/**
 * S3 · P1 — THE PENDING-ASK CLAIM CONTRACT.
 *
 *   ⭐⭐ The durable object remembers whether an Ask may still be RESUMED.
 *       Only the member's present act plus the fresh invocation can decide
 *       whether prose may CROSS.
 *
 * ⛔ THIS MODULE DEFINES NO AUTHORITY. `pendingAskRef` is an identity with a
 * lifecycle. Possessing it permits nothing: the resumed invocation still
 * re-derives the body requirement and the required section set, still receives
 * the member's explicit present gesture, still establishes a fresh disclosure
 * boundary, and still mints `may_cross` inside that invocation.
 *
 * ── WHY A DEDICATED OBJECT (substrate census, canonical c509976b5) ──────────
 *
 *   ask_threads    wrong granularity — a thread carries MANY Asks
 *   ask_turns      UPDATE refused by trigger; its (thread_id, turn_index)
 *                  arbitration produces unique turn numbers, not a state change
 *   isHeldRetry    continuity recognition; transitions nothing
 *   receipts       right mechanism, wrong seam — the claim would sit INSIDE
 *                  establishDisclosureBoundary, so a loser fails DURING rather
 *                  than BEFORE boundary establishment
 *
 * The valid shape is the one `consumeOAuthState` already uses in this
 * repository: an atomic mutation whose predicate INCLUDES "still pending".
 * ⛔ It is a PATTERN here, never that table.
 *
 * ── THE STATE MACHINE ──────────────────────────────────────────────────────
 *
 *   PENDING ──atomic claim──▶ CONSUMED ──▶ COMPLETED
 *                                      └──▶ TERMINAL_INCOMPLETE
 *
 * ⛔ NO transition returns CONSUMED → PENDING. An invocation that consumes the
 * act and then dies before the crossing completes requires a NEW member act —
 * never a half-authorized permission waiting to be reused.
 *
 * ⭐ THE CARDINALITY LAW this exists to keep:
 *   one member authorization act → at most ONE completed authored-body crossing
 *                                → at most ONE completed-crossing receipt.
 */

/** Opaque, high-entropy, meaningless alone. ⛔ Never derived from Work content. */
export type PendingAskRef = string;

/**
 * The non-prose coordinates of the paused question — WHICH question, never what
 * may be read. ⛔ The requirement and the section set are RE-DERIVED at resume
 * and must not be persisted: persisting them is how an identity record becomes a
 * permission record.
 */
export interface PendingAskCoordinates {
  readonly memberId: string;
  readonly manuscriptId: string;
  readonly threadId: string;
  readonly readingId: string;
  readonly observationKey: string;
}

/** Whether the invocation that consumed the claim reached a completed crossing. */
export type ConsumedCompletion = 'completed' | 'incomplete';

/**
 * ⭐ SEMANTIC OUTCOMES, INDEPENDENT OF ISOLATION MECHANICS.
 *
 * A serialization failure is a DATABASE FACT, not proof that another request
 * consumed this Ask. An implementation that maps SQLSTATE 40001 straight to
 * `already_consumed` is lying, and one that lets it surface as a server error is
 * lying the other way.
 *
 *   ⛔ A correctly refused replay may not masquerade as server failure, and a
 *     genuine server failure may not masquerade as replay.
 *
 * The same truthfulness law that keeps BODY_UNVERIFIABLE distinct from
 * BODY_AUTHORITY_REQUIRED.
 */
export type ClaimOutcome =
  /** ⭐ The ONLY outcome under which the resume may proceed toward a boundary. */
  | { readonly kind: 'claimed'; readonly coordinates: PendingAskCoordinates }
  /** This resume was already consumed. `completion` serves lost-response recovery. */
  | { readonly kind: 'already_consumed'; readonly completion: ConsumedCompletion }
  /** The pending window closed. Continuity hygiene, not an authority judgement. */
  | { readonly kind: 'expired' }
  /** No such pending Ask. Forged, truncated, or long gone. */
  | { readonly kind: 'unknown' }
  /** ⛔ A genuine substrate fault. NEVER reported as a replay. */
  | { readonly kind: 'unavailable'; readonly reason: string };

/** The single lawful test a caller performs before continuing a resume. */
export const claimAcquired = (
  o: ClaimOutcome,
): o is Extract<ClaimOutcome, { kind: 'claimed' }> => o.kind === 'claimed';

/**
 * ⛔ THE REFUSAL SURFACE. These names have appeared on every design that turned a
 * continuity record into a permission record. A field reaching for one of them is
 * reaching for the wrong thing, and this type says so at compile time.
 *
 * ⭐ `sectionId` is the one that looks harmless and is not: a durable row saying
 * WHICH section this Ask may read is a standing permission, however it is spelled.
 */
export type RefusedPendingField =
  | 'mayCross' | 'may_cross' | 'disclosureId' | 'receiptId'
  | 'consent' | 'authorized' | 'permission' | 'grant'
  | 'sectionId' | 'sectionRef' | 'sections' | 'scopeKind'
  | 'text' | 'body' | 'prose' | 'passage' | 'excerpt' | 'content';

/**
 * The substrate seam.
 *
 * ⛔ `claim` MUST be a single atomic mutation whose predicate includes "still
 * pending". A SELECT that decides, followed by an UPDATE that acts, leaves a
 * window in which a replay races the original and both proceed — the exact
 * defect `consumeOAuthState`'s header names, and the same one the founder
 * rejected in `joinWithInviteWithClient`: *the authority is the MUTATION, not a
 * precheck.*
 */
export interface PendingAskClaimant {
  /** Atomically claim the right to resume. ⭐ At most one caller may win. */
  claim(ref: PendingAskRef): Promise<ClaimOutcome>;
  /** Record that the claimed invocation reached a completed crossing. */
  recordCompleted(ref: PendingAskRef): Promise<void>;
}

/**
 * A deterministic interleaving seam, for instruments only.
 *
 * ⭐ Built on the T10f precedent from the Circles lane: a real competing act is
 * driven BETWEEN the phases of a candidate implementation, so a non-atomic
 * claimant loses on its own terms rather than on a timing accident. An atomic
 * implementation has no phases to interleave and simply ignores it.
 *
 * ⛔ Production wiring passes nothing. This is not a hook the route may use.
 */
export interface Interleaving {
  /** Awaited by a NON-ATOMIC claimant between its read and its write. */
  betweenReadAndWrite?: () => Promise<void>;
}
