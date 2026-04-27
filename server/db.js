// db.js — Legacy entry point, now uses abstraction layer
const { initializeDatabase } = require('./db-connection');

let db = null;

// Initialize database on module load
(async () => {
  try {
    db = await initializeDatabase();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
})();

// Wait for initialization
function getDb() {
  if (!db) {
    throw new Error('Database not initialized yet');
  }
  return db;
}

module.exports = {
  get: getDb,
  prepare: (sql) => {
    const database = getDb();
    return database.prepare(sql);
  },
  exec: (sql) => {
    const database = getDb();
    return database.exec(sql);
  },
  run: (sql, params) => {
    const database = getDb();
    return database.run(sql, params);
  },
  all: (sql, params) => {
    const database = getDb();
    return database.all(sql, params);
  },
  get: (sql, params) => {
    const database = getDb();
    return database.get(sql, params);
  },
  transaction: (fn) => {
    const database = getDb();
    return database.transaction(fn);
  }
};
