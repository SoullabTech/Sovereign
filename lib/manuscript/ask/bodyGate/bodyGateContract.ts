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
  establishBoundary(sectionId: string): Promise<'may_cross' | 'refused'>;
  /** The canonical whole-revision read. W1 may be wider than W2 for integrity. */
  loadRevision(): Promise<string | null>;
  /** What the frozen evidence resolves to — including sections not authorized. */
  recover(revision: string | null): Promise<readonly EvidenceSlice[] | { refusal: string }>;
  cognition(disclosed: readonly EvidenceSlice[]): Promise<void>;
  confirmCrossing(): Promise<void>;
  readonly trace: GateStep[];
}

export type AskBodyGate = (input: GateInput, deps: GateDeps) => Promise<BodyGateResult>;
