/**
 * SEL-0 · THE CANDIDATE-BOUNDARY SEAM — the one place standing is allowed to act.
 *
 * FOUNDER RULING, 2026-09-08 (D5 amendment):
 *
 *   > Standing may enforce writer-authored candidate eligibility upstream of
 *   > cognition. Standing values, standing history, or standing-derived
 *   > preference signals may not enter MAIA cognition, ranking, inference, or
 *   > prompt context.
 *
 * ⭐ THE DISTINCTION THIS MODULE EXISTS TO MAKE STRUCTURAL: standing is
 * AUTHORITY, not information. A dismissal decides what MAIA may be shown at
 * all; it must never become something she weighs. So this seam reads the
 * authoritative store, applies exactly one rule to it, and returns KEYS — never
 * the standing map, never a count of dismissals, never a "the writer kept this
 * one" hint that ranking could pick up.
 *
 * ```text
 *   standing store ──► THIS SEAM ──► lawful keys ──► selector ──► model
 *                          │
 *                          └── standing values stop here, permanently
 * ```
 *
 * ⛔ `keep`, `unresolved` AND UNSET ARE INDISTINGUISHABLE HERE, deliberately.
 * Only `dismiss` acts. A `keep` that conferred a nudge toward being offered
 * would be a standing-derived preference signal reaching ranking by the back
 * door — formally through this seam, which is exactly the leak the amendment
 * describes. The filter is `standing === 'dismiss'` and there is nothing else
 * to read.
 *
 * ⛔ CLIENT-SUPPLIED STANDING IS FORBIDDEN AS AUTHORITY, and this module makes
 * that structural rather than promised: it takes `memberId` and reads the store
 * itself. There is no parameter through which a caller could assert a standing,
 * so the route cannot pass one and a browser cannot invent one.
 *
 * ⛔ F-7 IS READ, NEVER RE-ADJUDICATED. The verdict was decided when the reading
 * froze and is immutable with the row. This seam resolves the ABSENCE of a
 * record to `unestablished` — the only place that resolution is made — and
 * `unestablished` is not `eligible`.
 */

import { currentStandings } from '../standing/store';
import type { DevelopmentalReading, F7Verdict } from '../developmentalReading/contract';
import type { ReadingAssessment } from '../developmentalReading/assess';

export type SelectionGate =
  | 'SELECTION_BOUNDARY_UNMEASURED'
  | 'NO_LAWFUL_CANDIDATE'
  | 'NO_REMAINING_CANDIDATE_THIS_COMMISSION';

export type BoundaryOutcome =
  | { readonly gate: SelectionGate }
  /** Keys only. There is deliberately no standing, count or reason on this side. */
  | { readonly gate: null; readonly lawfulKeys: readonly string[] };

/**
 * The verdict for one observation, with absence resolved once, here.
 *
 * A reading frozen before the F-7 record existed carries none. That is not
 * permission — it is the absence of an adjudication, which is `unestablished`.
 */
export function verdictFor(reading: DevelopmentalReading, key: string): F7Verdict {
  return reading.f7Eligibility?.verdicts[key] ?? 'unestablished';
}

export interface BoundaryFacts {
  readonly observations: readonly { readonly key: string }[];
  readonly assessment: ReadingAssessment;
  /** Only membership is ever consulted; no value travels with it. */
  readonly dismissed: ReadonlySet<string>;
  readonly f7: (key: string) => F7Verdict;
  readonly offered: ReadonlySet<string>;
}

/**
 * The gates, in the contract's order, as arithmetic.
 *
 * PURE, so the order is testable without a database — and so nothing in the
 * ordering can quietly come to depend on something the contract prohibits.
 *
 * ⛔ `unmeasured` ANYWHERE STOPS EVERYTHING. Not "skip that one": if the live
 * Work could not establish supersession for an observation, the BOUNDARY of the
 * lawful set is unknown, and a set computed from an unknown boundary is not a
 * set. Excluding only the unmeasured ones would answer confidently from a
 * candidate space nobody measured — the error Q12 exists to forbid.
 */
export function applyBoundary(facts: BoundaryFacts): BoundaryOutcome {
  for (const o of facts.observations) {
    const loc = facts.assessment.observations[o.key];
    if (!loc || loc.state === 'unmeasured') return { gate: 'SELECTION_BOUNDARY_UNMEASURED' };
  }

  const lawful = facts.observations
    .filter((o) => facts.f7(o.key) === 'eligible')
    .filter((o) => !facts.dismissed.has(o.key))
    .filter((o) => facts.assessment.observations[o.key]!.state === 'current')
    .map((o) => o.key);
  if (lawful.length === 0) return { gate: 'NO_LAWFUL_CANDIDATE' };

  const remaining = lawful.filter((k) => !facts.offered.has(k));
  if (remaining.length === 0) return { gate: 'NO_REMAINING_CANDIDATE_THIS_COMMISSION' };

  return { gate: null, lawfulKeys: remaining };
}

/**
 * The seam the route calls. Reads the authoritative standing store, narrows it
 * to the single fact the boundary is entitled to — WHICH KEYS ARE DISMISSED —
 * and never returns anything else derived from it.
 *
 * `currentStandings` throws rather than returning `[]` on error, and that is
 * relied upon here: a failed read must not arrive as "nothing is dismissed."
 * The throw propagates, and the caller reports a failure instead of selecting
 * from a candidate set built on an unread boundary.
 */
export async function resolveLawfulCandidates(input: {
  readonly memberId: string;
  readonly reading: DevelopmentalReading;
  readonly assessment: ReadingAssessment;
  readonly offered: ReadonlySet<string>;
}): Promise<BoundaryOutcome> {
  const rows = await currentStandings(input.memberId, input.reading.id);

  /* NARROWED AT THE SOURCE. The standing values are reduced to a set of keys
     inside this function and the fuller objects are not held, returned or
     logged — so there is no later place where a value could be picked up. */
  const dismissed = new Set(
    rows.filter((r) => r.standing === 'dismiss').map((r) => r.observationKey));

  return applyBoundary({
    observations: input.reading.observations,
    assessment: input.assessment,
    dismissed,
    f7: (key) => verdictFor(input.reading, key),
    offered: input.offered,
  });
}
