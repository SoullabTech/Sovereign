/**
 * Scheduled messages — Level 2 / Standing Authorizations (smallest slice: one-time send).
 *
 * THE ROW IS THE PERMISSION (docs/architecture/MAIA_ASSIST_SCOPE_2026-06-17.md):
 * a human authors recipient + body + scheduled_at, and an active (status='pending') row
 * authorizes exactly one send. `processDueScheduledMessages` atomically CLAIMS each row
 * (pending -> sending) before sending — that claim IS the active-check: a row revoked
 * between scheduling and firing simply isn't claimed, so it is never sent. The claim also
 * prevents double-send.
 *
 * Smallest slice ONLY: one-time, email channel, HUMAN-AUTHORED content. No recurring,
 * no event triggers, no MAIA-authored content, no autonomous outreach.
 */

import { query } from '@/lib/db/postgres';
import { EmailRouter } from '@/lib/comms/emailRouter';

export interface ScheduledMessage {
  id: string;
  owner_member_id: string;
  channel: string;
  recipient: string;
  subject: string;
  body: string;
  scheduled_at: string;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'revoked';
  attempts: number;
  last_error: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export class ScheduledMessageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScheduledMessageError';
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Platform managed sender — matches the verified Resend domain used by the other
// member-facing senders (magic-link / recover / reset-password, app/api/members/*).
const SENDER = { fromEmail: 'noreply@soullab.life', fromName: 'Soullab' } as const;

/** Create a one-time authorization. The member is the author/authorizer (owner). */
export async function createScheduledMessage(input: {
  ownerMemberId: string;
  recipient: string;
  subject?: string;
  body: string;
  scheduledAt: string;
}): Promise<ScheduledMessage> {
  if (!input.ownerMemberId) throw new ScheduledMessageError('ownerMemberId is required');

  const recipient = (input.recipient ?? '').trim();
  if (!EMAIL_RE.test(recipient)) {
    throw new ScheduledMessageError('recipient must be a valid email address');
  }
  const body = (input.body ?? '').trim();
  if (!body) throw new ScheduledMessageError('body is required');

  const when = new Date(input.scheduledAt);
  if (isNaN(when.getTime())) {
    throw new ScheduledMessageError('scheduledAt must be a valid ISO 8601 time');
  }
  const subject = (input.subject ?? '').trim();

  const res = await query(
    `INSERT INTO scheduled_messages (owner_member_id, channel, recipient, subject, body, scheduled_at)
     VALUES ($1, 'email', $2, $3, $4, $5)
     RETURNING *`,
    [input.ownerMemberId, recipient, subject, body, when.toISOString()],
  );
  const row = res.rows[0] as ScheduledMessage;
  console.log(
    `[MAIA/scheduled-message] created { id: ${row.id}, ownerPrefix: ${input.ownerMemberId.slice(0, 8)}, at: ${when.toISOString()} }`,
  );
  return row;
}

/** Revoke a pending authorization. Only the owner can revoke; only a pending row is revocable. */
export async function revokeScheduledMessage(id: string, ownerMemberId: string): Promise<boolean> {
  const res = await query(
    `UPDATE scheduled_messages
       SET status='revoked', updated_at=now()
     WHERE id=$1 AND owner_member_id=$2 AND status='pending'
     RETURNING id`,
    [id, ownerMemberId],
  );
  const ok = (res.rowCount ?? 0) > 0;
  if (ok) console.log(`[MAIA/scheduled-message] revoked { id: ${id} }`);
  return ok;
}

/** List the owner's authorizations (for the revoke/cancel surface). */
export async function listScheduledMessages(ownerMemberId: string): Promise<ScheduledMessage[]> {
  const res = await query(
    `SELECT * FROM scheduled_messages
     WHERE owner_member_id=$1
     ORDER BY created_at DESC
     LIMIT 100`,
    [ownerMemberId],
  );
  return res.rows as ScheduledMessage[];
}

export interface ProcessResult {
  due: number;
  claimed: number;
  sent: number;
  failed: number;
}

/**
 * The executor (called by the cron/worker trigger). For each due, active row: atomically
 * claim it, then send. The claim is the only writer of a send, and only fires for rows
 * still 'pending' — i.e. still authorized.
 */
export async function processDueScheduledMessages(limit = 25): Promise<ProcessResult> {
  const due = await query(
    `SELECT id FROM scheduled_messages
     WHERE status='pending' AND scheduled_at <= now()
     ORDER BY scheduled_at ASC
     LIMIT $1`,
    [limit],
  );

  let claimed = 0;
  let sent = 0;
  let failed = 0;

  for (const { id } of due.rows as Array<{ id: string }>) {
    // ATOMIC CLAIM = the active-check Kelly required. Proceeds only if the row is STILL
    // 'pending' (not revoked) at send time; also prevents double-send.
    const claim = await query(
      `UPDATE scheduled_messages
         SET status='sending', attempts=attempts+1, updated_at=now()
       WHERE id=$1 AND status='pending'
       RETURNING *`,
      [id],
    );
    const row = claim.rows[0] as ScheduledMessage | undefined;
    if (!row) continue; // revoked or claimed elsewhere between SELECT and UPDATE
    claimed++;

    try {
      const router = new EmailRouter(row.owner_member_id);
      const result = await router.send(
        {
          to: row.recipient,
          subject: row.subject || '(no subject)',
          bodyText: row.body,
        },
        SENDER,
      );
      if (!result.success) throw new Error(result.error || 'email send failed');

      await query(
        `UPDATE scheduled_messages
           SET status='sent', sent_at=now(), last_error=NULL, updated_at=now()
         WHERE id=$1`,
        [id],
      );
      sent++;
      console.log(`[MAIA/scheduled-message] sent { id: ${id}, provider: ${result.provider} }`);
    } catch (err: any) {
      await query(
        `UPDATE scheduled_messages
           SET status='failed', last_error=$2, updated_at=now()
         WHERE id=$1`,
        [id, String(err?.message ?? 'unknown error').slice(0, 500)],
      );
      failed++;
      console.error(`[MAIA/scheduled-message] failed { id: ${id} }:`, err?.message);
    }
  }

  return { due: due.rows.length, claimed, sent, failed };
}
