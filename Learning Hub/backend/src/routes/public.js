'use strict';
const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { validate, ah } = require('../middleware');
const { uid, httpError } = require('../lib/util');
const { snapshot } = require('../services/projection');
const { verifyCertificate } = require('../services/certificates');
const chain = require('../web3/chain');
const config = require('../config');

const router = express.Router();
const formLimit = rateLimit({ windowMs: 10 * 60 * 1000, limit: 20, message: { error: 'Too many requests. Try again in a few minutes.' } });

router.get('/health', (req, res) => res.json({ ok: true, web3: chain.status().mode, time: new Date().toISOString() }));

/** The read model the UI renders from, scoped to the viewer (see services/projection.js). */
router.get('/state', (req, res) => res.json(snapshot(req.db, req.user)));

/** Public verification API. Anyone can call it, e.g. curl /api/verify/LH-2026-AB12CD */
router.get('/verify/:id', ah(async (req, res) => {
  const id = String(req.params.id).toUpperCase();
  if (!/^LH-\d{4}-[A-Z0-9]{6}$/.test(id)) throw httpError(400, 'Certificate IDs look like LH-2026-AB12CD.');
  const r = await verifyCertificate(req.db, id);
  res.status(r.found ? 200 : 404).json(r);
}));

router.get('/web3/status', (req, res) => res.json(chain.status()));

router.post('/subscribe', formLimit, validate(z.object({ email: z.string().trim().toLowerCase().email('Enter a valid email.') })), (req, res) => {
  const d = req.db.data;
  if (!d.subscribers.some(s => s.email === req.body.email)) d.subscribers.push({ email: req.body.email, at: new Date().toISOString() });
  req.db.save();
  res.json({ ok: true });
});

router.post('/contact', formLimit, validate(z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(80),
  email: z.string().trim().email('Enter a valid email.').max(160),
  topic: z.string().trim().max(80).default('General'),
  msg: z.string().trim().min(5, 'Write a short message.').max(4000),
})), (req, res) => {
  req.db.data.messages.unshift({ ...req.body, id: uid('m'), at: new Date().toISOString(), read: false });
  req.db.save();
  res.status(201).json({ ok: true });
});

/**
 * AI Learning Assistant, powered by Google Gemini (generateContent REST API).
 * Without GEMINI_API_KEY it returns 503 { fallback: true } and the UI answers from course data.
 */
router.post('/assistant', formLimit, validate(z.object({ messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(4000) })).min(1).max(12) })), ah(async (req, res) => {
  if (!config.geminiKey) return res.status(503).json({ error: 'Assistant not configured', fallback: true });
  const d = req.db.data;
  const catalog = d.courses.filter(c => c.published).map(c => `- ${c.title} (${c.level}, ${c.price ? '$' + (c.price / 100).toFixed(2) : 'free'}): ${c.tagline}`).join('\n');
  const who = req.user ? `The learner is ${req.user.name} (${req.user.role}).` : 'The visitor is not signed in.';
  const system = `You are the Learning Hub AI Learning Assistant: warm, encouraging and concise (under 120 words, plain text, no markdown headings). ${who}
Courses available:\n${catalog}
Certificates are issued when a learner completes every lesson and passes every quiz: the record gets a SHA-256 fingerprint, is signed by the issuer (secp256k1), recorded on Learning Hub's ledger and anchored in a smart contract. Anyone can verify one on the Verify page or by scanning its QR code. Recommend only courses from this list.`;

  const msgs = req.body.messages.slice();
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length) throw httpError(400, 'Send a question.');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.geminiModel)}:generateContent`;
  let r;
  try {
    r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': config.geminiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: msgs.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        // thinkingBudget 0 keeps 2.5 Flash fast and stops "thinking" from using up the output budget
        generationConfig: { temperature: 0.7, maxOutputTokens: 600, thinkingConfig: { thinkingBudget: 0 } },
      }),
      signal: AbortSignal.timeout(20000),
    });
  } catch (e) {
    console.error('[assistant] Gemini request failed:', e.message);
    return res.status(503).json({ error: 'Assistant unavailable', fallback: true });
  }
  const data = await r.json().catch(() => null);
  if (!r.ok) {
    console.error(`[assistant] Gemini error ${r.status}:`, data?.error?.message || 'unknown');
    return res.status(503).json({ error: 'Assistant unavailable', fallback: true });
  }
  const text = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
  if (!text) return res.status(503).json({ error: 'Assistant returned no answer', fallback: true });
  res.json({ text });
}));

module.exports = router;
