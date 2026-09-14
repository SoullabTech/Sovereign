/**
 * WS2-04B — fetching the resolved write state, and choosing what to mount.
 *
 * The mode gate is FAIL-SAFE. If authority cannot be established, nothing
 * mounts: guessing `continuous` would let the whole-manuscript writer touch a
 * draft that may already be section-authoritative, and one save from it would
 * overwrite every section at once.
 *
 * `no_draft` is NOT a failure. Worktable owns first-draft creation
 * (loadDraft → none → beginDraft), and the write-state GET simply sees that
 * moment earlier. It means "let the continuous engine begin it", never
 * "cannot write".
 */

import type { SectionAuthority } from './sectionAuthority';
/* ⛔ The param names come from the one identity contract — never inlined. */
import {
  CANVAS_PROPOSAL_CHAIN_PARAM,
  CANVAS_PROPOSAL_VERSION_PARAM,
} from '@/app/writers-studio/canvasIdentity';
/* ⭐⭐ CUTOVER-01A · THE ROOM'S TARGET IS NOW THE CHAIN PROJECTION.
   It carries `location`, which may be unavailable — and an unavailable
   location NEVER means the proposal work is unavailable. The mount survives;
   only the mark is withheld. */
import type { ProposalWorkTarget as ChainProposalWorkTarget } from '@/lib/manuscript/proposalChain/proposalWorkTarget';
import type { ProposalWorkTarget as LegacyProposalWorkTarget } from '@/lib/manuscript/revisionProposal/proposalWork';
import type { SpacedRange } from '@/lib/manuscript/sections/coordinateSpace';

/**
 * ⭐ The wire genuinely carries EITHER while the cutover is staged: `proposal=`
 * still resolves the legacy target, the new chain+version pair resolves the
 * projection. ⛔ Typing this as only the new shape would be a lie about the
 * response, and the room would narrow on a fact the server never promised.
 */
export type ProposalWorkTarget = LegacyProposalWorkTarget | ChainProposalWorkTarget;

/**
 * ⭐⭐ THE ONE PLACE THE ROOM ASKS "MAY I MARK THIS?".
 *
 * ⛔ `null` NEVER means the proposal work is gone — the mount is already
 * decided by then. It means only that this exact place cannot be truthfully
 * marked in the Work as it stands, so nothing is drawn and no "show me where"
 * is offered. The conversation continues either way.
 */
export function markableRange(t: ProposalWorkTarget): SpacedRange | null {
  if ('location' in t) return t.location.located ? t.location.range : null;
  return t.range;
}

export interface WriteStateRow {
  id: string;
  position: number;
  heading: string | null;
  chars: number;
}

export interface WriteStateSection {
  id: string;
  position: number;
  heading: string | null;
  body: string;
  /**
   * ⭐⭐ WHICH AUTHORITY OWNS THIS SECTION — resolved by the server, rendered
   * by the surface. Replaces `editable: boolean`, which could not tell
   * "this section cannot be edited" apart from "this section is being worked
   * as a proposal" (PW-5).
   */
  authority: SectionAuthority;
}

export type WriteState =
  | { mode: 'section_aware'; version: number; rows: WriteStateRow[]; sections: WriteStateSection[] }
  /**
   * ⭐ A GENUINE MOUNT BOUNDARY, not a visual variant of the editor: the
   * PERSISTENCE AUTHORITY over one section has changed. `target` is present
   * exactly when the mode is this one, so the room cannot enter proposal work
   * without knowing what is being worked.
   */
  | { mode: 'proposal_work'; version: number; rows: WriteStateRow[];
      sections: WriteStateSection[]; target: ProposalWorkTarget }
  | { mode: 'continuous'; version: number; content: string; notice: { title: string; body: string } }
  | { mode: 'continuous_unprovable'; version: number; content: string; notice: { title: string; body: string } }
  | { mode: 'no_draft' };

/** What the Canvas should mount. */
export type WriteMount =
  /** The quiet opening state. No writing engine yet. */
  | { mount: 'pending' }
  /** The existing continuous Worktable, unchanged. */
  | { mount: 'worktable'; notice?: { title: string; body: string } }
  /** The section-aware session, with resolved data already in hand. */
  | { mount: 'sections'; version: number; rows: WriteStateRow[]; sections: WriteStateSection[] }
  /** The same session, with one section's authority held by a proposal. */
  | { mount: 'proposal_work'; version: number; rows: WriteStateRow[];
      sections: WriteStateSection[]; target: ProposalWorkTarget }
  /** Authority unknown. Mount neither engine. */
  | { mount: 'unavailable' };

export function chooseMount(
  phase: 'loading' | 'ready' | 'error',
  state: WriteState | null,
): WriteMount {
  /* Nothing mounts while the answer is unknown. useSectionWriting takes its
     version and first active section from its arguments AT MOUNT and resets
     only on draftKey — so mounting it empty and filling it later would build a
     session against the loading state. The decision has to be a mount
     boundary, not a prop update. */
  if (phase === 'loading') return { mount: 'pending' };

  /* Fail closed. An unknown write mode is not an invitation to use the older,
     wider writer. */
  if (phase === 'error' || !state) return { mount: 'unavailable' };

  switch (state.mode) {
    case 'section_aware':
      return {
        mount: 'sections',
        version: state.version,
        rows: state.rows,
        sections: state.sections,
      };
    case 'proposal_work':
      return {
        mount: 'proposal_work',
        version: state.version,
        rows: state.rows,
        sections: state.sections,
        target: state.target,
      };
    case 'continuous':
      return { mount: 'worktable' };
    case 'continuous_unprovable':
      /* Worktable stays available; the outline says why navigation is not. */
      return { mount: 'worktable', notice: state.notice };
    case 'no_draft':
      /* The existing creation path, preserved. */
      return { mount: 'worktable' };
  }
}

/** GET the resolved state. A 404 is `no_draft`, not an error. */
export async function fetchWriteState(
  manuscriptId: string,
  fetcher: (url: string) => Promise<Response>,
  /**
   * ⛔ PW-2 · SELECTORS ONLY. The server resolves everything they imply.
   * ⭐ CUTOVER-01A: chain + EXACT version, and BOTH are required — a chain
   * alone would let the room display whatever is newest and call it the thing
   * the writer was sent to.
   */
  focus?: { chainId: string; versionId: string } | null,
): Promise<{ phase: 'ready' | 'error'; state: WriteState | null }> {
  try {
    const q = focus
      ? `?${CANVAS_PROPOSAL_CHAIN_PARAM}=${encodeURIComponent(focus.chainId)}`
        + `&${CANVAS_PROPOSAL_VERSION_PARAM}=${encodeURIComponent(focus.versionId)}`
      : '';
    const res = await fetcher(
      `/api/sovereign/manuscripts/${manuscriptId}/write-state${q}`);
    if (res.status === 404) return { phase: 'ready', state: { mode: 'no_draft' } };
    if (!res.ok) return { phase: 'error', state: null };
    return { phase: 'ready', state: (await res.json()) as WriteState };
  } catch {
    return { phase: 'error', state: null };
  }
}

/**
 * ⭐⭐ THE SECTION ENGINE'S DATA, FOR EITHER MOUNT THAT USES IT.
 *
 * `sections` and `proposal_work` are DIFFERENT MOUNTS — the founder's ruling,
 * and correct: the persistence authority over a section differs between them,
 * which is a boundary and not a visual variant. But they run the same engine,
 * and the room reads that engine's data at six places.
 *
 * ⛔ WITHOUT THIS, EACH OF THOSE SIX BECOMES `=== 'sections' || === 'proposal_work'`
 * and the seventh, added later, quietly becomes `=== 'sections'` alone —
 * the drift this codebase keeps paying for. One reader, one definition.
 *
 * `target` is null for the ordinary mount and present for the other, so a
 * caller cannot read the engine without also seeing whether a proposal holds
 * one of its sections.
 */
export function sectionEngine(m: WriteMount): {
  version: number;
  rows: WriteStateRow[];
  sections: WriteStateSection[];
  target: ProposalWorkTarget | null;
} | null {
  if (m.mount === 'sections') {
    return { version: m.version, rows: m.rows, sections: m.sections, target: null };
  }
  if (m.mount === 'proposal_work') {
    return { version: m.version, rows: m.rows, sections: m.sections, target: m.target };
  }
  return null;
}
