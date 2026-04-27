// migrate-data.js — Migrate data from SQLite to PostgreSQL
require('dotenv').config();
const Database = require('better-sqlite3');
const { Pool } = require('pg');
const path = require('path');

const sourceDb = new Database(path.join(__dirname, 'uniconnect.db'));
const targetPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
});

// Define tables in order of dependencies
const TABLES = [
  'Users',
  'PartnerRequests',
  'StudyGroups',
  'GroupMembers',
  'GroupAnnouncements',
  'Resources',
  'BorrowRequests',
  'Transactions',
  'Conversations',
  'Messages',
  'Notifications',
  'LostFound',
  'Reports',
  'News',
  'UserTodos',
  'UserEvents'
];

async function migrateTable(tableName) {
  console.log(`\nMigrating table: ${tableName}`);
  
  try {
    // Get all data from SQLite
    const rows = sourceDb.prepare(`SELECT * FROM ${tableName}`).all();
    
    if (rows.length === 0) {
      console.log(`  ✓ Table empty, skipping`);
      return;
    }

    // For each row, insert into PostgreSQL
    let successCount = 0;
    for (const row of rows) {
      const columns = Object.keys(row);
      const values = Object.values(row);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(',');
      const insertSql = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
      
      try {
        await targetPool.query(insertSql, values);
        successCount++;
      } catch (error) {
        console.error(`  ✗ Failed to insert row in ${tableName}:`, error.message);
      }
    }

    // Verify count
    const countResult = await targetPool.query(`SELECT COUNT(*) FROM ${tableName}`);
    const pgCount = parseInt(countResult.rows[0].count);
    
    console.log(`  ✓ Migrated ${successCount} rows (PostgreSQL now has ${pgCount} total rows)`);
    
    if (successCount !== rows.length) {
      console.warn(`  ⚠ Warning: ${rows.length - successCount} rows failed to migrate`);
    }
  } catch (error) {
    console.error(`✗ Error migrating ${tableName}:`, error.message);
    throw error;
  }
}

async function runMigration() {
  console.log('Starting data migration from SQLite to PostgreSQL...\n');
  
  try {
    // Disable foreign key checks temporarily
    await targetPool.query('SET CONSTRAINTS ALL DEFERRED');
    
    for (const table of TABLES) {
      await migrateTable(table);
    }
    
    // Re-enable foreign key checks
    await targetPool.query('SET CONSTRAINTS ALL IMMEDIATE');
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    sourceDb.close();
    await targetPool.end();
  }
}

// Run migration
runMigration();
