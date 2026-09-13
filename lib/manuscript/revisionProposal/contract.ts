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
  | 'write_failed'
  | 'malformed';

export type AcceptOutcome =
  | { readonly outcome: 'accepted'; readonly proposal: RevisionProposal }
  | { readonly outcome: 'refused'; readonly reason: ProposalRefusal };

/**
 * ⭐ Occurrences of `needle`, counted without overlap.
 *
 * ⛔ NOT `indexOf`. "Found" is not "identified".
 */
export function occurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  let n = 0;
  let i = haystack.indexOf(needle);
  while (i !== -1) { n += 1; i = haystack.indexOf(needle, i + needle.length); }
  return n;
}

export type ExactMatch =
  | { readonly ok: true; readonly applied: string }
  | { readonly ok: false; readonly reason: 'expected_text_absent' | 'expected_text_ambiguous' };

/**
 * ⭐ THE EXACT-ONCE GUARD, pure — the one place that decides whether a proposal
 * still names something, so the law is falsifiable without a database.
 */
export function applyExactlyOnce(
  body: string, expected: string, replacement: string,
): ExactMatch {
  const n = occurrences(body, expected);
  if (n === 0) return { ok: false, reason: 'expected_text_absent' };
  if (n > 1) return { ok: false, reason: 'expected_text_ambiguous' };
  return { ok: true, applied: body.replace(expected, replacement) };
}
