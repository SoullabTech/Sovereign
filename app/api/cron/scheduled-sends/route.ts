export const dynamic = 'force-dynamic';

/**
 * SCHEDULED SENDS — due-send worker (Linux cron / systemd-timer compatible).
 *
 * Poll consent-confirmed, due, pending rows and send each via EmailRouter, then
 * record the delivery audit. Security: CRON_SECRET bearer (mirrors session-reminders).
 * F3: claim rows atomically before SMTP and never auto-resend an ambiguous
 * acceptance, even if a worker crashes after the provider call.
 *
 * Constitutional guardrails (also enforced in the SQL):
 *   - sends ONLY what a human authored and explicitly permitted (consent_confirmed = true)
 *   - sends ONLY when due (scheduled_for <= now())
 *   - email-only (the table's channel CHECK forbids anything else)
 *   - no autonomous selection: every row was authored + confirmed by a human
 *
 * Deploy: a Linux cron entry / systemd timer on minisforum hits this endpoint,
 *   e.g. every minute:  curl -H "Authorization: Bearer $CRON_SECRET" https://soullab.life/api/cron/scheduled-sends
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { EmailRouter } from '@/lib/comms/emailRouter';

const BATCH = 25;
const FROM_EMAIL = 'updates@soullab.life';

function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // No secret configured: permit only in development; fail closed in production.
    if (process.env.NODE_ENV === 'development') return true;
    console.warn('[scheduled-send] CRON_SECRET not configured');
    return false;
  }
  return request.headers.get('authorization') === `Bearer ${cronSecret}`;
}

async function processDue() {
  // One atomic reservation statement. Two workers may run concurrently but
  // SKIP LOCKED excludes an already-selected row; status flips to 'sending'
  // BEFORE we contact SMTP. No row is retried after crash or unknown outcome.
  const due = await db.query(`
    WITH claimed AS (
      SELECT s.id
      FROM scheduled_sends s
      WHERE s.status = 'pending'
        AND s.consent_confirmed = true
        AND s.scheduled_for <= now()
      ORDER BY s.scheduled_for ASC, s.id ASC
      FOR UPDATE SKIP LOCKED
      LIMIT $1
    ), updated AS (
      UPDATE scheduled_sends s
      SET status = 'sending', claim_token = gen_random_uuid(),
          claimed_at = now(), attempts = s.attempts + 1, updated_at = now()
      WHERE s.id IN (SELECT id FROM claimed) AND s.status = 'pending'
      RETURNING s.id, s.claim_token, s.practitioner_id, s.recipient_email,
                s.recipient_name, s.subject, s.body
    )
    SELECT s.*, p.name AS practitioner_name, p.email AS practitioner_email
    FROM updated s JOIN practitioners p ON p.id = s.practitioner_id
    ORDER BY s.id
  `, [BATCH]);

  let sent = 0;
  let failed = 0;
  for (const row of due.rows) {
    try {
      const router = new EmailRouter(row.practitioner_id);
      const result = await router.send({
        purpose: 'practitioner:scheduled-send',
          admission: { authority: { kind: 'system', trigger: 'scheduled-send-cron' }, destination: 'stored-record' },
        to: row.recipient_email,
        toName: row.recipient_name || undefined,
        subject: row.subject,
        bodyText: row.body,
        replyTo: row.practitioner_email || 'support@soullab.life',
      }, {
        fromEmail: FROM_EMAIL, fromName: 'Soullab',
      });

      if (result.success) {
        // The row may only be settled by the worker holding this exact claim.
        const saved = await db.query(
          `UPDATE scheduled_sends
              SET status = 'sent', sent_at = now(), provider = $3,
                  provider_message_id = $4, last_error = NULL, updated_at = now()
            WHERE id = $1 AND claim_token = $2 AND status = 'sending'
            RETURNING id`,
          [row.id, row.claim_token, result.provider, result.id ?? null]
        );
        if (saved.rowCount !== 1) {
          console.error('[ScheduledMail] provider accepted; claim settlement uncertain');
          failed++;
          continue;
        }
        sent++;
      } else {
        // A refusal may have followed remote acceptance. Never resubmit
        // automatically; the operator must reconcile the provider evidence.
        await db.query(
          `UPDATE scheduled_sends SET status = 'indeterminate',
             last_error = $3, updated_at = now()
            WHERE id = $1 AND claim_token = $2 AND status = 'sending'`,
          [row.id, row.claim_token, result.failureKind || 'provider_refused']
        );
        failed++;
        console.warn('[ScheduledMail] quarantined provider nonacceptance');
      }
    } catch (error) {
      // A network timeout or database fault may occur AFTER SMTP accepted.
      // Leave the immutable claim in 'sending' to avoid a duplicate email.
      failed++;
      console.error('[ScheduledMail] dispatch uncertainty', {
        errorClass: error instanceof Error ? error.name : 'unknown',
      });
    }
  }

  return { processed: due.rows.length, sent, failed };
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const summary = await processDue();
    return NextResponse.json({ success: true, timestamp: new Date().toISOString(), ...summary });
  } catch (error) {
    console.error('[scheduled-send] cron error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// Allow POST triggers too (some schedulers POST).
export async function POST(request: NextRequest) {
  return GET(request);
}
