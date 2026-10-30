'use strict';
const jwt = require('jsonwebtoken');
const config = require('../config');
const { httpError } = require('../lib/util');

const signToken = u => jwt.sign({ sub: u.id, role: u.role }, config.jwtSecret, { expiresIn: config.jwtExpires });

/** Attaches req.user when a valid Bearer token is present (never rejects). */
function authOptional(req, res, next) {
  req.user = null;
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) {
    try {
      const { sub } = jwt.verify(h.slice(7), config.jwtSecret);
      const u = req.db.data.users.find(x => x.id === sub);
      if (u && u.status !== 'suspended') req.user = u;
    } catch (e) { /* expired or invalid token: treat as anonymous */ }
  }
  next();
}

/** requireAuth() for any signed-in user, requireAuth('admin', 'instructor') for roles. */
const requireAuth = (...roles) => (req, res, next) => {
  if (!req.user) return next(httpError(401, 'Log in to continue.'));
  if (roles.length && !roles.includes(req.user.role)) return next(httpError(403, 'This action isn’t available for your role.'));
  next();
};

/** Validates req.body with a zod schema; replaces it with the parsed (clean) value. */
const validate = schema => (req, res, next) => {
  const r = schema.safeParse(req.body ?? {});
  if (!r.success) {
    const i = r.error.issues[0];
    return next(httpError(400, i.message === 'Required' ? `${i.path.join('.')} is required.` : i.message, { field: i.path.join('.') }));
  }
  req.body = r.data;
  next();
};

/** Wraps async handlers so thrown errors reach the error middleware. */
const ah = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function notFound(req, res) { res.status(404).json({ error: 'Not found' }); }

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || (err.type === 'entity.parse.failed' ? 400 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong on our side.' : err.message, field: err.field });
}

module.exports = { signToken, authOptional, requireAuth, validate, ah, notFound, errorHandler };
