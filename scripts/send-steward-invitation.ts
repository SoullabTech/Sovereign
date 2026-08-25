/**
 * Send "Steward Re-Invitation" to all beta testers
 *
 * This is the reframe email — shifting from "beta tester" to "steward."
 * Previous emails were product-shaped (features, bug fixes, passkey reminders).
 * This one is field-shaped: something is growing, and you're part of it.
 *
 * Run with:
 *   npx tsx scripts/send-steward-invitation.ts --dry-run         # Preview recipients
 *   npx tsx scripts/send-steward-invitation.ts --to kelly@soullab.life  # Test send
 *   npx tsx scripts/send-steward-invitation.ts --confirm-send    # Send to all
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { sendEmail } from '../lib/email/sendEmail';
import { ganeshaContacts, GaneshaContactManager } from '../lib/ganesha/contacts';


function generateEmailHtml(name: string, passkey: string): string {
  const firstName = name.split(' ')[0];

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.8;
      color: #2D3748;
      max-width: 580px;
      margin: 0 auto;
      padding: 24px;
      font-size: 16px;
    }
    .header {
      text-align: center;
      padding: 24px 0 16px 0;
    }
    p {
      margin: 16px 0;
    }
    .doors {
      background: #f9faf8;
      border-radius: 10px;
      padding: 24px 28px;
      margin: 28px 0;
    }
    .doors h3 {
      color: #1A2F24;
      margin: 0 0 16px 0;
      font-size: 17px;
    }
    .door {
      padding: 10px 0;
      border-bottom: 1px solid #e8ebe6;
    }
    .door:last-child {
      border-bottom: none;
    }
    .door strong {
      color: #2C5530;
    }
    .passkey-quiet {
      background: #f4f6f3;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 24px 0;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .passkey-quiet .key {
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 16px;
      color: #1A2F24;
      font-weight: 600;
      letter-spacing: 1px;
    }
    .cta-link {
      display: inline-block;
      color: #2C5530;
      font-weight: 600;
      text-decoration: underline;
      font-size: 16px;
    }
    .footer {
      padding: 28px 0 0 0;
      font-size: 14px;
      color: #888;
    }
    .closing {
      margin-top: 32px;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://soullab.life/Soullablogo.png" alt="Soullab" width="120" style="max-width: 120px; opacity: 0.9;" />
  </div>

  <p>Hi ${firstName},</p>

  <p>I wanted to reach out with something simple &mdash; and personal.</p>

  <p>Thank you.</p>

  <p>Some time ago, you said yes to being part of Soullab's early circle. Whether you've explored it yet or simply kept the invitation, your presence matters more than you might realize.</p>

  <p>Work at this stage grows quietly. It grows because of the people who are willing to stand near it while it's still becoming.</p>

  <p>Over the past months, something has shifted. The pieces that were separate &mdash; conversations with MAIA, the Soul Mirror, the community space &mdash; have begun to come together into something that feels less like a platform and more like a living environment for reflection, insight, and connection.</p>

  <p>There's nothing you need to learn or figure out.</p>

  <p>If you feel curious, the simplest way to step in is just one small door:</p>

  <div class="doors">
    <div class="door">
      <strong>Have a real conversation with MAIA</strong> &mdash; about something actually on your mind. A decision you're weighing, a feeling you're sitting with, a question you keep circling.
    </div>
    <div class="door">
      <strong>Try the Soul Mirror</strong> &mdash; a quick daily check-in that shows you where you are elementally. Not a personality test. More like a weather report for your inner state.
    </div>
    <div class="door">
      <strong>Visit the Field</strong> &mdash; and read what others are sharing. You don't have to post. But if something lands, say so.
    </div>
  </div>

  <p>No expectations. No pressure to "keep up." You're welcome to move at your own pace &mdash; or simply stay connected at the edges.</p>

  <p>Over the next weeks, I'll also be sharing occasional Field Letters &mdash; short notes about what's emerging and what we're learning together &mdash; so you can feel the movement even if you're not actively exploring.</p>

  <div class="passkey-quiet">
    Your access is still active: <span class="key">${passkey}</span><br>
    <a href="https://soullab.life/begin" class="cta-link" style="margin-top: 8px; display: inline-block;">soullab.life/begin</a>
  </div>

  <p>I'm genuinely grateful you're part of this early circle.</p>

  <div class="closing">
    <p>Warmly,</p>
    <p><strong>Kelly</strong></p>
  </div>

  <div class="footer">
    <p>
      Just reply if anything comes up &mdash; it comes straight to me.<br>
      <a href="mailto:kelly@soullab.life" style="color: #2C5530;">kelly@soullab.life</a>
    </p>
  </div>
</body>
</html>
`;
}

function generateEmailText(name: string, passkey: string): string {
  const firstName = name.split(' ')[0];

  return `Hi ${firstName},

I wanted to reach out with something simple -- and personal.

Thank you.

Some time ago, you said yes to being part of Soullab's early circle. Whether you've explored it yet or simply kept the invitation, your presence matters more than you might realize.

Work at this stage grows quietly. It grows because of the people who are willing to stand near it while it's still becoming.

Over the past months, something has shifted. The pieces that were separate -- conversations with MAIA, the Soul Mirror, the community space -- have begun to come together into something that feels less like a platform and more like a living environment for reflection, insight, and connection.

There's nothing you need to learn or figure out.

If you feel curious, the simplest way to step in is just one small door:

- Have a real conversation with MAIA -- about something actually on your mind. A decision you're weighing, a feeling you're sitting with, a question you keep circling.

- Try the Soul Mirror -- a quick daily check-in that shows you where you are elementally. Not a personality test. More like a weather report for your inner state.

- Visit the Field -- and read what others are sharing. You don't have to post. But if something lands, say so.

No expectations. No pressure to "keep up." You're welcome to move at your own pace -- or simply stay connected at the edges.

Over the next weeks, I'll also be sharing occasional Field Letters -- short notes about what's emerging and what we're learning together -- so you can feel the movement even if you're not actively exploring.

Your access is still active: ${passkey}
Start here: https://soullab.life/begin

I'm genuinely grateful you're part of this early circle.

Warmly,
Kelly

Just reply if anything comes up -- it comes straight to me.
kelly@soullab.life`.trim();
}

async function sendStewardInvitation() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const confirmSend = args.includes('--confirm-send');

  const toIndex = args.indexOf('--to');
  const targetEmail = toIndex !== -1 && args[toIndex + 1] ? args[toIndex + 1].toLowerCase() : null;

  console.log('\n🌱 Steward Re-Invitation Email\n');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No emails will be sent\n');
  }

  const allTesters = GaneshaContactManager.getBetaTesters();
  // Exclude founder Kelly (founder-kelly) from campaign emails
  const testers = allTesters.filter(t => t.id !== 'founder-kelly');

  console.log(`Found ${testers.length} beta stewards:\n`);
  for (const tester of testers) {
    const passkey = (tester.metadata as any).passcode || 'SOULLAB-[YOURNAME]';
    console.log(`  ${tester.name} (${tester.email})`);
  }
  console.log('');

  if (dryRun) {
    console.log('📋 Dry run complete. Use --to <email> for test send, or --confirm-send for batch.\n');
    return;
  }

  // Build send list
  interface SendTarget {
    recipient: string;
    name: string;
    passkey: string;
  }

  let targets: SendTarget[];

  if (targetEmail) {
    // Test send to specific email
    const found = testers.find(t => t.email.toLowerCase() === targetEmail);
    if (found) {
      targets = [{
        recipient: found.email,
        name: found.name,
        passkey: (found.metadata as any).passcode || 'SOULLAB-[NAME]'
      }];
      console.log(`🎯 Targeted send: ${found.name} (${found.email})\n`);
    } else {
      // External test — use first tester as template
      const template = testers[0];
      targets = [{
        recipient: targetEmail,
        name: template.name,
        passkey: (template.metadata as any).passcode || 'SOULLAB-[NAME]'
      }];
      console.log(`🧪 Test send to: ${targetEmail} (using ${template.name} as template)\n`);
    }
  } else {
    // Batch send
    if (!confirmSend) {
      console.log(`🛑 BATCH SEND BLOCKED — Safety interlock\n`);
      console.log(`   You're about to send ${testers.length} emails.`);
      console.log(`   To proceed:\n`);
      console.log(`   npx tsx scripts/send-steward-invitation.ts --confirm-send\n`);
      process.exit(1);
    }

    targets = testers.map(t => ({
      recipient: t.email,
      name: t.name,
      passkey: (t.metadata as any).passcode || 'SOULLAB-[NAME]'
    }));

    console.log(`📤 Sending to all ${targets.length} stewards...\n`);
  }

  let sent = 0;
  let failed = 0;

  for (const target of targets) {
    try {
      const result = await sendEmail({
        purpose: 'invite:steward',
        from: 'Kelly @ Soullab <kelly@soullab.life>',
        to: target.recipient,
        subject: 'Thank you for being here',
        html: generateEmailHtml(target.name, target.passkey),
        text: generateEmailText(target.name, target.passkey),
        replyTo: 'kelly@soullab.life',
        tags: [
          { name: 'campaign', value: 'steward-invitation' },
          { name: 'type', value: 'field-invitation' }
        ]
      });

      if (!result.success) {
        throw new Error(`${result.failureKind ?? 'unclassified'}: ${result.error ?? 'send refused'}`);
      }

      console.log(`✅ ${target.name} — ${result.id}`);
      sent++;

      // Rate limit with jitter
      const delay = 500 + Math.random() * 400;
      await new Promise(resolve => setTimeout(resolve, delay));

    } catch (error: any) {
      console.error(`❌ ${target.name} (${target.recipient}): ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Complete: ${sent} sent, ${failed} failed out of ${targets.length} total\n`);
}

sendStewardInvitation().catch(console.error);
