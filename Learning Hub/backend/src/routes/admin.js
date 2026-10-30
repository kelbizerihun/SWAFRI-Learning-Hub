'use strict';
/* Admin portal: users, certificates, ledger tools, messages, demo reset. */
const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { requireAuth, validate, ah } = require('../middleware');
const { uid, walletAddr, handleFor, lessonsOf, sha256, httpError } = require('../lib/util');
const ledger = require('../lib/ledger');
const { issueCertificate, revokeCertificate } = require('../services/certificates');
const { notify } = require('../services/learning');
const config = require('../config');

const router = express.Router();
const admin = requireAuth('admin');
const userOr404 = (req) => { const u = req.db.data.users.find(x => x.id === req.params.id); if (!u) throw httpError(404, 'User not found.'); return u; };
const adminCount = d => d.users.filter(u => u.role === 'admin' && u.status !== 'suspended').length;

router.post('/admin/users', admin, validate(z.object({
  name: z.string().trim().min(3, 'Enter a name and a valid email.').max(80),
  email: z.string().trim().toLowerCase().email('Enter a name and a valid email.'),
  role: z.enum(['student', 'instructor', 'admin']),
  password: z.string().min(8, 'Temporary password needs 8+ characters.').max(128),
})), ah(async (req, res) => {
  const d = req.db.data, b = req.body;
  if (d.users.some(u => u.email.toLowerCase() === b.email)) throw httpError(409, 'That email is already registered.');
  const id = uid('u');
  const u = { id, name: b.name, email: b.email, role: b.role, pwHash: await bcrypt.hash(b.password, 10), status: 'active', createdAt: new Date().toISOString(), walletPublic: true, handle: handleFor(b.name, d.users), wallet: walletAddr(id, b.email) };
  d.users.push(u);
  req.db.save();
  res.status(201).json({ id });
}));

router.patch('/admin/users/:id', admin, validate(z.object({ role: z.enum(['student', 'instructor', 'admin']).optional(), status: z.enum(['active', 'suspended']).optional() })), (req, res) => {
  const d = req.db.data, u = userOr404(req);
  if (u.id === req.user.id) throw httpError(400, 'You can’t change your own role or status.');
  if (u.role === 'admin' && ((req.body.role && req.body.role !== 'admin') || req.body.status === 'suspended') && adminCount(d) <= 1) throw httpError(400, 'Keep at least one active admin.');
  Object.assign(u, req.body);
  req.db.save();
  res.json({ ok: true });
});

router.delete('/admin/users/:id', admin, (req, res) => {
  const d = req.db.data, u = userOr404(req);
  if (u.id === req.user.id) throw httpError(400, 'You can’t delete your own account.');
  const mine = x => x.userId === u.id;
  d.users = d.users.filter(x => x.id !== u.id);
  for (const k of ['enrollments', 'goals', 'saved', 'notifs', 'eventRegs', 'applications']) d[k] = d[k].filter(x => !mine(x));
  delete d.activity[u.id];
  for (const k of Object.keys(d.notes)) if (k.startsWith(u.id + '|')) delete d.notes[k];
  req.db.save();
  res.json({ ok: true });
});

router.post('/admin/certificates/issue', admin, validate(z.object({ enrollmentId: z.string() })), ah(async (req, res) => {
  const d = req.db.data;
  const e = d.enrollments.find(x => x.id === req.body.enrollmentId);
  if (!e) throw httpError(404, 'Enrollment not found.');
  if (e.certId) throw httpError(409, 'This enrollment already has a certificate.');
  const c = d.courses.find(x => x.id === e.courseId);
  const now = new Date().toISOString();
  lessonsOf(c).forEach(l => { if (!e.done[l.id]) e.done[l.id] = now; });
  e.completedAt = now;
  const cert = await issueCertificate(req.db, e);
  notify(req.db, e.userId, `Certificate issued for ${c.title}.`, 'cert-' + cert.id);
  req.db.save();
  res.status(201).json({ cert });
}));

router.post('/admin/certificates/:id/revoke', admin, validate(z.object({ reason: z.string().trim().min(3).max(200) })), (req, res) => {
  const cert = revokeCertificate(req.db, req.params.id, req.body.reason);
  if (!cert) throw httpError(404, 'Certificate not found or already revoked.');
  notify(req.db, cert.studentId, `Your ${cert.courseTitle} certificate was revoked: ${req.body.reason}.`, 'certificates');
  req.db.save();
  res.json({ cert });
});

router.get('/admin/chain/validate', admin, (req, res) => res.json(ledger.validateChain(req.db.data.chain)));

/** Demo: alter a mined block like an attacker would, to show verification catching it. */
router.post('/admin/chain/tamper', admin, (req, res) => {
  const d = req.db.data;
  if (d.tamperBackup) throw httpError(409, 'Restore the altered block first.');
  const target = d.chain.find(b => b.txs[0]?.type === 'MINT_CERTIFICATE');
  if (!target) throw httpError(404, 'No certificate blocks yet.');
  d.tamperBackup = { index: target.index, tx: JSON.parse(JSON.stringify(target.txs[0])) };
  target.txs[0].certHash = sha256('forged-' + Date.now());
  req.db.save();
  res.json({ index: target.index, certId: target.txs[0].certId });
});
router.post('/admin/chain/restore', admin, (req, res) => {
  const d = req.db.data, b = d.tamperBackup;
  if (!b) return res.json({ ok: true });
  d.chain[b.index].txs[0] = b.tx;
  delete d.tamperBackup;
  req.db.save();
  res.json({ ok: true });
});

router.post('/admin/messages/read', admin, (req, res) => {
  req.db.data.messages.forEach(m => { m.read = true; });
  req.db.save();
  res.json({ ok: true });
});

/** Restores the original demo data. Disabled when DEMO_MODE=false. */
router.post('/demo/reset', requireAuth(), ah(async (req, res) => {
  if (!config.demoMode) throw httpError(403, 'Demo reset is disabled on this server.');
  const { seed } = require('../db/seed');
  await seed(req.db);
  require('../web3/chain').reanchorPending();
  res.json({ ok: true });
}));

module.exports = router;
