'use strict';
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { authOptional, notFound, errorHandler } = require('./middleware');

/** Builds the Express app around a loaded Store (kept separate from listen() for tests). */
function createApp(db, { log = true } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins, credentials: false }));
  // Stripe webhooks need the raw request body for signature checks, so this comes before express.json()
  app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => { req.db = db; next(); }, require('./routes/payments').webhook);
  app.use(express.json({ limit: '1mb' }));
  if (log) app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
  app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 600, standardHeaders: 'draft-7', legacyHeaders: false }));
  app.use((req, res, next) => { req.db = db; next(); });
  app.use('/api', authOptional);

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api', require('./routes/public'));
  app.use('/api', require('./routes/learning'));
  app.use('/api', require('./routes/me'));
  app.use('/api', require('./routes/courses'));
  app.use('/api', require('./routes/admin'));
  app.use('/api', require('./routes/payments').router);

  app.get('/', (req, res) => res.json({ name: 'Learning Hub API', docs: '/api/health' }));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
