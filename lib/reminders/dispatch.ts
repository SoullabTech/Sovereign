/**
 * DISPATCH AUTHORITY — SELF-ADDRESSED-RETURN-01 Tier 1.
 *
 * Provider idempotency stops a duplicate EMAIL. It does not stop two workers
 * both believing they own a reminder, and it says nothing about the race that
 * pre-delivery cancellation introduces: the member clicks Cancel at the same
 * moment a worker begins sending.
 *
 * So ownership is made mechanically decidable, in two stages:
 *
 *     PENDING
 *        ↓  claimDue()          atomic lease. The member may STILL cancel.
 *     CLAIMED
 *        ↓  beginDispatch()     THE LINEARIZATION POINT.
 *     DISPATCHING               cancellation is now genuinely too late
 *        ↓  markDelivered()
 *     DELIVERED
 *
 * `dispatch_started_at` is the single instant that decides the race. Before it,
 * cancellation wins and the worker cannot dispatch. After it, the send has
 * begun and the member is told so truthfully — an email cannot be recalled, and
 * we will not sell a cancellation that did not happen.
 *
 * The lease EXPIRES, so a worker that dies between claiming and dispatching
 * cannot hold a member's reminder hostage: it becomes claimable again, and
 * remains cancellable throughout.
 *
 * R32-A CONSTRAINT: every statement here touches ONLY member_reminders. No
 * join, no member, no session, no activity. The dispatch contract is about the
 * reminder's own lifecycle, never about the person.
 */

import { query } from '@/lib/db/postgres';
import { RETRY_HORIZON_HOURS } from './types';

/** How long a worker may hold a claim before it becomes claimable again. */
export const CLAIM_LEASE_MINUTES = 5;

export interface ClaimedReminder {
  id: string;
  member_id: string;
  delivery_text: string;
  delivery_deadline: Date;
  created_at: Date;
  delivery_attempts: number;
  first_attempt_at: Date | null;
  cancel_token_version: number;
  claim_token: string;
}

/**
 * Atomically lease due reminders.
 *
 * FOR UPDATE SKIP LOCKED: two workers running this concurrently take disjoint
 * sets — neither blocks, and neither can lease a row the other holds.
 *
 * The due predicates are unchanged and remain R32-A's evidence:
 *   delivery_at <= now() · cancelled_at IS NULL · delivered_at IS NULL
 * plus the lifecycle predicates that make a claim well-defined (not already
 * dispatching, not failed, lease free or expired).
 */
export async function claimDue(limit: number): Promise<ClaimedReminder[]> {
  const res = await query<ClaimedReminder>(
    `WITH due AS (
       SELECT id
         FROM member_reminders
        WHERE delivery_at <= now()
          AND cancelled_at IS NULL
          AND delivered_at IS NULL
          AND failed_at IS NULL
          AND dispatch_started_at IS NULL
          AND (claim_expires_at IS NULL OR claim_expires_at < now())
        ORDER BY delivery_at
        LIMIT $1
        FOR UPDATE SKIP LOCKED
     )
     UPDATE member_reminders r
        SET claimed_at = now(),
            claim_token = gen_random_uuid(),
            claim_expires_at = now() + ($2 || ' minutes')::interval
       FROM due
      WHERE r.id = due.id
      RETURNING r.id, r.member_id, r.delivery_text, r.delivery_deadline, r.created_at,
                r.delivery_attempts, r.first_attempt_at, r.cancel_token_version, r.claim_token`,
    [limit, String(CLAIM_LEASE_MINUTES)],
  );
  return res.rows;
}

export type DispatchOutcome =
  | { ok: true }
  | { ok: false; reason: 'cancelled' | 'lost_claim' | 'expired' | 'retry_horizon' | 'already_dispatched' };

/**
 * THE LINEARIZATION POINT. Called immediately before sendEmail.
 *
 * Every condition is re-checked inside one atomic UPDATE, so nothing observed
 * at claim time can have gone stale by dispatch time. Notably `cancelled_at IS
 * NULL` is re-checked HERE, not merely at claim: that is what makes a
 * cancellation racing a send resolve one way or the other, never both.
 */
export async function beginDispatch(
  reminderId: string,
  claimToken: string,
): Promise<DispatchOutcome> {
  const res = await query<{ id: string }>(
    `UPDATE member_reminders
        SET dispatch_started_at = now(),
            first_attempt_at = COALESCE(first_attempt_at, now()),
            delivery_attempts = delivery_attempts + 1
      WHERE id = $1
        AND claim_token = $2
        AND cancelled_at IS NULL
        AND delivered_at IS NULL
        AND dispatch_started_at IS NULL
        AND failed_at IS NULL
        AND delivery_deadline >= now()
        AND (first_attempt_at IS NULL
             OR first_attempt_at > now() - ($3 || ' hours')::interval)
      RETURNING id`,
    [reminderId, claimToken, String(RETRY_HORIZON_HOURS)],
  );

  if (res.rows.length > 0) return { ok: true };

  // Diagnose WHY, so a refusal is legible rather than a silent no-op. This
  // reads only the reminder's own row.
  const row = await query<{
    cancelled_at: Date | null;
    dispatch_started_at: Date | null;
    delivered_at: Date | null;
    claim_token: string | null;
    delivery_deadline: Date;
    first_attempt_at: Date | null;
  }>(
    `SELECT cancelled_at, dispatch_started_at, delivered_at, claim_token,
            delivery_deadline, first_attempt_at
       FROM member_reminders WHERE id = $1`,
    [reminderId],
  );
  const r = row.rows[0];
  if (!r) return { ok: false, reason: 'lost_claim' };
  if (r.cancelled_at) return { ok: false, reason: 'cancelled' };
  if (r.dispatch_started_at || r.delivered_at) return { ok: false, reason: 'already_dispatched' };
  if (r.claim_token !== claimToken) return { ok: false, reason: 'lost_claim' };
  if (new Date(r.delivery_deadline).getTime() < Date.now()) return { ok: false, reason: 'expired' };
  if (
    r.first_attempt_at &&
    Date.now() - new Date(r.first_attempt_at).getTime() > RETRY_HORIZON_HOURS * 3_600_000
  ) {
    return { ok: false, reason: 'retry_horizon' };
  }
  return { ok: false, reason: 'lost_claim' };
}

/** Terminal success. Only reachable from DISPATCHING. */
export async function markDelivered(reminderId: string): Promise<void> {
  await query(
    `UPDATE member_reminders
        SET delivered_at = now(), claim_token = NULL, claimed_at = NULL, claim_expires_at = NULL
      WHERE id = $1 AND dispatch_started_at IS NOT NULL`,
    [reminderId],
  );
}

/**
 * A send that began but did not complete.
 *
 * dispatch_started_at is deliberately CLEARED so the reminder can be retried —
 * but first_attempt_at is NOT, so the retry horizon still runs from the first
 * attempt and the provider idempotency key still covers the window. This is the
 * one transition that walks backwards, and it is why the horizon exists.
 */
export async function releaseDispatch(reminderId: string): Promise<void> {
  await query(
    `UPDATE member_reminders
        SET dispatch_started_at = NULL, claim_token = NULL, claimed_at = NULL,
            claim_expires_at = NULL
      WHERE id = $1 AND delivered_at IS NULL`,
    [reminderId],
  );
}

/** Terminal failure with a typed code. Never provider prose. */
export async function recordTerminalFailure(
  reminderId: string,
  code: string,
): Promise<void> {
  await query(
    `UPDATE member_reminders
        SET failed_at = now(), failure_code = $2, dispatch_started_at = NULL,
            claim_token = NULL, claimed_at = NULL, claim_expires_at = NULL
      WHERE id = $1 AND delivered_at IS NULL`,
    [reminderId, code],
  );
}

export type CancelResult = 'cancelled' | 'already_sending' | 'not_found';

/**
 * Member cancellation, conditional on dispatch not having begun.
 *
 * Returns a TRUTHFUL state. `already_sending` is not a failure and not an
 * error — it is the honest answer that the send has begun and cannot be
 * recalled. Reporting success there would be a lie the member acts on.
 */
export async function cancelIfNotDispatching(
  where: { id: string; memberId: string } | { cancelTokenHash: string },
): Promise<CancelResult> {
  const byToken = 'cancelTokenHash' in where;
  const res = await query<{ id: string }>(
    `UPDATE member_reminders
        SET cancelled_at = now(), claim_token = NULL, claimed_at = NULL,
            claim_expires_at = NULL
      WHERE ${byToken ? 'cancel_token_hash = $1' : 'id = $1 AND member_id = $2'}
        AND cancelled_at IS NULL
        AND delivered_at IS NULL
        AND dispatch_started_at IS NULL
      RETURNING id`,
    byToken ? [where.cancelTokenHash] : [where.id, where.memberId],
  );
  if (res.rows.length > 0) return 'cancelled';

  const existing = await query<{ cancelled_at: Date | null; dispatch_started_at: Date | null }>(
    `SELECT cancelled_at, dispatch_started_at
       FROM member_reminders
      WHERE ${byToken ? 'cancel_token_hash = $1' : 'id = $1 AND member_id = $2'}`,
    byToken ? [where.cancelTokenHash] : [where.id, where.memberId],
  );
  const row = existing.rows[0];
  if (!row) return 'not_found';
  // Idempotent: cancelling an already-cancelled reminder is still 'cancelled'.
  if (row.cancelled_at) return 'cancelled';
  return 'already_sending';
}
