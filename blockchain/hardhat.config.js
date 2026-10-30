require('@nomicfoundation/hardhat-ethers');
require('@nomicfoundation/hardhat-chai-matchers');
require('dotenv').config();
const path = require('path');
const { subtask } = require('hardhat/config');
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require('hardhat/builtin-tasks/task-names');

// Use the solc compiler bundled in node_modules (npm "solc") so compiling works
// offline, e.g. on hackathon Wi-Fi that blocks binaries.soliditylang.org.
subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, hre, runSuper) => {
  if (args.solcVersion === '0.8.24') {
    return { compilerPath: path.join(__dirname, 'node_modules', 'solc', 'soljson.js'), isSolcJs: true, version: '0.8.24', longVersion: '0.8.24+commit.e11b9ed9' };
  }
  return runSuper();
});

const accounts = process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: { version: '0.8.24', settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    // `npm run node` starts this chain on http://127.0.0.1:8545 (chain id 31337)
    localhost: { url: 'http://127.0.0.1:8545' },
    // Public testnets: set DEPLOYER_PRIVATE_KEY and the RPC URL in blockchain/.env
    sepolia: { url: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org', accounts },
    amoy: { url: process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology', accounts },
  },
};
