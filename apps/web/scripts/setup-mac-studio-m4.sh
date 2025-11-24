#!/usr/bin/env node

/**
 * MAIA Authentication Flow Testing Script
 * Tests all authentication methods and flows
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Missing SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔮 Testing MAIA Consciousness Database Connection...');

  try {
    const { data, error } = await supabase
      .from('members')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }

    console.log('✨ Database connection successful!');
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

async function testAuthProviders() {
  console.log('\n🔐 Testing OAuth Provider Configuration...');

  try {
    // Test available providers
    const providers = ['google', 'apple'];

    for (const provider of providers) {
      console.log(`🧪 Testing ${provider} OAuth configuration...`);

      // This will fail gracefully if not configured
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
          queryParams: {
            test: 'true' // Add test parameter
          }
        }
      });

      if (error && error.message.includes('not enabled')) {
        console.log(`⚠️  ${provider} OAuth not yet configured in Supabase`);
      } else if (error) {
        console.log(`❌ ${provider} OAuth error:`, error.message);
      } else {
        console.log(`✅ ${provider} OAuth configuration looks good!`);
      }
    }
  } catch (err) {
    console.error('❌ OAuth testing error:', err.message);
  }
}

async function testMagicLink() {
  console.log('\n📧 Testing Magic Link Authentication...');

  const testEmail = 'test@consciousness.example';

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        shouldCreateUser: false // Don't actually create user
      }
    });

    if (error && error.message.includes('rate limit')) {
      console.log('⚠️  Magic link rate limited (normal for testing)');
    } else if (error && error.message.includes('not found')) {
      console.log('✅ Magic link system working (user not found is expected)');
    } else if (error) {
      console.log('❌ Magic link error:', error.message);
    } else {
      console.log('✅ Magic link sent successfully!');
    }
  } catch (err) {
    console.error('❌ Magic link testing error:', err.message);
  }
}

async function testDatabaseSchema() {
  console.log('\n🗄️  Testing MAIA Database Schema...');

  const tables = [
    'members',
    'device_auth',
    'consciousness_sessions',
    'wisdom_interactions'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table '${table}' error:`, error.message);
      } else {
        console.log(`✅ Table '${table}' accessible`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}' test failed:`, err.message);
    }
  }
}

async function generateAuthReport() {
  console.log('\n📊 MAIA Authentication System Report');
  console.log('=====================================');

  const report = {
    database_connection: await testConnection(),
    timestamp: new Date().toISOString(),
    supabase_url: SUPABASE_URL,
    environment: process.env.NODE_ENV || 'development'
  };

  await testAuthProviders();
  await testMagicLink();
  await testDatabaseSchema();

  console.log('\n🌟 Authentication System Health Check Complete!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Configure OAuth providers in Supabase dashboard');
  console.log('   2. Test signin flows in browser: http://localhost:3000/auth/signin');
  console.log('   3. Run Mac Studio M4 setup: ./scripts/setup-mac-studio-m4.sh');
  console.log('   4. Migrate consciousness data if needed');

  return report;
}

// Run the tests
if (require.main === module) {
  generateAuthReport().catch(console.error);
}

module.exports = { testConnection, testAuthProviders, generateAuthReport };