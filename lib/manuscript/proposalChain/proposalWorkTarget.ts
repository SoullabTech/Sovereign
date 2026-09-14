/**
 * CUTOVER-01A — THE PROPOSAL-WORK PROJECTION THE WRITING ROOM MOUNTS.
 *
 * ⭐⭐ THE CUTOVER LAW (founder, 2026-09-14):
 *
 *     A proposal may lose its exact place in the current Work
 *     without losing its place in the conversation.
 *
 * ── WHAT THIS REPLACES, AND WHY ────────────────────────────────────────────
 *
 * The retired `revisionProposal/proposalWork.resolveProposalWork()` returned
 * `null` unless `previewProposal(...).state === 'acceptable'`, and the write
 * state mounted proposal work only on a non-null target. So:
 *
 *     not executable → no proposal_work mount → the conversation disappears
 *
 * That is R6 rebuilt one layer above the read model we just separated. The
 * writer could stop being able to TALK about a formulation because the Work had
 * moved underneath it — which is the one thing the chain exists to survive.
 *
 * ⭐ Here the two facts are split all the way down:
 *
 *     proposal_work   ALWAYS survives on a readable chain + version
 *     location        MAY be unavailable, and says only that
 *
 * ⛔ `location.unavailable` NEVER means `proposal_work unavailable`. It means
 * exactly one thing: *we cannot truthfully mark this exact place in the present
 * Work.* No mark, no "show me where" — and the conversation continues.
 *
 * ── ⛔ WHERE THE LOCATION COMES FROM, AND WHERE IT MUST NOT ────────────────
 *
 * From the Work state the caller ALREADY RESOLVED — the same section bodies it
 * is about to return. ⛔ It is never asked of `RevisionAuthorization`, because
 * that would re-establish
 *
 *     proposal location depends on authorization
 *          ⇣  which is just
 *     discussability depends on executability
 *
 * wearing a different coat. Authorization status owns CONSENT/EXECUTION
 * location. Proposal-work mounting owns CONVERSATION/PRESENTATION location.
 * While the Work is unchanged the two produce the same range. ⛔ They remain
 * different facts, and nothing here may read the one to answer the other.
 *
 * ── WHAT TRAVELS ───────────────────────────────────────────────────────────
 *
 * ⭐ `replacementText` is LAWFUL here: this is proposal-work transport and the
 * authored formulation IS its subject.
 * ⛔ `expectedText` does NOT travel. It is a Work fact; the surface reads the
 * prose out of the body it already holds, at `range`, so the two cannot
 * disagree. (F1-4: the consent channel names a place and carries no prose. That
 * is the CONSENT channel; this one carries the authored wording on purpose and
 * still never carries the Work's.)
 *
 * ⛔ `range` is `projected_section_body` CODE POINTS, always, and only ever
 * measured against a projected body. FOCUS-W3 cost this programme two days on
 * exactly that substitution.
 */

import { occurrences } from '@/lib/manuscript/exactText';
import { readProposalWork, type ProposalWork, type ProposalWorkRefusal } from './proposalWork';
import type { SpacedRange } from '@/lib/manuscript/sections/coordinateSpace';

/**
 * Why this formulation cannot be marked in the Work as it stands right now.
 *
 * ⛔ Each is a statement about the PRESENT Work, never about the proposal's
 * standing. None of them withdraws the conversation.
 */
export type LocationUnavailableReason =
  /** The authored-against wording is no longer in the section. */
  | 'expected_text_absent'
  /** It occurs more than once — ⛔ a guessed occurrence is a wrong mark. */
  | 'expected_text_ambiguous'
  /**
   * The target section is not in this Work state, or its stored text has no
   * provable projection (`editable: false`), so any offset would be an offset
   * into a DIFFERENT text than the one the writer edits.
   */
  | 'section_unreadable';

export type ProposalWorkLocation =
  | { readonly located: true; readonly range: SpacedRange }
  | { readonly located: false; readonly reason: LocationUnavailableReason };

/**
 * What the section-writing room needs beyond `ProposalWork` itself.
 *
 * ⛔ No authority field. No `mayAccept`, no `executionAuthority`, no
 * `inspection_only`. Those have no successor in any spelling.
 */
export interface ProposalWorkTarget {
  readonly chainId: string;
  readonly versionId: string;
  readonly sectionId: string;
  /** Writer-facing name of the place, resolved by the server. */
  readonly sectionLabel: string;
  /** ⭐ The EXACT focused version's wording — never the head's. */
  readonly replacementText: string;
  readonly location: ProposalWorkLocation;
}

/**
 * The Work state this projection is measured against.
 *
 * Structurally typed on what `resolveDraftWriteState` already returns, so the
 * caller hands over the sections it is ALREADY returning rather than causing a
 * second read that could disagree with the first.
 */
export interface ProjectedSection {
  readonly id: string;
  readonly heading: string | null;
  /** ⭐ The PROJECTED body — `splitStoredSection(...).body`. */
  readonly body: string;
  /** ⛔ False means `body` is an opaque stored slice, not a projected body. */
  readonly editable: boolean;
}

/** Stable, writer-facing, and never dependent on the section's neighbours. */
function labelFor(section: ProjectedSection | undefined, sectionId: string): string {
  return section?.heading ?? `Section ${sectionId.slice(0, 8)}`;
}

/**
 * ⭐ Locate the chain's historical `expectedText` in the section AS IT IS NOW.
 *
 * Exactly once, or not at all. ⛔ There is deliberately no "first occurrence"
 * fallback: marking one of several candidates would tell the writer we know
 * where the change goes when we do not.
 */
export function locateInWork(
  work: ProposalWork,
  sections: readonly ProjectedSection[],
): ProposalWorkLocation {
  const sectionId = work.chain.locus.targetSectionId;
  const section = sections.find((s) => s.id === sectionId);
  /* ⛔ An unprojectable section is unreadable, never "absent": we are not
     entitled to say the wording is gone when we cannot read the text. */
  if (!section || !section.editable) return { located: false, reason: 'section_unreadable' };

  const expected = work.chain.locus.expectedText;
  const n = occurrences(section.body, expected);
  if (n === 0) return { located: false, reason: 'expected_text_absent' };
  if (n > 1) return { located: false, reason: 'expected_text_ambiguous' };

  /* CODE POINTS, from a UTF-16 index, against the projected body. */
  const unitIndex = section.body.indexOf(expected);
  const start = [...section.body.slice(0, unitIndex)].length;
  const end = start + [...expected].length;
  return { located: true, range: { space: 'projected_section_body', start, end } };
}

/** ⛔ Projection only — it decides nothing about execution. */
export function projectProposalWork(
  work: ProposalWork,
  focused: { readonly id: string; readonly replacementText: string },
  sections: readonly ProjectedSection[],
): ProposalWorkTarget {
  const sectionId = work.chain.locus.targetSectionId;
  return {
    chainId: work.chain.id,
    versionId: focused.id,
    sectionId,
    sectionLabel: labelFor(sections.find((s) => s.id === sectionId), sectionId),
    /* ⭐ C7: the FOCUSED version's wording. A chain whose head is v4 shown at
       v2 renders v2 — silently switching to the head would show the writer a
       formulation they did not ask to see. */
    replacementText: focused.replacementText,
    location: locateInWork(work, sections),
  };
}

export type ProposalWorkTargetResult =
  | { readonly ok: true; readonly target: ProposalWorkTarget }
  | { readonly ok: false; readonly reason: ProposalWorkRefusal };

/**
 * The cutover read: chain + EXACT version, projected against a Work state the
 * caller already holds.
 *
 * ⛔ `versionId` IS REQUIRED. `readProposalWork` will fall back to the head
 * when no version is named, and that default is a reading convenience the
 * writing room must not inherit — the room should know which authored
 * formulation it is displaying.
 */
export async function readProposalWorkTarget(
  memberId: string,
  chainId: string,
  versionId: string,
  sections: readonly ProjectedSection[],
): Promise<ProposalWorkTargetResult> {
  const r = await readProposalWork(memberId, chainId, versionId);
  if (!r.ok) return { ok: false, reason: r.reason };
  const focused = r.work.focused;
  /* Unreachable while a version is named — `readProposalWork` refuses first.
     ⛔ Kept as a refusal rather than an assertion: a null focus must never
     become "then use the head". */
  if (!focused) return { ok: false, reason: 'version_unknown' };
  return { ok: true, target: projectProposalWork(r.work, focused, sections) };
}
