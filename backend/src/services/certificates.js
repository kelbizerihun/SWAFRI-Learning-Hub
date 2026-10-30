'use strict';
/*
 * Certificate lifecycle.
 *
 *  issue:  build record → SHA-256 of canonical record → issuer signs the fingerprint →
 *          MINT_CERTIFICATE tx mined into the Learning Hub ledger → fingerprint queued for
 *          anchoring in the CertificateRegistry contract on the configured EVM chain.
 *  revoke: REVOKE_CERTIFICATE tx mined + contract.revoke(). The original record stays.
 *  verify: recompute fingerprint, check signature, check ledger block, check revocation,
 *          and (when an EVM chain is configured) compare with the on-chain record.
 */
const { verifyMessage } = require('ethers');
const { sha256, canonical, newCertId, lessonsOf, short } = require('../lib/util');
const ledger = require('../lib/ledger');
const { issuerInfo, signHash } = require('../web3/issuer');
const chain = require('../web3/chain');

/** Exactly the fields that are fingerprinted. Must match certPayload() in the browser. */
const certPayload = c => ({
  id: c.id, studentName: c.studentName, studentWallet: c.studentWallet, courseId: c.courseId, courseTitle: c.courseTitle,
  instructorName: c.instructorName, issuedAt: c.issuedAt, score: c.score, skills: c.skills, issuer: c.issuer,
});
const fingerprint = c => sha256(canonical(certPayload(c)));

async function issueCertificate(db, enr, when) {
  const d = db.data;
  const u = d.users.find(x => x.id === enr.userId);
  const c = d.courses.find(x => x.id === enr.courseId);
  if (!u || !c) return null;
  if (enr.certId) return d.certs.find(x => x.id === enr.certId) || null;

  const quizzes = lessonsOf(c).filter(l => l.type === 'q');
  const score = quizzes.length ? Math.round(quizzes.reduce((a, q) => a + (enr.quiz[q.id]?.best ?? 100), 0) / quizzes.length) : 100;
  const issuedAt = (when || new Date()).toISOString();
  const iss = issuerInfo();
  let id = newCertId();
  while (d.certs.some(x => x.id === id)) id = newCertId();

  const cert = {
    id, studentId: u.id, studentName: u.name, studentWallet: u.wallet, studentHandle: u.handle, courseId: c.id, courseTitle: c.title,
    instructorName: d.users.find(x => x.id === c.instructor)?.name || 'Learning Hub', issuedAt, score, skills: c.skills.slice(0, 6),
    issuer: { name: iss.name, did: iss.did },
  };
  cert.hash = fingerprint(cert);
  cert.signature = await signHash(cert.hash);
  cert.signer = iss.address;

  const tx = { type: 'MINT_CERTIFICATE', certId: cert.id, certHash: cert.hash, to: u.wallet, issuer: iss.did, at: issuedAt };
  const block = ledger.mineBlock(d.chain, [tx], issuedAt);
  Object.assign(cert, { txHash: ledger.txHash(tx), blockIndex: block.index, blockHash: block.hash, status: 'valid' });

  d.certs.push(cert);
  enr.certId = cert.id;
  enr.completedAt = enr.completedAt || issuedAt;
  db.save();
  chain.enqueueIssue(cert);
  return cert;
}

function revokeCertificate(db, certId, reason) {
  const d = db.data;
  const cert = d.certs.find(c => c.id === certId);
  if (!cert || cert.status === 'revoked') return null;
  const at = new Date().toISOString();
  const tx = { type: 'REVOKE_CERTIFICATE', certId, certHash: cert.hash, reason, issuer: issuerInfo().did, at };
  const b = ledger.mineBlock(d.chain, [tx], at);
  Object.assign(cert, { status: 'revoked', revokedAt: at, revokeReason: reason, revokeBlock: b.index });
  db.save();
  chain.enqueueRevoke(cert);
  return cert;
}

/** Server-side verification, for API consumers (employers' systems, the judges' curl…). */
async function verifyCertificate(db, id) {
  const d = db.data;
  const rec = d.certs.find(c => c.id === id);
  if (!rec) return { found: false, verdict: 'not_found', id };
  const iss = issuerInfo();
  const steps = [];

  const recomputed = fingerprint(rec);
  const hashOk = recomputed === rec.hash;
  steps.push({ k: 'hash', ok: hashOk, title: 'Certificate fingerprint matches', detail: hashOk ? `SHA-256 ${rec.hash}` : 'The record was changed after it was issued.' });

  let sigOk = false;
  try { sigOk = verifyMessage(rec.hash, rec.signature).toLowerCase() === iss.address.toLowerCase() && rec.issuer?.did === iss.did; } catch (e) { sigOk = false; }
  steps.push({ k: 'sig', ok: sigOk, title: 'Signed by a trusted issuer', detail: sigOk ? `${iss.name} · ${iss.did} · ECDSA secp256k1` : 'The issuer signature doesn’t match this certificate.' });

  const block = d.chain.find(b => b.index === rec.blockIndex && b.hash === rec.blockHash);
  let anchorOk = false, anchorDetail = 'No block on the ledger contains this certificate’s fingerprint.';
  if (block) {
    const tx = block.txs.find(t => t.type === 'MINT_CERTIFICATE' && t.certId === rec.id);
    const issues = ledger.checkBlock(block, d.chain[block.index - 1]);
    anchorOk = !!tx && tx.certHash === recomputed && !issues.length;
    anchorDetail = anchorOk ? `Block #${block.index} · ${short(block.hash, 14)}` : (issues[0] || 'The on-chain fingerprint differs from this record.');
  }
  steps.push({ k: 'chain', ok: anchorOk, title: 'Anchored on the Learning Hub ledger', detail: anchorDetail });

  const rev = ledger.findTx(d.chain, t => t.type === 'REVOKE_CERTIFICATE' && t.certId === rec.id)?.tx || null;

  const onchain = await onchainInfo(rec);
  if (onchain.step) steps.push(onchain.step);

  steps.push({ k: 'rev', ok: !rev && !onchain.revoked, title: 'Not revoked', detail: rev ? `Revoked · ${rev.reason || 'No reason given'}` : 'No revocation transaction found.' });

  const failed = !hashOk || !sigOk || !anchorOk || (onchain.step && onchain.step.ok === false);
  const verdict = failed ? 'invalid' : (rev || onchain.revoked) ? 'revoked' : 'valid';
  return { found: true, verdict, steps, record: publicRecord(rec), block, revocation: rev, issuer: iss, onchain: onchain.data };
}

/** Reads the contract and describes the EVM anchor. `step` is null when no chain is configured. */
async function onchainInfo(rec) {
  const st = chain.status();
  const base = { configured: st.mode !== 'ledger-only', mode: st.mode, network: st.network, chainId: st.chainId, contract: st.contract, explorerUrl: st.explorerUrl, anchor: rec.evm || null };
  if (st.mode === 'ledger-only') return { data: base, step: null };
  if (rec.evm?.status !== 'confirmed') {
    const pending = !rec.evm || rec.evm.status === 'pending';
    return { data: base, step: { k: 'evm', ok: null, pending: true, title: pending ? 'EVM anchor pending' : 'EVM anchor not yet recorded', detail: pending ? `Waiting for ${st.network || 'the network'} to confirm the transaction.` : (rec.evm.error || 'Anchoring will be retried.') } };
  }
  const live = await chain.readCertificate(rec.id);
  if (!live || live.error) {
    return { data: { ...base, live: null }, step: { k: 'evm', ok: null, pending: true, title: 'Recorded on ' + (rec.evm.network || 'EVM chain'), detail: `Tx ${short(rec.evm.txHash || '', 12)} · the network is unreachable right now, so it couldn’t be re-read.` } };
  }
  const match = live.exists && live.certHash === fingerprint(rec);
  return {
    data: { ...base, live },
    revoked: !!live.revokedAt,
    step: { k: 'evm', ok: match, title: `Anchored on ${rec.evm.network || 'EVM chain'} smart contract`, detail: match ? `Contract ${short(st.contract, 10)} · tx ${short(rec.evm.txHash || '', 12)} · block ${rec.evm.blockNumber}` : live.exists ? 'The fingerprint stored on-chain differs from this record.' : 'The contract has no record of this certificate.' },
  };
}

const publicRecord = rec => { const { studentId, ...pub } = rec; return pub; };

module.exports = { certPayload, fingerprint, issueCertificate, revokeCertificate, verifyCertificate, onchainInfo, publicRecord };
