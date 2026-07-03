/**
 * Member lifecycle service
 *
 * Admin-managed account states (see docs/specs/MEMBER_LIFECYCLE_2026-06-10.md):
 *   - active   : normal
 *   - disabled : sign-in blocked, still visible, data preserved (reversible)
 *   - archived : sign-in blocked, hidden from active surfaces, data preserved (reversible)
 *
 * Sign-in is blocked centrally in lib/auth/serverSessions.ts::createSession() for any
 * status <> 'active'. This service additionally REVOKES live sessions when a member
 * leaves 'active', so a paused account is logged out immediately rather than living
 * until token expiry.
 *
 * HARD DELETE is NOT here — it removes the row and is a separate Phase 2 operation
 * (lib/members/purge.ts). This service never deletes member data.
 */

import { query } from '@/lib/db/postgres';
import { revokeAllSessions } from '@/lib/auth/serverSessions';

export type MemberStatus = 'active' | 'disabled' | 'archived';

export const MEMBER_STATUSES: readonly MemberStatus[] = ['active', 'disabled', 'archived'] as const;

export function isMemberStatus(v: unknown): v is MemberStatus {
  return typeof v === 'string' && (MEMBER_STATUSES as readonly string[]).includes(v);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface MemberLifecycle {
  memberId: string;
  status: MemberStatus;
  statusChangedAt: string | null;
  statusChangedBy: string | null;
  statusReason: string | null;
}

export interface SetStatusResult {
  ok: boolean;
  notFound?: boolean;
  noop?: boolean;
  memberId: string;
  previousStatus?: MemberStatus;
  status?: MemberStatus;
  username?: string | null;
  email?: string | null;
  /** sessions revoked as a side effect of leaving 'active' */
  revokedSessions: number;
}

/**
 * Read a member's current lifecycle state. Returns null if the member does not exist.
 */
export async function getMemberLifecycle(memberId: string): Promise<MemberLifecycle | null> {
  if (!UUID_RE.test(memberId)) return null;
  const result = await query(
    `SELECT id, status, status_changed_at, status_changed_by, status_reason
     FROM members WHERE id = $1`,
    [memberId]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    memberId: row.id,
    status: row.status as MemberStatus,
    statusChangedAt: row.status_changed_at ? new Date(row.status_changed_at).toISOString() : null,
    statusChangedBy: row.status_changed_by ?? null,
    statusReason: row.status_reason ?? null,
  };
}

/**
 * Set a member's lifecycle status.
 *
 * On any transition that leaves 'active' (disable / archive), all of the member's
 * live sessions are revoked so the change takes effect immediately.
 *
 * @param memberId target member
 * @param status   new lifecycle status
 * @param actorId  acting admin's member id, if known (stored for audit; null otherwise)
 * @param reason   optional human reason, stored on the record
 */
export async function setMemberStatus(
  memberId: string,
  status: MemberStatus,
  actorId?: string | null,
  reason?: string | null
): Promise<SetStatusResult> {
  if (!UUID_RE.test(memberId)) {
    return { ok: false, notFound: true, memberId, revokedSessions: 0 };
  }
  if (!isMemberStatus(status)) {
    throw new Error(`Invalid member status: ${String(status)}`);
  }

  const changedBy = actorId && UUID_RE.test(actorId) ? actorId : null;
  const cleanReason = reason && reason.trim() ? reason.trim().slice(0, 1000) : null;

  // Capture previous + new + identity in one statement.
  const result = await query(
    `WITH prev AS (SELECT status AS previous_status FROM members WHERE id = $1)
     UPDATE members m
        SET status = $2,
            status_changed_at = NOW(),
            status_changed_by = $3,
            status_reason = $4
       FROM prev
      WHERE m.id = $1
      RETURNING m.status AS new_status, prev.previous_status, m.username, m.email`,
    [memberId, status, changedBy, cleanReason]
  );

  if (result.rows.length === 0) {
    return { ok: false, notFound: true, memberId, revokedSessions: 0 };
  }

  const row = result.rows[0];
  const previousStatus = row.previous_status as MemberStatus;
  const newStatus = row.new_status as MemberStatus;

  // Revoke live sessions whenever the member is no longer active.
  let revokedSessions = 0;
  if (newStatus !== 'active') {
    revokedSessions = await revokeAllSessions(memberId, `account_${newStatus}`);
  }

  return {
    ok: true,
    noop: previousStatus === newStatus,
    memberId,
    previousStatus,
    status: newStatus,
    username: row.username ?? null,
    email: row.email ?? null,
    revokedSessions,
  };
}
