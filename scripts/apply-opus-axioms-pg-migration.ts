/**
 * Apply Opus Axiom Turns Migration (PostgreSQL)
 *
 * This script applies the opus_axiom_turns table migration directly
 * to the local PostgreSQL database using the DATABASE_URL.
 *
 * Usage: npx tsx scripts/apply-opus-axioms-pg-migration.ts
 */

import { getPool } from '../lib/database/postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

async function applyMigration() {
  console.log('🔧 Connecting to PostgreSQL...');

  const pool = getPool();

  // Read migration file
  const migrationPath = join(process.cwd(), 'supabase/migrations/20251214_create_opus_axiom_turns.sql');
  console.log(`📖 Reading migration: ${migrationPath}`);

  let migrationSQL: string;
  try {
    migrationSQL = readFileSync(migrationPath, 'utf-8');
  } catch (error) {
    console.error('❌ Failed to read migration file:', error);
    process.exit(1);
  }

  // Apply migration
  console.log('⚡ Applying migration to database...');

  try {
    await pool.query(migrationSQL);

    console.log('✅ Migration applied successfully!');
    console.log('\n📊 Table created: opus_axiom_turns');
    console.log('   - Stores Opus Axioms evaluations for DEEP path responses');
    console.log('   - Indexes created for turn_id, session_id, user_id, is_gold, rupture_detected');
    console.log('   - Ready to receive Opus consultation quality metrics');

    // Verify table was created
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'opus_axiom_turns'
      ORDER BY ordinal_position
    `);

    if (result.rows.length > 0) {
      console.log('\n✅ Table structure verified:');
      result.rows.forEach((row: any) => {
        console.log(`   - ${row.column_name}: ${row.data_type}`);
      });
    }

  } catch (error: any) {
    // Check if table already exists
    if (error.message?.includes('already exists')) {
      console.log('⚠️  Table opus_axiom_turns already exists - skipping migration');

      // Verify existing table structure
      const result = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'opus_axiom_turns'
        ORDER BY ordinal_position
      `);

      console.log('\n✅ Existing table structure:');
      result.rows.forEach((row: any) => {
        console.log(`   - ${row.column_name}: ${row.data_type}`);
      });

    } else {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  } finally {
    await pool.end();
  }
}

applyMigration().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
