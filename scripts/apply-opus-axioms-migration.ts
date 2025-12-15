/**
 * Apply Opus Axiom Turns Migration
 *
 * This script applies the opus_axiom_turns table migration directly
 * to the Supabase database using the service role key.
 *
 * Usage: npx tsx scripts/apply-opus-axioms-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

async function applyMigration() {
  // Get Supabase credentials from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('🔧 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

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
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: migrationSQL });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration applied successfully!');
    console.log('\n📊 Table created: opus_axiom_turns');
    console.log('   - Stores Opus Axioms evaluations for DEEP path responses');
    console.log('   - Indexes created for turn_id, session_id, user_id, is_gold, rupture_detected');
    console.log('   - Ready to receive Opus consultation quality metrics');

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
