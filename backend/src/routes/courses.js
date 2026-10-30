'use strict';
/* Instructor portal: create courses, edit details & curriculum, quiz builder, publish. */
const express = require('express');
const { z } = require('zod');
const { requireAuth, validate } = require('../middleware');
const { uid, lessonsOf, httpError } = require('../lib/util');
const { CATS } = require('../data/seedData');

const router = express.Router();
const IMAGES = ['design', 'dev', 'data', 'ai', 'web3', 'sql'];
const str = (max, min = 0) => z.string().trim().min(min).max(max);
const id = z.string().regex(/^[\w-]{1,60}$/, 'Invalid id');

const quizQ = z.object({ q: str(500), opts: z.array(str(300)).min(2, 'Each question needs at least two options.').max(8), correct: z.number().int().min(0), explain: str(1000).default('') })
  .refine(q => q.correct < q.opts.length, 'Mark a correct answer for every question.');
const lesson = z.object({
  id, type: z.enum(['v', 'r', 'p', 'q']), title: str(160, 1), min: z.number().int().min(1).max(600),
  summary: str(4000).optional(), points: z.array(str(300)).max(30).optional(), quiz: z.array(quizQ).max(50).optional(),
});
const courseSchema = z.object({
  title: str(80, 3), tagline: str(220).default(''), cat: z.enum(Object.keys(CATS)), level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  img: z.enum(IMAGES), about: z.array(str(2000)).max(20).default([]), outcomes: z.array(z.tuple([str(200), str(400)])).max(20).default([]),
  includes: z.array(str(200)).max(12).default([]), before: str(400).default(''),
  project: z.object({ title: str(200), text: str(1000), tags: z.array(str(40)).max(10) }).nullable().default(null),
  skills: z.array(str(60)).max(20).default([]), passMark: z.number().int().min(40).max(100).default(70),
  price: z.number().int().min(0, 'Price can’t be negative.').max(100000, 'Price must be $1,000 or less.').refine(p => p === 0 || p >= 50, 'Paid courses must cost at least $0.50 (Stripe’s minimum).').default(0),
  published: z.boolean().optional(),
  modules: z.array(z.object({ id, title: str(160, 1), lessons: z.array(lesson).max(100) })).max(40),
}).refine(c => { const ids = c.modules.flatMap(m => m.lessons.map(l => l.id)); return new Set(ids).size === ids.length; }, 'Lesson ids must be unique.');

/** Server-side publish rules (mirrors canPublish in the UI). */
function publishProblem(c) {
  const ls = lessonsOf(c);
  if (!ls.length) return 'Add at least one lesson before publishing.';
  const bad = ls.find(l => l.type === 'q' && !(l.quiz || []).length || l.type === 'q' && l.quiz.some(q => !q.q || q.opts.filter(Boolean).length < 2));
  return bad ? `Add questions to “${bad.title}” before publishing.` : null;
}

function editable(req) {
  const c = req.db.data.courses.find(x => x.id === req.params.id);
  if (!c) throw httpError(404, 'Course not found.');
  if (req.user.role !== 'admin' && c.instructor !== req.user.id) throw httpError(403, 'You can only edit your own courses.');
  return c;
}

router.post('/courses', requireAuth('instructor', 'admin'), (req, res) => {
  const c = {
    id: 'c' + Date.now().toString(36), title: 'Untitled course', cat: 'design', img: 'design', hero: 'design', level: 'Beginner', instructor: req.user.id,
    rating: 0, reviews: 0, students: 0, featured: false, published: false, price: 0, tagline: '', about: [], outcomes: [],
    includes: ['Bite-sized lessons', 'Blockchain-verified completion certificate', 'Lifetime access, at your own pace'], before: '', project: null, skills: [], passMark: 70,
    createdAt: new Date().toISOString(),
    modules: [{ id: uid('m'), title: 'Getting started', lessons: [{ id: uid('l'), type: 'v', title: 'Welcome to the course', min: 5, summary: 'Meet your instructor and see what you’ll build.', points: ['What you’ll learn', 'How the course works', 'How certificates are issued'] }] }],
  };
  req.db.data.courses.push(c);
  req.db.save();
  res.status(201).json({ course: c });
});

/** Saves details and curriculum in one call. Stats, owner and featured flag are server-managed. */
router.put('/courses/:id', requireAuth('instructor', 'admin'), validate(courseSchema), (req, res) => {
  const c = editable(req);
  const { published, ...b } = req.body;
  const next = { ...c, ...b, hero: b.img === 'design' ? 'courseHero' : b.img };
  if (published === true && !c.published) { const p = publishProblem(next); if (p) throw httpError(400, p); }
  if (published !== undefined) next.published = published;
  Object.assign(c, next);
  req.db.save();
  res.json({ course: c });
});

router.post('/courses/:id/publish', requireAuth('instructor', 'admin'), validate(z.object({ published: z.boolean() })), (req, res) => {
  const c = editable(req);
  if (req.body.published) { const p = publishProblem(c); if (p) throw httpError(400, p); }
  c.published = req.body.published;
  req.db.save();
  res.json({ course: c });
});

router.post('/courses/:id/feature', requireAuth('admin'), (req, res) => {
  const c = editable(req);
  c.featured = !c.featured;
  req.db.save();
  res.json({ course: c });
});

router.delete('/courses/:id', requireAuth('instructor', 'admin'), (req, res) => {
  const c = editable(req);
  const d = req.db.data;
  if (req.user.role !== 'admin' && d.enrollments.some(e => e.courseId === c.id)) throw httpError(409, 'Learners are enrolled. Ask an admin to remove this course.');
  d.courses = d.courses.filter(x => x.id !== c.id);
  d.enrollments = d.enrollments.filter(e => e.courseId !== c.id);
  req.db.save();
  res.json({ ok: true });
});

module.exports = router;
