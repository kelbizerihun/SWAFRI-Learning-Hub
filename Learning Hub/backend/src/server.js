'use strict';
const config = require('./config');
const { Store } = require('./db/store');
const { seed } = require('./db/seed');
const { createApp } = require('./app');
const chain = require('./web3/chain');
const { issuerInfo } = require('./web3/issuer');

async function main() {
  const db = new Store(config.dataDir);
  if (!db.load()) await seed(db);
  const app = createApp(db);
  const server = app.listen(config.port, () => {
    console.log(`\n  Learning Hub API → http://localhost:${config.port}/api`);
    console.log(`  Issuer           → ${issuerInfo().did}\n`);
  });
  chain.init(db); // connects to the EVM provider in the background

  const stop = async () => { console.log('\nShutting down…'); chain.shutdown(); server.close(); await db.close(); process.exit(0); };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch(e => { console.error(e); process.exit(1); });
