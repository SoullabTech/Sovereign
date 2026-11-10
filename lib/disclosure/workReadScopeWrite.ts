/**
 * WS-WORK-CONTINUITY · Part B — the only writer of scope events. Called by the
 * member's own gesture route and nothing else. ⛔ Not imported by the Ask route.
 */
import { query } from '@/lib/db/postgres';
import type { ScopeLevel } from '@/lib/manuscript/ask/workReadScope';

export async function appendScopeEvent(input: {
  memberId: string; livingWorkId: string; event: 'grant' | 'revoke'; level: ScopeLevel | null;
}): Promise<string | null> {
  /* Ownership proven in the SQL: the Work must be this member's. */
  const r = await query<{ id: string }>(
    `INSERT INTO work_reading_scope_events (member_id, living_work_id, event, level)
     SELECT $1, w.id, $3, $4 FROM living_works w WHERE w.id = $2 AND w.member_id = $1
     RETURNING id`,
    [input.memberId, input.livingWorkId, input.event, input.event === 'grant' ? input.level : null]);
  return r.rows[0]?.id ?? null;
}
