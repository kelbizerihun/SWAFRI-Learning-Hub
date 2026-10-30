'use strict';
// Run with: npm test   (uses a temporary database, ledger-only mode, no network needed)
const os = require('os');
const fs = require('fs');
const path = require('path');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lh-test-'));
process.env.DATA_DIR = tmp;
process.env.CHAIN_RPC_URL = '';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { Store } = require('../src/db/store');
const { seed } = require('../src/db/seed');
const { createApp } = require('../src/app');

let db, app;
const login = async (email, password) => (await request(app).post('/api/auth/login').send({ email, password }).expect(200)).body.token;
const as = (token) => ({
  get: (u) => request(app).get(u).set('Authorization', 'Bearer ' + token),
  post: (u, b) => request(app).post(u).set('Authorization', 'Bearer ' + token).send(b),
  put: (u, b) => request(app).put(u).set('Authorization', 'Bearer ' + token).send(b),
  patch: (u, b) => request(app).patch(u).set('Authorization', 'Bearer ' + token).send(b),
});

before(async () => { db = new Store(tmp); await seed(db); app = createApp(db, { log: false }); });
after(async () => { await db.close(); fs.rmSync(tmp, { recursive: true, force: true }); });

test('anonymous snapshot hides private data and quiz answer keys', async () => {
  const s = (await request(app).get('/api/state').expect(200)).body;
  assert.equal(s.meId, null);
  assert.ok(s.users.every(u => !u.email && !u.pwHash), 'no emails or hashes');
  const quiz = s.courses.flatMap(c => c.modules.flatMap(m => m.lessons)).find(l => l.type === 'q');
  assert.equal(quiz.quiz[0].correct, undefined);
  assert.equal(s.enrollments.length, 0);
  assert.ok(s.certs.length > 0 && s.chain.length > 0, 'public registry and ledger are visible');
});

test('registration validates input and rejects duplicate emails', async () => {
  const base = { name: 'Abebe Kebede', email: 'new@example.com', password: 'weak', role: 'student', university: 'Addis Ababa University', region: 'Addis Ababa', city: 'Addis Ababa', academic: 'Junior', field: 'Computer Science' };
  const weak = await request(app).post('/api/auth/register').send(base).expect(400);
  assert.match(weak.body.error, /8\+ characters/);
  await request(app).post('/api/auth/register').send({ ...base, password: 'Strong#2026' }).expect(201);
  const dup = await request(app).post('/api/auth/register').send({ ...base, password: 'Strong#2026' }).expect(409);
  assert.equal(dup.body.field, 'email');
  const avail = await request(app).get('/api/auth/email-available?email=new@example.com').expect(200);
  assert.equal(avail.body.available, false);
});

test('login rejects wrong passwords; roles are enforced', async () => {
  await request(app).post('/api/auth/login').send({ email: 'misgana@learninghub.io', password: 'nope' }).expect(401);
  const t = await login('misgana@learninghub.io', 'Learn#2026');
  await as(t).post('/api/admin/chain/tamper').expect(403);
  await as(t).post('/api/courses').expect(403);
  await request(app).post('/api/courses/c5/enroll').expect(401);
});

test('a learner completes a course and receives a verifiable certificate', async () => {
  const t = await login('abel@example.com', 'Learn#2026'); // Abel is not enrolled in c4 yet
  await as(t).post('/api/courses/c4/enroll').expect(201);
  const course = db.data.courses.find(c => c.id === 'c4');
  const lessons = course.modules.flatMap(m => m.lessons);
  let cert = null;
  for (const l of lessons) {
    if (l.type === 'q') {
      const wrong = await as(t).post(`/api/enrollments/c4/quizzes/${l.id}/submit`, { answers: l.quiz.map(q => (q.correct + 1) % q.opts.length) }).expect(200);
      assert.equal(wrong.body.passed, false);
      const r = await as(t).post(`/api/enrollments/c4/quizzes/${l.id}/submit`, { answers: l.quiz.map(q => q.correct) }).expect(200);
      assert.equal(r.body.score, 100);
      cert = r.body.cert || cert;
    } else {
      const r = await as(t).post(`/api/enrollments/c4/lessons/${l.id}/complete`).expect(200);
      cert = r.body.cert || cert;
    }
  }
  assert.ok(cert, 'certificate issued on the last lesson');
  const v = (await request(app).get('/api/verify/' + cert.id).expect(200)).body;
  assert.equal(v.verdict, 'valid');
  assert.ok(v.steps.every(s => s.ok));

  // Tampering with the stored record is detected
  const stored = db.data.certs.find(c => c.id === cert.id);
  stored.studentName = 'Someone Else';
  assert.equal((await request(app).get('/api/verify/' + cert.id)).body.verdict, 'invalid');
  stored.studentName = cert.studentName;

  // Revocation by an admin
  const admin = await login('admin@learninghub.io', 'Admin#2026');
  await as(admin).post(`/api/admin/certificates/${cert.id}/revoke`, { reason: 'Issued in error' }).expect(200);
  assert.equal((await request(app).get('/api/verify/' + cert.id)).body.verdict, 'revoked');
});

test('instructors can only edit their own courses; publishing is validated', async () => {
  const solomon = await login('solomon@learninghub.io', 'Teach#2026');
  const priya = await login('priya@learninghub.io', 'Teach#2026');
  const { course } = (await as(solomon).post('/api/courses').expect(201)).body;
  const body = { ...course, title: 'Smart Contracts 101', modules: [{ id: 'mx', title: 'Intro', lessons: [{ id: 'q1', type: 'q', title: 'Quiz', min: 5, quiz: [] }] }], published: true };
  for (const k of ['id', 'instructor', 'rating', 'reviews', 'students', 'featured', 'hero', 'createdAt']) delete body[k];
  const bad = await as(solomon).put('/api/courses/' + course.id, body).expect(400);
  assert.match(bad.body.error, /Add questions/);
  await as(priya).put('/api/courses/' + course.id, { ...body, published: false }).expect(403);
  body.modules[0].lessons[0].quiz = [{ q: 'What is a smart contract?', opts: ['Code on a blockchain', 'A PDF'], correct: 0, explain: 'It runs on-chain.' }];
  const ok = await as(solomon).put('/api/courses/' + course.id, body).expect(200);
  assert.equal(ok.body.course.published, true);
  assert.equal(ok.body.course.instructor, 'u_solomon');
});

test('the ledger tamper demo breaks and restores the chain', async () => {
  const admin = await login('admin@learninghub.io', 'Admin#2026');
  await as(admin).post('/api/admin/chain/tamper').expect(200);
  assert.equal((await as(admin).get('/api/admin/chain/validate')).body.ok, false);
  await as(admin).post('/api/admin/chain/restore').expect(200);
  assert.equal((await as(admin).get('/api/admin/chain/validate')).body.ok, true);
});
