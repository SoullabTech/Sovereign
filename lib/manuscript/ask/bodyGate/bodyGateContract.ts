/**
 * S3 · P1 — THE ASK BODY GATE · the contract R1–R4 govern.
 *
 *   ⭐⭐ No authored BODY characters required by the Ask enter cognition without
 *       fresh, section-scoped body-disclosure authority.
 *
 * ⛔ NOT a claim that no authored characters enter cognition before body
 * authority — that is demonstrably false: member-authored headings already cross
 * via `FrozenStructureUnit.title` under the `structure` requirement. That is a
 * separate authored-structure governance lane and this gate neither creates nor
 * closes it.
 *
 * ⛔ THIS MODULE IS NOT THE ROUTE. It states the seam the route must satisfy so
 * the obligations can be falsified against deliberate prohibited implementations
 * before any route is wired.
 */

import type { ConsumedCompletion, PendingAskRef } from '../pendingAsk/claimContract';

/** Every operation an instrument watches for, in call order. */
export type GateStep =
  | 'claim' | 'boundary' | 'may_cross' | 'load' | 'recover' | 'filter'
  | 'cognition' | 'receipt';

/** One recovered piece of evidence, tagged with the section it came from. */
export interface EvidenceSlice {
  readonly sectionId: string;
  readonly text: string;
}

/**
 * ⭐ THE FIVE PROTOCOL STATES, plus the replay answer.
 *
 * ⛔ `BODY_UNVERIFIABLE` is reachable ONLY after `may_cross`. Routing an
 * unauthorized crossing into it would make these indistinguishable to the writer:
 *
 *   UNAUTHORIZED   "I was not permitted to read the required prose."
 *   UNVERIFIABLE   "I was permitted, but could not recover or verify it."
 */
export type BodyGateResult =
  | { readonly kind: 'STRUCTURE_SUFFICIENT' }
  | { readonly kind: 'BODY_AUTHORITY_REQUIRED'; readonly sections: readonly string[] }
  | { readonly kind: 'BODY_SCOPE_INCOMPLETE'; readonly outstanding: readonly string[] }
  | { readonly kind: 'BODY_AUTHORIZED'; readonly disclosed: readonly EvidenceSlice[] }
  | { readonly kind: 'BODY_UNVERIFIABLE'; readonly refusal: string }
  /**
   * ⭐⭐ THE SIXTH STATE — ratified 2026-09-10.
   *
   *   member act              DID occur
   *   pendingAskRef claim     DID succeed · is SPENT
   *   disclosure boundary     could not be fully established
   *   authored body loaded    NO
   *   cognition reached       NO
   *   completed crossing      NO
   *   retry                   requires a NEW explicit member act
   *
   * ⛔ It must never blur into its neighbours:
   *   BODY_AUTHORITY_REQUIRED  "you have not authorized this yet"
   *   BODY_SCOPE_INCOMPLETE    "you authorized only some of what is required"
   *   DISCLOSURE_UNAVAILABLE   "you authorized it, I could not establish the
   *                             disclosure, nothing was read, and that
   *                             authorization is now spent"
   *   BODY_UNVERIFIABLE        "disclosure was established and recovery began,
   *                             but the evidence could not be verified"
   *
   * ⭐ `actSpent` is not a detail. Claim-before-boundary has a real cost: a
   * failed boundary spends the act. ⛔ Do not "optimize" that away by making the
   * act reusable — that reopens the replay problem deliberately closed.
   */
  | { readonly kind: 'DISCLOSURE_UNAVAILABLE'; readonly actSpent: boolean }
  /** The resume was already claimed. ⛔ Never a re-execution of the disclosure. */
  | { readonly kind: 'ALREADY_CONSUMED'; readonly completion: ConsumedCompletion };

/** What the member's present act authorizes, or nothing at all. */
export interface GateInput {
  /** Section ids whose BODY the observation's evidence requires. */
  readonly requiredSections: readonly string[];
  /** True where at least one evidence ref requires `body` depth. */
  readonly bodyRequired: boolean;
  /** The member's explicit present act. Empty means no authority exists. */
  readonly authorizes: readonly string[];
  /** Present only on a resume. */
  readonly pendingRef?: PendingAskRef;
}

/**
 * Instrumented stand-ins for the canonical operations. ⭐ `recover` deliberately
 * yields slices the caller did not necessarily authorize, so a candidate that
 * trusts `required === authorized` instead of filtering is caught rather than
 * flattered.
 */
export interface GateDeps {
  claim(ref: PendingAskRef): Promise<{ kind: 'claimed' } | { kind: 'already_consumed'; completion: ConsumedCompletion }>;
  /**
   * ⭐ ONE BOUNDARY PER SECTION — authority stays section-scoped. A boundary
   * attempt mints an `attempted` receipt whether or not it succeeds; ⛔ an
   * attempted receipt is evidence that a crossing MAY have occurred and was not
   * confirmed, and it is never authority and never a completed disclosure.
   */
  establishBoundary(sectionId: string): Promise<'may_cross' | 'refused'>;
  /** The canonical whole-revision read. W1 may be wider than W2 for integrity. */
  loadRevision(): Promise<string | null>;
  /** What the frozen evidence resolves to — including sections not authorized. */
  recover(revision: string | null): Promise<readonly EvidenceSlice[] | { refusal: string }>;
  cognition(disclosed: readonly EvidenceSlice[]): Promise<void>;
  /** ⭐ Per section. ⛔ Never called for a section whose crossing did not occur. */
  confirmCrossing(sectionId: string): Promise<void>;
  readonly trace: GateStep[];
}

/**
 * ⭐⭐ THE CARDINALITY LAW, superseding the old "one act → one receipt row".
 *
 *   One member authorization act may cause AT MOST ONE ACT 3 disclosure
 *   execution and ONE model-context handoff. That execution may contain several
 *   independently section-scoped authorities and therefore several receipt rows.
 *
 * ⛔ That is NOT a multi-section authority token. Authority remains section-
 * scoped; what is shared is the serving request, not the permission.
 *
 * Anti-replay, strengthened around the execution rather than the row count:
 *
 *   ⭐ Replaying the member act can create ZERO additional boundaries, loads,
 *     handoffs, or receipts.
 *
 * And the ordering ruled with it:
 *
 *   ⭐ ALL required section boundaries must be established BEFORE any authored
 *     body is loaded or any cognition handoff occurs.
 */
export type AskBodyGate = (input: GateInput, deps: GateDeps) => Promise<BodyGateResult>;
