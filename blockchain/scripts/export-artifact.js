// Copies the compiled ABI + bytecode into the backend so the API can deploy and
// talk to the contract without depending on Hardhat at runtime.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'artifacts', 'contracts', 'CertificateRegistry.sol', 'CertificateRegistry.json');
const dest = path.join(__dirname, '..', '..', 'backend', 'src', 'web3', 'CertificateRegistry.json');
const { contractName, abi, bytecode } = JSON.parse(fs.readFileSync(src, 'utf8'));
fs.writeFileSync(dest, JSON.stringify({ contractName, abi, bytecode }, null, 2));
console.log('Exported artifact to', path.relative(process.cwd(), dest));
