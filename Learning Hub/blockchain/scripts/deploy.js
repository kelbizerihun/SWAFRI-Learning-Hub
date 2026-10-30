// Deploys CertificateRegistry and writes the address where the backend can find it.
// Usage: npm run deploy:local   (with `npm run node` running in another terminal)
const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const Registry = await hre.ethers.getContractFactory('CertificateRegistry');
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const address = await registry.getAddress();
  const { chainId } = await hre.ethers.provider.getNetwork();

  // Optionally authorize the backend's issuer account (if different from the deployer)
  if (process.env.ISSUER_ADDRESS && process.env.ISSUER_ADDRESS.toLowerCase() !== deployer.address.toLowerCase()) {
    await (await registry.setIssuer(process.env.ISSUER_ADDRESS, true)).wait();
    console.log('Authorized issuer', process.env.ISSUER_ADDRESS);
  }

  const out = { network: hre.network.name, chainId: Number(chainId), address, deployer: deployer.address, deployedAt: new Date().toISOString() };
  const dest = path.join(__dirname, '..', '..', 'backend', 'data', `deployment.${hre.network.name}.json`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log(`CertificateRegistry deployed to ${address} on ${hre.network.name} (chain ${chainId})`);
  console.log('Set CONTRACT_ADDRESS=' + address + ' in backend/.env');
}

main().catch(e => { console.error(e); process.exit(1); });
