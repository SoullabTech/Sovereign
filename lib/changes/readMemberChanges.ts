/**
 * The canonical member-owned Changes read — one query, two callers.
 *
 * MAIA-NODE-05 §1 is explicit: if conversation has to duplicate domain logic in
 * order to use a capability, repair the invocation seam instead. So this is an
 * EXTRACTION, not a second path. The SQL, the parameters and the row mapping
 * were moved here verbatim from `GET /api/changes`, which now calls this
 * function and keeps its own authorization exactly where it was.
 *
 * ⛔ Authorization does NOT live here. Every caller must already have resolved a
 * credential-verified member id (`getMemberIdFromRequest`) before calling. This
 * function takes the member as an argument and scopes the query to it; it has no
 * way to authenticate anyone and must never be handed an id from an untrusted
 * source such as a request body or a bare header.
 *
 * ── Ordering ──
 * `created_at DESC`, unchanged. Ruled in MAIA-NODE-05 §13: it matches the
 * member's own Changes surface and has one transparent meaning — most recently
 * named. ⛔ Not `updated_at`: a differently ordered reality from the domain UI is
 * exactly what this must not introduce.
 */

import db from '@/lib/db/postgres';

/** Statuses `GET /api/changes` accepts as a filter — the member-settable set. */
export const FILTERABLE_CHANGE_STATUSES = [
  'naming', 'active', 'integrating', 'complete', 'archived',
] as const;

export interface MemberChange {
  id: string;
  memberId: string;
  title: string;
  description: string | null;
  changeType: string | null;
  emotionalState: string | null;
  urgency: string | null;
  hexagramNumber: number | null;
  hexagramName: string | null;
  relatingHexagramNumber: number | null;
  changingLines: number[];
  castingMethod: string | null;
  castAt: string | Date | null;
  councilResult: unknown;
  hexagramInterpretation: unknown;
  notes: string | null;
  questions: string[];
  followUpIntention: string | null;
  status: string;
  iterationCount: number;
  consultedAt: string | Date | null;
  createdAt: string | Date | null;
  updatedAt: string | Date | null;
  parentChangeId: string | null;
  rootChangeId: string | null;
  experienceCount: number;
}

export interface ReadMemberChangesOptions {
  /** One of FILTERABLE_CHANGE_STATUSES. Anything else is ignored, as before. */
  status?: string | null;
  /** Clamped to 100, as before. */
  limit?: number;
}

/**
 * Every Change owned by this member.
 *
 * With no `status`, archived rows are excluded — the original default, preserved.
 */
export async function readMemberChanges(
  memberId: string,
  options: ReadMemberChangesOptions = {},
): Promise<MemberChange[]> {
  const limit = Math.min(options.limit ?? 50, 100);
  const status = options.status ?? null;

  let sql = `
      SELECT
        c.id,
        c.member_id,
        c.title,
        c.description,
        c.change_type,
        c.emotional_state,
        c.urgency,
        c.hexagram_number,
        c.hexagram_name,
        c.relating_hexagram_number,
        c.changing_lines,
        c.casting_method,
        c.cast_at,
        c.council_result,
        c.hexagram_interpretation,
        c.notes,
        c.questions,
        c.follow_up_intention,
        c.status,
        c.iteration_count,
        c.consulted_at,
        c.created_at,
        c.updated_at,
        c.parent_change_id,
        c.root_change_id,
        (SELECT COUNT(*)::int FROM change_experiences e WHERE e.change_id = c.id) as experience_count
      FROM studio_changes c
      WHERE c.member_id = $1
    `;
  const params: (string | number)[] = [memberId];

  if (status && (FILTERABLE_CHANGE_STATUSES as readonly string[]).includes(status)) {
    sql += ` AND c.status = $${params.length + 1}`;
    params.push(status);
  } else {
    sql += ` AND c.status != 'archived'`;
  }

  sql += ` ORDER BY c.created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  const result = await db.query(sql, params);

  return result.rows.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    memberId: row.member_id as string,
    title: row.title as string,
    description: row.description as string | null,
    changeType: row.change_type as string | null,
    emotionalState: row.emotional_state as string | null,
    urgency: row.urgency as string | null,
    hexagramNumber: row.hexagram_number as number | null,
    hexagramName: row.hexagram_name as string | null,
    relatingHexagramNumber: row.relating_hexagram_number as number | null,
    changingLines: (row.changing_lines as number[]) || [],
    castingMethod: row.casting_method as string | null,
    castAt: row.cast_at as string | Date | null,
    councilResult: row.council_result,
    hexagramInterpretation: row.hexagram_interpretation,
    notes: row.notes as string | null,
    questions: (row.questions as string[]) || [],
    followUpIntention: row.follow_up_intention as string | null,
    status: row.status as string,
    iterationCount: (row.iteration_count as number) || 0,
    consultedAt: row.consulted_at as string | Date | null,
    createdAt: row.created_at as string | Date | null,
    updatedAt: row.updated_at as string | Date | null,
    parentChangeId: row.parent_change_id as string | null,
    rootChangeId: row.root_change_id as string | null,
    experienceCount: (row.experience_count as number) || 0,
  }));
}
