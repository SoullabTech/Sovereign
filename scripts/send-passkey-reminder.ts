/**
 * Send passkey reminder emails to unregistered beta testers
 * Run with: npx tsx scripts/send-passkey-reminder.ts
 *
 * Options:
 *   --dry-run           Preview without sending emails
 *   --to <email>        Send test email to any address (uses first tester's content as template)
 *   --confirm-send      Required flag to actually send batch emails (safety interlock)
 *   --single            DEPRECATED: use --to instead
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { sendEmail } from '../lib/email/sendEmail';
import { query } from '../lib/db/postgres';


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

  <p style="text-align: center; font-size: 14px; color: #666; margin-top: 20px;">
    <strong>iPhone/iPad/Mac?</strong> You can also use your TestFlight invite if you have one.<br>
    <span style="color: #888;">Android coming soon.</span>
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

iPhone/iPad/Mac? You can also use your TestFlight invite if you have one.
Android coming soon.

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

// Helper to redact passkey for logging (show prefix only)
function redactPasskey(passkey: string): string {
  // SOULLAB-NAME → SOULLAB-N***
  const parts = passkey.split('-');
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[1].charAt(0)}***`;
  }
  return passkey.substring(0, 8) + '***';
}

async function sendPasskeyReminders() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const singleMode = args.includes('--single');
  const confirmSend = args.includes('--confirm-send');

  // Parse --to <email> for targeted test sends
  const toIndex = args.indexOf('--to');
  const targetEmail = toIndex !== -1 && args[toIndex + 1] ? args[toIndex + 1].toLowerCase() : null;

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
    // Redact passkey in logs - never print full passkey to stdout
    console.log(`  • ${tester.name} (${tester.email}) - ${redactPasskey(tester.passkey)}`);
  }

  console.log('');

  if (dryRun) {
    console.log('📋 Dry run complete. Run without --dry-run to send emails.\n');
    return;
  }

  // Determine who to email and what content to use
  let testersToEmail: { recipient: string; contentSource: UnregisteredTester }[];
  let isBatchSend = false;

  if (targetEmail) {
    // --to <email>: Send to ANY email address
    // If email matches a tester, use their content; otherwise use testers[0] as template
    const found = testers.find(t => t.email.toLowerCase() === targetEmail);
    if (found) {
      // Target is an actual tester - send their real email
      testersToEmail = [{ recipient: found.email, contentSource: found }];
      console.log(`🎯 Targeted send: ${found.name} (${found.email})\n`);
    } else {
      // Target is external (e.g., kelly@soullab.life) - use testers[0] as template
      const templateTester = testers[0];
      testersToEmail = [{ recipient: targetEmail, contentSource: templateTester }];
      console.log(`🧪 Test send to: ${targetEmail}`);
      console.log(`   Using template from: ${templateTester.name} (${redactPasskey(templateTester.passkey)})\n`);
    }
  } else if (singleMode) {
    // --single: first alphabetically (DEPRECATED)
    const first = testers[0];
    testersToEmail = [{ recipient: first.email, contentSource: first }];
    console.log(`⚠️  --single is deprecated. Use --to <email> for safer testing.\n`);
    console.log(`🎯 Single mode: Only sending to ${first.name}\n`);
  } else {
    // Batch send to all testers - requires --confirm-send
    isBatchSend = true;
    testersToEmail = testers.map(t => ({ recipient: t.email, contentSource: t }));

    if (!confirmSend) {
      console.log(`🛑 BATCH SEND BLOCKED - Safety interlock\n`);
      console.log(`   You're about to send ${testersToEmail.length} emails.`);
      console.log(`   To proceed, add --confirm-send to the command:\n`);
      console.log(`   npx tsx scripts/send-passkey-reminder.ts --confirm-send\n`);
      process.exit(1);
    }

    console.log(`📤 Sending to all ${testersToEmail.length} testers (--confirm-send acknowledged)...\n`);
  }

  let sent = 0;
  let failed = 0;

  for (const { recipient, contentSource } of testersToEmail) {
    try {
      // Use neutral subject for external test sends (recipient ≠ contentSource)
      const isExternalTest = recipient.toLowerCase() !== contentSource.email.toLowerCase();
      const subject = isExternalTest
        ? 'MAIA beta passkey (test email)'
        : `${contentSource.name} — your MAIA beta passkey`;

      // Extract domain for deliverability tracking (not full email = less PII)
      // Sanitize: Resend tags only allow ASCII letters, numbers, underscores, dashes
      const rawDomain = recipient.split('@')[1] || 'unknown';
      const recipientDomain = rawDomain.replace(/\./g, '_');  // gmail.com → gmail_com

      const result = await sendEmail({
        purpose: 'auth:passkey-recovery',
        from: 'Kelly @ Soullab <kelly@soullab.life>',
        to: recipient,
        subject,
        html: generateEmailHtml(contentSource.name, contentSource.passkey),
        text: generateEmailText(contentSource.name, contentSource.passkey),
        tags: [
          { name: 'campaign', value: 'passkey-reminder' },
          { name: 'type', value: 'onboarding' },
          { name: 'domain', value: recipientDomain }
        ]
      });

      // The vendor's response shape no longer has to be guessed at with three
      // fallbacks and an `as any`: sendEmail returns one typed result, and a
      // refusal is a refusal.
      if (!result.success) {
        throw new Error(`${result.failureKind ?? 'unclassified'}: ${result.error ?? 'send refused'}`);
      }

      console.log(`✅ Sent to ${recipient} — id: ${result.id}`);
      sent++;

      // Rate limit: 500-900ms with jitter to avoid provider throttling
      const delay = 500 + Math.random() * 400;
      await new Promise(resolve => setTimeout(resolve, delay));

    } catch (error: any) {
      console.error(`❌ Failed for ${recipient}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Complete: ${sent} sent, ${failed} failed out of ${testersToEmail.length} total\n`);
}

// Run it
sendPasskeyReminders().catch(console.error);
