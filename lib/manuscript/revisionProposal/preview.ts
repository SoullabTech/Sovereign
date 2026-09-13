/**
 * EDITORIAL-WRITE-01A — the staged diff, derived on the SERVER.
 *
 * ⭐⭐ THE PREVIEW AND THE ACCEPTANCE CONSUME THE SAME GUARD.
 *
 * `applyExactlyOnce` decides both. FOCUS-W3 cost this programme two days
 * because a preflight and an act answered two different questions and the panel
 * advertised five places as ready while the crossing could read four. A consent
 * surface that says "this will make 1 change" where acceptance would refuse is
 * the same defect with worse consequences: the member would authorize something
 * that does not happen, or — far worse — something else.
 *
 * ── ⛔ THE PREVIEW IS NOT AUTHORITY ───────────────────────────────────────
 *
 * It renders what the stored proposal names, against the Work state that
 * proposal is bound to. It never regenerates an equivalent edit, never relocates
 * the target, never widens the match.
 *
 *   Permission for one exact change is not permission to achieve the same
 *   intention another way.
 *
 * ⛔ NOTHING HERE WRITES.
 */

import { query } from '@/lib/db/postgres';
import { splitStoredSection } from '@/lib/manuscript/sections/saveSection';
import { applyExactlyOnce, type ProposalRefusal } from './contract';
import { readProposal } from './store';

/** How much of the member's own prose frames the change, in code points. */
const CONTEXT = 140;

export interface StagedChange {
  /** `Section 23 · “THE SPIRALING PATH…”` — the writer's own vocabulary. */
  readonly sectionLabel: string;
  /** Exactly the characters that would go. */
  readonly removed: string;
  readonly contextBefore: string;
  readonly contextAfter: string;
  /** ⛔ Always 1 in this cut. Multi-change proposals are not built. */
  readonly changeCount: number;
}

export type ProposalPreview =
  /** ⭐ The ONLY state in which the accept gesture may be offered. */
  | { readonly state: 'acceptable'; readonly proposalId: string; readonly change: StagedChange }
  /** Already spent. A proposal authorizes one change, once. */
  | { readonly state: 'already_accepted'; readonly proposalId: string; readonly resultingVersion: number }
  /**
   * ⭐ The Work moved, or the characters are gone or ambiguous.
   * ⛔ NOT an invitation to compute a fresh equivalent edit.
   */
  | { readonly state: 'no_longer_matches'; readonly proposalId: string; readonly reason: ProposalRefusal }
  | { readonly state: 'unknown' };

const slice = (s: string, from: number, to: number) =>
  [...s].slice(Math.max(0, from), to).join('');

export async function previewProposal(
  memberId: string, proposalId: string,
): Promise<ProposalPreview> {
  const proposal = await readProposal(memberId, proposalId);
  /* ⛔ Another member's proposal is indistinguishable from one that is not there. */
  if (!proposal) return { state: 'unknown' };

  if (proposal.acceptedAt !== null) {
    return { state: 'already_accepted', proposalId,
      resultingVersion: proposal.resultingVersion ?? 0 };
  }

  const no = (reason: ProposalRefusal): ProposalPreview =>
    ({ state: 'no_longer_matches', proposalId, reason });

  const d = await query<{ version: string }>(
    `SELECT version FROM manuscript_working_drafts
      WHERE id = $1 AND manuscript_id = $2 AND member_id = $3`,
    [proposal.draftId, proposal.workId, memberId]);
  if (d.rows.length === 0) return no('draft_not_found');
  if (Number(d.rows[0].version) !== proposal.baseVersion) return no('stale_base');

  const s = await query<{ text: string; position: number; heading: string | null }>(
    `SELECT s.text, s.position, ms.heading
       FROM manuscript_draft_sections s
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE s.id = $1 AND s.draft_id = $2`,
    [proposal.targetSectionId, proposal.draftId]);
  if (s.rows.length === 0) return no('section_not_found');

  const split = splitStoredSection(s.rows[0].text, s.rows[0].heading);
  if (!split) return no('section_not_projectable');

  /* ⭐⭐ THE SAME GUARD ACCEPTANCE USES. Not a second implementation of it. */
  const applied = applyExactlyOnce(
    split.body, proposal.expectedText, proposal.replacementText);
  if (!applied.ok) return no(applied.reason);

  /* The frame around the change, taken from the member's own body. */
  const at = [...split.body.slice(0, split.body.indexOf(proposal.expectedText))].length;
  const heading = s.rows[0].heading?.trim();
  return {
    state: 'acceptable',
    proposalId,
    change: {
      /* `position` is 0-indexed; the writer's §23 is position 22. */
      sectionLabel: heading
        ? `Section ${s.rows[0].position + 1} · “${heading}”`
        : `Section ${s.rows[0].position + 1}`,
      removed: proposal.expectedText,
      contextBefore: slice(split.body, at - CONTEXT, at),
      contextAfter: slice(split.body, at + [...proposal.expectedText].length,
        at + [...proposal.expectedText].length + CONTEXT),
      changeCount: 1,
    },
  };
}

/** ⭐ The ONLY state that may offer the gesture. Asked in one place. */
export const mayAccept = (p: ProposalPreview): boolean => p.state === 'acceptable';
