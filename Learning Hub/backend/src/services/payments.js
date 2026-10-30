'use strict';
/*
 * Course payments with Stripe Checkout (Stripe's hosted payment page).
 *
 *   1. POST /api/payments/checkout  → creates a Checkout Session for the course price and
 *                                     returns its URL; the browser redirects there.
 *   2. Stripe redirects back to /payment/success?session_id=…  and the app calls
 *      POST /api/payments/confirm   → the server RETRIEVES the session from Stripe and
 *                                     enrolls the learner only if Stripe says it's paid.
 *   3. POST /api/payments/webhook   → (optional, recommended) Stripe calls this directly on
 *                                     checkout.session.completed, so enrollment happens even
 *                                     if the learner closes the tab before returning.
 * Steps 2 and 3 are idempotent: whichever arrives first enrolls, the other is a no-op.
 * Card details never touch our servers.
 */
const Stripe = require('stripe');
const config = require('../config');
const { httpError } = require('../lib/util');
const { enrollUser, notify } = require('./learning');

let client = null;
function stripe() {
  if (!config.stripeSecretKey) throw httpError(503, 'Payments aren’t set up on this server yet. Add STRIPE_SECRET_KEY to backend/.env.');
  if (!client) client = new Stripe(config.stripeSecretKey);
  return client;
}
/** Turns Stripe SDK errors into clear API errors instead of a generic 500. */
async function call(fn) {
  try { return await fn(); }
  catch (e) {
    if (e.status && !String(e.type || '').startsWith('Stripe')) throw e; // our own HttpError
    console.error(`[payments] ${e.type || 'Error'}: ${e.message}`);
    if (e.type === 'StripeConnectionError') throw httpError(502, 'Couldn’t reach Stripe. Check your internet connection and try again.');
    if (e.type === 'StripeAuthenticationError') throw httpError(502, 'Stripe rejected the API key. Check STRIPE_SECRET_KEY in backend/.env.');
    if (e.type === 'StripeInvalidRequestError') throw httpError(400, 'Stripe couldn’t process this request: ' + e.message);
    throw httpError(502, 'The payment service is unavailable right now. Try again in a moment.');
  }
}

/** Lets tests swap in a fake Stripe client. */
const setStripeClient = c => { client = c; };

async function createCheckout(db, user, course) {
  if (!(course.price > 0)) throw httpError(400, 'This course is free. Enroll directly.');
  const app = config.publicAppUrl.replace(/\/$/, '');
  const s = await call(() => stripe().checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email,
    client_reference_id: user.id,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: config.stripeCurrency,
        unit_amount: course.price,
        product_data: { name: course.title, description: (course.tagline || 'Learning Hub course').slice(0, 300) },
      },
    }],
    metadata: { userId: user.id, courseId: course.id },
    success_url: `${app}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${app}/payment/cancel?course=${encodeURIComponent(course.id)}`,
  }));
  db.data.payments.push({
    id: s.id, userId: user.id, courseId: course.id, courseTitle: course.title, amount: course.price,
    currency: config.stripeCurrency, status: 'pending', createdAt: new Date().toISOString(),
  });
  db.save();
  return { id: s.id, url: s.url };
}

/** Enrolls the learner once Stripe reports the session as paid. Safe to call repeatedly. */
function fulfill(db, session) {
  const d = db.data;
  const { userId, courseId } = session.metadata || {};
  let p = d.payments.find(x => x.id === session.id);
  if (!p) { // e.g. webhook for a session created before a data reset
    p = { id: session.id, userId, courseId, amount: session.amount_total, currency: session.currency, status: 'pending', createdAt: new Date().toISOString() };
    d.payments.push(p);
  }
  if (session.payment_status !== 'paid') { db.save(); return { status: session.payment_status || 'unpaid', payment: p }; }
  const c = d.courses.find(x => x.id === courseId);
  const u = d.users.find(x => x.id === userId);
  if (!c || !u) throw httpError(404, 'The course or account for this payment no longer exists. Contact support with your receipt.');
  const firstTime = p.status !== 'paid';
  Object.assign(p, { status: 'paid', paidAt: p.paidAt || new Date().toISOString(), amount: session.amount_total ?? p.amount, currency: session.currency || p.currency, paymentIntent: session.payment_intent || null });
  const r = enrollUser(db, userId, c);
  if (firstTime) notify(db, userId, `Payment received for ${c.title}. Enjoy the course!`, 'course-' + c.id);
  db.save();
  return { status: 'paid', payment: p, enrollment: r.enrollment, courseId: c.id };
}

async function confirm(db, user, sessionId) {
  const s = await call(() => stripe().checkout.sessions.retrieve(sessionId));
  if (s.metadata?.userId !== user.id) throw httpError(403, 'This payment belongs to a different account.');
  return fulfill(db, s);
}

/** Verifies the Stripe signature on the raw body, then fulfills completed checkouts. */
function handleWebhook(db, rawBody, signature) {
  if (!config.stripeWebhookSecret) throw httpError(503, 'STRIPE_WEBHOOK_SECRET is not set.');
  let event;
  try { event = stripe().webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret); }
  catch (e) { throw httpError(400, 'Invalid Stripe signature.'); }
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') fulfill(db, event.data.object);
  if (event.type === 'checkout.session.expired') {
    const p = db.data.payments.find(x => x.id === event.data.object.id);
    if (p && p.status === 'pending') { p.status = 'expired'; db.save(); }
  }
  return { received: true, type: event.type };
}

module.exports = { createCheckout, confirm, fulfill, handleWebhook, setStripeClient };
