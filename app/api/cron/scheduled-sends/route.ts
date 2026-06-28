export const dynamic = 'force-dynamic';

/**
 * SCHEDULED SENDS — due-send worker (Linux cron / systemd-timer compatible).
 *
 * Poll consent-confirmed, due, pending rows and send each via EmailRouter, then
 * record the delivery audit. Security: CRON_SECRET bearer (mirrors session-reminders).
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
const MAX_ATTEMPTS = 3;
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
  // The consent gate + due gate live in the query: only consent_confirmed, pending, due rows.
  const due = await db.query(
    `SELECT s.id, s.practitioner_id, s.recipient_email, s.recipient_name, s.subject, s.body, s.attempts,
            p.name AS practitioner_name
       FROM scheduled_sends s
       JOIN practitioners p ON p.id = s.practitioner_id
      WHERE s.status = 'pending' AND s.consent_confirmed = true AND s.scheduled_for <= now()
      ORDER BY s.scheduled_for ASC
      LIMIT $1`,
    [BATCH],
  );

  let sent = 0;
  let failed = 0;

  for (const row of due.rows) {
    try {
      const router = new EmailRouter(row.practitioner_id);
      const result = await router.send(
        {
          to: row.recipient_email,
          toName: row.recipient_name || undefined,
          subject: row.subject,
          bodyText: row.body, // plain text, human-authored — no HTML injection surface
        },
        { fromEmail: FROM_EMAIL, fromName: `${row.practitioner_name} via SoulLab` },
      );

      if (result.success) {
        await db.query(
          `UPDATE scheduled_sends
              SET status = 'sent', sent_at = now(), attempts = attempts + 1,
                  provider = $2, provider_message_id = $3, last_error = NULL, updated_at = now()
            WHERE id = $1`,
          [row.id, result.provider, result.id ?? null],
        );
        sent++;
        console.log(`[MAIA/scheduled-send] sent { id: ${row.id}, practitionerPrefix: ${row.practitioner_id.slice(0, 8)}, provider: ${result.provider}, messageId: ${result.id ?? 'n/a'} }`);
      } else {
        const attempts = row.attempts + 1;
        const status = attempts >= MAX_ATTEMPTS ? 'failed' : 'pending';
        await db.query(
          `UPDATE scheduled_sends SET status = $2, attempts = $3, last_error = $4, updated_at = now() WHERE id = $1`,
          [row.id, status, attempts, result.error ?? 'send failed'],
        );
        failed++;
        console.warn(`[MAIA/scheduled-send] failed { id: ${row.id}, attempts: ${attempts}, status: ${status}, error: ${result.error ?? 'unknown'} }`);
      }
    } catch (err) {
      const attempts = row.attempts + 1;
      const status = attempts >= MAX_ATTEMPTS ? 'failed' : 'pending';
      const message = err instanceof Error ? err.message : 'unknown error';
      await db
        .query(`UPDATE scheduled_sends SET status = $2, attempts = $3, last_error = $4, updated_at = now() WHERE id = $1`, [row.id, status, attempts, message])
        .catch(() => {});
      failed++;
      console.error(`[MAIA/scheduled-send] exception { id: ${row.id}, error: ${message} }`);
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
