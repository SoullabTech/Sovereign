/**
 * Canonical Personal Keep read selector.
 *
 * J5-1 moves the repository-earned Keep eligibility law out of the Book
 * Workbench adapter so every future Personal Keeps reader can share one source
 * of truth. This module is read-only and deliberately preserves the existing
 * Workbench query semantics byte-for-behavior: same guards, filters, ordering,
 * selected columns, and 200-row ceiling.
 *
 * This selector establishes that a row qualifies as a Personal Keep. It does
 * NOT authorize disclosure into MAIA cognition; that remains a later governed
 * crossing.
 */

import { query } from '@/lib/db/postgres';

export interface PersonalKeepRow {
  id: string;
  title: string;
  body: string | null;
  source_type: string;
  status: string;
  kept_at: Date;
  is_breakthrough: boolean | null;
}

export interface SearchPersonalKeepsInput {
  memberId: string;
  text?: string;
  from?: string;
  to?: string;
}

export interface ResolvePersonalKeepInput {
  memberId: string;
  keepId: string;
}

/**
 * The qualifying predicate for a generic Personal Field / Portfolio Keep.
 * Keep this private to the selector: callers ask for Personal Keeps; they do
 * not reconstruct the constitutional predicate themselves.
 */
const PERSONAL_KEEP_GUARDS = `
  member_id = $1
  AND generated_by = 'member-gesture'
  AND status IN ('active', 'still_alive')
  AND memory_scope = 'personal'
  AND posture_at_creation IS DISTINCT FROM 'sanctuary'
  AND NOT (source_type = 'practitioner_observation' AND facilitator_id IS NULL)
`;

/**
 * Search the authenticated member's qualifying Personal Keeps.
 *
 * J5-1 intentionally preserves the Workbench ancestor's chronology and ceiling.
 * Pagination/tie-breaking for the future five-item MAIA read is NOT introduced
 * by this extraction cut.
 */
export async function searchPersonalKeeps(
  input: SearchPersonalKeepsInput,
): Promise<PersonalKeepRow[]> {
  const clauses: string[] = [PERSONAL_KEEP_GUARDS];
  const params: unknown[] = [input.memberId];

  if (input.text && input.text.trim()) {
    params.push(`%${input.text.trim()}%`);
    clauses.push(`(title ILIKE $${params.length} OR body ILIKE $${params.length})`);
  }
  if (input.from) {
    params.push(input.from);
    clauses.push(`kept_at >= $${params.length}`);
  }
  if (input.to) {
    params.push(input.to);
    clauses.push(`kept_at <= $${params.length}`);
  }

  const result = await query<PersonalKeepRow>(
    `SELECT id, title, body, source_type, status, kept_at, is_breakthrough
     FROM member_memory_atoms
     WHERE ${clauses.join(' AND ')}
     ORDER BY kept_at DESC
     LIMIT 200`,
    params,
  );

  return result.rows;
}

/** Resolve one qualifying Personal Keep under the exact same predicate. */
export async function resolvePersonalKeep(
  input: ResolvePersonalKeepInput,
): Promise<PersonalKeepRow | null> {
  const result = await query<PersonalKeepRow>(
    `SELECT id, title, body, source_type, status, kept_at, is_breakthrough
     FROM member_memory_atoms
     WHERE ${PERSONAL_KEEP_GUARDS} AND id = $2`,
    [input.memberId, input.keepId],
  );

  return result.rows[0] ?? null;
}
