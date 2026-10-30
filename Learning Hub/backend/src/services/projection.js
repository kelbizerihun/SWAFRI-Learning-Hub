'use strict';
/*
 * Builds the read model the browser renders from (GET /api/state).
 *
 * The UI is a fast client-rendered app, so it receives one snapshot shaped like the
 * prototype's local state. The server decides what goes into it per viewer:
 *
 *   anonymous   published catalog (no quiz answer keys), public profiles, public certificate
 *               registry + ledger, events and careers
 *   student     + their own enrollments, notes, bookmarks, goals, notifications, activity
 *   instructor  + their drafts with answer keys, enrollments & learners in their courses
 *   admin       everything except password hashes and keys
 */
const { earnedBadges, lessonsDone } = require('./learning');
const chain = require('../web3/chain');
const { issuerInfo } = require('../web3/issuer');
const config = require('../config');

const PRIVATE_USER_FIELDS = ['pwHash'];
const stripSecrets = u => { const o = { ...u }; PRIVATE_USER_FIELDS.forEach(k => delete o[k]); return o; };

function stripAnswers(c) {
  return { ...c, modules: c.modules.map(m => ({ ...m, lessons: m.lessons.map(l => (l.type === 'q' ? { ...l, quiz: (l.quiz || []).map(q => ({ q: q.q, opts: q.opts })) } : l)) })) };
}

function snapshot(db, viewer) {
  const d = db.data;
  const role = viewer?.role;
  const isAdmin = role === 'admin';
  const own = x => viewer && x.userId === viewer.id;

  const myEnrolledCourseIds = new Set(viewer ? d.enrollments.filter(own).map(e => e.courseId) : []);
  const teaches = c => viewer && c.instructor === viewer.id;

  // Courses: catalog + anything you teach + anything you're enrolled in (learners keep access).
  const courses = d.courses
    .filter(c => c.published || isAdmin || teaches(c) || myEnrolledCourseIds.has(c.id))
    .map(c => (isAdmin || teaches(c) ? c : stripAnswers(c)));

  // Enrollments
  let enrollments = [];
  if (isAdmin) enrollments = d.enrollments;
  else if (role === 'instructor') { const mine = new Set(d.courses.filter(teaches).map(c => c.id)); enrollments = d.enrollments.filter(e => mine.has(e.courseId)); }
  else if (viewer) enrollments = d.enrollments.filter(own);

  // Users: full record for yourself/admins, public profile for everyone else.
  const myLearners = new Set(role === 'instructor' ? enrollments.map(e => e.userId) : []);
  const users = d.users.filter(u => isAdmin || u.status !== 'suspended' || u.id === viewer?.id).map(u => {
    if (isAdmin || u.id === viewer?.id) return { ...stripSecrets(u), earnedBadges: u.role === 'student' ? earnedBadges(db, u) : [], lessonsDone: u.role === 'student' ? lessonsDone(db, u.id) : 0 };
    const p = { id: u.id, name: u.name, role: u.role, handle: u.handle, avatarUrl: u.avatarUrl, title: u.title, bio: u.bio, years: u.years, taught: u.taught, irating: u.irating };
    if (u.role === 'student') {
      p.walletPublic = !!u.walletPublic;
      if (u.walletPublic || myLearners.has(u.id)) Object.assign(p, { university: u.university, field: u.field, academic: u.academic, city: u.city, wallet: u.wallet, earnedBadges: earnedBadges(db, u), lessonsDone: lessonsDone(db, u.id) });
    }
    return p;
  });

  const notesOut = {};
  if (viewer) for (const [k, v] of Object.entries(d.notes)) if (k.startsWith(viewer.id + '|')) notesOut[k] = v;

  return {
    v: 3,
    meId: viewer?.id || null,
    demoMode: config.demoMode,
    users,
    courses,
    enrollments,
    certs: d.certs,           // public registry: certificates are meant to be verifiable by anyone
    chain: d.chain,           // public ledger
    events: d.events,
    careers: d.careers,
    eventRegs: d.eventRegs.map(r => (isAdmin || own(r) ? r : { eventId: r.eventId, userId: null, at: r.at })),
    applications: isAdmin ? d.applications : d.applications.filter(own),
    saved: d.saved.filter(own),
    notes: notesOut,
    activity: isAdmin ? d.activity : viewer ? { [viewer.id]: d.activity[viewer.id] || {} } : {},
    goals: d.goals.filter(own),
    notifs: d.notifs.filter(own).slice(0, 50),
    messages: isAdmin ? d.messages : [],
    subscribers: isAdmin ? d.subscribers : [],
    payments: (isAdmin ? d.payments : d.payments.filter(own)).map(({ checkoutUrl, ...p }) => p),
    payEnabled: !!config.stripeSecretKey,
    issuer: issuerInfo(),
    web3: chain.status(),
    tamperBackup: isAdmin && d.tamperBackup ? { index: d.tamperBackup.index } : null,
  };
}

module.exports = { snapshot, stripSecrets, stripAnswers };
