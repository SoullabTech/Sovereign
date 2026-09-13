/**
 * EW-F2 · STEP 2 — SERVER-RESOLVED PROPOSAL WORK.
 *
 * ⛔ PW-2: THE CLIENT CANNOT CREATE PROPOSAL WORK MODE BY ASSERTION.
 * The browser may supply one thing — a proposal id, as a SELECTOR. Everything
 * that follows from it is resolved here against the authenticated member:
 * ownership, the Work, the draft, the version, the target section, the range,
 * and whether the proposal is still live at all.
 *
 * ⭐⭐ AND IT IS NOT A SECOND RESOLUTION. `previewProposal` already decides
 * every one of those questions, using the SAME exact-once guard acceptance
 * uses. Re-deriving any of it here would be a new source of disagreement about
 * the Work — the failure this programme has already paid for twice (the
 * confirmation instrument that issued its own SQL, and the two-implementation
 * decay definition). This adds nothing to that resolution; it only asks it a
 * narrower question and carries the staged text the surface needs.
 *
 * ── WHAT TRAVELS, AND WHY SO LITTLE ───────────────────────────────────────
 *
 * NOT the section prose. The write state already carries every section's body,
 * so the PROPOSED state is DERIVED in the surface from the Work's own text plus
 * the staged replacement. A second copy of the prose would be a second thing
 * that can be stale, and the whole EW-F1 finding was about a representation
 * disagreeing with the Work.
 *
 * ⛔ `range` is `projected_section_body` CODE POINTS — the same space the
 * accepted F1-2 mark uses against the editor's body. It is never re-derived
 * against stored text here; FOCUS-W3 cost this programme two days on exactly
 * that substitution.
 */

import { previewProposal } from './preview';
import type { SpacedRange } from '@/lib/manuscript/sections/coordinateSpace';

export interface ProposalWorkTarget {
  readonly proposalId: string;
  readonly sectionId: string;
  /** Writer-facing name of the place, resolved by the server. */
  readonly sectionLabel: string;
  /** ⛔ projected_section_body code points. Never stored-text offsets. */
  readonly range: SpacedRange;
  readonly operation: 'delete_exact_text';
  /**
   * ⭐ The staged authored content. Empty for a deletion today; this is the
   * field that becomes a successor chain at step 3. The Work fact it replaces
   * (`expected_text`) deliberately does NOT travel — the surface reads it out
   * of the body it already has, at `range`, so the two can never disagree.
   */
  readonly replacementText: string;
}

/**
 * The proposal being worked, or null.
 *
 * ⛔ NULL IS TOTAL. A proposal that is absent, another member's, already
 * accepted, or no longer matching the Work all resolve to null here — the room
 * then mounts the ordinary section engine. Proposal work mode is entered only
 * on a proposal that could actually be accepted right now, because the whole
 * point of the mode is to let the writer work toward that acceptance.
 */
export async function resolveProposalWork(
  memberId: string,
  proposalId: string | null,
): Promise<ProposalWorkTarget | null> {
  if (!proposalId) return null;
  const preview = await previewProposal(memberId, proposalId);
  if (preview.state !== 'acceptable') return null;
  return {
    proposalId: preview.proposalId,
    sectionId: preview.change.sectionId,
    sectionLabel: preview.change.sectionLabel,
    range: preview.change.range,
    operation: preview.change.operation,
    /* Deletion today. The vocabulary opens at step 4, not here. */
    replacementText: '',
  };
}
