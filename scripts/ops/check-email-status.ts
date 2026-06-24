/**
 * Ops diagnostic — Resend delivery-status lookup (Pre-phase, paywall launch).
 *
 * Reads (does NOT send) the delivery event for a previously-sent message,
 * by its Resend messageId. Distinguishes delivered vs bounced/failed
 * ("Not received"). Does NOT reveal inbox-vs-spam — only the receiving
 * mailbox knows that.
 *
 * Usage:
 *   node --env-file=.env.production --import tsx scripts/ops/check-email-status.ts <messageId>
 */

import { Resend } from 'resend';

async function main() {
  const id = process.argv[2] || process.env.MSG_ID;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('✗ RESEND_API_KEY is not set (run with `node --env-file=.env.production ...`).');
    process.exit(1);
  }
  if (!id) {
    console.error('✗ No messageId. Usage: ... scripts/ops/check-email-status.ts <messageId>');
    process.exit(1);
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.get(id);

  if (error) {
    console.error('✗ Resend lookup error:', error);
    process.exit(2);
  }

  console.log(
    JSON.stringify(
      {
        id: data?.id,
        from: data?.from,
        to: data?.to,
        subject: data?.subject,
        last_event: (data as Record<string, unknown> | null)?.last_event ?? '(none)',
        created_at: data?.created_at,
      },
      null,
      2,
    ),
  );
  console.log('--- last_event: "delivered" = reached recipient mail server (NOT inbox-vs-spam); "bounced"/"failed" = Not received ---');
}

main().catch((e) => {
  console.error('✗ Unexpected failure:', e);
  process.exit(3);
});
