'use strict';
// npm run seed → wipes data/db.json and re-creates the demo data.
const config = require('../config');
const { Store } = require('./store');
const { seed } = require('./seed');
(async () => { const db = new Store(config.dataDir); db.load(); await seed(db); await db.close(); })();
