/**
 * ASTRO-PRO-04 (#1893) — audited, revocable Pro tester grants.
 *
 * The append-only astro_pro_tester_grant_events table is the only source of a
 * non-founder's Pro standing: their latest event decides. A grant admits no one
 * by itself — proAccess.ts consults it only in the 'tester-grant' phase.
 */
import { query } from '@/lib/db/postgres';

export type ProTesterGrantAction = 'grant' | 'revoke';

/** True only when the member's latest event is a grant. Throws on lookup failure; callers fail closed. */
export async function hasActiveProTesterGrant(memberId: string): Promise<boolean> {
  const result = await query<{ action: ProTesterGrantAction }>(
    `SELECT action FROM astro_pro_tester_grant_events
      WHERE member_id = $1 ORDER BY id DESC LIMIT 1`,
    [memberId],
  );
  return result.rows[0]?.action === 'grant';
}

export async function recordProTesterGrantEvent(input: {
  memberId: string;
  action: ProTesterGrantAction;
  actorMemberId: string;
  reason?: string | null;
}): Promise<void> {
  await query(
    `INSERT INTO astro_pro_tester_grant_events (member_id, action, actor_member_id, reason)
     VALUES ($1, $2, $3, $4)`,
    [input.memberId, input.action, input.actorMemberId, input.reason ?? null],
  );
}

export interface ProTesterStanding {
  memberId: string;
  username: string | null;
  action: ProTesterGrantAction;
  occurredAt: string;
}

/** Each member's latest event, for the founder's review of who holds Pro. */
export async function listProTesterStandings(): Promise<ProTesterStanding[]> {
  const result = await query<{ member_id: string; username: string | null; action: ProTesterGrantAction; occurred_at: Date }>(
    `SELECT DISTINCT ON (e.member_id) e.member_id, m.username, e.action, e.occurred_at
       FROM astro_pro_tester_grant_events e JOIN members m ON m.id = e.member_id
      ORDER BY e.member_id, e.id DESC`,
  );
  return result.rows.map((r) => ({
    memberId: r.member_id,
    username: r.username,
    action: r.action,
    occurredAt: r.occurred_at.toISOString(),
  }));
}
