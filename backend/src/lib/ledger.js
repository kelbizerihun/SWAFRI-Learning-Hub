'use strict';
/*
 * The Learning Hub ledger: an append-only chain of blocks with real SHA-256 hashing,
 * Merkle roots and proof of work. Every certificate mint and revocation is a transaction
 * in a block. It always works (even with no EVM network), powers the Ledger Explorer and
 * tamper demo, and is published read-only to the browser so verification can run there.
 *
 * When an EVM network is configured (see web3/chain.js) each certificate fingerprint is
 * ALSO anchored in the CertificateRegistry smart contract.
 */
const { sha256, canonical } = require('./util');
const config = require('../config');

const txHash = tx => sha256(canonical(tx));

function merkleRoot(hashes) {
  if (!hashes.length) return sha256('');
  let level = hashes.slice();
  while (level.length > 1) {
    const next = [];
    for (let i = 0; i < level.length; i += 2) next.push(sha256(level[i] + (level[i + 1] ?? level[i])));
    level = next;
  }
  return level[0];
}

const headerStr = b => `${b.index}|${b.timestamp}|${b.prevHash}|${b.merkleRoot}|${b.nonce}`;
const target = () => '0'.repeat(config.ledgerDifficulty);

function mineBlock(chain, txs, timestamp) {
  const prev = chain[chain.length - 1];
  const b = { index: chain.length, timestamp: timestamp || new Date().toISOString(), prevHash: prev ? prev.hash : '0'.repeat(64), txs, nonce: 0 };
  b.merkleRoot = merkleRoot(txs.map(txHash));
  let h = sha256(headerStr(b));
  while (!h.startsWith(target())) { b.nonce++; h = sha256(headerStr(b)); }
  b.hash = h;
  chain.push(b);
  return b;
}

function checkBlock(b, prev) {
  const issues = [];
  if (sha256(headerStr(b)) !== b.hash) issues.push('Block hash doesn’t match its contents');
  if (!b.hash.startsWith(target())) issues.push('Proof of work is missing');
  if (merkleRoot(b.txs.map(txHash)) !== b.merkleRoot) issues.push('Transactions were altered (Merkle root mismatch)');
  if (prev && b.prevHash !== prev.hash) issues.push('Link to previous block is broken');
  return issues;
}

function validateChain(chain) {
  for (let i = 0; i < chain.length; i++) {
    const issues = checkBlock(chain[i], chain[i - 1]);
    if (issues.length) return { ok: false, at: i, issues };
  }
  return { ok: true, blocks: chain.length };
}

const findTx = (chain, pred) => { for (const b of chain) for (const t of b.txs) if (pred(t)) return { block: b, tx: t }; return null; };

module.exports = { txHash, merkleRoot, headerStr, mineBlock, checkBlock, validateChain, findTx };
