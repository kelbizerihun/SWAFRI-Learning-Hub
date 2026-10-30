'use strict';
/*
 * Tiny persistent document store.
 *
 * All platform data lives in one JSON document (data/db.json) that is loaded into memory
 * on start and written back atomically (write to a temp file, then rename) shortly after
 * every change. Node runs request handlers on one thread, so in-memory reads/writes are
 * consistent without locks.
 *
 * This keeps the prototype zero-install (no database server for the team to set up).
 * Every service talks to the store only through `db.data` and `db.save()`, so swapping in
 * MongoDB/PostgreSQL later means replacing this file and the collection access in services.
 */
const fs = require('fs');
const path = require('path');

const SCHEMA_VERSION = 5;

class Store {
  constructor(dir) {
    this.dir = dir;
    this.file = path.join(dir, 'db.json');
    this.data = null;
    this.timer = null;
    this.writing = Promise.resolve();
  }

  /** Returns true when an existing database was loaded. */
  load() {
    fs.mkdirSync(this.dir, { recursive: true });
    if (!fs.existsSync(this.file)) return false;
    try {
      const d = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      if (d && d.v === SCHEMA_VERSION) { this.data = d; return true; }
      console.warn('[db] Schema changed; re-seeding a fresh database.');
    } catch (e) {
      const bad = this.file + '.corrupt-' + Date.now();
      fs.renameSync(this.file, bad);
      console.error(`[db] Could not parse db.json (moved to ${path.basename(bad)}); re-seeding.`);
    }
    return false;
  }

  replace(data) { this.data = { ...data, v: SCHEMA_VERSION }; this.saveNow(); }

  /** Debounced write: many changes in one request become one disk write. */
  save() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 100);
  }

  saveNow() { clearTimeout(this.timer); this.writeSync(); }

  flush() {
    const json = JSON.stringify(this.data);
    this.writing = this.writing.then(() => new Promise(resolve => {
      const tmp = this.file + '.tmp';
      fs.writeFile(tmp, json, err => {
        if (err) { console.error('[db] write failed', err); return resolve(); }
        fs.rename(tmp, this.file, e => { if (e) console.error('[db] rename failed', e); resolve(); });
      });
    }));
    return this.writing;
  }

  writeSync() {
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.data));
    fs.renameSync(tmp, this.file);
  }

  async close() { if (this.timer) { clearTimeout(this.timer); await this.flush(); } await this.writing; }
}

module.exports = { Store, SCHEMA_VERSION };
