'use strict';
/* Helpers shared across services. Hashing MUST match the browser exactly
   (frontend/lib/hub.js: sha256 + canonical) so certificates verify on both sides. */
const crypto = require('crypto');
const { getAddress } = require('ethers');

const sha256 = str => crypto.createHash('sha256').update(String(str), 'utf8').digest('hex');

/** Deterministic JSON: object keys sorted at every level. */
const canonical = o => {
  if (o === null || typeof o !== 'object') return JSON.stringify(o);
  if (Array.isArray(o)) return '[' + o.map(canonical).join(',') + ']';
  return '{' + Object.keys(o).sort().map(k => JSON.stringify(k) + ':' + canonical(o[k])).join(',') + '}';
};

const uid = (p = 'id') => p + '_' + crypto.randomBytes(5).toString('hex');
const CERT_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCertId = () => 'LH-' + new Date().getFullYear() + '-' + Array.from({ length: 6 }, () => CERT_ALPHABET[crypto.randomInt(32)]).join('');

const dayKey = (d = new Date()) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const short = (h, n = 10) => (h ? `${h.slice(0, n)}…${h.slice(-6)}` : '');

/** Every learner gets an address automatically (no keys to manage, nothing to buy). */
const walletAddr = (id, email) => getAddress('0x' + sha256('lh-wallet:' + id + ':' + email).slice(0, 40));

const handleFor = (name, users) => {
  const base = String(name).toLowerCase().replace(/^dr\.?\s+/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'learner';
  let h = base, i = 2;
  while (users.some(u => u.handle === h)) h = base + '-' + i++;
  return h;
};

// ---- course helpers
const lessonsOf = c => c.modules.flatMap(m => m.lessons.map(l => ({ ...l, moduleId: m.id, moduleTitle: m.title })));
const courseMinutes = c => lessonsOf(c).reduce((a, l) => a + (+l.min || 0), 0);
const doneCount = (e, c) => (c ? lessonsOf(c).filter(l => e.done[l.id]).length : 0);
const progressOf = (e, c) => { if (!e || !c) return 0; const n = lessonsOf(c).length; return n ? Math.round(doneCount(e, c) / n * 100) : 0; };

function autoSummary(t, ct) { return `In this lesson you’ll work through “${t}” step by step, with practical examples you can apply right away in ${ct}.`; }
function autoPoints(t) { return [`Why “${t.replace(/^Practice:\s*|^Project:\s*|^Capstone:\s*|^Lab:\s*/, '')}” matters`, 'Worked example, start to finish', 'Common mistakes and how to avoid them', 'A quick recap to lock it in']; }

/** Expands the compact seed format into the stored course shape. */
function normalizeCourse(c) {
  return {
    id: c.id, title: c.title, cat: c.cat, img: c.img, hero: c.hero || c.img, level: c.level, instructor: c.instructor,
    rating: c.rating ?? 0, reviews: c.reviews ?? 0, students: c.students ?? 0, featured: !!c.featured, published: c.published ?? true,
    tagline: c.tagline || '', about: c.about || [], outcomes: c.outcomes || [], includes: c.includes || [], before: c.before || '',
    project: c.project || null, skills: c.skills || [], passMark: c.passMark || 70, price: c.price || 0, createdAt: c.createdAt || daysAgo(120).toISOString(),
    modules: (c.modules || []).map((m, mi) => ({
      id: 'm' + (mi + 1) + (m.k || ''), title: m.t, lessons: m.l.map((l, li) => {
        const [type, title, min, extra, points] = l;
        const o = { id: `m${mi + 1}l${li + 1}`, type, title, min };
        if (type === 'q') o.quiz = extra.map(([q, opts, correct, explain]) => ({ q, opts, correct, explain }));
        else { o.summary = extra || autoSummary(title, c.title); o.points = points || autoPoints(title); }
        return o;
      }),
    })),
  };
}

/** Error with an HTTP status, picked up by the error middleware. */
class HttpError extends Error {
  constructor(status, message, extra) { super(message); this.status = status; Object.assign(this, extra); }
}
const httpError = (status, message, extra) => new HttpError(status, message, extra);

module.exports = {
  sha256, canonical, uid, newCertId, dayKey, daysAgo, short, walletAddr, handleFor,
  lessonsOf, courseMinutes, doneCount, progressOf, autoSummary, autoPoints, normalizeCourse, HttpError, httpError,
};
