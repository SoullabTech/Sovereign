/**
 * EA-NOOP-ADJUSTMENT-01 — THE NARROW NO-OP LAW.
 *
 * ⭐⭐ WHAT THIS FILE REFUSES, STATED EXACTLY:
 *
 *   MAIA's new `reply_with_proposal` candidate is BYTE-IDENTICAL to her own
 *   immediately preceding proposal at this exact locus — the EXACT version
 *   the turn was invoked against (`authoredAgainstVersionId`), never the
 *   chain's current head and never any other version in the lineage.
 *
 * ⛔ NOT THIS FILE'S BUSINESS:
 *
 *   · a member-authored predecessor with identical wording — the author may
 *     repeat their own words; nothing here reads that as a defect.
 *   · a match against some OLDER, non-immediate version — a formulation MAIA
 *     already offered two versions ago is not what `authoredAgainstVersionId`
 *     names, and this law does not walk the lineage looking for one.
 *   · normalized equality (whitespace, case) — ruled explicitly out of scope
 *     by the governing review. Exact bytes only.
 *
 * ⭐ WHY THE RUNTIME SEAM RE-READS THE EXACT PREDECESSOR RATHER THAN REUSING
 * `assembly.invokedAgainstVersionId` BY ITSELF: that id is already carried on
 * the frozen `EditorialInvocation` — this module does not re-derive it. What
 * it DOES re-read is the version's own wording and authorship, via
 * `readProposalWork` focused on that exact id, because the frozen invocation
 * carries only the id, never the text or the author of what it names.
 *
 * ⛔ THIS IS NOT A REPAIR OF `proposalChain/store.ts` OR `succession.ts`. Both
 * are read only, through the existing reviewed read model
 * (`readProposalWork`), and neither is imported here. An identical
 * formulation may lawfully exist elsewhere in a chain's lineage; this law
 * only ever looks at the one version the current turn was invoked against.
 */

import { readProposalWork } from '../proposalChain/proposalWork';
import type { VersionAuthor } from '../proposalChain/contract';

export interface NoopAdjustmentCandidate {
  readonly memberId: string;
  readonly chainId: string;
  /** ⭐ The EXACT frozen predecessor to compare against. ⛔ Never the head. */
  readonly authoredAgainstVersionId: string | null;
  readonly candidateReplacementText: string;
}

/** ⛔ One reason, naming exactly the defect this law refuses. */
export type NoopAdjustmentReason = 'noop_editorial_adjustment';

export type NoopAdjustmentVerdict =
  | { readonly isNoop: false }
  | {
      readonly isNoop: true;
      readonly reason: NoopAdjustmentReason;
      /** ⭐ Concrete enough for a later writer-facing route mapping. */
      readonly detail: string;
    };

const NOOP_DETAIL =
  'This proposal repeats MAIA\'s own immediately preceding wording at this passage, '
  + 'unchanged. Nothing was written. Ask for something different, or accept the existing '
  + 'proposal.';

/**
 * ⭐⭐ THE LAW ITSELF — pure, total, falsifiable without a database.
 *
 * Given the EXACT frozen predecessor (or `null`, meaning none was found or
 * none existed) and a new candidate, decide whether the candidate is a
 * byte-identical repeat of that one predecessor's wording, authored by MAIA.
 *
 * ⛔ Receives one version, never a lineage. A caller that hands this a version
 * other than the exact one the turn was invoked against has already broken
 * the law this function exists to keep narrow.
 */
export function evaluateNoopAdjustment(
  predecessor: { readonly author: VersionAuthor; readonly replacementText: string } | null,
  candidateReplacementText: string,
): NoopAdjustmentVerdict {
  if (predecessor === null) return { isNoop: false };
  if (predecessor.author !== 'maia') return { isNoop: false };
  if (predecessor.replacementText !== candidateReplacementText) return { isNoop: false };
  return { isNoop: true, reason: 'noop_editorial_adjustment', detail: NOOP_DETAIL };
}

/**
 * ⭐ THE RUNTIME SEAM. Resolves the exact frozen predecessor through the
 * reviewed read model, focused on `authoredAgainstVersionId`, then applies
 * the law above.
 *
 * ⛔ `authoredAgainstVersionId === null` (the first proposal in a chain, with
 * no predecessor to repeat) is read as "nothing to compare against" — never
 * as a match. ⛔ A predecessor `readProposalWork` cannot find (unknown chain,
 * unknown version, a corrupt chain) is read the same way: absence of an
 * exact frozen predecessor is absence of a no-op, never evidence of one.
 */
export async function detectNoopAdjustment(
  input: NoopAdjustmentCandidate,
): Promise<NoopAdjustmentVerdict> {
  if (input.authoredAgainstVersionId === null) return { isNoop: false };

  const work = await readProposalWork(
    input.memberId, input.chainId, input.authoredAgainstVersionId);
  if (!work.ok) return { isNoop: false };

  return evaluateNoopAdjustment(work.work.focused, input.candidateReplacementText);
}
