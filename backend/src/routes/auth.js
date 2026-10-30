'use strict';
const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { signToken, validate, ah } = require('../middleware');
const { uid, walletAddr, handleFor, short, httpError } = require('../lib/util');
const { notify } = require('../services/learning');

const router = express.Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many attempts. Wait a few minutes and try again.' } });

const EMAIL = z.string().trim().toLowerCase().email('Enter a valid email, like maya@example.com.').max(160);
const PASSWORD = z.string().min(8, 'Use 8+ characters with at least one number and one symbol.').max(128)
  .refine(p => /\d/.test(p) && /[^A-Za-z0-9]/.test(p), 'Use 8+ characters with at least one number and one symbol.');
const req = (msg, max = 120) => z.string({ required_error: msg }).trim().min(1, msg).max(max);

const registerSchema = z.object({
  name: z.string().trim().min(3, 'Enter your full name as it should appear on certificates.').max(80),
  email: EMAIL,
  password: PASSWORD,
  role: z.enum(['student', 'instructor'], { errorMap: () => ({ message: 'Choose a role.' }) }),
  university: req('Choose your university.'),
  region: req('Choose your region.'),
  city: req('Choose your city.'),
  academic: req('Choose your academic status.'),
  field: req('Choose your field of study.'),
});

router.post('/register', limiter, validate(registerSchema), ah(async (req, res) => {
  const d = req.db.data, b = req.body;
  if (d.users.some(u => u.email.toLowerCase() === b.email)) throw httpError(409, 'An account with this email already exists. Log in instead.', { field: 'email' });
  const id = uid('u');
  const u = {
    id, name: b.name, email: b.email, role: b.role, university: b.university, region: b.region, city: b.city, academic: b.academic, field: b.field,
    pwHash: await bcrypt.hash(b.password, 10), createdAt: new Date().toISOString(), walletPublic: true, status: 'active',
    title: b.role === 'instructor' ? 'Instructor' : '', lastLogin: new Date().toISOString(),
  };
  u.handle = handleFor(u.name, d.users);
  u.wallet = walletAddr(id, u.email);
  d.users.push(u);
  notify(req.db, id, `Welcome to Learning Hub! Your wallet address is ${short(u.wallet, 8)}.`, u.role === 'student' ? 'wallet-' + u.handle : 'instructor');
  req.db.save();
  res.status(201).json({ token: signToken(u), user: { id: u.id, name: u.name, role: u.role, handle: u.handle } });
}));

router.post('/login', limiter, validate(z.object({ email: z.string().trim().toLowerCase(), password: z.string() })), ah(async (req, res) => {
  const u = req.db.data.users.find(x => x.email.toLowerCase() === req.body.email);
  const ok = u && (await bcrypt.compare(req.body.password, u.pwHash));
  if (!ok) throw httpError(401, 'That email and password don’t match. Check both and try again.');
  if (u.status === 'suspended') throw httpError(403, 'This account is suspended. Contact support to restore access.');
  u.lastLogin = new Date().toISOString();
  req.db.save();
  res.json({ token: signToken(u), user: { id: u.id, name: u.name, role: u.role, handle: u.handle } });
}));

/** Live check used by the registration form when the email field loses focus. */
router.get('/email-available', limiter, (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  res.json({ available: !!email && !req.db.data.users.some(u => u.email.toLowerCase() === email) });
});

module.exports = router;
