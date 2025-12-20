/**
 * Apply Socratic Validator Events Migration
 *
 * This script applies the socratic_validator_events table migration directly
 * to the Supabase database using the service role key.
 *
 * Usage: npx tsx scripts/apply-validator-migration.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

async function applyMigration() {
  // Get Supabase credentials from environment
  const dbUrl = process.env.NEXT_PUBLIC_DATABASE_URL;
  const dbServiceKey = process.env.DATABASE_SERVICE_KEY;

  if (!dbUrl || !dbServiceKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    console.error('Required: NEXT_PUBLIC_DATABASE_URL, DATABASE_SERVICE_KEY');
    process.exit(1);
  }

  console.log('🔧 Connecting to Supabase...');
  const supabase = createClient(dbUrl, dbServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Read migration file
  const migrationPath = join(process.cwd(), 'supabase/migrations/20251214_socratic_validator_events.sql');
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
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: migrationSQL });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration applied successfully!');
    console.log('\n📊 Table created: socratic_validator_events');
    console.log('   - RLS policies enabled');
    console.log('   - Indexes created for analytics');
    console.log('   - Service role has full access');
    console.log('   - Users can view their own events');

  } catch (error) {
    // If exec_sql doesn't exist, try direct SQL execution
    console.log('⚠️  exec_sql RPC not available, trying direct execution...');

    // Split by statement and execute individually
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i] + ';';
      console.log(`   Executing statement ${i + 1}/${statements.length}...`);

      const { error } = await supabase.rpc('exec', { sql: stmt });

      if (error) {
        console.error(`❌ Statement ${i + 1} failed:`, error);
        console.error(`Statement: ${stmt.substring(0, 100)}...`);
        process.exit(1);
      }
    }

    console.log('✅ All migration statements executed successfully!');
  }
}

applyMigration().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
