// rollback-migration.js — Clear PostgreSQL database in case of issues
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const TABLES = [
  'Messages',
  'Conversations',
  'Notifications',
  'UserEvents',
  'UserTodos',
  'News',
  'Reports',
  'LostFound',
  'Transactions',
  'BorrowRequests',
  'Resources',
  'GroupAnnouncements',
  'GroupMembers',
  'StudyGroups',
  'PartnerRequests',
  'Users'
];

async function rollback() {
  console.log('Rolling back PostgreSQL database...\n');
  
  try {
    // Disable foreign key checks
    await pool.query('SET CONSTRAINTS ALL DEFERRED');
    
    for (const table of TABLES) {
      try {
        await pool.query(`TRUNCATE TABLE ${table} CASCADE`);
        console.log(`✓ Cleared ${table}`);
      } catch (error) {
        console.log(`⚠ Could not clear ${table}: ${error.message}`);
      }
    }
    
    // Re-enable foreign key checks
    await pool.query('SET CONSTRAINTS ALL IMMEDIATE');
    
    console.log('\n✅ Rollback completed');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
  } finally {
    await pool.end();
  }
}

rollback();
