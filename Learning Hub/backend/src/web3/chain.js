'use strict';
/*
 * Web3 provider: connects to any EVM JSON-RPC endpoint (local Hardhat node, Sepolia,
 * Polygon Amoy, …) with ethers.js and anchors certificate fingerprints in the
 * CertificateRegistry contract.
 *
 *  - No CHAIN_RPC_URL           → "ledger-only" mode (certificates still work via the PoW ledger)
 *  - RPC unreachable            → keeps retrying in the background; nothing blocks the API
 *  - No CONTRACT_ADDRESS        → deploys the contract automatically (AUTO_DEPLOY_CONTRACT=true)
 *  - Local dev chain (31337)    → funds the issuer account from Hardhat's default account
 *
 * Anchoring runs in a background queue, so issuing a certificate never waits for a block.
 * Each certificate carries `evm: { status: 'pending' | 'confirmed' | 'failed', ... }`.
 */
const { JsonRpcProvider, Wallet, Contract, ContractFactory, parseEther } = require('ethers');
const artifact = require('./CertificateRegistry.json');
const config = require('../config');
const { loadIssuer } = require('./issuer');

// Hardhat/Anvil's publicly known account #0. Only ever used on local dev chains.
const DEV_FUNDER_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const DEV_CHAINS = new Set([31337, 1337]);
const NETWORK_NAMES = { 1: 'Ethereum', 11155111: 'Sepolia', 137: 'Polygon', 80002: 'Polygon Amoy', 8453: 'Base', 84532: 'Base Sepolia', 31337: 'Hardhat (local)', 1337: 'Local dev chain' };

const state = { mode: config.chainRpcUrl ? 'connecting' : 'ledger-only', chainId: null, network: null, contract: null, error: null, lastBlock: null };
let provider = null, signer = null, registry = null, db = null, retryTimer = null;
let queue = Promise.resolve();

function status() {
  return {
    mode: state.mode, network: state.network, chainId: state.chainId, contract: state.contract,
    issuer: loadIssuer().address, explorerUrl: config.explorerUrl || null, error: state.error,
  };
}
const connected = () => state.mode === 'evm' && !!registry;

async function init(store) {
  db = store;
  if (!config.chainRpcUrl) { console.log('[web3] CHAIN_RPC_URL not set: running in ledger-only mode.'); return status(); }
  try {
    await connect();
    reanchorPending();
  } catch (e) {
    state.mode = 'connecting'; state.error = e.shortMessage || e.message;
    console.warn(`[web3] Not connected (${state.error}). Retrying in 15 s…`);
    clearTimeout(retryTimer);
    retryTimer = setTimeout(() => init(store), 15000);
    retryTimer.unref?.();
  }
  return status();
}

async function connect() {
  provider = new JsonRpcProvider(config.chainRpcUrl, undefined, { staticNetwork: false, polling: true, pollingInterval: 1000 });
  const net = await withTimeout(provider.getNetwork(), 5000, 'RPC did not respond');
  state.chainId = Number(net.chainId);
  state.network = NETWORK_NAMES[state.chainId] || net.name || `Chain ${state.chainId}`;
  signer = loadIssuer().connect(provider);

  if (DEV_CHAINS.has(state.chainId)) await fundOnDevChain();

  const stored = db.data.web3?.contracts?.[state.chainId];
  let address = config.contractAddress || stored || null;
  if (address && (await provider.getCode(address)) === '0x') {
    if (config.contractAddress) throw new Error(`No contract found at CONTRACT_ADDRESS ${address} on chain ${state.chainId}`);
    console.warn('[web3] Stored contract is gone (local chain restarted?). Redeploying and re-anchoring.');
    address = null;
    markAllPending();
  }
  if (!address) {
    if (!config.autoDeploy) throw new Error('CONTRACT_ADDRESS is not set and AUTO_DEPLOY_CONTRACT is false');
    const factory = new ContractFactory(artifact.abi, artifact.bytecode, signer);
    const c = await factory.deploy();
    await c.waitForDeployment();
    address = await c.getAddress();
    db.data.web3 = db.data.web3 || { contracts: {} };
    db.data.web3.contracts[state.chainId] = address;
    db.save();
    console.log(`[web3] Deployed CertificateRegistry at ${address}`);
  }
  registry = new Contract(address, artifact.abi, signer);
  if (!(await registry.isIssuer(signer.address))) {
    throw new Error(`Issuer ${signer.address} is not authorized in the contract. Call setIssuer(${signer.address}, true) from the contract owner.`);
  }
  state.contract = address; state.mode = 'evm'; state.error = null;
  console.log(`[web3] Connected to ${state.network} (chain ${state.chainId}). Registry ${address}, issuer ${signer.address}`);
}

async function fundOnDevChain() {
  const bal = await provider.getBalance(signer.address);
  if (bal >= parseEther('1')) return;
  const funder = new Wallet(DEV_FUNDER_KEY, provider);
  if (funder.address === signer.address) return;
  const tx = await funder.sendTransaction({ to: signer.address, value: parseEther('100') });
  await tx.wait();
  console.log(`[web3] Funded issuer ${signer.address} with 100 test ETH on the local chain.`);
}

function markAllPending() {
  for (const c of db.data.certs) c.evm = { status: 'pending' };
  db.save();
}

/** Queue every certificate (and revocation) that isn't confirmed on the current chain. */
function reanchorPending() {
  if (!connected()) return;
  for (const cert of db.data.certs) {
    const onThisChain = cert.evm?.chainId === state.chainId && cert.evm?.contract === state.contract;
    if (!onThisChain || cert.evm.status !== 'confirmed') enqueueIssue(cert);
    else if (cert.status === 'revoked' && !cert.evm.revokeTxHash) enqueueRevoke(cert);
  }
}

function enqueue(job) {
  queue = queue.then(job).catch(e => console.error('[web3] queue error', e.message));
  return queue;
}

function enqueueIssue(cert) {
  if (!config.chainRpcUrl) return Promise.resolve();
  if (!cert.evm || cert.evm.status !== 'confirmed') { cert.evm = { ...(cert.evm || {}), status: 'pending' }; db?.save(); }
  if (!db) return Promise.resolve(); // picked up by reanchorPending() after init()
  return enqueue(async () => {
    if (!connected()) return; // will be picked up by reanchorPending() after reconnecting
    const live = db.data.certs.find(c => c.id === cert.id);
    if (!live) return;
    try {
      const existing = await registry.getCertificate(live.id);
      let txHash = null, blockNumber = null;
      if (existing.exists) {
        if (existing.certHash.toLowerCase() !== '0x' + live.hash) throw new Error('A different fingerprint is already on-chain for this ID');
      } else {
        const tx = await registry.issue(live.id, '0x' + live.hash, live.studentWallet);
        const rc = await tx.wait(config.chainConfirmations);
        txHash = rc.hash; blockNumber = rc.blockNumber;
      }
      live.evm = { status: 'confirmed', chainId: state.chainId, network: state.network, contract: state.contract, txHash: txHash || live.evm?.txHash || null, blockNumber: blockNumber ?? live.evm?.blockNumber ?? null, at: new Date().toISOString() };
      db.save();
      if (live.status === 'revoked') await revokeOnChain(live);
    } catch (e) {
      live.evm = { status: 'failed', error: e.shortMessage || e.message };
      db.save();
      console.error(`[web3] Anchoring ${live.id} failed: ${live.evm.error}`);
    }
  });
}

function enqueueRevoke(cert) {
  if (!config.chainRpcUrl || !db) return Promise.resolve();
  return enqueue(async () => { if (connected()) { const live = db.data.certs.find(c => c.id === cert.id); if (live) await revokeOnChain(live); } });
}

async function revokeOnChain(cert) {
  try {
    const onchain = await registry.getCertificate(cert.id);
    if (!onchain.exists) return; // issue job will handle it, then revoke
    if (onchain.revokedAt > 0n) { cert.evm.revokeTxHash = cert.evm.revokeTxHash || 'already-revoked'; db.save(); return; }
    const tx = await registry.revoke(cert.id, cert.revokeReason || 'Revoked');
    const rc = await tx.wait(config.chainConfirmations);
    cert.evm = { ...cert.evm, revokeTxHash: rc.hash, revokeBlockNumber: rc.blockNumber };
    db.save();
  } catch (e) {
    console.error(`[web3] Revoking ${cert.id} on-chain failed: ${e.shortMessage || e.message}`);
  }
}

/** Live read from the contract, used by the verification portal. */
async function readCertificate(certId) {
  if (!connected()) return null;
  try {
    const r = await withTimeout(registry.getCertificate(certId), 5000, 'RPC timeout');
    return {
      exists: r.exists, certHash: r.certHash.replace(/^0x/, ''), issuer: r.issuer, student: r.student,
      issuedAt: r.issuedAt ? new Date(Number(r.issuedAt) * 1000).toISOString() : null,
      revokedAt: r.revokedAt ? new Date(Number(r.revokedAt) * 1000).toISOString() : null,
      revokeReason: r.revokeReason || null,
    };
  } catch (e) {
    return { error: e.shortMessage || e.message };
  }
}

function withTimeout(p, ms, msg) {
  let t;
  return Promise.race([p, new Promise((_, rej) => { t = setTimeout(() => rej(new Error(msg)), ms); })]).finally(() => clearTimeout(t));
}

/** Resolves once all queued anchoring jobs are done (used by tests). */
const idle = () => queue;
function shutdown() { clearTimeout(retryTimer); provider?.destroy?.(); }

module.exports = { init, status, connected, enqueueIssue, enqueueRevoke, readCertificate, reanchorPending, idle, shutdown };
