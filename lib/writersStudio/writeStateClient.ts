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
  CANVAS_PROPOSAL_PARAM,
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
/* ⭐⭐ W5-Z0 · the identity of the editorial RELATIONSHIP, resolved by the
   server and distinct from the candidate formulation `target` carries. */
import type { EditorialWorkspaceSubject } from './editorialWorkspace';
import type { RequestedChainSubject } from '@/app/writers-studio/canvasIdentity';

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

/**
 * ⭐⭐ WHERE THE ROOM MAY TAKE THE WRITER — the orientation law, in ONE place.
 *
 * ⚠️ THIS FUNCTION EXISTS BECAUSE A MUTANT SURVIVED. The first 01A.2 witness
 * proved the rule against its OWN reimplementation of it, so a Canvas that
 * oriented on an unlocated target — fabricating a range to move by — passed
 * every obligation. A witness holding a private copy of the law tests the copy.
 *
 * ⛔ GATED ON A MARKABLE RANGE. This is the 01A law applied to MOVEMENT rather
 * than to marking: no exact place, no mark, no "show me where" — and no arrival
 * either. Taking a writer to a section we cannot point inside is motion without
 * evidence, and it is worse than staying put because it looks like knowledge.
 *
 * ⭐ It reads whichever target the server resolved — legacy or chain/version —
 * so the room can never take its bearings from a second proposal object.
 */
export function roomOrientation(
  target: ProposalWorkTarget | null | undefined,
): { readonly sectionId: string; readonly range: SpacedRange } | null {
  if (!target) return null;
  const range = markableRange(target);
  return range ? { sectionId: target.sectionId, range } : null;
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

/**
 * ⭐⭐ W5-Z0 · THE TWO FACTS THE RESPONSE NOW CARRIES SEPARATELY.
 *
 *     editorialSubject   the identity of the editorial RELATIONSHIP
 *     target             the exact candidate FORMULATION + its projection
 *
 * ⛔ THE ABSENCE OF `target` IS NOT THE ABSENCE OF A RELATIONSHIP. A chain that
 * holds an observation and no candidate wording has a subject and no target,
 * and the mode stays `section_aware` because nothing may be suspended,
 * previewed, compared or authorized where no formulation exists.
 *
 * ⭐ Optional on BOTH modes on purpose: the legacy `proposal=` path resolves a
 * target and NO subject (it names a different object, retired at W7), and the
 * zero-version path resolves a subject and NO target. Neither implies the other.
 */
export type WriteState =
  | { mode: 'section_aware'; version: number; rows: WriteStateRow[];
      sections: WriteStateSection[]; editorialSubject?: EditorialWorkspaceSubject }
  /**
   * ⭐ A GENUINE MOUNT BOUNDARY, not a visual variant of the editor. `target`
   * is present exactly when the mode is this one, so the room cannot enter
   * proposal work without knowing what is being worked.
   *
   * ⚠️ CORRECTED BY FOUNDER RULING, 2026-09-14. This said the mode meant *the
   * PERSISTENCE AUTHORITY over one section has changed*. That is no longer
   * always true, and leaving the sentence would have made the type description
   * assert a fact the server had stopped guaranteeing.
   *
   *     mode: 'proposal_work'   proposal-work context is MOUNTED
   *     SectionAuthority        whether persistence authority actually moved
   *
   * They coincide when the location is located. When it is unavailable the
   * conversation is still mounted and every section keeps the authority it had
   * — because a system that failed to establish the place has no basis to
   * withhold the writer's own Work there. ⛔ Two facts, read from two fields;
   * never infer the second from the first.
   */
  | { mode: 'proposal_work'; version: number; rows: WriteStateRow[];
      sections: WriteStateSection[]; target: ProposalWorkTarget;
      editorialSubject?: EditorialWorkspaceSubject }
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

/**
 * ⭐⭐ CUTOVER-01A.2 · ONE TAGGED SELECTOR, TOTAL AND EXCLUSIVE.
 *
 * ⚠️ FOUNDER REVIEW OF 6fc919f7d, DEFECT. 01A's own standing said *`proposal=`
 * keeps its own resolution untouched; the new pair wins wherever both appear.*
 * The first half stopped being true the moment this function took only
 * `{ chainId, versionId }`: a legacy `?proposal=<id>` URL still loaded the old
 * panel, but every write-state read then carried NO selector at all, so the
 * legacy path silently lost its `proposal_work` mount and authority while its
 * routes and UI remained live.
 *
 *     keeping an old route PRESENT is not the same as
 *     keeping its semantics REACHABLE
 *
 * ⛔ Parallel nullable arguments are how that happened — two optional
 * parameters can both be absent, both be present, or disagree, and the type
 * says nothing. A tagged union cannot be half-supplied, and there is exactly
 * one query form per kind. ⛔ No translation, no adapter, and the two forms are
 * NEVER sent together.
 */
export type ProposalSelector =
  | { readonly kind: 'chain_version'; readonly chainId: string; readonly versionId: string }
  /**
   * ⭐⭐ W5-Z0 · THE CHAIN WITHOUT A FOCUS. ⛔ A THIRD KIND, not a nullable
   * `versionId` on the first — a nullable field would let every consumer of
   * `chain_version` silently start handling a case it was never written for,
   * which is how the head default would creep back in.
   */
  | { readonly kind: 'chain_only'; readonly chainId: string }
  | { readonly kind: 'legacy'; readonly proposalId: string };

/**
 * ⭐ Chain+version wins wherever both appear — the 01A precedence rule, in the
 * one place that decides it rather than at each call site.
 */
export function proposalSelector(
  requested: RequestedChainSubject | null,
  legacyProposalId: string | null,
): ProposalSelector | null {
  if (requested) {
    return requested.versionId !== null
      ? { kind: 'chain_version', chainId: requested.chainId, versionId: requested.versionId }
      /* ⛔ The server decides whether a chain-only ask has a lawful subject —
         see `readChainOnlySubject`. The client only forwards what was named. */
      : { kind: 'chain_only', chainId: requested.chainId };
  }
  if (legacyProposalId) return { kind: 'legacy', proposalId: legacyProposalId };
  return null;
}

/**
 * ⭐⭐ WHICH LEGACY PANEL THIS VISIT MAY MOUNT — and usually none.
 *
 * ⚠️ FOUNDER REVIEW OF 45cb0ec33, AND THE MOST SERIOUS OF THE THREE. 01A.2
 * chose precedence once for `fetchWriteState`, and that was mistaken for
 * choosing it once for the ROOM. With both identities in the URL the Canvas
 * still read the raw legacy parameter for its preview hook, so:
 *
 *     Work · mount · orientation   →  chain C, version V
 *     decision panel               →  legacy proposal OLD
 *
 * ⛔ That is not a visual disagreement. The old panel carries its own Accept
 * Changes against `/revision-proposal/OLD/accept`, so the writer could be shown
 * one proposal in the manuscript while the decision surface was able to act on
 * a different one.
 *
 *     Choosing one proposal identity for the Work is insufficient if another
 *     proposal identity still owns the decision panel.
 *     ⭐ ONE VISIT GETS ONE PROPOSAL SUBJECT, EVERYWHERE.
 *
 * ⛔ This removes nothing: a `legacy` selector still yields its id, so the
 * staged old path stays fully reachable on its own URL. It only stops the old
 * panel from riding along beside a chain/version visit.
 */
export function legacyProposalFor(selector: ProposalSelector | null): string | null {
  return selector && selector.kind === 'legacy' ? selector.proposalId : null;
}

/** GET the resolved state. A 404 is `no_draft`, not an error. */
export async function fetchWriteState(
  manuscriptId: string,
  fetcher: (url: string) => Promise<Response>,
  /** ⛔ PW-2 · A SELECTOR ONLY. The server resolves everything it implies. */
  selector?: ProposalSelector | null,
): Promise<{ phase: 'ready' | 'error'; state: WriteState | null }> {
  try {
    /* ⛔ EXACTLY ONE FORM. A request carrying both would ask the server to
       choose, and precedence is the client's own rule to apply once. */
    const q = !selector ? ''
      : selector.kind === 'chain_version'
        ? `?${CANVAS_PROPOSAL_CHAIN_PARAM}=${encodeURIComponent(selector.chainId)}`
          + `&${CANVAS_PROPOSAL_VERSION_PARAM}=${encodeURIComponent(selector.versionId)}`
      : selector.kind === 'chain_only'
        /* ⛔ No `proposalVersion` at all — not an empty one. An empty parameter
           is a named-but-blank focus, and the server would have to decide what
           blank means. Absence is the only honest spelling of "none named". */
        ? `?${CANVAS_PROPOSAL_CHAIN_PARAM}=${encodeURIComponent(selector.chainId)}`
        : `?${CANVAS_PROPOSAL_PARAM}=${encodeURIComponent(selector.proposalId)}`;
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

/**
 * ⭐⭐ W5-Z0 · THE ONE QUESTION THE ROOM ASKS ABOUT EDITORIAL IDENTITY.
 *
 *     What editorial subject did the server resolve for this Work?
 *
 * ⛔ NOT `do I have a proposal target, or do I happen to hold a chain
 * parameter?` — two questions with two answers is how a second mounting rule
 * gets bolted on beside the first, and the founder ruled against exactly that
 * (2026-09-14). There is one seam, it reads the server's answer, and it is
 * reached from the write STATE rather than from the mount: which writing engine
 * runs and whether an editorial relationship exists are independent facts.
 *
 * ⛔ It derives nothing. A response with no `editorialSubject` yields null even
 * when a target is present — that is the legacy path, and it must keep its own
 * panel rather than acquire a chain identity it does not have.
 */
export function editorialSubjectOf(
  state: WriteState | null | undefined,
): EditorialWorkspaceSubject | null {
  if (!state) return null;
  return 'editorialSubject' in state ? state.editorialSubject ?? null : null;
}
