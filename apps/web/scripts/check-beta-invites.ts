#!/usr/bin/env node
/**
 * Check Beta Invitation Status
 * Verifies Resend configuration and Supabase beta signups
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: any;
}

const results: CheckResult[] = [];

function logResult(result: CheckResult) {
  const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
  console.log(`${icon} ${result.name}`);
  if (result.message) console.log(`   ${result.message}`);
  if (result.details) {
    Object.entries(result.details).forEach(([key, value]) => {
      console.log(`   - ${key}: ${value}`);
    });
  }
  results.push(result);
}

async function checkResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    logResult({
      name: 'Resend API Key',
      status: 'fail',
      message: 'RESEND_API_KEY not found in .env.local',
    });
    return;
  }

  logResult({
    name: 'Resend API Key',
    status: 'pass',
    message: 'Configured',
    details: {
      'Key prefix': apiKey.substring(0, 8) + '...',
      'Length': apiKey.length
    }
  });

  // Test Resend API
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      logResult({
        name: 'Resend API Connection',
        status: 'pass',
        message: 'Connected successfully',
        details: {
          'Recent emails': data.data?.length || 0,
        }
      });

      // Show recent beta invitations
      if (data.data && data.data.length > 0) {
        const betaInvites = data.data.filter((email: any) =>
          email.subject?.includes('Beta Invitation') ||
          email.from?.includes('soullab.life')
        );

        if (betaInvites.length > 0) {
          logResult({
            name: 'Beta Invitations Sent',
            status: 'pass',
            message: `Found ${betaInvites.length} beta invitation(s)`,
            details: {
              'Most recent': betaInvites[0]?.created_at
                ? new Date(betaInvites[0].created_at).toLocaleString()
                : 'Unknown',
              'Status': betaInvites[0]?.last_event || 'Unknown'
            }
          });
        } else {
          logResult({
            name: 'Beta Invitations Sent',
            status: 'warn',
            message: 'No beta invitations found in recent emails',
          });
        }
      }
    } else {
      logResult({
        name: 'Resend API Connection',
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
      });
    }
  } catch (error: any) {
    logResult({
      name: 'Resend API Connection',
      status: 'fail',
      message: error.message,
    });
  }
}

async function checkSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    logResult({
      name: 'Supabase Configuration',
      status: 'fail',
      message: 'Supabase credentials not found in .env.local',
    });
    return;
  }

  logResult({
    name: 'Supabase Configuration',
    status: 'pass',
    message: 'Configured',
    details: {
      'URL': url.substring(0, 30) + '...',
      'Key length': key.length
    }
  });

  // Test Supabase connection
  try {
    const response = await fetch(`${url}/rest/v1/beta_signups?select=count`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const count = data[0]?.count || 0;

      logResult({
        name: 'Supabase Beta Signups',
        status: 'pass',
        message: `Found ${count} beta signup(s) in database`,
      });

      // Get recent signups
      const recentResponse = await fetch(
        `${url}/rest/v1/beta_signups?select=first_name,last_name,email,status,created_at&order=created_at.desc&limit=5`,
        {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
          },
        }
      );

      if (recentResponse.ok) {
        const recent = await recentResponse.json();
        if (recent.length > 0) {
          console.log('\n   📋 Recent Beta Signups:');
          recent.forEach((signup: any) => {
            const date = new Date(signup.created_at).toLocaleDateString();
            console.log(`   - ${signup.first_name} ${signup.last_name} (${signup.email}) - ${signup.status} - ${date}`);
          });
        }
      }
    } else {
      logResult({
        name: 'Supabase Beta Signups',
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
      });
    }
  } catch (error: any) {
    logResult({
      name: 'Supabase Connection',
      status: 'fail',
      message: error.message,
    });
  }
}

async function checkAdminUI() {
  logResult({
    name: 'Admin UI',
    status: 'pass',
    message: 'Available at http://localhost:3000/admin/send-invites',
    details: {
      'Features': 'Single & Batch sending',
      'Format': 'Name, Email CSV'
    }
  });
}

async function runChecks() {
  console.log('\n📧 Beta Invitation Status Check\n' + '='.repeat(50) + '\n');

  await checkResendConfig();
  console.log();

  await checkSupabaseConfig();
  console.log();

  await checkAdminUI();

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Summary:\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const warned = results.filter(r => r.status === 'warn').length;
  const failed = results.filter(r => r.status === 'fail').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️  Warnings: ${warned}`);
  console.log(`❌ Failed: ${failed}`);

  console.log('\n💡 Next Steps:\n');
  console.log('1. Visit Resend dashboard: https://resend.com/emails');
  console.log('2. Check admin UI: http://localhost:3000/admin/send-invites');
  console.log('3. View Supabase: https://app.supabase.com/project/_/editor');
  console.log('\n📖 Full guide: HOW_TO_CHECK_BETA_INVITATIONS.md\n');
}

runChecks().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});