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
   ⭐⭐ TWO OBJECTS, NOT ONE: THE PROOF AND THE FACT IT ESTABLISHED.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⛔⛔ RULING 5 MADE STRUCTURAL.
 *
 *     ProposalChain.locus   historical / conversational address —
 *                           "what place was this proposal about?"
 *     the execution binding execution-effective authority —
 *                           "what exact Work state may this member act change?"
 *
 * ⚠️ THEY MAY CONTAIN IDENTICAL VALUES WHEN THE WORK HAS NOT MOVED, AND THAT IS
 * EXACTLY THE DANGER. Equal values are not one fact, and a binding assembled by
 * copying a chain's locus is stale authority wearing current clothes.
 *
 * ── ⭐⭐ AND THAT IS WHY THIS IS TWO TYPES, NOT ONE ────────────────────────
 *
 * ⚠️ FOUNDER REVIEW, 2026-09-14. The first cut stored the BRANDED CLASS inside
 * `RevisionAuthorization`, which made a durable authorization impossible to
 * hydrate truthfully. After a round trip through PostgreSQL you hold plain
 * data, the private class identity is gone, and every remaining option is bad:
 *
 *     fabricate a proof                       ⛔ forge it
 *     re-resolve against the CURRENT Work     ⛔ rewrite historical authority
 *     cast the plain row back to the proof    ⛔ defeat the guarantee
 *
 * ⭐ So the proof and the durable fact separate:
 *
 *     ResolvedGuardProof   ephemeral · branded · obtainable ONLY by reading
 *                          the Work at the authorizing act
 *              │
 *              ▼
 *     ExecutionBinding     durable · plain data · survives serialization
 *
 * **Unforgeability belongs to CREATION. Durability belongs to the RESULTING
 * FACT.** The proof establishes that the authorizing act really read the Work;
 * the binding records what that act established. ⛔ A hydrator can reconstruct
 * the second and must never be able to manufacture the first.
 */

/** ⭐ The durable fact. Plain data, by design — it has to survive a database. */
export interface ExecutionBinding {
  readonly workId: string;
  readonly draftId: string;
  /** ⭐ The version of the Work READ FOR THIS ACT. ⛔ Never the chain's. */
  readonly baseVersion: number;
  readonly targetSectionId: string;
  /** ⭐⭐ The exact characters this permission may replace, as read then. */
  readonly expectedText: string;
  readonly operation: AuthorizationOperation;
}

/**
 * ⭐ The ephemeral proof. A class with a private member and no exported
 * constructor — the `BoundEvidence` device (`lib/manuscript/development/
 * bind.ts`) — so the only way to hold one is `resolveGuard()`.
 *
 * ⛔ IT IS NEVER PERSISTED AND HAS NO `toJSON`. What gets stored is its
 * `binding`; a proof that could be serialized and read back would be a proof
 * that can be reconstituted from a literal, which is not a proof.
 */
class Proof {
  private readonly resolvedFromTheWork = true as const;
  constructor(readonly binding: ExecutionBinding) {}
}

export type ResolvedGuardProof = Proof;

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
  | { readonly ok: true; readonly proof: ResolvedGuardProof }
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

  /**
   * ⭐ The execution-effective binding — DURABLE PLAIN DATA.
   * ⛔ Obtainable only by presenting a `ResolvedGuardProof` to `authorize()`,
   * so the fact cannot exist without the reading that established it — but the
   * fact itself survives a database, which the proof deliberately does not.
   */
  readonly guard: ExecutionBinding;

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
    proof: new Proof({
      workId: reading.workId, draftId: reading.draftId,
      /* ⭐ THE READING'S VERSION. ⛔ NOT `chain.locus.baseVersion`. */
      baseVersion: reading.version,
      targetSectionId: reading.sectionId,
      expectedText: chain.locus.expectedText,
      operation: 'delete_exact_text',
    }),
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
    /** ⛔ The PROOF, not a binding. A caller holding only plain data cannot act. */
    readonly proof: ResolvedGuardProof;
    readonly authorizedAt: string;
  },
): AuthorizeResult {
  const { chain, versions, versionId, proof } = input;

  /* ⛔⛔ THE FORGERY CHECK, AT RUNTIME TOO.
     The class's private member makes a literal unassignable at COMPILE time —
     but a `as unknown as ResolvedGuardProof` cast erases to nothing, and the
     first draft of this function accepted one. ⚠️ A comment claiming "not must
     not, CANNOT" while the runtime said otherwise is the gap this programme
     keeps finding: `instanceof` is what makes the sentence true in both. */
  if (!(proof instanceof Proof)) return { ok: false, reason: 'malformed' };
  const guard = proof.binding;

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
  guard: ExecutionBinding, reading: WorkStateReading,
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

/* ══════════════════════════════════════════════════════════════════════════
   ⭐⭐ THE DURABLE HYDRATOR — AND WHAT IT DELIBERATELY CANNOT DO.
   ══════════════════════════════════════════════════════════════════════════ */

/** The authorization exactly as a row carries it. ⛔ Plain data throughout. */
export interface StoredAuthorization {
  readonly id: string;
  readonly memberId: string;
  readonly proposalChainId: string;
  readonly proposalVersionId: string;
  readonly guard: ExecutionBinding;
  readonly authorizedAt: string;
  readonly acceptedAt: string | null;
  readonly resultingVersion: number | null;
}

const isBinding = (b: unknown): b is ExecutionBinding => {
  if (typeof b !== 'object' || b === null) return false;
  const x = b as Record<string, unknown>;
  return typeof x.workId === 'string' && typeof x.draftId === 'string'
    && Number.isInteger(x.baseVersion) && typeof x.targetSectionId === 'string'
    && typeof x.expectedText === 'string' && x.operation === 'delete_exact_text';
};

/**
 * ⭐ REBUILD A DURABLE AUTHORIZATION FROM PLAIN DATA — and nothing more.
 *
 * ⛔⛔ THIS FUNCTION CANNOT MANUFACTURE A `ResolvedGuardProof`, AND THAT IS THE
 * WHOLE POINT. It returns the authorization with its `ExecutionBinding` — the
 * fact the original act established — and no way to perform a NEW authorizing
 * act. A hydrator that could mint a proof would let a row read out of a
 * database stand in for having read the Work.
 *
 * ⛔ And it does NOT re-resolve against the current Work. `guardStillHolds()`
 * answers whether the binding is still executable; ⭐ that is a different
 * question from what the member authorized, and conflating them would let a
 * later Work state silently rewrite historical authority.
 */
export function hydrateAuthorization(
  row: unknown,
): RevisionAuthorization | null {
  if (typeof row !== 'object' || row === null) return null;
  const r = row as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.memberId !== 'string') return null;
  if (typeof r.proposalChainId !== 'string' || typeof r.proposalVersionId !== 'string') return null;
  if (typeof r.authorizedAt !== 'string') return null;
  if (!isBinding(r.guard)) return null;

  const acceptedAt = r.acceptedAt ?? null;
  const resultingVersion = r.resultingVersion ?? null;
  if (acceptedAt !== null && typeof acceptedAt !== 'string') return null;
  if (resultingVersion !== null && !Number.isInteger(resultingVersion)) return null;
  /* ⛔ The receipt is whole or absent — the `mrp_acceptance_whole` law, in the
     contract rather than only in a CHECK a different lane owns. */
  if ((acceptedAt === null) !== (resultingVersion === null)) return null;

  return {
    id: r.id, memberId: r.memberId,
    proposalChainId: r.proposalChainId, proposalVersionId: r.proposalVersionId,
    guard: r.guard, authorizedAt: r.authorizedAt,
    acceptedAt: acceptedAt as string | null,
    resultingVersion: resultingVersion as number | null,
  };
}
