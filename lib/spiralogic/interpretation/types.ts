/**
 * Spiralogic Interpretation Layer — dominance rule types.
 *
 * The C-fence (registration grammar spec, Q6 = Option C, RATIFIED 2026-07-09):
 * the grammar emits DISTRIBUTION as ground truth; dominance is an interpretive
 * claim produced by exactly ONE versioned rule that ALL renderers consume.
 * The rule may return `none` where no stable dominance is warranted — `none`
 * is a valid, expected verdict (~25-28% of charts under strict crowning per
 * the Monte Carlo design input), never an error.
 *
 * Spec: docs/specs/SPIRALOGIC_REGISTRATION_GRAMMAR_SPEC_2026-07-09.md
 * Recon: docs/architecture/RENDERER_DOMINANCE_RECON_2026-07-10.md
 *
 * INV-8: `interpretation_version` is a provenance axis SEPARATE from
 * `grammar_version`. Both travel on the verdict.
 */

import type { Element, PhaseKey } from '../registration';

/** The rule's own version — bump on ANY semantic change to the verdict. */
export const INTERPRETATION_VERSION = 'dominance_v1' as const;

export type InterpretationVersion = typeof INTERPRETATION_VERSION;

/**
 * Graded strength, designed against the null-rate table (spec, Pre-ratification
 * data): strict crowning yields ~25-28% `none`; a one-sign Moon shift flips
 * dominance in ~39% of charts. Graded language over crown-or-null is standing
 * constraint #1 on this rule (spec, closing deliberation 2026-07-09).
 */
export type DominanceGrade = 'clear' | 'leaning' | 'none';

/**
 * The structured verdict every renderer consumes. Renderers own PHRASING;
 * this rule owns STRUCTURE. No renderer may compute its own dominance.
 */
export interface DominanceVerdict {
  /** The interpretive claim. 'none' = no stable dominance is warranted. */
  verdict: Element | 'none';
  /** Graded strength of the claim. 'none' iff verdict is 'none'. */
  grade: DominanceGrade;
  /**
   * The inverse claim, same discipline: present only when a unique quietest
   * element exists (and agrees across Moon branches). Never manufactured.
   */
  deficient: Element | null;
  /**
   * True when the two Q4 Moon branches disagree on the verdict — the
   * epistemic flag the grammar preserved (`moonUncertain`) does not
   * evaporate at the interpretation boundary. Always false for timed or
   * unbranched charts.
   */
  moonSensitive: boolean;
  /** Present iff verdict is 'none' because of a tie for the top element. */
  tied?: Element[];
  /** Present iff the Moon branches disagreed (Q4 degradation, relocated here by Q6=C). */
  reason?: 'moon_ambiguous';
  /** Provenance axis 1: which rule produced this claim. */
  interpretation_version: InterpretationVersion;
  /** Provenance axis 2: which grammar computed the underlying distribution. */
  grammar_version: 1;
  /**
   * The underlying ground truth — the grammar's 12-phase distribution
   * (raw weights, all 12 keys; the aggregated 0.5/0.5 form when Moon-branched).
   */
  distribution: Record<PhaseKey, number>;
  /** Element rollup of `distribution` (raw weights, NOT percentages — SH-12 discipline). */
  elementWeights: Record<Element, number>;
}
