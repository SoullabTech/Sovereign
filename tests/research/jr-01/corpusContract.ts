/**
 * JR-01 — Paired Relational Perturbation Corpus, typed contract (`jr01-c1`).
 *
 * ⛔ RESEARCH INSTRUMENT. Not product code. Nothing here runs at runtime, reads a
 * database, or touches a member. It is outside `tsconfig.ship.json` and cannot move
 * the typecheck baseline.
 *
 * ⭐⭐ WHAT IS UNDER TEST, STATED NARROWLY
 *   Not "does MAIA have relational geometry."
 *   Not "does a model reason relationally."
 *   Only: **when the lexical payload is held constant and one load-bearing relation
 *   changes, does a model's answer change in the direction the repository's own rule
 *   requires — and does it stay put when only wording changes?**
 *
 * ⛔ Geometry is a LATER explanatory question. Rungs 1–2 of the evidence staircase
 * need no activations at all. Nothing in this file presumes an internal
 * representation exists, and a corpus result is never evidence about one.
 *
 * ── THE SIX CONSTRUCTION LAWS ──────────────────────────────────────────────────
 * Founder-stated 2026-09-15. Each is mechanically enforced by `validate.ts`, per the
 * 2026-08-14 maxim: *gates that fire, not rules an agent is expected to remember.*
 *
 *   L1  ONE PERTURBATION PER PAIR. Everything but the target relation stays constant.
 *   L2  NO VOCABULARY LEAKAGE. `HELD`, `EXCLUDED`, `superseded`, `authority`, … may
 *       not appear in a stimulus unless the cell explicitly tests vocabulary transfer.
 *   L3  REPOSITORY-DERIVED ANSWER KEY. The correct relation comes from an existing
 *       rule at a cited path — never from what sounds psychologically reasonable.
 *   L4  BIDIRECTIONAL FORMS. Half the corpus presents A first, half B first, so
 *       position cannot become a cheap signal.
 *   L5  SEMANTIC ALIASES SEPARATED FROM STRUCTURAL TESTS. Plain language establishes
 *       the operator; vocabulary-invariance comes afterward, in its own cell.
 *   L6  RUNTIME-GROUNDED AND CONTRACT-ONLY SPECIMENS STAY MARKED APART. ⛔ No quietly
 *       treating a beautiful type distinction as witnessed runtime behaviour.
 *
 * ── AND THE LAW THE CENSUS FORCED ─────────────────────────────────────────────
 *   ⭐⭐ **IDENTICAL OUTPUT IS NOT RELATIONAL EQUIVALENCE.**
 *   R07, R08 and R09 exist because two cases can be byte-identical downstream while
 *   differing entirely in why they got there. `sameObservableSurface` marks them, and
 *   a model that answers from the surface must fail them.
 */

// ── Evidence standing (L6) ────────────────────────────────────────────────────

/**
 * How well the repository's own behaviour on this operator is established.
 * ⛔ This grades THE ANSWER KEY'S PROVENANCE, never a model's performance.
 */
export const GROUNDING = [
  /** Exercised against a real route/process and observed: the strongest standing here. */
  'runtime_witnessed',
  /** Executed in production on live turns, but not response-governing (CMT-01 shadow). */
  'shadow_executed',
  /** A named script or falsifier suite exercised it; no production traffic. */
  'harness_exercised',
  /** The distinction exists in types and is enforced by the compiler only. */
  'contract_only',
  /** ⚠️ In the vocabulary but emitted by no code path. Dead until something emits it. */
  'declared_unemitted',
] as const;
export type Grounding = (typeof GROUNDING)[number];

/** A citation into the repository that establishes the answer key. L3. */
export interface RuleCitation {
  /** Repo-relative path. */
  readonly path: string;
  /** The operation cited — never a line number (D1: line numbers drift). */
  readonly operation: string;
  readonly grounding: Grounding;
  /** ⚠️ What this citation does NOT establish. Required: absence of a caveat is a claim. */
  readonly doesNotEstablish: string;
}

// ── The 2x2 (founder, 2026-09-15) ─────────────────────────────────────────────
//
//                      │ same wording          │ different wording
//   ───────────────────┼───────────────────────┼──────────────────────
//   same relation      │ identity_control      │ paraphrase_control
//   different relation │ relational_pert.      │ generalization
//
// ⭐ The two controls are what stop a flip rate from being read as relational
// competence: a model that changes its answer whenever ANY word changes scores well
// on perturbation alone. `paraphrase_control` is where that model dies.

export const CELL = [
  'identity_control',
  'paraphrase_control',
  'relational_perturbation',
  'generalization',
] as const;
export type Cell = (typeof CELL)[number];

export const CELL_SHAPE: Record<Cell, { readonly wording: 'same' | 'different'; readonly relation: 'same' | 'different' }> = {
  identity_control:        { wording: 'same',      relation: 'same' },
  paraphrase_control:      { wording: 'different', relation: 'same' },
  relational_perturbation: { wording: 'same',      relation: 'different' },
  generalization:          { wording: 'different', relation: 'different' },
};

/** Which member of a pair is shown first. L4. */
export type Order = 'AB' | 'BA';

// ── Stimuli and keys ──────────────────────────────────────────────────────────

/**
 * One side of a pair. `text` is what a model sees — nothing else in this object is.
 * ⛔ `key` is the repository's required relation, expressed as a stable token, NOT as
 * free prose a grader would have to interpret.
 */
export interface Side {
  /** Stimulus as presented. No repository vocabulary unless `testsVocabulary`. */
  readonly text: string;
  /** The required relation, from the cited rule. Closed per operator. */
  readonly key: string;
  /** Why the rule gives this answer. Read by a human reviewer; never shown to a model. */
  readonly because: string;
}

export interface Pair {
  /** `R05.relational_perturbation.AB` — stable, sortable, greppable. */
  readonly id: string;
  readonly operatorId: OperatorId;
  readonly cell: Cell;
  readonly order: Order;
  readonly a: Side;
  readonly b: Side;
  /**
   * ⭐ Set when A and B produce the same observable downstream surface (empty context,
   * identical text, zero rows). These are the specimens that punish surface reading.
   */
  readonly sameObservableSurface?: string;
  /** L2 escape hatch: this cell deliberately uses repository vocabulary. */
  readonly testsVocabulary?: true;
}

export const OPERATOR_IDS = [
  'R01', 'R02', 'R03', 'R04', 'R05', 'R06',
  'R07', 'R08', 'R09', 'R10', 'R11', 'R12',
] as const;
export type OperatorId = (typeof OPERATOR_IDS)[number];

export interface Operator {
  readonly id: OperatorId;
  /** The distinction, in one line, as the repository draws it. */
  readonly distinction: string;
  /** Closed answer vocabulary for this operator. Every `Side.key` must be a member. */
  readonly keys: readonly string[];
  readonly citations: readonly RuleCitation[];
  /** Weakest grounding among the citations — the operator's honest standing. */
  readonly grounding: Grounding;
  /** ⚠️ What a correct model answer here would still NOT establish. */
  readonly doesNotEstablish: string;
  readonly pairs: readonly Pair[];
}

export interface Corpus {
  readonly version: string;
  readonly builtAgainst: string;
  readonly operators: readonly Operator[];
}

/** Weakest-first, so `min` is the honest report. */
const GROUNDING_RANK: Record<Grounding, number> = {
  declared_unemitted: 0, contract_only: 1, harness_exercised: 2, shadow_executed: 3, runtime_witnessed: 4,
};

export const weakestGrounding = (cs: readonly RuleCitation[]): Grounding =>
  cs.reduce<Grounding>((w, c) => (GROUNDING_RANK[c.grounding] < GROUNDING_RANK[w] ? c.grounding : w), 'runtime_witnessed');

/**
 * Repository vocabulary that must not leak into a stimulus (L2).
 * ⛔ Deliberately includes the ordinary-English members (`held`, `current`, `absent`):
 * a stimulus containing the answer word is not testing the distinction, it is testing
 * whether the model can copy.
 */
export const RESERVED_VOCABULARY: readonly string[] = [
  'held', 'excluded', 'offered', 'admitted', 'available',
  'superseded', 'unmeasured', 'current', 'absent', 'present_empty', 'suppressed',
  'attempted', 'crossed', 'authority', 'provenance', 'participation class',
  'authored by', 'situate', 'infer', 'retrieved', 'placed', 'disposition',
  'sanctuary', 'eligible', 'disclosure', 'receipt', 'invariant',
];
