'use strict';
/* Builds a fresh database with the demo catalog, accounts, progress and certificates. */
const bcrypt = require('bcryptjs');
const { SEED_COURSES, SEED_EVENTS, SEED_CAREERS, SEED_USERS, SEED_ENROLL } = require('../data/seedData');
const { uid, dayKey, daysAgo, walletAddr, handleFor, lessonsOf, normalizeCourse } = require('../lib/util');
const ledger = require('../lib/ledger');
const { issuerInfo } = require('../web3/issuer');
const { issueCertificate } = require('../services/certificates');
const { notify } = require('../services/learning');

async function seed(db) {
  const iss = issuerInfo();
  db.replace({
    users: [], courses: SEED_COURSES.map(normalizeCourse), enrollments: [], certs: [], chain: [],
    events: SEED_EVENTS.slice(), eventRegs: [], careers: SEED_CAREERS.slice(),
    saved: [], notes: {}, activity: {}, goals: [], notifs: [], messages: [], applications: [], subscribers: [], payments: [],
    web3: { contracts: {} }, seededAt: new Date().toISOString(),
  });
  const d = db.data;
  ledger.mineBlock(d.chain, [{ type: 'GENESIS', note: 'Learning Hub credential ledger', issuer: iss.did, at: daysAgo(120).toISOString() }], daysAgo(120).toISOString());

  for (const su of SEED_USERS) {
    const { pw, ...rest } = su;
    const u = { ...rest, pwHash: await bcrypt.hash(pw, 10), status: 'active', createdAt: daysAgo(su.role === 'student' ? 70 : 200).toISOString(), walletPublic: true };
    u.handle = handleFor(u.name, d.users);
    u.wallet = walletAddr(u.id, u.email);
    d.users.push(u);
  }

  const plan = SEED_ENROLL.map(([userId, courseId, n, done, ago]) => ({ userId, courseId, n, done, ago })).sort((a, b) => b.ago - a.ago);
  for (const p of plan) {
    const c = d.courses.find(x => x.id === p.courseId);
    const ls = lessonsOf(c);
    const count = p.n === 'all' ? ls.length : +p.n;
    const e = { id: uid('e'), userId: p.userId, courseId: p.courseId, enrolledAt: daysAgo(p.ago).toISOString(), done: {}, quiz: {}, watch: {}, last: null, completedAt: null, certId: null };
    ls.slice(0, count).forEach((l, i) => {
      const t = new Date(daysAgo(Math.max(0, p.ago - Math.round((i + 1) * (p.ago - 1) / Math.max(1, count)))));
      t.setHours(9 + (i % 9), (i * 7) % 60);
      e.done[l.id] = t.toISOString(); e.watch[l.id] = 100;
      if (l.type === 'q') { const sc = [100, 67, 100, 100, 67][i % 5]; e.quiz[l.id] = { best: sc, last: sc, attempts: 1 }; }
    });
    const next = ls[count] || ls[ls.length - 1];
    e.last = { lessonId: next.id, at: daysAgo(Math.max(0, Math.min(p.ago, 3))).toISOString() };
    if (p.userId === 'u_misgana' && p.courseId === 'c1') e.watch[next.id] = 35;
    d.enrollments.push(e);
    if (p.done) {
      const when = daysAgo(Math.max(1, p.ago - 20));
      e.completedAt = when.toISOString();
      await issueCertificate(db, e, when);
    }
  }

  // Misgana's activity: a 12-day streak and a week that matches the design
  const wk = [60, 90, 30, 120, 60, 90, 60];
  d.activity.u_misgana = {};
  for (let i = 0; i < 12; i++) d.activity.u_misgana[dayKey(daysAgo(i))] = i < 7 ? wk[6 - i] : 45;
  [45, 60, 50, 70, 60].forEach((m, k) => (d.activity.u_misgana[dayKey(daysAgo(7 + k))] = m));
  delete d.activity.u_misgana[dayKey(daysAgo(12))];
  d.activity.u_misgana[dayKey(daysAgo(13))] = 55;
  ['u_abel', 'u_liya', 'u_ruth', 'u_sara', 'u_samuel', 'u_jonah'].forEach((id, j) => {
    d.activity[id] = {};
    for (let i = 0; i < 9; i++) if ((i + j) % 3) d.activity[id][dayKey(daysAgo(i))] = 20 + ((i * 17 + j * 11) % 70);
  });

  const g = (title, kind, target, due, courseId) => d.goals.push({ id: uid('g'), userId: 'u_misgana', title, kind, target, due: due.toISOString(), courseId });
  g('Reach 10 study hours this week', 'hours', 10, daysAgo(-2));
  g('Finish the pandas module', 'module', 0, daysAgo(-5), 'c3');
  g('Earn your Python certificate', 'course', 0, daysAgo(-9), 'c3');
  d.eventRegs.push({ userId: 'u_misgana', eventId: 'e1', at: daysAgo(2).toISOString() });
  notify(db, 'u_misgana', 'Your SQL Foundations certificate was recorded on the ledger.', 'certificates');
  notify(db, 'u_misgana', 'New workshop: Issue your first verifiable credential (Dec 3).', 'events');
  db.saveNow();
  console.log(`[db] Seeded ${d.users.length} users, ${d.courses.length} courses, ${d.certs.length} certificates, ${d.chain.length} blocks.`);
}

module.exports = { seed };
