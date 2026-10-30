'use strict';
/*
 * The issuer identity. One secp256k1 (Ethereum) key does two jobs:
 *   1. signs every certificate fingerprint (EIP-191 personal_sign), and
 *   2. sends the transactions that anchor fingerprints in the CertificateRegistry contract.
 * Verifiers recover the signer address from the signature and compare it with the issuer
 * address published by the platform and authorized in the contract.
 *
 * Key source: ISSUER_PRIVATE_KEY env var (recommended for real deployments, never written
 * to disk), otherwise a key generated once and kept in data/issuer.key (git-ignored).
 */
const fs = require('fs');
const path = require('path');
const { Wallet } = require('ethers');
const config = require('../config');

let wallet = null;

function loadIssuer() {
  if (wallet) return wallet;
  if (config.issuerPrivateKey) {
    wallet = new Wallet(config.issuerPrivateKey);
    return wallet;
  }
  const file = path.join(config.dataDir, 'issuer.key');
  fs.mkdirSync(config.dataDir, { recursive: true });
  if (fs.existsSync(file)) {
    wallet = new Wallet(fs.readFileSync(file, 'utf8').trim());
  } else {
    wallet = Wallet.createRandom();
    fs.writeFileSync(file, wallet.privateKey, { mode: 0o600 });
    console.log(`[issuer] Generated a new issuer key: ${wallet.address} (stored in data/issuer.key)`);
  }
  return wallet;
}

const issuerInfo = () => {
  const w = loadIssuer();
  return { name: config.issuerName, did: 'did:ethr:' + w.address, address: w.address };
};

/** Signs a certificate fingerprint (hex string) with the issuer key. */
const signHash = hash => loadIssuer().signMessage(hash);

module.exports = { loadIssuer, issuerInfo, signHash };
