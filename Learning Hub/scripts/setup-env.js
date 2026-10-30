// Creates backend/.env from the example on first setup (never overwrites an existing one).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dest = path.join(__dirname, '..', 'backend', '.env');
if (fs.existsSync(dest)) { console.log('backend/.env already exists, leaving it as is.'); process.exit(0); }
const example = fs.readFileSync(path.join(__dirname, '..', 'backend', '.env.example'), 'utf8');
fs.writeFileSync(dest, example.replace('change-me-to-a-long-random-string', crypto.randomBytes(32).toString('hex')));
console.log('Created backend/.env (local Hardhat chain, random JWT secret).');
