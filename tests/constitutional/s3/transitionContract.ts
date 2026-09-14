/**
 * S3 CLASS-B TRANSITION CONTRACT — typed, executable, observable-only.
 *
 * Authority: S3-DESIGN-01 §15 (Rulings 5–7 + qualification) and the founder
 * ruling of 2026-09-13 that the transition law is a TYPED contract.
 *
 * ⭐⭐ IT TYPES THE LAW AT THE BOUNDARY, NOT THE MACHINE BEHIND IT.
 *
 *   MAY TYPE   member-act identity · claim semantics · replay semantics ·
 *              completion identity · crossing cardinality · receipt
 *              cardinality · authority isolation · server-derived scope ·
 *              observable outcomes
 *
 *   ⛔ MAY NOT TYPE   table shape · column names · a status column or enum ·
 *              TTL · expiry implementation · locking strategy · transaction
 *              mechanism · what a completion identity points at · the
 *              persistence shape of the act reference · boundary-vocabulary
 *              widening
 *
 * ⛔ THIS FILE CARRIES NO RUNTIME AUTHORITY AND NO STORAGE AUTHORITY. It is a
 * specification substrate. Nothing here may be imported by product code, and
 * importing it would not confer permission on anything.
 *
 * ⚠️ Note on `authoredText`. It exists ONLY so that the law "identity is the
 * act, never the characters" is falsifiable — and so the prose-comparison
 * defeat candidate is constructible in B-ii. ⛔ A conforming implementation
 * never keys anything on it.
 */

/** Opaque identities. The brands exist so a test cannot pass one for another. */
export type ActRef = string & { readonly __brand: 'S3ActRef' };
export type SectionId = string & { readonly __brand: 'S3SectionId' };
export type CompletionId = string & { readonly __brand: 'S3CompletionId' };
export type RequestId = string & { readonly __brand: 'S3RequestId' };
export type MemberId = string & { readonly __brand: 'S3MemberId' };
export type WorkId = string & { readonly __brand: 'S3WorkId' };

export const actRef = (s: string) => s as ActRef;
export const sectionId = (s: string) => s as SectionId;
export const requestId = (s: string) => s as RequestId;
export const memberId = (s: string) => s as MemberId;
export const workId = (s: string) => s as WorkId;

/**
 * ACT 2 — the Ask reached the decision point and paused.
 *
 * `requiredSections` is the world's ground truth: the set the SERVER would
 * derive from the reading and the anchor. ⛔ It is never the client's account.
 */
export interface PausedAsk {
  readonly member: MemberId;
  readonly work: WorkId;
  readonly requiredSections: readonly SectionId[];
  /** Inert. ⛔ Never an identity input. See the file header. */
  readonly authoredText: string;
}

/** ACT 3 — the member's explicit present authorization arrives. */
export interface ResumeRequest {
  readonly ref: ActRef;
  /** The member's explicit act. ⛔ A claim, never an authority. */
  readonly authorizes: readonly SectionId[];
  /** The serving request. ⛔ Present so that keying on it is BUILDABLE and therefore killable. */
  readonly request: RequestId;
  readonly authoredText: string;
}

/**
 * What a caller can observe about one ACT 3 attempt.
 *
 * ⭐ These are OUTCOMES, not stored states. No member of this union may be read
 * as naming a column.
 */
export type ResumeOutcome =
  /** The claim was won and the disclosure performed in THIS invocation. */
  | {
      readonly kind: 'executed';
      readonly completion: CompletionId;
      /** Sections whose authored body entered W2 in this invocation. */
      readonly crossings: readonly SectionId[];
      /** Section receipts minted in this invocation — one per authorized section. */
      readonly receipts: readonly SectionId[];
    }
  /** Already completed. The SAME completion identity returns. ⛔ Zero new crossings. */
  | { readonly kind: 'recovered'; readonly completion: CompletionId }
  /** Claimed, then died before any crossing completed. ⛔ A fresh member act is required. */
  | { readonly kind: 'interrupted' }
  /** Nothing happened, and why. */
  | { readonly kind: 'refused'; readonly reason: RefusalReason };

export type RefusalReason =
  /** The client's set did not cover what the server derived (§10.5). */
  | 'body_scope_incomplete'
  /** The reference is not this member's unfinished act, or is not a known act at all. */
  | 'unknown_act'
  /** The act exists but can no longer be resumed. ⛔ Says nothing about why, by design. */
  | 'not_resumable';

/** Cumulative effects, for asserting that a later attempt added none. */
export interface CrossingLedger {
  readonly crossings: readonly SectionId[];
  readonly receipts: readonly SectionId[];
  readonly completions: readonly CompletionId[];
}

/**
 * The surface a Class-B candidate exposes. ⭐ Nine methods' worth of machine,
 * reduced to three observations — because everything else is step 11.
 */
export interface S3Candidate {
  /** ACT 2. Issues the act's identity. ⛔ Confers nothing. */
  pause(ask: PausedAsk): Promise<ActRef>;
  /** ACT 3. */
  resume(req: ResumeRequest): Promise<ResumeOutcome>;
  /**
   * Test-only cumulative observation.
   * ⛔ NOT a runtime capability, and a conforming implementation is not
   * required to be able to answer it in production.
   */
  observe(): Promise<CrossingLedger>;
  /**
   * Simulate the process dying after the claim is won and before any crossing
   * completes. ⛔ Test-only; the ONLY way B-iii can reach S3-F7 deterministically.
   */
  failAfterClaimOnce(): void;
}

export type CandidateFactory = () => Promise<S3Candidate>;
