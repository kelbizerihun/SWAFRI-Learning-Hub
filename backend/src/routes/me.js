'use strict';
/* The signed-in user's own data: profile, wallet visibility, notes, bookmarks, goals,
   notifications, event registrations and job applications. */
const express = require('express');
const { z } = require('zod');
const { requireAuth, validate } = require('../middleware');
const { uid, lessonsOf, httpError } = require('../lib/util');
const { notify } = require('../services/learning');

const router = express.Router();
const auth = requireAuth();

router.patch('/me/profile', auth, validate(z.object({
  name: z.string().trim().min(3, 'Enter your full name.').max(80),
  university: z.string().trim().max(120).optional(),
  field: z.string().trim().max(120).optional(),
  title: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(600).optional(),
})), (req, res) => {
  const u = req.user, b = { ...req.body };
  if (u.role !== 'instructor') { delete b.title; delete b.bio; }
  if (u.role === 'admin') { delete b.university; delete b.field; }
  Object.assign(u, b);
  req.db.save();
  res.json({ ok: true });
});

router.patch('/me/wallet', requireAuth('student'), validate(z.object({ walletPublic: z.boolean() })), (req, res) => {
  req.user.walletPublic = req.body.walletPublic;
  req.db.save();
  res.json({ walletPublic: req.user.walletPublic });
});

router.put('/me/notes/:courseId/:lessonId', auth, validate(z.object({ text: z.string().max(20000) })), (req, res) => {
  const c = req.db.data.courses.find(x => x.id === req.params.courseId);
  if (!c || !lessonsOf(c).some(l => l.id === req.params.lessonId)) throw httpError(404, 'Lesson not found.');
  const k = `${req.user.id}|${c.id}|${req.params.lessonId}`;
  if (req.body.text.trim()) req.db.data.notes[k] = req.body.text; else delete req.db.data.notes[k];
  req.db.save();
  res.json({ ok: true });
});

router.post('/me/saved/toggle', auth, validate(z.object({ courseId: z.string(), lessonId: z.string() })), (req, res) => {
  const d = req.db.data, { courseId, lessonId } = req.body;
  const c = d.courses.find(x => x.id === courseId);
  if (!c || !lessonsOf(c).some(l => l.id === lessonId)) throw httpError(404, 'Lesson not found.');
  const i = d.saved.findIndex(s => s.userId === req.user.id && s.courseId === courseId && s.lessonId === lessonId);
  if (i >= 0) d.saved.splice(i, 1); else d.saved.push({ userId: req.user.id, courseId, lessonId, at: new Date().toISOString() });
  req.db.save();
  res.json({ saved: i < 0 });
});

const goalSchema = z.object({
  title: z.string().trim().min(3).max(160),
  kind: z.enum(['hours', 'lessons', 'module', 'course']),
  target: z.number().min(0).max(1000),
  courseId: z.string().max(60).optional().nullable(),
  due: z.string().datetime({ offset: true, message: 'Choose a due date.' }),
});
router.post('/me/goals', requireAuth('student'), validate(goalSchema), (req, res) => {
  const b = req.body;
  if (['module', 'course'].includes(b.kind) && !req.db.data.enrollments.some(e => e.userId === req.user.id && e.courseId === b.courseId)) throw httpError(400, 'Enroll in a course first.');
  const g = { id: uid('g'), userId: req.user.id, ...b };
  req.db.data.goals.push(g);
  req.db.save();
  res.status(201).json({ goal: g });
});
router.delete('/me/goals/:id', requireAuth('student'), (req, res) => {
  const d = req.db.data;
  d.goals = d.goals.filter(g => !(g.id === req.params.id && g.userId === req.user.id));
  req.db.save();
  res.json({ ok: true });
});

router.post('/me/notifications/read-all', auth, (req, res) => {
  req.db.data.notifs.forEach(n => { if (n.userId === req.user.id) n.read = true; });
  req.db.save();
  res.json({ ok: true });
});

router.post('/events/:id/register', auth, (req, res) => {
  const d = req.db.data;
  const ev = d.events.find(e => e.id === req.params.id);
  if (!ev) throw httpError(404, 'Event not found.');
  const i = d.eventRegs.findIndex(r => r.userId === req.user.id && r.eventId === ev.id);
  if (i >= 0) { d.eventRegs.splice(i, 1); req.db.save(); return res.json({ registered: false }); }
  if (ev.spots && d.eventRegs.filter(r => r.eventId === ev.id).length >= ev.spots) throw httpError(409, 'This event is full.');
  d.eventRegs.push({ userId: req.user.id, eventId: ev.id, at: new Date().toISOString() });
  notify(req.db, req.user.id, `You’re registered for “${ev.title}”.`, 'events');
  req.db.save();
  res.json({ registered: true });
});

router.post('/careers/:id/apply', auth, (req, res) => {
  const d = req.db.data;
  const j = d.careers.find(x => x.id === req.params.id);
  if (!j) throw httpError(404, 'Opportunity not found.');
  if (!d.applications.some(a => a.userId === req.user.id && a.jobId === j.id)) {
    d.applications.push({ userId: req.user.id, jobId: j.id, at: new Date().toISOString() });
    notify(req.db, req.user.id, `Application sent: ${j.title}.`, 'careers');
    req.db.save();
  }
  res.json({ applied: true });
});

module.exports = router;
