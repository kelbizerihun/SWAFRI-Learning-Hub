const { expect } = require('chai');
const { ethers } = require('hardhat');

const H1 = '0x' + 'ab'.repeat(32);
const H2 = '0x' + 'cd'.repeat(32);

describe('CertificateRegistry', () => {
  let registry, owner, issuer, student, stranger;

  beforeEach(async () => {
    [owner, issuer, student, stranger] = await ethers.getSigners();
    registry = await (await ethers.getContractFactory('CertificateRegistry')).deploy();
    await registry.waitForDeployment();
  });

  it('makes the deployer the owner and an issuer', async () => {
    expect(await registry.owner()).to.equal(owner.address);
    expect(await registry.isIssuer(owner.address)).to.equal(true);
  });

  it('issues a certificate and verifies its fingerprint', async () => {
    await expect(registry.issue('LH-2026-AAAAAA', H1, student.address)).to.emit(registry, 'CertificateIssued');
    const c = await registry.getCertificate('LH-2026-AAAAAA');
    expect(c.exists).to.equal(true);
    expect(c.certHash).to.equal(H1);
    expect(c.student).to.equal(student.address);
    expect(c.issuer).to.equal(owner.address);
    const [matches, revoked] = await registry.verify('LH-2026-AAAAAA', H1);
    expect(matches).to.equal(true);
    expect(revoked).to.equal(false);
    expect((await registry.verify('LH-2026-AAAAAA', H2)).matches).to.equal(false);
    expect(await registry.totalIssued()).to.equal(1n);
  });

  it('refuses duplicate IDs and empty hashes', async () => {
    await registry.issue('LH-2026-AAAAAA', H1, student.address);
    await expect(registry.issue('LH-2026-AAAAAA', H2, student.address)).to.be.revertedWithCustomError(registry, 'AlreadyIssued');
    await expect(registry.issue('LH-2026-BBBBBB', ethers.ZeroHash, student.address)).to.be.revertedWithCustomError(registry, 'EmptyHash');
  });

  it('only lets authorized issuers write', async () => {
    await expect(registry.connect(stranger).issue('LH-2026-AAAAAA', H1, student.address)).to.be.revertedWithCustomError(registry, 'NotIssuer');
    await expect(registry.connect(stranger).setIssuer(stranger.address, true)).to.be.revertedWithCustomError(registry, 'NotOwner');
    await registry.setIssuer(issuer.address, true);
    await registry.connect(issuer).issue('LH-2026-AAAAAA', H1, student.address);
    expect((await registry.getCertificate('LH-2026-AAAAAA')).issuer).to.equal(issuer.address);
  });

  it('revokes with a reason, once', async () => {
    await registry.issue('LH-2026-AAAAAA', H1, student.address);
    await expect(registry.revoke('LH-2026-AAAAAA', 'Issued in error')).to.emit(registry, 'CertificateRevoked');
    const c = await registry.getCertificate('LH-2026-AAAAAA');
    expect(c.revokedAt).to.be.greaterThan(0n);
    expect(c.revokeReason).to.equal('Issued in error');
    expect((await registry.verify('LH-2026-AAAAAA', H1)).revoked).to.equal(true);
    await expect(registry.revoke('LH-2026-AAAAAA', 'again')).to.be.revertedWithCustomError(registry, 'AlreadyRevoked');
    await expect(registry.revoke('LH-2026-ZZZZZZ', 'x')).to.be.revertedWithCustomError(registry, 'UnknownCertificate');
  });
});
