'use strict';
const express = require('express');
const { z } = require('zod');
const { requireAuth, validate, ah } = require('../middleware');
const { httpError } = require('../lib/util');
const payments = require('../services/payments');

const router = express.Router();

router.post('/payments/checkout', requireAuth('student'), validate(z.object({ courseId: z.string().max(60) })), ah(async (req, res) => {
  const d = req.db.data;
  const c = d.courses.find(x => x.id === req.body.courseId && x.published);
  if (!c) throw httpError(404, 'Course not found.');
  if (d.enrollments.some(e => e.userId === req.user.id && e.courseId === c.id)) throw httpError(409, 'You’re already enrolled in this course.');
  res.status(201).json(await payments.createCheckout(req.db, req.user, c));
}));

router.post('/payments/confirm', requireAuth('student'), validate(z.object({ sessionId: z.string().regex(/^cs_[\w]+$/, 'Invalid checkout session.') })), ah(async (req, res) => {
  res.json(await payments.confirm(req.db, req.user, req.body.sessionId));
}));

/** Mounted in app.js with express.raw() so the Stripe signature can be checked. */
const webhook = (req, res, next) => {
  try { res.json(payments.handleWebhook(req.db, req.body, req.headers['stripe-signature'])); } catch (e) { next(e); }
};

module.exports = { router, webhook };
