/**
 * Spiralogic Interpretation Layer — the single versioned dominance rule.
 *
 * `interpretation_version: 'dominance_v1'` — the ONE place in the codebase
 * where a Spiralogic elemental distribution becomes a dominance claim.
 * Every renderer consumes this; no renderer defines its own (the C-fence,
 * registration grammar spec Q6 = Option C, RATIFIED 2026-07-09/10).
 *
 * Input contract: RAW POSITIONS (`ChartPositions`), not an aggregated
 * distribution — settled by the Q4 consequence: Moon-branch propagation
 * requires evaluating the verdict under BOTH branches, which an aggregated
 * distribution cannot support (per-branch identity is summed away).
 * Registration is consumed via `registerChart`, never re-implemented.
 *
 * v1 semantics (strict / unweighted, per ratified Q5 — all bodies 1.0):
 *  - Element rollup of the grammar distribution (fire = fire_1+fire_2+fire_3, …).
 *  - Tie for the top element → verdict 'none' (+ `tied`). First-class
 *    ambiguity: ~25-28% of charts land here by design (null-rate table).
 *  - Unique top element → verdict = that element;
 *    grade 'clear' when it leads the runner-up by >= CLEAR_LEAD raw weight
 *    (two full bodies), else 'leaning'.
 *  - `deficient` mirrors the discipline at the bottom: unique quietest
 *    element or null. Never defaulted, never invented.
 *  - Moon-branched input (Q4 noon mode): the verdict is computed under BOTH
 *    branches. Branches disagree → verdict 'none', reason 'moon_ambiguous',
 *    moonSensitive: true (the grammar's epistemic flag survives this layer).
 *    Branches agree → the agreed verdict at the more conservative grade.
 *
 * Luminaries (deferred by ratified Q5 to this layer, NOT taken up in v1):
 * v1 is strict/unweighted. The design data argues for it: luminaries-2×
 * lowers the base null rate (~25%→~18%) but raises Moon-branch divergence
 * 38.4%→52.1% — trading the symptom for a worse disease. Because this rule
 * consumes raw positions, a future 'dominance_v2_*' MAY weight per body
 * before rollup without touching the grammar (registration stays Q5-pure).
 *
 * Out of jurisdiction: non-natal "dominant element" computations (facet
 * signatures, divination draws, resonance scores, conversational
 * `member_spiral_state`). Different substrates; this rule governs claims
 * derived from natal-chart registration only. Their always-crown idioms are
 * NOT precedent for chart behavior (recon §2b).
 */

import type { ChartPositions, Element, PhaseKey, SpiralogicProfile } from '../registration';
import { registerChart } from '../registration';
import type { DominanceGrade, DominanceVerdict } from './types';
import { INTERPRETATION_VERSION } from './types';

/** Canonical element order (also the tie-listing order). */
const ELEMENTS: readonly Element[] = ['fire', 'water', 'earth', 'air'] as const;

/**
 * v1 grade threshold: a crown is 'clear' when the top element leads the
 * runner-up by at least this much raw weight (= two full bodies of the
 * ten, weight 1.0 each). Below it, the crown is 'leaning'.
 */
export const CLEAR_LEAD = 2.0;

interface CoreVerdict {
  verdict: Element | 'none';
  grade: DominanceGrade;
  deficient: Element | null;
  tied?: Element[];
}

function rollup(distribution: Record<PhaseKey, number>): Record<Element, number> {
  const weights = { fire: 0, water: 0, earth: 0, air: 0 } as Record<Element, number>;
  for (const element of ELEMENTS) {
    weights[element] =
      distribution[`${element}_1` as PhaseKey] +
      distribution[`${element}_2` as PhaseKey] +
      distribution[`${element}_3` as PhaseKey];
  }
  return weights;
}

/** The core rule: pure function of an element rollup. */
function coreVerdict(weights: Record<Element, number>): CoreVerdict {
  const sorted = [...ELEMENTS].sort((a, b) => weights[b] - weights[a]);
  const topWeight = weights[sorted[0]];
  const leaders = ELEMENTS.filter((e) => weights[e] === topWeight);

  const bottomWeight = weights[sorted[sorted.length - 1]];
  const trailers = ELEMENTS.filter((e) => weights[e] === bottomWeight);
  // The inverse claim only exists when a unique quietest element exists AND
  // it is not also the top (degenerate all-equal case).
  const deficient =
    trailers.length === 1 && bottomWeight !== topWeight ? trailers[0] : null;

  if (leaders.length > 1) {
    return { verdict: 'none', grade: 'none', deficient, tied: leaders };
  }

  const lead = topWeight - weights[sorted[1]];
  return {
    verdict: sorted[0],
    grade: lead >= CLEAR_LEAD ? 'clear' : 'leaning',
    deficient,
  };
}

const GRADE_RANK: Record<DominanceGrade, number> = { none: 0, leaning: 1, clear: 2 };

function finalize(
  profile: SpiralogicProfile,
  core: CoreVerdict,
  moonSensitive: boolean,
  reason?: 'moon_ambiguous',
): DominanceVerdict {
  const result: DominanceVerdict = {
    verdict: core.verdict,
    grade: core.grade,
    deficient: core.deficient,
    moonSensitive,
    interpretation_version: INTERPRETATION_VERSION,
    grammar_version: profile.grammar_version,
    distribution: profile.distribution,
    elementWeights: rollup(profile.distribution),
  };
  if (core.tied) result.tied = core.tied;
  if (reason) result.reason = reason;
  return result;
}

/**
 * The single versioned dominance rule (see module header for semantics).
 * Throws `RegistrationInputError` on invalid positions — the grammar's
 * refuse-not-repair pattern propagates; this layer never repairs input.
 */
export function interpretDominance(positions: ChartPositions): DominanceVerdict {
  // The emitted ground truth: the grammar's profile of the input as given
  // (aggregated 0.5/0.5 Moon weights when branched — Q4/SH-10).
  const profile = registerChart(positions);

  if (positions.moonBranches === undefined) {
    return finalize(profile, coreVerdict(rollup(profile.distribution)), false);
  }

  // Q4 branch propagation: evaluate the verdict under BOTH Moon branches.
  // Each branch is a fully-resolved noon chart (Moon at that branch, 1.0).
  const [branchA, branchB] = positions.moonBranches.map((moonLongitude) =>
    coreVerdict(
      rollup(
        registerChart({
          bodies: { ...positions.bodies, Moon: moonLongitude },
          mode: 'noon',
        }).distribution,
      ),
    ),
  );

  const verdictsDisagree = branchA.verdict !== branchB.verdict;
  // The inverse claim inherits the same branch discipline.
  const deficient = branchA.deficient === branchB.deficient ? branchA.deficient : null;

  if (verdictsDisagree) {
    // The Q4 degradation obligation, relocated here by Q6=C: dominance that
    // depends on an unknown birth time is not stable dominance.
    return finalize(
      profile,
      { verdict: 'none', grade: 'none', deficient },
      true,
      'moon_ambiguous',
    );
  }

  // Branches agree. Crown (or decline) at the more conservative grade —
  // a claim is only as strong as its weaker branch.
  const grade =
    GRADE_RANK[branchA.grade] <= GRADE_RANK[branchB.grade] ? branchA.grade : branchB.grade;
  const agreed: CoreVerdict = {
    verdict: branchA.verdict,
    grade,
    deficient,
  };
  if (branchA.verdict === 'none') {
    // Both branches declined independently; surface the tie only when both
    // branches tied over the identical set (otherwise the sets are
    // branch-relative and would misreport).
    const sameTie =
      branchA.tied &&
      branchB.tied &&
      branchA.tied.length === branchB.tied.length &&
      branchA.tied.every((e, i) => branchB.tied![i] === e);
    if (sameTie) agreed.tied = branchA.tied;
  }
  return finalize(profile, agreed, false);
}
