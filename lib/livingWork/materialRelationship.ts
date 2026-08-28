/**
 * The one refusal a material/Work relationship can raise from the database.
 *
 * A consideration (`maybe` / `not_now`) and a belonging declaration are
 * mutually exclusive, enforced by triggers over a pair-scoped advisory lock
 * (migration 20260828000001). Once those two writes are correctly serialized,
 * one of two SIMULTANEOUS contradictory member acts legitimately loses — so
 * this is a live path, not a future-writer backstop, and it may never reach a
 * member as "Something went wrong" (D-014).
 *
 * Shared rather than duplicated: the considerations route and the materials
 * route can each raise it, and one predicate means they cannot drift apart.
 */

/** PostgreSQL `restrict_violation`. */
const RESTRICT_VIOLATION = '23001';

/** The prefix the trigger raises. Matching on it, not on prose, keeps the
 *  member-facing wording free to change without breaking recognition. */
const CONFLICT_PREFIX = 'material_relationship_conflict:';

export function isMaterialRelationshipConflict(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: unknown; message?: unknown };
  return (
    e.code === RESTRICT_VIOLATION &&
    typeof e.message === 'string' &&
    e.message.includes(CONFLICT_PREFIX)
  );
}

/**
 * What the member is told. It names what happened and what to do, and it does
 * NOT pick a winner: the order in which two conflicting acts happened to reach
 * the database must not decide meaning invisibly. The member chooses again.
 */
export const MATERIAL_RELATIONSHIP_CONFLICT_MESSAGE =
  'That relationship changed while you were acting. Refresh it and choose again.';
