'use strict';
/* Activity minutes, streaks, badges, skills and notifications. */
const { uid, dayKey, daysAgo } = require('../lib/util');

const courseById = (db, id) => db.data.courses.find(c => c.id === id);

function logMinutes(db, userId, mins) {
  const a = (db.data.activity[userId] = db.data.activity[userId] || {});
  const k = dayKey();
  a[k] = (a[k] || 0) + Math.max(0, Math.round(mins));
}

function streakOf(db, userId) {
  const a = db.data.activity[userId] || {};
  let n = 0, i = a[dayKey()] ? 0 : 1;
  while (a[dayKey(daysAgo(i))]) { n++; i++; }
  return n;
}

/* Badge rules (the browser shows them; the server decides who has earned them). */
const BADGES = [
  { id: 'first', test: (db, u) => db.data.enrollments.some(e => e.userId === u.id && e.completedAt) },
  { id: 'chain', test: (db, u) => db.data.certs.some(c => c.studentId === u.id && c.status === 'valid') },
  { id: 'data', test: (db, u) => db.data.enrollments.some(e => e.userId === u.id && e.completedAt && courseById(db, e.courseId)?.cat === 'data') },
  { id: 'early', test: (db, u) => db.data.enrollments.some(e => e.userId === u.id && Object.values(e.done).some(t => new Date(t).getHours() < 9)) },
  { id: 'ace', test: (db, u) => db.data.enrollments.some(e => e.userId === u.id && Object.values(e.quiz).some(q => q.best === 100)) },
  { id: 'streak', test: (db, u) => streakOf(db, u.id) >= 14 },
];
const earnedBadges = (db, u) => BADGES.filter(b => b.test(db, u)).map(b => b.id);

function lessonsDone(db, userId) {
  let n = 0;
  for (const e of db.data.enrollments) {
    if (e.userId !== userId) continue;
    const c = courseById(db, e.courseId);
    if (c) n += c.modules.reduce((a, m) => a + m.lessons.filter(l => e.done[l.id]).length, 0);
  }
  return n;
}

function notify(db, userId, text, link) {
  db.data.notifs.unshift({ id: uid('n'), userId, text, link, at: new Date().toISOString(), read: false });
  if (db.data.notifs.length > 2000) db.data.notifs.length = 2000;
}

/** Creates the enrollment (idempotent). Payment checks happen before this is called. */
function enrollUser(db, userId, c) {
  const d = db.data;
  const ex = d.enrollments.find(e => e.userId === userId && e.courseId === c.id);
  if (ex) return { enrollment: ex, created: false };
  const e = { id: uid('e'), userId, courseId: c.id, enrolledAt: new Date().toISOString(), done: {}, quiz: {}, watch: {}, last: null, completedAt: null, certId: null };
  d.enrollments.push(e);
  c.students = (c.students || 0) + 1;
  notify(db, userId, `You enrolled in ${c.title}.`, 'course-' + c.id);
  db.save();
  return { enrollment: e, created: true };
}

module.exports = { enrollUser, logMinutes, streakOf, earnedBadges, lessonsDone, notify, courseById };
