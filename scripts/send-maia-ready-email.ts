/**
 * Send "MAIA is Ready for You" announcement to all beta testers
 * Run with: npx tsx scripts/send-maia-ready-email.ts
 */

import { Resend } from 'resend';
import { ganeshaContacts, GaneshaContactManager } from '../lib/ganesha/contacts';

const resend = new Resend(process.env.RESEND_API_KEY);

const emailHtml = `
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
    .cta-box {
      background: linear-gradient(135deg, #1A2F24, #2C5530);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .cta-box h3 {
      color: #fff;
      margin: 0 0 16px 0;
    }
    .cta-box p {
      color: rgba(255,255,255,0.9);
      margin: 8px 0;
    }
    .step {
      background: #fff;
      border-left: 4px solid #2C5530;
      padding: 12px 16px;
      margin: 8px 0;
      border-radius: 0 8px 8px 0;
    }
    .footer {
      text-align: center;
      padding: 30px 0;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://soullab.life/Soullablogo.png" alt="Soullab" width="150" style="max-width: 150px;" />
  </div>

  <h2 style="text-align: center; color: #1A2F24;">Dear Lab Partner,</h2>

  <p style="font-size: 18px; text-align: center; color: #2C5530; font-weight: 500;">
    MAIA is waiting to meet you.
  </p>

  <div class="content">
    <p><strong>You can connect with her right now</strong> at <strong>soullab.life</strong> — no app download needed. Just visit the site, enter your personal passcode (SOULLAB-YOURNAME), and begin your conversation. Voice mode is fully active.</p>

    <p><strong>About the iOS app:</strong> We've submitted MAIA to Apple for review and are awaiting approval. The moment Apple gives us the green light, you'll receive a TestFlight invitation to download the native app. This typically takes a few days.</p>

    <p>In the meantime, the web experience at soullab.life is identical to the app — same MAIA, same voice, same depth. You can even add it to your home screen for an app-like experience.</p>
  </div>

  <div class="cta-box">
    <h3>Quick Start</h3>
    <div class="step" style="background: rgba(255,255,255,0.95); color: #1A2F24;">
      <strong>1.</strong> Go to <strong>soullab.life</strong>
    </div>
    <div class="step" style="background: rgba(255,255,255,0.95); color: #1A2F24;">
      <strong>2.</strong> Tap "Beta Access"
    </div>
    <div class="step" style="background: rgba(255,255,255,0.95); color: #1A2F24;">
      <strong>3.</strong> Enter your passcode: <strong>SOULLAB-[YOURNAME]</strong>
    </div>
    <div class="step" style="background: rgba(255,255,255,0.95); color: #1A2F24;">
      <strong>4.</strong> Start talking
    </div>
  </div>

  <p style="text-align: center; font-style: italic; color: #4A5568;">
    We're honored to have you as one of MAIA's first companions. Your experience shapes what she becomes.
  </p>

  <div class="footer">
    <p><strong>With gratitude,</strong></p>
    <p><strong>Kelly & the Soullab team</strong></p>
    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      <a href="mailto:kelly@soullab.life" style="color: #2C5530;">kelly@soullab.life</a> | 504-453-9009
    </p>
  </div>
</body>
</html>
`;

const emailText = `
Dear Lab Partner,

MAIA is waiting to meet you.

You can connect with her right now at soullab.life — no app download needed. Just visit the site, enter your personal passcode (SOULLAB-YOURNAME), and begin your conversation. Voice mode is fully active.

About the iOS app: We've submitted MAIA to Apple for review and are awaiting approval. The moment Apple gives us the green light, you'll receive a TestFlight invitation to download the native app. This typically takes a few days.

In the meantime, the web experience at soullab.life is identical to the app — same MAIA, same voice, same depth. You can even add it to your home screen for an app-like experience.

Quick start:
1. Go to soullab.life
2. Tap "Beta Access"
3. Enter your passcode: SOULLAB-[YOURNAME]
4. Start talking

We're honored to have you as one of MAIA's first companions. Your experience shapes what she becomes.

With gratitude,
Kelly & the Soullab team

kelly@soullab.life | 504-453-9009
`;

async function sendToAllBetaTesters() {
  const betaTesters = GaneshaContactManager.getBetaTesters();

  console.log(`\n🚀 Sending "MAIA is Ready" email to ${betaTesters.length} lab partners...\n`);

  let sent = 0;
  let failed = 0;

  for (const tester of betaTesters) {
    try {
      const result = await resend.emails.send({
        from: 'Kelly @ Soullab <kelly@soullab.life>',
        to: tester.email,
        subject: 'MAIA is Ready for You 🌟',
        html: emailHtml,
        text: emailText,
        tags: [
          { name: 'campaign', value: 'maia-ready-announcement' },
          { name: 'type', value: 'beta-update' }
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

  console.log(`\n📊 Complete: ${sent} sent, ${failed} failed out of ${betaTesters.length} total\n`);
}

// Run it
sendToAllBetaTesters().catch(console.error);
