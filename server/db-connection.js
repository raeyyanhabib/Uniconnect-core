const path = require('path');
require('dotenv').config();

let db = null;
let pool = null;
const dbType = process.env.DB_TYPE || 'sqlite';

// Initialize connection based on DB_TYPE
async function initializeDatabase() {
  if (dbType === 'postgres') {
    const { Pool } = require('pg');
    // PostgreSQL initialization
    const connectionString = process.env.DATABASE_URL || 
                             process.env.POSTGRES_URL || 
                             process.env.POSTGRES_URL_NON_POOLING ||
                             process.env.POSTGRES_PRISMA_URL;
                             
    pool = new Pool({
      connectionString,
      max: 10,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Create pool
    try {
      console.log('Connecting to PostgreSQL...');
      if (!connectionString) {
        throw new Error('DATABASE_URL is missing! Please connect Vercel Postgres in the Storage tab.');
      }
      
      // Verification query to ensure connection is live
      await pool.query('SELECT NOW()');
      console.log('PostgreSQL connection established');
    } catch (error) {
      console.error('DATABASE CONNECTION ERROR:', error.message);
      // Don't throw here, let the adapter handle it or fail gracefully later
    }

    return createPostgresAdapter();
  } else {
    // SQLite initialization - only loaded locally
    const Database = require('better-sqlite3');
    db = new Database(path.join(__dirname, 'uniconnect.db'));
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Load schema
    try {
      const fs = require('fs');
      const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      const statements = schema.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          db.exec(statement);
        }
      }
      console.log('SQLite database ready (uniconnect.db)');
    } catch (error) {
      console.error('Error initializing SQLite schema:', error);
      throw error;
    }

    return createSQLiteAdapter();
  }
}

// SQLite adapter - maintains same API
function createSQLiteAdapter() {
  return {
    prepare: (sql) => {
      return db.prepare(sql);
    },
    exec: (sql) => {
      return db.exec(sql);
    },
    run: (sql, params) => {
      return db.prepare(sql).run(params);
    },
    get: (sql, params) => {
      return db.prepare(sql).get(params);
    },
    all: (sql, params) => {
      return db.prepare(sql).all(params);
    },
    transaction: (fn) => {
      return db.transaction(fn)();
    },
    close: () => {
      if (db) db.close();
    }
  };
}

// Helper to translate '?' placeholders to '$1, $2, ...' for PostgreSQL
function translateSql(sql) {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

// Helper to normalize parameters for PostgreSQL
function normalizeParams(args) {
  if (args.length === 0) return [];
  if (args.length === 1) {
    if (Array.isArray(args[0])) return args[0];
    if (typeof args[0] === 'object' && args[0] !== null) return Object.values(args[0]);
  }
  return args;
}

// PostgreSQL adapter - mimics SQLite API
function createPostgresAdapter() {
  return {
    prepare: (sql) => {
      const translated = translateSql(sql);
      return {
        run: async (...args) => {
          try {
            const p = normalizeParams(args);
            return await pool.query(translated, p);
          } catch (error) {
            throw error;
          }
        },
        get: async (...args) => {
          try {
            const p = normalizeParams(args);
            const result = await pool.query(translated, p);
            return result.rows[0];
          } catch (error) {
            throw error;
          }
        },
        all: async (...args) => {
          try {
            const p = normalizeParams(args);
            const result = await pool.query(translated, p);
            return result.rows;
          } catch (error) {
            throw error;
          }
        }
      };
    },
    exec: async (sql) => {
      try {
        await pool.query(sql);
      } catch (error) {
        throw error;
      }
    },
    run: async (sql, ...args) => {
      try {
        const p = normalizeParams(args);
        return await pool.query(translateSql(sql), p);
      } catch (error) {
        throw error;
      }
    },
    get: async (sql, ...args) => {
      try {
        const p = normalizeParams(args);
        const result = await pool.query(translateSql(sql), p);
        return result.rows[0];
      } catch (error) {
        throw error;
      }
    },
    all: async (sql, ...args) => {
      try {
        const p = normalizeParams(args);
        const result = await pool.query(translateSql(sql), p);
        return result.rows;
      } catch (error) {
        throw error;
      }
    },
    transaction: async (fn) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await fn();
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    close: async () => {
      if (pool) await pool.end();
    }
  };
}

module.exports = {
  initializeDatabase,
  getDbType: () => dbType
};
