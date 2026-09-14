/**
 * EDITORIAL-WRITE-01 — the contract.
 *
 *   Editorial decision  — the Work should be handled this way.
 *   RevisionProposal    — here is the exact change I am asking permission to make.
 *   Accepted mutation   — the member authorized this exact change.
 *
 * ⛔ Three different objects. This is the middle one, and rendering it changes
 * nothing.
 */

/** ⛔ ONE operation. The vocabulary is earned from manuscript work. */
export type ProposalOperation = 'delete_exact_text';

export interface RevisionProposal {
  readonly id: string;
  readonly workId: string;
  readonly draftId: string;
  /** The state of the Work this was built against. */
  readonly baseVersion: number;
  readonly operation: ProposalOperation;
  readonly targetSectionId: string;
  /** ⭐ These exact characters, at that target, occurring exactly once. */
  readonly expectedText: string;
  readonly replacementText: string;
  readonly decisionChainId: string | null;
  readonly createdAt: string;
  /** ⛔ Written WITH `resultingVersion`, never before it. */
  readonly acceptedAt: string | null;
  readonly resultingVersion: number | null;
  /** ⭐ What this proposal may do. Fixed at creation; immutable thereafter. */
  readonly executionAuthority: ExecutionAuthority;
}

export type ProposalRefusal =
  /** No such proposal for this member. ⛔ Indistinguishable from another's. */
  | 'proposal_unknown'
  /** Already accepted. A proposal authorizes one change, once. */
  | 'already_accepted'
  /** The Work moved past the state this was built against. */
  | 'stale_base'
  | 'draft_not_found'
  | 'section_not_found'
  /** This cut cannot split the section into heading and body. */
  | 'section_not_projectable'
  /** ⭐ The characters are gone. The version alone never authorizes the write. */
  | 'expected_text_absent'
  /**
   * ⭐⭐ The characters occur more than once.
   *
   * ⛔ A proposal that cannot say WHICH characters it means does not name an
   * exact change. Deleting "the first one" would be the system choosing on the
   * member's behalf and calling it their authorization.
   */
  | 'expected_text_ambiguous'
  /**
   * ⭐⭐ EW-F1a · THIS PROPOSAL MAY NOT CROSS INTO THE WORK.
   *
   * Staged for inspection. Not a failure of the change, not a statement about
   * the Work — a statement about what this proposal was ever authorized to do.
   *
   * ⛔ It is NOT promotable. If the editorial idea should become executable
   * that is a new proposal in a recorded relationship to this one, never the
   * quiet relabelling of an authority the member never granted.
   */
  | 'inspection_only'
  | 'write_failed'
  | 'malformed';

/**
 * What a proposal is permitted to do, fixed when it is created.
 *
 * ⭐ THE DEFAULT IS THE SAFE ONE, in the schema and here. A proposal nobody
 * deliberately marked executable is not executable — because "this one is only
 * for looking at" was, until EW-F1a, a promise between people rather than a
 * property of the thing, and it gave way twice in one afternoon.
 */
export type ExecutionAuthority = 'inspection_only' | 'member_acceptance';

export function mayCrossIntoTheWork(a: ExecutionAuthority): boolean {
  return a === 'member_acceptance';
}

export type AcceptOutcome =
  | { readonly outcome: 'accepted'; readonly proposal: RevisionProposal }
  | { readonly outcome: 'refused'; readonly reason: ProposalRefusal };

/**
 * ⚠️ MOVED 2026-09-14. `occurrences` and `applyExactlyOnce` are NEUTRAL WORK
 * LAW and now live in `@/lib/manuscript/exactText`. They were never part of
 * this module's authority ontology — they answer whether exact characters
 * occur exactly once, which is true regardless of who may change them.
 *
 * ⛔ Re-exported here ONLY so consumers this lane has not ported keep working.
 * ⛔ THE AUTHORITY VOCABULARY DOES NOT TRAVEL WITH THEM: nothing in the neutral
 * module knows about `ExecutionAuthority` or `inspection_only`, and this
 * re-export must not become a reason to keep reaching for this file.
 */
export { occurrences, applyExactlyOnce, type ExactMatch } from '@/lib/manuscript/exactText';
