/**
 * Circle constitution state — FR-03 / FR-11
 *
 * CIRCLE-04 · R3. The canonical answer to one question:
 *
 *     Is this presently a plural Circle?
 *
 * FR-11 (founder, 2026-09-06): FR-03 describes an ACTIVE Circle, not every
 * instant of Circle formation. The Constitution distinguishes ADMINISTRATIVE
 * EXISTENCE from RELATIONAL CONSTITUTION — *creation is not constitution: you can
 * create a Circle alone, you cannot constitute a Circle alone.*
 *
 * ⛔ DERIVED, NEVER STORED (founder ruling, R3)
 *
 * There is deliberately no `circles.lifecycle_status` column. Membership rows
 * already hold the authoritative fact; storing a second copy creates a drift
 * problem the system could not adjudicate:
 *
 *     stored state = ACTIVE     membership count = 2      ← which one is true?
 *
 * So constitution state is computed transactionally from active memberships,
 * every time. There is no timer, no administrator act, and no system inference.
 * This is not the system deciding what a Circle means; it is the ratified
 * ontology applied to a fact: plurality is presently there, or it is not.
 *
 * If some persistent HISTORICAL fact turns out to be genuinely needed, that is a
 * founder adjudication — not a mutable lifecycle column added quietly.
 *
 * ⚠️⚠️ SEMANTIC COLLISION — READ BEFORE USING THIS TYPE
 *
 * `FieldPhase` in ./types.ts is `'forming' | 'active' | 'integrating' | 'quiet'`
 * and answers a DIFFERENT question: *what appears to be happening in this
 * Circle's current activity?* `fieldPulseService.derivePhase()` calls a Circle
 * `'active'` when an inquiry is open and `'forming'` when there has been any
 * activity at all. **Those words have nothing to do with plurality.**
 *
 *     CONSTITUTION STATE   is this presently a plural Circle?
 *     FIELD PHASE          what appears to be happening in it?
 *
 * The two share string values, so TypeScript CANNOT catch a mix-up:
 * `CircleConstitutionState` is structurally assignable to `FieldPhase`. The
 * separation is a discipline, not a compiler guarantee. Never assign one to the
 * other, never render them in the same slot, and never derive one from the other.
 *
 * FieldPhase is NOT repaired or renamed here (founder ruling). The collision is
 * recorded as CA-14 for later reconciliation.
 */

import { query } from '@/lib/db/postgres';

/**
 * Is this presently a plural Circle? Two states, and only two.
 *
 * ⛔ Not a lifecycle. The richer lifecycle — maturation · rest · completion ·
 * birth · separation — is where human interpretation and member acts return, and
 * it remains outside R3 (CA-04).
 */
export type CircleConstitutionState = 'forming' | 'active';

/**
 * The plurality threshold, in exactly one place in the codebase.
 *
 * FR-03: a Circle is a bounded sovereign relational field among THREE OR MORE
 * persons. Three is where a genuinely plural field becomes possible — a dyad has
 * a different geometry (FR-03), and cannot survive one member's departure.
 *
 * ⛔ No maximum attaches. No numerical maximum is ratified.
 */
export const CIRCLE_PLURALITY_THRESHOLD = 3;

/** The minimal shape shared by a pg client and the `transaction()` handle. */
export interface ConstitutionStateClient {
  query(
    sql: string,
    params?: unknown[]
  ): Promise<{ rows: any[]; rowCount: number | null }>;
}

/**
 * The whole rule, pure and testable:
 *
 *     < 3 active members   →  FORMING
 *     >= 3 active members  →  ACTIVE
 *
 * FORMING means *not presently constituted as a plural relational field*. It
 * covers both initial formation (1 → 2 → 3) and re-formation, where an active
 * Circle falls below plurality.
 *
 * ⛔ A fall below three is NOT failure, and must never be described as one. The
 * Circle simply does not presently satisfy active-Circle plurality. Nothing
 * deletes it, recruits for it, splits it, or interprets the cause.
 */
export function deriveConstitutionState(
  activeMemberCount: number
): CircleConstitutionState {
  return activeMemberCount >= CIRCLE_PLURALITY_THRESHOLD ? 'active' : 'forming';
}

/**
 * The canonical derivation. Every consumer uses this rather than inventing its
 * own threshold logic — the founder ruling is explicit that `COUNT(*) >= 3` must
 * not be reproduced around the codebase.
 *
 * Pass `client` to derive inside an existing transaction, so the answer reflects
 * uncommitted membership changes in that unit of work.
 *
 * Precondition: the Circle exists. This derives from memberships alone and does
 * not verify circle existence — callers reach it through
 * `getCircleWithMembership()`, which already establishes that. A Circle with
 * zero active members derives FORMING, which is correct: it is not presently
 * plural.
 */
export async function getCircleConstitutionState(
  circleId: string,
  client?: ConstitutionStateClient
): Promise<CircleConstitutionState> {
  const sql = `SELECT COUNT(*)::int AS n
               FROM circle_memberships
               WHERE circle_id = $1 AND status = 'active'`;
  const rows = client
    ? (await client.query(sql, [circleId])).rows
    : (await query(sql, [circleId])).rows;

  return deriveConstitutionState(rows[0]?.n ?? 0);
}
