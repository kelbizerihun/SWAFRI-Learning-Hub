'use strict';
// Payments (Stripe) and AI assistant (Gemini) with fakes: no network or real keys needed.
const os = require('os');
const fs = require('fs');
const path = require('path');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lh-pay-'));
Object.assign(process.env, { DATA_DIR: tmp, CHAIN_RPC_URL: '', STRIPE_SECRET_KEY: 'sk_test_fake', STRIPE_WEBHOOK_SECRET: 'whsec_test_secret', GEMINI_API_KEY: 'test-gemini-key' });

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const Stripe = require('stripe');
const { Store } = require('../src/db/store');
const { seed } = require('../src/db/seed');
const { createApp } = require('../src/app');
const payments = require('../src/services/payments');

let db, app, token, created = [];
const sessions = {};
const fakeStripe = {
  checkout: { sessions: {
    create: async (p) => { const id = 'cs_test_' + Math.random().toString(36).slice(2); created.push(p); sessions[id] = { id, payment_status: 'unpaid', metadata: p.metadata, amount_total: p.line_items[0].price_data.unit_amount, currency: p.line_items[0].price_data.currency }; return { id, url: 'https://checkout.stripe.com/c/pay/' + id }; },
    retrieve: async (id) => sessions[id],
  } },
  webhooks: new Stripe('sk_test_fake').webhooks, // real signature verification
};

before(async () => {
  db = new Store(tmp); await seed(db); app = createApp(db, { log: false });
  payments.setStripeClient(fakeStripe);
  token = (await request(app).post('/api/auth/login').send({ email: 'jonah@example.com', password: 'Learn#2026' })).body.token;
});
after(async () => { await db.close(); fs.rmSync(tmp, { recursive: true, force: true }); });
const auth = r => r.set('Authorization', 'Bearer ' + token);

test('paid courses cannot be enrolled in without paying', async () => {
  const r = await auth(request(app).post('/api/courses/c1/enroll')).expect(402);
  assert.match(r.body.error, /paid course/);
});

test('checkout → confirm enrolls only after Stripe reports the session as paid', async () => {
  const co = await auth(request(app).post('/api/payments/checkout').send({ courseId: 'c1' })).expect(201);
  assert.match(co.body.url, /^https:\/\/checkout\.stripe\.com/);
  const p = created.at(-1);
  assert.equal(p.line_items[0].price_data.unit_amount, 2900);
  assert.equal(p.metadata.courseId, 'c1');
  assert.match(p.success_url, /\/payment\/success\?session_id=\{CHECKOUT_SESSION_ID\}$/);

  const unpaid = await auth(request(app).post('/api/payments/confirm').send({ sessionId: co.body.id })).expect(200);
  assert.equal(unpaid.body.status, 'unpaid');
  assert.ok(!db.data.enrollments.some(e => e.userId === 'u_jonah' && e.courseId === 'c1'));

  sessions[co.body.id].payment_status = 'paid';
  const paid = await auth(request(app).post('/api/payments/confirm').send({ sessionId: co.body.id })).expect(200);
  assert.equal(paid.body.status, 'paid');
  assert.ok(db.data.enrollments.some(e => e.userId === 'u_jonah' && e.courseId === 'c1'));
  await auth(request(app).post('/api/payments/confirm').send({ sessionId: co.body.id })).expect(200); // idempotent
  assert.equal(db.data.enrollments.filter(e => e.userId === 'u_jonah' && e.courseId === 'c1').length, 1);
  await auth(request(app).post('/api/payments/checkout').send({ courseId: 'c1' })).expect(409);
});

test('another account cannot claim someone else’s payment', async () => {
  const co = await auth(request(app).post('/api/payments/checkout').send({ courseId: 'c3' })).expect(201);
  sessions[co.body.id].payment_status = 'paid';
  const other = (await request(app).post('/api/auth/login').send({ email: 'ruth@example.com', password: 'Learn#2026' })).body.token;
  await request(app).post('/api/payments/confirm').set('Authorization', 'Bearer ' + other).send({ sessionId: co.body.id }).expect(403);
});

test('signed Stripe webhook enrolls; a bad signature is rejected', async () => {
  const co = await auth(request(app).post('/api/payments/checkout').send({ courseId: 'c3' })).expect(201);
  const event = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed', data: { object: { ...sessions[co.body.id], payment_status: 'paid' } } });
  await request(app).post('/api/payments/webhook').set('stripe-signature', 't=1,v1=bad').set('content-type', 'application/json').send(event).expect(400);
  const sig = fakeStripe.webhooks.generateTestHeaderString({ payload: event, secret: 'whsec_test_secret' });
  await request(app).post('/api/payments/webhook').set('stripe-signature', sig).set('content-type', 'application/json').send(event).expect(200);
  assert.ok(db.data.enrollments.some(e => e.userId === 'u_jonah' && e.courseId === 'c3'));
});

test('assistant calls Gemini and returns its answer', async () => {
  const realFetch = global.fetch; let sent;
  global.fetch = async (url, opts) => { sent = { url, opts }; return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Try Python for Data Science next!' }] } }] }), { status: 200 }); };
  try {
    const r = await request(app).post('/api/assistant').send({ messages: [{ role: 'user', content: 'What should I learn next?' }] }).expect(200);
    assert.equal(r.body.text, 'Try Python for Data Science next!');
    assert.match(sent.url, /generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-2\.5-flash:generateContent$/);
    assert.equal(sent.opts.headers['x-goog-api-key'], 'test-gemini-key');
    const body = JSON.parse(sent.opts.body);
    assert.equal(body.contents[0].role, 'user');
    assert.match(body.systemInstruction.parts[0].text, /Python for Data Science/);

    global.fetch = async () => new Response(JSON.stringify({ error: { message: 'API key not valid' } }), { status: 400 });
    const f = await request(app).post('/api/assistant').send({ messages: [{ role: 'user', content: 'hi' }] }).expect(503);
    assert.equal(f.body.fallback, true); // UI then answers locally
  } finally { global.fetch = realFetch; }
});
