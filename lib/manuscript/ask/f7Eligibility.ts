/**
 * SEL-0 · F-7 eligibility, as the RUNTIME can presently establish it.
 *
 * ⚠️ PRODUCT GAP, RECORDED RATHER THAN CLOSED BY A DEFAULT.
 *
 * The ratified candidate boundary (contract §2.3) defines a lawful candidate as
 * F-7 eligible AND not dismissed AND not superseded. Standing has an
 * authoritative store and supersession has an authoritative derivation. F-7
 * eligibility has NEITHER: no column, no table, no classifier, no runtime path
 * computes it. The only F-7 adjudication that exists anywhere is the one
 * performed by hand over the frozen SEL-0 corpus at Step 0.
 *
 * ⛔ SO THIS FILE DOES NOT INVENT ONE. Two defaults were available and both are
 * refused:
 *
 *   "assume eligible"    would admit material whose constitutional lawfulness
 *                        has never been established, and would make MAIA's
 *                        restraint depend on an assumption nobody made.
 *   "assume ineligible"  would be honest about the unknown but would look, from
 *                        outside, exactly like "there is nothing to say."
 *
 * The chosen shape says the true thing instead: the verdict is THREE-state, and
 * `unestablished` is neither eligibility nor ineligibility. It is not eligible,
 * so it cannot enter the lawful set — an observation whose lawfulness cannot be
 * established is not one MAIA may choose to raise. The writer can still address
 * any observation by key; only MAIA's autonomous selection is constrained.
 *
 * This is the same discipline Q12 applies to supersession: an unestablished
 * predicate must never masquerade as a substantive decision. It is applied here
 * in the conservative direction, which admits nothing unlawful.
 *
 * CONSEQUENCE, STATED PLAINLY: with the resolver below, production has zero
 * lawful candidates and the selector will report `NO_LAWFUL_CANDIDATE` on every
 * commission. The runtime path is real, reachable and correct; the capability
 * is inert until an F-7 eligibility source exists. That remaining gap is a
 * founder question — an F-7 classifier, or a stored per-observation verdict
 * written when a reading is frozen — and is NOT decided here.
 */

export type F7Verdict = 'eligible' | 'ineligible' | 'unestablished';

export interface F7EligibilitySource {
  /** The verdict for one observation of one reading. Never throws. */
  verdict(observationKey: string): F7Verdict;
}

/**
 * The deployed source. It reports `unestablished` for every observation because
 * that is the truth, not because the lookup failed.
 */
export const runtimeF7Eligibility: F7EligibilitySource = {
  verdict: () => 'unestablished',
};

/**
 * A source backed by an explicit, externally adjudicated verdict map — the
 * shape a frozen SEL-0 fixture or a future stored classification supplies.
 * A key absent from the map is `unestablished`, never `eligible`.
 */
export function f7EligibilityFrom(
  verdicts: ReadonlyMap<string, F7Verdict>,
): F7EligibilitySource {
  return { verdict: (key) => verdicts.get(key) ?? 'unestablished' };
}
