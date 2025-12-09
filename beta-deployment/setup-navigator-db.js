#!/usr/bin/env node

// setup-navigator-db.js - Quick setup script for Navigator PostgreSQL schema

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupNavigatorDB() {
  console.log('🗄️  Setting up Navigator decision logging database...\n');

  // Database connection
  const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'maia_consciousness',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
  });

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Read and execute schema
    console.log('📋 Loading Navigator schema...');
    const schemaPath = path.join(__dirname, 'db', 'migrations', '20251208_create_navigator_decisions.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('🏗️  Creating Navigator tables...');
    await pool.query(schemaSql);
    console.log('✅ Navigator tables created successfully\n');

    // Verify tables exist
    console.log('🔍 Verifying table creation...');
    const tableCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('navigator_decisions', 'navigator_feedback')
      ORDER BY table_name
    `);

    console.log('📊 Created tables:');
    tableCheck.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    console.log('\n🎉 Navigator database setup complete!');
    console.log('\nYou can now:');
    console.log('• Start your consciousness computing server');
    console.log('• Use the /api/consciousness/spiral-aware endpoint');
    console.log('• View logged decisions with SQL queries');
    console.log('\nExample query:');
    console.log('SELECT member_id, recommended_protocol_id, created_at FROM navigator_decisions ORDER BY created_at DESC LIMIT 5;');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('• Ensure PostgreSQL is running');
    console.error('• Check database credentials in environment variables');
    console.error('• Verify database exists or create it first');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupNavigatorDB().catch(console.error);
}

module.exports = { setupNavigatorDB };