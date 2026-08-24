/**
 * Personal Studio provisioning — the existence decision, extracted and pure.
 *
 * THE INVARIANT THIS FILE EXISTS TO HOLD:
 *
 *   Suspension is a state of an EXISTING practitioner, never evidence that the
 *   practitioner does not exist.
 *
 * The witnessed defect (2026-08-21): the route asked
 *
 *     SELECT id FROM practitioners WHERE member_id = $1 AND status = 'active'
 *
 * and treated an empty result as "this member has no practitioner". Member
 * 49ae4717 had a SUSPENDED practitioner (fb0cb8b7). The filtered query returned
 * nothing, the route took the creation path, and minted a second practitioner
 * (717da53c) plus a default theme in one transaction — which is why those two
 * rows share a created_at to the millisecond.
 *
 * The predicate must answer EXISTENCE. Status is interpreted after the row is
 * found, never folded into the question of whether a row is there at all.
 */

export type PractitionerRow = { id: string; status: string | null };

/** A conflict that could not be reconciled to this member. Named by constraint, never guessed. */
export type CollisionConflict =
  | { action: 'slug_conflict'; constraint: string }
  | { action: 'email_conflict'; constraint: string }
  | { action: 'unique_conflict'; constraint: string | null };

export type ProvisionDecision =
  | { action: 'use_existing'; practitionerId: string }
  | { action: 'refuse_suspended'; practitionerId: string }
  | { action: 'refuse_state'; practitionerId: string; status: string }
  | { action: 'create' };

/**
 * Decide from the rows a member ACTUALLY has. `rows` must come from an
 * unfiltered `WHERE member_id = $1` — passing a status-filtered set here
 * reintroduces the defect one layer up.
 */
export function decideProvisioning(rows: PractitionerRow[]): ProvisionDecision {
  if (!rows || rows.length === 0) return { action: 'create' };

  // An active row is usable, whatever else exists alongside it. Kelly's member
  // 49ae4717 ended up holding both a suspended and an active practitioner, so
  // "the first row" is not a safe reading — the state is.
  const active = rows.find((r) => r.status === 'active');
  if (active) return { action: 'use_existing', practitionerId: active.id };

  const suspended = rows.find((r) => r.status === 'suspended');
  if (suspended) return { action: 'refuse_suspended', practitionerId: suspended.id };

  // Some other non-active state. Name it rather than inferring absence — the
  // whole defect was a non-active state being read as no state at all.
  const other = rows[0];
  return { action: 'refuse_state', practitionerId: other.id, status: other.status ?? 'unknown' };
}

/** Postgres unique_violation. A deterministic slug makes this reachable under retry. */
export function isUniqueViolation(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && (error as { code?: string }).code === '23505');
}

/**
 * Which unique constraint actually fired.
 *
 * The creation INSERT carries at least TWO deterministic unique values —
 * `slug = personal-<member8>` and `email = <slug>@soullab.life` — so a 23505
 * does not identify itself. Returns null when the driver did not say, and a
 * null constraint must NOT be narrated as a slug problem.
 */
export function constraintNameOf(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const c = (error as { constraint?: unknown }).constraint;
  return typeof c === 'string' && c.length > 0 ? c : null;
}

/** The deterministic slug. Same input always yields the same slug — hence the collision. */
export function personalSlugFor(memberId: string): string {
  return `personal-${memberId.slice(0, 8)}`;
}

/**
 * What a unique violation MEANS, after re-reading the member's rows.
 *
 * A conflict is only reconcilable if the member now genuinely owns a
 * practitioner — a concurrent request won the race. If the member still owns
 * nothing, the slug belongs to somebody else, and that is a real conflict that
 * must be named rather than surfaced as an unexplained 500.
 */
export function classifyCollision(
  rowsAfterReread: PractitionerRow[],
  constraint?: string | null,
): ProvisionDecision | CollisionConflict {
  // The re-read is STRONGER evidence than the constraint name: if the member now
  // owns a practitioner, a concurrent request won and the conflict is resolved,
  // whichever unique index happened to fire. Recovery is deliberately
  // constraint-agnostic.
  const decision = decideProvisioning(rowsAfterReread);
  if (decision.action !== 'create') return decision;

  // Member still owns nothing, so the conflicting row belongs to something else.
  // Name only what the constraint actually says. Reporting every unresolved
  // 23505 as a slug problem is a more specific claim than the evidence carries —
  // the same over-attribution this module was written to remove.
  switch (constraint) {
    case 'practitioners_slug_key':  return { action: 'slug_conflict', constraint };
    case 'practitioners_email_key': return { action: 'email_conflict', constraint };
    default:
      return { action: 'unique_conflict', constraint: constraint ?? null };
  }
}
