/**
 * Ops diagnostic — Email deliverability test (Pre-phase, paywall launch).
 *
 * Proves the OPERATIONAL half of the email audit that CODE CANNOT prove:
 * that a verified @soullab.life sender actually lands in an external inbox
 * (and not spam). Code being clean ≠ deliverable.
 * See docs/specs/ENTITLEMENTS_RESOURCE_BUDGET_SPEC_2026-06-10.md §11 / §14.
 *
 * Usage (does nothing without a recipient — safe to leave in the tree):
 *   node --env-file=.env.production --import tsx scripts/ops/test-email-deliverability.ts you@gmail.com
 *   # optional explicit sender as 2nd arg:
 *   node --env-file=.env.production --import tsx scripts/ops/test-email-deliverability.ts you@gmail.com "Soullab <noreply@soullab.life>"
 *
 * After sending, CHECK BOTH the inbox AND the spam/junk folder.
 * Test at least one Gmail AND one Outlook/Hotmail address — deliverability
 * differs by provider, and SPF/DKIM/DNS gaps usually surface as spam-foldering,
 * not as a send error. A clean send here only proves Resend ACCEPTED the mail.
 */

import { Resend } from 'resend';

async function main() {
  const to = process.argv[2] || process.env.TEST_EMAIL_TO;
  const from =
    process.argv[3] || process.env.TEST_EMAIL_FROM || 'Soullab <noreply@soullab.life>';
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error(
      '✗ RESEND_API_KEY is not set. Run with `node --env-file=.env.production --import tsx scripts/ops/test-email-deliverability.ts <to>`.',
    );
    process.exit(1);
  }
  if (!to) {
    console.error(
      '✗ No recipient. Usage: ... scripts/ops/test-email-deliverability.ts <to-address> [from]',
    );
    process.exit(1);
  }

  const resend = new Resend(apiKey);
  const stamp = new Date().toISOString();

  console.log('→ Sending deliverability test:');
  console.log(`    from: ${from}`);
  console.log(`    to:   ${to}`);
  console.log(`    at:   ${stamp}`);

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: `Soullab deliverability test — ${stamp}`,
    text:
      'Automated deliverability test for the Soullab launch.\n\n' +
      'If you received this, the sender domain is delivering.\n' +
      'IMPORTANT: did it land in the INBOX or in SPAM/JUNK?\n\n' +
      `Sender: ${from}\nSent:   ${stamp}\n`,
    tags: [{ name: 'type', value: 'deliverability-test' }],
  });

  if (error) {
    console.error('✗ Resend returned an error:', error);
    process.exit(2);
  }

  console.log(`✓ Accepted by Resend. messageId: ${data?.id ?? '(none returned)'}`);
  console.log(`  NEXT: open ${to} — confirm it arrived AND whether it is inbox vs spam.`);
  console.log('  A successful send does NOT prove inbox placement — only that Resend accepted it.');
}

main().catch((e) => {
  console.error('✗ Unexpected failure:', e);
  process.exit(3);
});
