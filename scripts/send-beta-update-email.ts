/**
 * Send "Beta Update - Sign-in Fixed" announcement to all beta testers
 * Run with: npx tsx scripts/send-beta-update-email.ts
 */

import { sendEmail } from '../lib/email/sendEmail';

/** Failures that mean every remaining recipient in this run would fail too. */
const TRANSPORT_WIDE_FAILURES = new Set<string>([
  'quota_exceeded', 'provider_auth', 'provider_config', 'not_configured',
]);
import { GaneshaContactManager } from '../lib/ganesha/contacts';


const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.7;
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
      padding: 20px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #1A2F24, #2C5530);
      color: #fff;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 24px 0;
    }
    .list-item {
      padding: 8px 0;
      padding-left: 20px;
      position: relative;
    }
    .list-item::before {
      content: "\\2713";
      position: absolute;
      left: 0;
      color: #2C5530;
      font-weight: bold;
    }
    .footer {
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

  <div class="content">
    <p>Hi everyone,</p>

    <p>Quick update on the MAIA beta.</p>

    <p>We've just completed a full pass on <strong>sign-in, signup, and onboarding</strong>, and everything is now working cleanly end-to-end. This includes:</p>

    <div class="list-item">Smooth registration with your SOULLAB passkey</div>
    <div class="list-item">Reliable sign-in (no more onboarding stalls)</div>
    <div class="list-item">Clean handling of edge cases we discovered during early testing</div>

    <p>If you previously tried to register and got stuck, you should now be able to <strong>sign in normally and continue</strong> without issue.</p>

    <p style="text-align: center;">
      <a href="https://soullab.life" class="cta-button">Jump Back In</a>
    </p>

    <p>Thank you for your patience — the early feedback helped us tighten the foundations, and we're feeling really good about where the beta is now.</p>

    <p>More soon,</p>
    <p><strong>Kelly</strong></p>
  </div>

  <div class="footer">
    <p style="font-size: 12px; color: #999;">
      <a href="mailto:kelly@soullab.life" style="color: #2C5530;">kelly@soullab.life</a>
    </p>
  </div>
</body>
</html>
`;

const emailText = `
Hi everyone,

Quick update on the MAIA beta.

We've just completed a full pass on sign-in, signup, and onboarding, and everything is now working cleanly end-to-end. This includes:

- Smooth registration with your SOULLAB passkey
- Reliable sign-in (no more onboarding stalls)
- Clean handling of edge cases we discovered during early testing

If you previously tried to register and got stuck, you should now be able to sign in normally and continue without issue.

You're welcome to jump back in at: https://soullab.life

Thank you for your patience — the early feedback helped us tighten the foundations, and we're feeling really good about where the beta is now.

More soon,
Kelly

kelly@soullab.life
`;

async function sendToAllBetaTesters() {
  const betaTesters = GaneshaContactManager.getBetaTesters();

  console.log(`\n📧 Sending "Beta Update" email to ${betaTesters.length} lab partners...\n`);

  let sent = 0;
  let failed = 0;

  for (const tester of betaTesters) {
    try {
      const result = await sendEmail({
        purpose: 'broadcast:update',
        triggerType: 'script',
        triggerRef: 'send-beta-update-email',
        campaignRef: 'beta-signin-fixed',
        from: 'Kelly @ Soullab <kelly@soullab.life>',
        to: tester.email,
        subject: 'MAIA Beta Update: Sign-in Fixed',
        html: emailHtml,
        text: emailText,
        tags: [
          { name: 'campaign', value: 'beta-signin-fixed' },
          { name: 'type', value: 'beta-update' }
        ]
      });

      // The vendor REFUSES by resolving, so this loop counted refusals as
      // sends: a blast against an exhausted quota reported 100% delivered.
      if (!result.success) {
        console.error(
          `❌ REFUSED for ${tester.name}: failureKind=${result.failureKind ?? 'unclassified'} providerCode=${result.providerCode ?? 'unnamed'}`
        );
        failed++;
        if (TRANSPORT_WIDE_FAILURES.has(result.failureKind ?? '')) {
          console.error(`⛔ ABORTING — ${result.failureKind} is transport-wide; remaining recipients not attempted.`);
          break;
        }
        continue;
      }

      console.log(`✅ Sent to ${tester.name}`);
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
