/**
 * STEP 2 · REVISION AUTHORIZATION — the contract, as pure types and functions.
 *
 * ⭐⭐ THE THREE-OBJECT RULING, 2026-09-14:
 *
 *     MAIA OFFER  ──▶  COLLABORATIVE PROPOSAL  ──▶  AUTHORIZATION  ──▶  guarded
 *     (candidate)      (proposal_chains /            (this file)          mutation
 *                       proposal_versions)
 *
 * Three acts. ⛔ The database must make it impossible to mistake one for
 * another, and this file is the third.
 *
 * ⛔ NO PERSISTENCE, AND NONE AUTHORIZED. Schema and migration are a separate
 * packet on a separate branch. This file is the ontology; the table is derived
 * from it, never the reverse — the Step 1 discipline, unchanged.
 *
 * ── ⭐⭐ WHAT IS ABSENT HERE, AND CANNOT BE ADDED WITHOUT CHANGING THIS TYPE ──
 *
 *     replacementText     the authored wording lives on `ProposalVersion`
 *     rationale           likewise
 *     "the current head"  an authorization names ONE EXACT VERSION
 *     inspection_only     ⛔ see below — the state no longer exists
 *
 * So this is true BY SHAPE rather than by a check somebody must remember:
 *
 *     Changing the proposal wording cannot change what an existing
 *     authorization permits. New wording requires a new version, and
 *     permission for that wording requires a new authorization.
 *
 * ── ⛔ WHY THERE IS NO `inspection_only` ──────────────────────────────────
 *
 * EW-F1a was necessary for the architecture that existed, and it caught a real
 * failure: twice on 2026-09-13 a proposal staged for inspection was accepted
 * and the manuscript moved. ⛔ Nothing here diminishes that.
 *
 * ⭐ But the flag existed because ONE ROW was doing TWO JOBS — something merely
 * staged, and something capable of writing. With proposal and authorization
 * separated the invalid state has nowhere to live:
 *
 *     OLD   a row exists, carrying a flag that says do not execute it
 *     NEW   there is no executable object yet
 *
 * **Before the member authorizes an exact version, there is no authorization
 * record.** The EXISTENCE of the row is the permission. That is stronger than a
 * flag, because a flag can be misread, defaulted, promoted or forgotten, and an
 * absent row cannot be any of those things.
 */

import type { ProposalChain, ProposalVersion } from '@/lib/manuscript/proposalChain/contract';

/** ⛔ ONE operation, inherited deliberately. The vocabulary is earned. */
export type AuthorizationOperation = 'delete_exact_text';

/* ══════════════════════════════════════════════════════════════════════════
   ⭐⭐ THE EXECUTION GUARD — UNFORGEABLE ON PURPOSE.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⛔⛔ RULING 5 MADE STRUCTURAL.
 *
 *     ProposalChain.locus   historical / conversational address —
 *                           "what place was this proposal about?"
 *     ExecutionGuard        execution-effective authority —
 *                           "what exact Work state may this member act change?"
 *
 * ⚠️ THEY MAY CONTAIN IDENTICAL VALUES WHEN THE WORK HAS NOT MOVED, AND THAT IS
 * EXACTLY THE DANGER. Equal values are not one fact, and a guard assembled by
 * copying a chain's locus is stale authority wearing current clothes.
 *
 * ⭐ So a guard is NOT an interface an object literal can satisfy. It is a class
 * with a private member and no exported constructor: the only way to obtain one
 * is `resolveGuard()`, which requires the Work state to be READ AT THE TIME OF
 * THE AUTHORIZING ACT. A `LocusIdentity` therefore cannot be passed where a
 * guard is required — not "must not", CANNOT.
 *
 * ⚠️ Same device as `BoundEvidence` (`lib/manuscript/development/bind.ts`), and
 * for the same reason: a proof that can be reconstituted from a literal is not
 * a proof.
 */
class Guard {
  private readonly resolved = true as const;
  constructor(
    readonly workId: string,
    readonly draftId: string,
    /** ⭐ The version of the Work READ FOR THIS ACT. ⛔ Never the chain's. */
    readonly baseVersion: number,
    readonly targetSectionId: string,
    /** ⭐⭐ The exact characters this permission may replace, read now. */
    readonly expectedText: string,
    readonly operation: AuthorizationOperation,
  ) {}
  toJSON() {
    return {
      workId: this.workId, draftId: this.draftId, baseVersion: this.baseVersion,
      targetSectionId: this.targetSectionId, expectedText: this.expectedText,
      operation: this.operation,
    };
  }
}

export type ExecutionGuard = Guard;

/** What the authorizing act read from the Work. ⛔ Not from the proposal. */
export interface WorkStateReading {
  readonly workId: string;
  readonly draftId: string;
  readonly version: number;
  readonly sectionId: string;
  /** The exact characters presently at the target, as the writer is seeing them. */
  readonly textAtTarget: string;
}

export type GuardRefusal =
  /** The reading names a different Work than the chain it is being bound to. */
  | 'work_mismatch'
  /** The reading names a different section than the chain's locus. */
  | 'section_mismatch'
  /** The Work no longer contains the characters this chain was opened against. */
  | 'expected_text_absent'
  /** ⭐ More than once. A permission that cannot say WHICH characters is not one. */
  | 'expected_text_ambiguous'
  | 'malformed';

export type GuardResult =
  | { readonly ok: true; readonly guard: ExecutionGuard }
  | { readonly ok: false; readonly reason: GuardRefusal };

/* ══════════════════════════════════════════════════════════════════════════
   THE AUTHORIZATION
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⭐ ONE MEMBER ACT, PERMITTING ONE EXACT VERSION, ONCE.
 *
 * ⛔ Note `proposalVersionId` is a REQUIRED field of the record itself. There is
 * no constructor anywhere in this module that takes a chain alone and finds a
 * version — the Step 1 law arriving one layer up: *the system must not infer the
 * author's relation from current state.*
 */
export interface RevisionAuthorization {
  readonly id: string;
  readonly memberId: string;

  /** ⭐⭐ EXACTLY WHICH AUTHORED FORMULATION. ⛔ Never "the head". */
  readonly proposalChainId: string;
  readonly proposalVersionId: string;

  /** ⭐ The execution-effective binding, obtainable only from `resolveGuard`. */
  readonly guard: ExecutionGuard;

  readonly authorizedAt: string;

  /**
   * ⭐ THE EXECUTION RECEIPT, written together or not at all.
   * ⛔ Absent means "not yet executed", never "executed, details pending".
   */
  readonly acceptedAt: string | null;
  readonly resultingVersion: number | null;
}

export type AuthorizationRefusal =
  /** The version does not belong to the chain being authorized. */
  | 'version_foreign_to_chain'
  /** The chain is not this member's, or does not exist. ⛔ Indistinguishable. */
  | 'chain_unknown'
  /** No such version in that chain. */
  | 'version_unknown'
  /** ⭐ A permission is single-use. */
  | 'already_accepted'
  /** The Work moved past the state this permission was bound to. */
  | 'guard_stale'
  | 'malformed';

export type AuthorizeResult =
  | { readonly ok: true; readonly authorization: RevisionAuthorization }
  | { readonly ok: false; readonly reason: AuthorizationRefusal };

/* ══════════════════════════════════════════════════════════════════════════
   PURE FUNCTIONS
   ══════════════════════════════════════════════════════════════════════════ */

/** Occurrences counted without overlap. ⛔ NOT `indexOf` — found is not identified. */
export function occurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  let n = 0;
  let i = haystack.indexOf(needle);
  while (i !== -1) { n += 1; i = haystack.indexOf(needle, i + needle.length); }
  return n;
}

/**
 * ⭐⭐ THE ONLY WAY TO OBTAIN A GUARD.
 *
 * ⛔ It takes a READING OF THE WORK, not the chain's locus. The chain supplies
 * only two things — which Work and section this proposal was about, and the
 * characters it was opened against — and BOTH are re-verified against what the
 * Work says NOW. `baseVersion` comes from the reading; the chain's is never
 * copied forward.
 *
 * ⚠️ THAT IS THE WHOLE POINT. An authorization created by copying
 * `chain.locus` would carry a version number nobody read at the authorizing
 * act — the same defect as a store synthesizing `supersedes` from whatever it
 * found under its lock, one layer up.
 */
export function resolveGuard(
  chain: ProposalChain, reading: WorkStateReading,
): GuardResult {
  if (typeof reading?.textAtTarget !== 'string' || !Number.isInteger(reading?.version)) {
    return { ok: false, reason: 'malformed' };
  }
  if (reading.workId !== chain.locus.workId) return { ok: false, reason: 'work_mismatch' };
  if (reading.sectionId !== chain.locus.targetSectionId) {
    return { ok: false, reason: 'section_mismatch' };
  }
  const n = occurrences(reading.textAtTarget, chain.locus.expectedText);
  if (n === 0) return { ok: false, reason: 'expected_text_absent' };
  if (n > 1) return { ok: false, reason: 'expected_text_ambiguous' };
  return {
    ok: true,
    guard: new Guard(
      reading.workId, reading.draftId,
      /* ⭐ THE READING'S VERSION. ⛔ NOT `chain.locus.baseVersion`. */
      reading.version,
      reading.sectionId, chain.locus.expectedText, 'delete_exact_text'),
  };
}

/**
 * ⭐ THE AUTHORIZING ACT.
 *
 * ⛔ Requires an exact `versionId` and a guard that was resolved, not assembled.
 * There is deliberately no `authorizeHead(chain)` and there must never be one.
 */
export function authorize(
  input: {
    readonly id: string;
    readonly memberId: string;
    readonly chain: ProposalChain;
    readonly versions: readonly ProposalVersion[];
    readonly versionId: string;
    readonly guard: ExecutionGuard;
    readonly authorizedAt: string;
  },
): AuthorizeResult {
  const { chain, versions, versionId, guard } = input;

  /* ⛔⛔ THE FORGERY CHECK, AT RUNTIME TOO.
     The class's private member makes a literal unassignable at COMPILE time —
     but a `as unknown as ExecutionGuard` cast erases to nothing, and the first
     draft of this function accepted one. ⚠️ A comment claiming "not must not,
     CANNOT" while the runtime said otherwise is the gap this programme keeps
     finding: `instanceof` is what makes the sentence true in both places. */
  if (!(guard instanceof Guard)) return { ok: false, reason: 'malformed' };

  if (chain.memberId !== input.memberId) return { ok: false, reason: 'chain_unknown' };

  const version = versions.find((v) => v.id === versionId);
  if (!version) return { ok: false, reason: 'version_unknown' };
  if (version.chainId !== chain.id) return { ok: false, reason: 'version_foreign_to_chain' };

  /* ⛔ The guard must be about the same place this chain is about. It may carry
     a DIFFERENT baseVersion — that is the point of resolving it — but not a
     different Work or target. */
  if (guard.workId !== chain.locus.workId || guard.targetSectionId !== chain.locus.targetSectionId) {
    return { ok: false, reason: 'malformed' };
  }

  return {
    ok: true,
    authorization: {
      id: input.id, memberId: input.memberId,
      proposalChainId: chain.id, proposalVersionId: version.id,
      guard, authorizedAt: input.authorizedAt,
      acceptedAt: null, resultingVersion: null,
    },
  };
}

/**
 * ⭐ Is this permission still executable against the Work as it is now?
 *
 * ⛔ RULING 6 LIVES HERE, AND IT IS AN ABSENCE: this function says nothing
 * about whether the PROPOSAL is still worth working on. Those are independent
 * questions and nothing in this module answers the first.
 */
export function guardStillHolds(
  guard: ExecutionGuard, reading: WorkStateReading,
): boolean {
  return reading.workId === guard.workId
    && reading.draftId === guard.draftId
    && reading.version === guard.baseVersion
    && reading.sectionId === guard.targetSectionId
    && occurrences(reading.textAtTarget, guard.expectedText) === 1;
}

/**
 * ⭐ THE EXECUTION RECEIPT — both fields together, once.
 *
 * ⛔ Never two steps. A durable "claimed but not written" state would tell a
 * member their change was made when the Work never moved; EDITORIAL-WRITE-01
 * paid for that lesson and `mrp_acceptance_whole` is its constraint.
 */
export function recordExecution(
  authorization: RevisionAuthorization, acceptedAt: string, resultingVersion: number,
): AuthorizeResult {
  if (authorization.acceptedAt !== null) return { ok: false, reason: 'already_accepted' };
  if (!Number.isInteger(resultingVersion)) return { ok: false, reason: 'malformed' };
  return { ok: true, authorization: { ...authorization, acceptedAt, resultingVersion } };
}

/**
 * ⭐ RULING 6, stated as a type so a surface cannot collapse it back.
 *
 * ⛔ `resolveProposalWork()` today returns `null` for BOTH "no such proposal"
 * and "the Work moved", so a writer cannot keep discussing an idea whose
 * executable binding has lapsed. These are two questions and this is two
 * fields. ⛔ No implementation is authorized by this type existing.
 */
export interface ProposalWorkability {
  /** Can writer and MAIA keep working on this wording? */
  readonly discussable: boolean;
  /** Could an authorization execute against the Work right now? */
  readonly executable: boolean;
}
