/**
 * Apply Beta Migrations Script
 *
 * Applies critical migrations needed for beta testing:
 * 1. Session memory tables (user_session_patterns, conversation_insights)
 * 2. Memory palace (episodic_memories, semantic_memories, etc.)
 * 3. Relationship essence (soul recognition)
 * 4. Opus axiom turns (DEEP path quality tracking)
 * 5. Community commons posts
 * 6. Socratic validator events
 *
 * Usage: npx tsx scripts/apply-beta-migrations.ts
 */

import { getPool } from '../lib/database/postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

// Critical migrations for beta in dependency order
const BETA_MIGRATIONS = [
  '20241202000001_create_session_memory_tables.sql',
  '20251213_complete_memory_palace.sql',
  '20251214_create_relationship_essence.sql',
  '20251214_create_opus_axiom_turns.sql',
  '20251214_socratic_validator_events.sql',
  '20251214_community_commons_posts.sql',
];

async function applyMigrations() {
  console.log('🔧 Starting beta migration application...\n');

  const pool = getPool();

  // Create migrations tracking table if it doesn't exist
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✅ Schema migrations table ready\n');
  } catch (error) {
    console.error('❌ Failed to create migrations table:', error);
    process.exit(1);
  }

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const migrationFile of BETA_MIGRATIONS) {
    const version = migrationFile.replace('.sql', '');

    // Check if already applied
    const { rows } = await pool.query(
      'SELECT version FROM schema_migrations WHERE version = $1',
      [version]
    );

    if (rows.length > 0) {
      console.log(`⏭️  Skipping ${migrationFile} (already applied)`);
      skipCount++;
      continue;
    }

    // Read migration file
    const migrationPath = join(process.cwd(), 'supabase/migrations', migrationFile);
    let migrationSQL: string;

    try {
      migrationSQL = readFileSync(migrationPath, 'utf-8');
    } catch (error) {
      console.error(`❌ Failed to read ${migrationFile}:`, error);
      failCount++;
      continue;
    }

    // Apply migration
    console.log(`⚡ Applying ${migrationFile}...`);

    try {
      await pool.query('BEGIN');
      await pool.query(migrationSQL);
      await pool.query(
        'INSERT INTO schema_migrations (version) VALUES ($1)',
        [version]
      );
      await pool.query('COMMIT');

      console.log(`✅ Applied ${migrationFile}\n`);
      successCount++;
    } catch (error: any) {
      await pool.query('ROLLBACK');

      // Check if error is because table already exists
      if (error.message?.includes('already exists')) {
        console.log(`⚠️  ${migrationFile} - Tables already exist, marking as applied\n`);
        await pool.query(
          'INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING',
          [version]
        );
        skipCount++;
      } else {
        console.error(`❌ Failed to apply ${migrationFile}:`);
        console.error(`   ${error.message}\n`);
        failCount++;
      }
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('MIGRATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Applied: ${successCount}`);
  console.log(`⏭️  Skipped: ${skipCount} (already applied)`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('');

  if (failCount === 0) {
    console.log('🎉 All beta migrations applied successfully!');
    console.log('   MAIA is ready for beta testing.');
  } else {
    console.log('⚠️  Some migrations failed. Check logs above.');
    process.exit(1);
  }

  await pool.end();
}

applyMigrations().catch(error => {
  console.error('❌ Migration process failed:', error);
  process.exit(1);
});
