/**
 * STEP 1 · LOCUS-SCOPED AUTHORED PROPOSAL SUCCESSION — the contract.
 *
 * ⭐⭐ THE RULING, RATIFIED 2026-09-14:
 *
 *   A succession chain belongs to ONE LOCUS. An editorial ruling may govern
 *   multiple locus-scoped chains, and is not itself executable authority.
 *   One proposal version = one authored formulation for one exact target.
 *
 * ⛔ NO PERSISTENCE, AND NONE AUTHORIZED. Schema and migration are a separate
 * lane on a separate branch. **This file is the ontology; the table must be
 * derived from it, never the reverse.**
 *
 * ── ⛔ WHY THIS IS NOT AN EXTENSION OF `manuscript_structure_proposals` ─────
 *
 * That object is a mutable `reviewed` blob plus a `review_revision` counter
 * with no history table. It can say "MAIA proposed once, the member revised N
 * times, the member adopted revision K". It CANNOT say
 * `MAIA v1 → Kelly v2 → MAIA v3 → Kelly v4`: intermediate formulations are
 * overwritten and a revision has no author.
 *
 * ⚠️ Reusing it would preserve the APPEARANCE of history while destroying the
 * intermediate authorship that is the entire point.
 *
 * ── ⭐ SUCCESSION IS CARRIED BY THE SUCCESSOR ──────────────────────────────
 *
 * `supersedes` lives on the version that comes after; `superseded_by` is
 * DERIVED and never stored — the Authority × Time direction already ratified
 * for memory. The head is the version nobody supersedes; it is found, not
 * flagged, so there is no second fact to fall out of step with the first.
 *
 * ⛔ This is deliberately NOT the `event_index` pattern of
 * `editorial_decision_events`. That is an event LOG, where order is the record.
 * This is SUCCESSION, where each entry names what it replaces — which is what
 * makes a cycle, a self-predecessor and a branch expressible enough to refuse.
 */

/**
 * ⭐ WHO WROTE THIS FORMULATION — explicit, never inferred from position or
 * from what surrounds it.
 *
 * ⛔ There is no `system` and no `unknown`. A version nobody authored is not a
 * version; a fixture staged mechanically must say so somewhere real rather than
 * borrowing MAIA's name, which is the false-provenance failure of 2026-09-13.
 *
 * ⚠️ `member_confirmed_maia_proposal` from `DecisionAuthorship` is deliberately
 * NOT here. A member accepting MAIA's wording unchanged binds an authorization
 * to HER version; it does not author one of their own. Collision recorded in
 * the census §7.3 — the two vocabularies must not drift, and this is the
 * boundary between them.
 */
export type VersionAuthor = 'maia' | 'member';

export const VERSION_AUTHORS: readonly VersionAuthor[] = ['maia', 'member'];

export const isVersionAuthor = (v: unknown): v is VersionAuthor =>
  typeof v === 'string' && (VERSION_AUTHORS as readonly string[]).includes(v);

/**
 * ⭐⭐ THE LOCUS — facts about the WORK, fixed when the chain opens.
 *
 * ⛔ AUTHORIZATION FACTS, NOT AUTHORED MATERIAL. They never appear on a
 * version. A chain whose locus would need to change is not that chain any more:
 * it is a new proposal against a new state of the Work.
 */
export interface LocusIdentity {
  readonly workId: string;
  readonly draftId: string;
  /** The state of the Work this chain was opened against. */
  readonly baseVersion: number;
  readonly targetSectionId: string;
  /**
   * ⭐ THE LAW ACCEPTANCE USES — the exact characters this chain may replace,
   * required to occur exactly once at the target. Immutable for the chain's
   * life.
   */
  readonly expectedText: string;
}

/**
 * ⭐ A REFERENCE TO A GOVERNING RULING — relationship only.
 *
 * ⛔ NEVER OWNERSHIP OF WORDING. One ruling may govern several chains (the
 * campfire case: keep the first, make the second a callback, strengthen the
 * return). It is not executable authority and it is not a version: note that
 * this type has no field a replacement, a rationale or an author could travel
 * in, so a ruling cannot be mistaken for a formulation by shape.
 */
export interface EditorialRulingRef {
  readonly decisionChainId: string;
}

/**
 * One authored formulation. ⛔ WORDING AND PROVENANCE ONLY.
 *
 * ⭐⭐ NOTE WHAT IS ABSENT AND CANNOT BE ADDED WITHOUT CHANGING THIS TYPE: a
 * target, an expected text, a base version, a range, an operation. Those are
 * the chain's, and the chain does not evolve. So
 *
 *   "changing what should replace the text cannot change what text the
 *    authorization is permitted to replace"
 *
 * is true BY SHAPE — no check to forget, no validation to bypass, and no later
 * refactor that can quietly reunite them. `manuscript_revision_proposals` held
 * both on one row and one gesture edited both; that is the defect this retires.
 */
export interface ProposalVersion {
  readonly id: string;
  readonly chainId: string;
  /** ⭐ The version this replaces. `null` only for the root. */
  readonly supersedes: string | null;
  /** What this author proposes should stand in place of the expected text. */
  readonly replacementText: string;
  /**
   * ⭐ Why, in THIS author's own words — and ABSENT when there is none.
   *
   * ⛔ Never synthesised, and ⛔ never a home for the writer's DIRECTION.
   * "Too absolute — keep the experiential quality without making it universal"
   * is an instruction that produced the next version; putting it here would
   * attribute the member's instruction to MAIA's reasoning.
   * See `DIRECTION-HOME` below.
   */
  readonly rationale?: string;
  readonly author: VersionAuthor;
  readonly authoredAt: string;
}

export interface ProposalChain {
  readonly id: string;
  readonly memberId: string;
  readonly locus: LocusIdentity;
  /** Present when a ruling governs this chain. ⛔ A reference, never a parent. */
  readonly governedBy?: EditorialRulingRef;
  readonly openedAt: string;
}

/**
 * ⭐ AN AUTHORIZATION POINTS AT ONE EXACT VERSION.
 *
 * ⛔ Not at a chain, not at "the latest", not at a range of versions. Step 2
 * builds the durable object; this states the shape succession must make
 * possible and nothing more.
 */
export interface VersionAuthorization {
  readonly chainId: string;
  readonly versionId: string;
}

export type SuccessionRefusal =
  /** A version without an author in the closed vocabulary. */
  | 'author_missing'
  /** The version does not belong to the chain it is being read against. */
  | 'foreign_chain'
  /** `supersedes` names a version that is not in this chain. */
  | 'predecessor_unknown'
  /** `supersedes` names the version itself. */
  | 'self_predecessor'
  /** Following `supersedes` returns to a version already visited. */
  | 'cycle'
  /** Two versions carry the same id. */
  | 'duplicate_version'
  /** More than one version has `supersedes === null`. */
  | 'multiple_roots'
  /** No version has `supersedes === null`. */
  | 'no_root'
  /** Two versions supersede the same predecessor: the chain is not linear. */
  | 'branched'
  /** An append would replace a version that already exists. */
  | 'version_exists'
  /** An append must succeed the head, not an earlier version. */
  | 'not_successor_of_head'
  /** An authorization naming a version outside its chain. */
  | 'authorization_foreign_version';

export type SuccessionResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly reason: SuccessionRefusal };

/* ══════════════════════════════════════════════════════════════════════════
   ⚠️ DIRECTION-HOME — OPEN.

   The writer's instruction between versions — "too absolute; keep the
   experiential quality without making it universal" — is none of:

     the wording being proposed          (that is a ProposalVersion)
     the author's rationale for it       (that belongs to whoever wrote it)
     the higher-order editorial ruling   (that is an EditorialDecision)

   It is an INSTRUCTIONAL CONVERSATIONAL ACT BETWEEN VERSIONS, and it has no
   durable representation anywhere in this system.

   ⛔ NON-BLOCKING for the succession substrate — proving succession does not
   require inventing its home. ⛔ BLOCKING before collaborative revise
   persistence is frozen.

   ⚠️ Recorded here, in the file someone would otherwise reach for, precisely
   so that nobody "temporarily" stuffs it into `rationale` and quietly
   falsifies provenance.
   ══════════════════════════════════════════════════════════════════════════ */
