'use strict';
/*
 * Enrollment, lesson tracking and quizzes. Quizzes are graded here (learners never
 * receive answer keys before submitting) and certificates are issued here the moment
 * the last lesson is completed, so progress can't be faked from the browser.
 */
const express = require('express');
const { z } = require('zod');
const { requireAuth, validate, ah } = require('../middleware');
const { lessonsOf, httpError } = require('../lib/util');
const { logMinutes, notify, enrollUser } = require('../services/learning');
const { issueCertificate } = require('../services/certificates');

const router = express.Router();
const student = requireAuth('student');

function load(req) {
  const d = req.db.data;
  const c = d.courses.find(x => x.id === req.params.courseId);
  if (!c) throw httpError(404, 'Course not found.');
  const e = d.enrollments.find(x => x.userId === req.user.id && x.courseId === c.id);
  return { d, c, e };
}
function loadEnrolled(req) {
  const r = load(req);
  if (!r.e) throw httpError(403, 'Enroll to start this course.');
  return r;
}
function lessonOf(c, lessonId) {
  const l = lessonsOf(c).find(x => x.id === lessonId);
  if (!l) throw httpError(404, 'Lesson not found.');
  return l;
}

/** Marks the enrollment complete and issues the certificate once every lesson is done. */
async function maybeFinish(req, c, e) {
  if (e.completedAt || !lessonsOf(c).every(l => e.done[l.id])) return null;
  e.completedAt = new Date().toISOString();
  const cert = await issueCertificate(req.db, e);
  notify(req.db, e.userId, `Certificate issued for ${c.title}. Block #${cert.blockIndex}.`, 'cert-' + cert.id);
  req.db.save();
  return cert;
}

router.post('/courses/:courseId/enroll', student, (req, res) => {
  const { c, e } = load(req);
  if (e) return res.json({ enrollment: e, created: false });
  if (!c.published) throw httpError(403, 'This course isn’t open for enrollment.');
  if (c.price > 0) throw httpError(402, 'This is a paid course. Complete checkout to enroll.', { checkout: true });
  const r = enrollUser(req.db, req.user.id, c);
  res.status(201).json(r);
});

/** Remembers the lesson the learner opened last ("Continue where you left off"). */
router.post('/enrollments/:courseId/last', student, validate(z.object({ lessonId: z.string().max(60) })), (req, res) => {
  const { c, e } = loadEnrolled(req);
  lessonOf(c, req.body.lessonId);
  e.last = { lessonId: req.body.lessonId, at: new Date().toISOString() };
  req.db.save();
  res.json({ ok: true });
});

/** Video watch % or practice-checklist progress. Only ever increases for video. */
router.patch('/enrollments/:courseId/watch', student, validate(z.object({ lessonId: z.string().max(60), pct: z.number().min(0).max(100), exact: z.boolean().optional() })), (req, res) => {
  const { c, e } = loadEnrolled(req);
  lessonOf(c, req.body.lessonId);
  const pct = Math.round(req.body.pct);
  e.watch[req.body.lessonId] = req.body.exact ? pct : Math.max(e.watch[req.body.lessonId] || 0, pct);
  req.db.save();
  res.json({ watch: e.watch[req.body.lessonId] });
});

router.post('/enrollments/:courseId/lessons/:lessonId/complete', student, ah(async (req, res) => {
  const { c, e } = loadEnrolled(req);
  const l = lessonOf(c, req.params.lessonId);
  if (l.type === 'q') throw httpError(400, 'Quizzes are completed by passing them.');
  let newly = false;
  if (!e.done[l.id]) {
    e.done[l.id] = new Date().toISOString();
    e.watch[l.id] = 100;
    logMinutes(req.db, req.user.id, l.min);
    newly = true;
    req.db.save();
  }
  const cert = newly ? await maybeFinish(req, c, e) : null;
  res.json({ enrollment: e, completed: newly, cert });
}));

router.post('/enrollments/:courseId/quizzes/:lessonId/submit', student, validate(z.object({ answers: z.array(z.number().int().min(0)).max(100) })), ah(async (req, res) => {
  const { c, e } = loadEnrolled(req);
  const l = lessonOf(c, req.params.lessonId);
  if (l.type !== 'q' || !l.quiz?.length) throw httpError(400, 'This lesson isn’t a quiz.');
  const { answers } = req.body;
  if (answers.length !== l.quiz.length) throw httpError(400, 'Answer every question before submitting.');

  const right = l.quiz.filter((q, i) => answers[i] === q.correct).length;
  const score = Math.round(right / l.quiz.length * 100);
  const pass = c.passMark || 70;
  const prev = e.quiz[l.id];
  e.quiz[l.id] = { best: Math.max(prev?.best ?? -1, score), last: score, attempts: (prev?.attempts || 0) + 1 };
  let cert = null;
  if (score >= pass && !e.done[l.id]) {
    e.done[l.id] = new Date().toISOString();
    logMinutes(req.db, req.user.id, l.min);
    req.db.save();
    cert = await maybeFinish(req, c, e);
  }
  req.db.save();
  res.json({
    score, passed: score >= pass, passMark: pass, best: e.quiz[l.id].best, attempts: e.quiz[l.id].attempts,
    // revealed only after an attempt, like the UI shows
    correct: l.quiz.map(q => q.correct), explain: l.quiz.map(q => q.explain || 'Review this lesson for details.'),
    enrollment: e, cert,
  });
}));

/** Study-time heartbeat from the video player (1 minute per call, capped). */
router.post('/me/activity', student, validate(z.object({ minutes: z.number().min(0).max(5) })), (req, res) => {
  logMinutes(req.db, req.user.id, req.body.minutes);
  req.db.save();
  res.json({ ok: true });
});

module.exports = router;
