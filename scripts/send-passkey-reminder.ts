/**
 * Send passkey reminder emails to unregistered beta testers
 * Run with: npx tsx scripts/send-passkey-reminder.ts
 *
 * Options:
 *   --dry-run    Preview without sending emails
 *   --single     Send to one tester only (for testing)
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { Resend } from 'resend';
import { query } from '../lib/db/postgres';

// Lazy init to allow dry-run without API key
let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not found in .env.local');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface UnregisteredTester {
  name: string;
  email: string;
  passkey: string;
}

function generateEmailHtml(name: string, passkey: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #2D3748;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 30px 0;
    }
    .content {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 30px;
      margin: 20px 0;
    }
    .passkey-box {
      background: linear-gradient(135deg, #1A2F24, #2C5530);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .passkey-box h3 {
      color: #fff;
      margin: 0 0 12px 0;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .passkey {
      background: rgba(255,255,255,0.95);
      color: #1A2F24;
      font-size: 24px;
      font-weight: bold;
      padding: 16px 24px;
      border-radius: 8px;
      display: inline-block;
      font-family: monospace;
      letter-spacing: 2px;
    }
    .step {
      background: #fff;
      border-left: 4px solid #2C5530;
      padding: 12px 16px;
      margin: 8px 0;
      border-radius: 0 8px 8px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #1A2F24, #2C5530);
      color: #FFFFFF !important;
      font-size: 18px;
      font-weight: 600;
      padding: 16px 40px;
      border-radius: 8px;
      text-decoration: none;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 30px 0;
      color: #666;
      font-size: 14px;
    }
    .ignore-line {
      text-align: center;
      font-size: 13px;
      color: #888;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <!-- Preheader for inbox preview -->
  <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Your MAIA beta passkey is inside. If you already installed, ignore this.
  </div>

  <div class="header">
    <img src="https://soullab.life/Soullablogo.png" alt="Soullab" width="150" style="max-width: 150px;" />
  </div>

  <h2 style="text-align: center; color: #1A2F24;">Hi ${name},</h2>

  <p style="font-size: 18px; text-align: center; color: #2C5530; font-weight: 500;">
    Your MAIA beta access is ready.
  </p>

  <div class="content">
    <p>Quick reminder in case this email got buried — here's your passkey to begin.</p>
  </div>

  <div class="passkey-box">
    <h3>Your Passkey</h3>
    <div class="passkey">${passkey}</div>
  </div>

  <div style="text-align: center;">
    <a href="https://soullab.life/begin" class="cta-button">Begin Your Journey</a>
  </div>

  <div class="content">
    <h3 style="color: #1A2F24; margin-top: 0;">Quick Start</h3>
    <div class="step">
      <strong>1.</strong> Go to <a href="https://soullab.life/begin" style="color: #2C5530; font-weight: bold;">soullab.life/begin</a>
    </div>
    <div class="step">
      <strong>2.</strong> Click <strong>Begin Journey</strong> and enter your passkey
    </div>
    <div class="step">
      <strong>3.</strong> Create your username + password
    </div>
  </div>

  <p style="text-align: center; font-style: italic; color: #4A5568;">
    Voice mode is available — you can speak with MAIA like you're talking to a friend.
  </p>

  <p class="ignore-line">
    Already installed or signed in? You can ignore this email.
  </p>

  <div class="footer">
    <p><strong>With warmth,</strong></p>
    <p><strong>Kelly & the Soullab team</strong></p>
    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      If anything gets stuck, just reply — we'll help.<br>
      <a href="mailto:kelly@soullab.life" style="color: #2C5530;">kelly@soullab.life</a> | 504-453-9009
    </p>
  </div>
</body>
</html>
`;
}

function generateEmailText(name: string, passkey: string): string {
  return `
Hi ${name},

Quick nudge in case this got buried — your MAIA beta access is ready.

Your passkey: ${passkey}

Start here: https://soullab.life/begin
1) Click "Begin Journey"
2) Enter your passkey
3) Create your username + password

If you already installed / signed in, you can ignore this message.

If anything glitches, just reply and tell us what you're seeing (a screenshot helps).

With warmth,
Kelly & the Soullab team
`.trim();
}

async function getUnregisteredTesters(): Promise<UnregisteredTester[]> {
  const result = await query(`
    SELECT
      recipient_name as name,
      recipient_email as email,
      passkey
    FROM gift_passkeys
    WHERE redeemed_at IS NULL
      AND recipient_email IS NOT NULL
      AND recipient_name NOT LIKE 'Friend of%'
    ORDER BY recipient_name
  `);

  return result.rows;
}

async function sendPasskeyReminders() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const singleMode = args.includes('--single');

  console.log('\n📧 Passkey Reminder Email Script\n');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No emails will be sent\n');
  }

  const testers = await getUnregisteredTesters();

  if (testers.length === 0) {
    console.log('✨ All testers have registered! No reminders needed.\n');
    return;
  }

  console.log(`Found ${testers.length} unregistered testers:\n`);

  for (const tester of testers) {
    console.log(`  • ${tester.name} (${tester.email}) - ${tester.passkey}`);
  }

  console.log('');

  if (dryRun) {
    console.log('📋 Dry run complete. Run without --dry-run to send emails.\n');
    return;
  }

  const testersToEmail = singleMode ? [testers[0]] : testers;

  if (singleMode) {
    console.log(`🎯 Single mode: Only sending to ${testersToEmail[0].name}\n`);
  }

  let sent = 0;
  let failed = 0;

  for (const tester of testersToEmail) {
    try {
      const result = await getResend().emails.send({
        from: 'Kelly @ Soullab <kelly@soullab.life>',
        to: tester.email,
        subject: `${tester.name} — your MAIA beta passkey`,
        html: generateEmailHtml(tester.name, tester.passkey),
        text: generateEmailText(tester.name, tester.passkey),
        tags: [
          { name: 'campaign', value: 'passkey-reminder' },
          { name: 'type', value: 'onboarding' }
        ]
      });

      console.log(`✅ Sent to ${tester.name} (${tester.email})`);
      sent++;

      // Rate limit: wait 500ms between emails
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error: any) {
      console.error(`❌ Failed for ${tester.name}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Complete: ${sent} sent, ${failed} failed out of ${testersToEmail.length} total\n`);
}

// Run it
sendPasskeyReminders().catch(console.error);
