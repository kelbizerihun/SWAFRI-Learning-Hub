'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Empty values and placeholders like PASTE_YOUR_…_HERE count as "not set"
const env = (k, d) => { const v = process.env[k]; return v === undefined || v === '' || /^PASTE_/.test(v) ? d : v; };
const bool = (k, d) => { const v = env(k); return v === undefined ? d : /^(1|true|yes|on)$/i.test(v); };

const NODE_ENV = env('NODE_ENV', 'development');
const DEV_SECRET = 'dev-only-secret-change-me';

const config = {
  env: NODE_ENV,
  port: +env('PORT', 4000),
  dataDir: path.resolve(__dirname, '..', env('DATA_DIR', 'data')),
  jwtSecret: env('JWT_SECRET', DEV_SECRET),
  jwtExpires: env('JWT_EXPIRES', '7d'),
  corsOrigins: env('CORS_ORIGIN', 'http://localhost:3000').split(',').map(s => s.trim()),
  publicAppUrl: env('PUBLIC_APP_URL', 'http://localhost:3000'),
  demoMode: bool('DEMO_MODE', true),           // allows "Reset demo data"
  ledgerDifficulty: +env('LEDGER_DIFFICULTY', 3),
  issuerName: env('ISSUER_NAME', 'Learning Hub Credentials Office'),
  issuerPrivateKey: env('ISSUER_PRIVATE_KEY', ''), // optional; generated & stored in data/ if empty

  // ---- Web3 provider (optional). Empty = ledger-only mode.
  chainRpcUrl: env('CHAIN_RPC_URL', ''),
  contractAddress: env('CONTRACT_ADDRESS', ''),
  autoDeploy: bool('AUTO_DEPLOY_CONTRACT', true),
  explorerUrl: env('EXPLORER_URL', ''),           // e.g. https://sepolia.etherscan.io
  chainConfirmations: +env('CHAIN_CONFIRMATIONS', 1),

  // ---- AI assistant: Google Gemini (optional; answers locally without a key)
  geminiKey: env('GEMINI_API_KEY', ''),
  geminiModel: env('GEMINI_MODEL', 'gemini-2.5-flash'),

  // ---- Payments: Stripe Checkout (optional; paid courses can't be bought without it)
  stripeSecretKey: env('STRIPE_SECRET_KEY', ''),
  stripeWebhookSecret: env('STRIPE_WEBHOOK_SECRET', ''),
  stripeCurrency: env('STRIPE_CURRENCY', 'usd').toLowerCase(),
};

if (config.env === 'production' && config.jwtSecret === DEV_SECRET) {
  throw new Error('Set JWT_SECRET in production.');
}

module.exports = config;
