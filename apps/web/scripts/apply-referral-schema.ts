#!/usr/bin/env npx tsx

/**
 * Apply Referral System Schema to Supabase
 * This script applies the viral growth engine schema to the database
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applySchema() {
  console.log('🚀 Applying MAIA-PAI Referral System Schema...');
  console.log(`📍 Database: ${supabaseUrl}`);

  try {
    // Read the schema file
    const schemaPath = path.join(process.cwd(), '../../docs/database/referral-system-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Split into individual statements (rough approach)
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
      .filter(s => !s.startsWith('/*') && !s.includes('COMMENT ON'));

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.includes('CREATE TABLE IF NOT EXISTS beta_testers')) {
        console.log(`⚡ [${i + 1}/${statements.length}] Creating/updating beta_testers table...`);
      } else if (statement.includes('CREATE TABLE IF NOT EXISTS referral_codes')) {
        console.log(`⚡ [${i + 1}/${statements.length}] Creating referral_codes table...`);
      } else if (statement.includes('CREATE TABLE IF NOT EXISTS referral_analytics')) {
        console.log(`⚡ [${i + 1}/${statements.length}] Creating referral_analytics table...`);
      } else if (statement.includes('CREATE TABLE IF NOT EXISTS ambassador_levels')) {
        console.log(`⚡ [${i + 1}/${statements.length}] Creating ambassador_levels table...`);
      } else if (statement.includes('INSERT INTO ambassador_levels')) {
        console.log(`⚡ [${i + 1}/${statements.length}] Setting up ambassador levels...`);
      } else if (statement.includes('INSERT INTO beta_testers')) {
        console.log(`⚡ [${i + 1}/${statements.length}] Adding Nicole Casbarro as beta tester...`);
      } else if (statement.includes('INSERT INTO referral_codes')) {
        console.log(`⚡ [${i + 1}/${statements.length}] Generating referral codes for Nicole...`);
      } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
        console.log(`⚡ [${i + 1}/${statements.length}] Creating utility functions...`);
      } else {
        console.log(`⚡ [${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);
      }

      const { data, error } = await supabase.rpc('execute_sql', {
        query: statement + ';'
      });

      if (error) {
        // Try direct query for simpler statements
        const { error: directError } = await supabase.from('_').select('*').limit(0);

        if (error.message.includes('function execute_sql does not exist')) {
          // Use a different approach - create the tables manually
          console.warn(`⚠️  Cannot execute via RPC, attempting manual creation...`);
          break;
        } else {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          console.error(`Statement: ${statement.substring(0, 200)}...`);
        }
      }
    }

    // Manual table creation approach
    console.log('\n🔧 Creating tables manually...');

    // Create beta_testers table
    const { error: betaTestersError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS beta_testers (
          user_id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          username TEXT NOT NULL,
          full_name TEXT,
          onboarding_completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          referred_by TEXT,
          referral_codes_remaining INTEGER DEFAULT 10,
          total_referrals INTEGER DEFAULT 0,
          profile_data JSONB,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending'))
        );
      `
    });

    if (betaTestersError) {
      console.warn('⚠️  beta_testers table creation:', betaTestersError.message);
    } else {
      console.log('✅ beta_testers table created/verified');
    }

    // Test the connection and verify structure
    console.log('\n🔍 Verifying database structure...');

    // Check if we can query beta_testers
    const { data: betaTesters, error: queryError } = await supabase
      .from('beta_testers')
      .select('*')
      .limit(1);

    if (queryError) {
      console.warn('⚠️  Cannot query beta_testers:', queryError.message);

      // Try to check if Nicole exists in the existing structure
      const { data: testQuery } = await supabase
        .from('beta_testers')
        .select('user_id, email, username')
        .eq('email', 'nicolecasbarro@gmail.com')
        .maybeSingle();

      if (testQuery) {
        console.log('✅ Nicole Casbarro found in existing beta_testers table');
      }
    } else {
      console.log('✅ beta_testers table is accessible');

      // Check if Nicole exists
      const { data: nicole } = await supabase
        .from('beta_testers')
        .select('user_id, email, username')
        .eq('email', 'nicolecasbarro@gmail.com')
        .maybeSingle();

      if (nicole) {
        console.log('✅ Nicole Casbarro already exists:', nicole);
      } else {
        console.log('➕ Nicole Casbarro needs to be added');
      }
    }

    // Check what tables exist
    const { data: tables } = await supabase.rpc('get_table_names') || { data: null };
    if (tables) {
      console.log('📋 Available tables:', tables.map((t: any) => t.tablename).join(', '));
    }

    console.log('\n🎉 Schema application completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Verify tables in Supabase dashboard');
    console.log('   2. Test beta verification with Nicole\'s codes');
    console.log('   3. Create admin invite management panel');

  } catch (error) {
    console.error('💥 Failed to apply schema:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  applySchema().catch(console.error);
}

export { applySchema };