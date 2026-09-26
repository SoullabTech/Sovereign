'use client';
/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1B — THE LIVE WRITE HOST.
 *
 * The first real flagship Write runtime, at /writers-studio/rebuild.
 *
 * AUTHORITY SPLIT, PRESERVED EXACTLY
 *   FLAGSHIP (StudioShell · WriteFrame · flagship.css)  composition · geometry
 *   THIS HOST                                            manuscript identity ·
 *                                                        Work resolution · focus/place ·
 *                                                        held passage · truthful status
 *   RebuildWritingBoundary → useSectionWriting →         the ONE authorship authority:
 *   makeSectionSave                                      staging · save queue · version
 *                                                        concurrency · stale_base · capture
 *
 * ⛔ Nothing of the lower layer is re-created here. The manuscript surface is
 * `RebuildAuthoredBody`, the same component the legacy host mounts, with the
 * same callbacks bound to the same `SectionWriting` session.
 *
 * WHAT THIS HOST DELIBERATELY DOES NOT EXPOSE (C1B, as amended by R1-1C)
 *   Aa · voice note · Comment · More · facet · Develop · Pure Canvas · chapter
 *   review. Each keeps its substrate intact behind its own routes; none is
 *   drawn here without a lawful action behind it. Navigation names Write and
 *   Review (R1-1C); the current destination is non-interactive orientation.
 *
 * C1C1 — DISCUSS-ONLY CONTEXTUAL MAIA
 *   When the server says the editorial layer is enabled (a boolean handed down
 *   by page.tsx, presentation state only) and a passage is HELD, the host
 *   exposes ONE affordance, `Ask MAIA`, which opens a one-shot composer. Submit
 *   is the commissioning act: the member's own text → `discussAct.ts` (posture
 *   at the gesture · settle the existing writing session · open the passage
 *   relationship at the exact held range · one discourse turn under the
 *   withholding scope). The reply is rendered by the pure `DiscussLayer`.
 *   ⛔ One turn per gesture. ⛔ No proposal. ⛔ No second composer. ⛔ Release
 *   hides; it never claims to cancel. ⛔ A late result attaches only to the
 *   gesture that commissioned it. ⛔ Flag off: nothing of this is drawn and no
 *   editorial route is ever called.
 *
 * R1-1B — LIVE SINGLE-READING READ-ONLY REVIEW
 *   `?reading=<id>` is the ONLY way Review is requested. Absent → the Write
 *   runtime exactly as before, and NO reading GET is made. Present → the ledger
 *   is read first (member-owned), then the exact reading, then the R1-0 mapper;
 *   only `ready` mounts the R1-1A ReviewPresentation with the read-only
 *   capability set. Anything else is one calm unavailable state. ⛔ No newest,
 *   no first, no aggregation, no commission, no cognition, no write. A late
 *   result attaches only to the exact selection that commissioned it.
 *
 * R1-1C — REVIEW NAVIGATION SUCCESSION (successor to the frozen C1B-L6 regime)
 *   Write ↕ Review are visible flagship destinations in the one shell. The URL
 *   is the single state authority: `reading=<id>` → Review of exactly that
 *   reading through the unchanged R1-1B runtime. Choosing Review with no
 *   reading opens the READING CHOOSER — the member-owned ledger's own metadata,
 *   in the ledger's own order, nothing pre-chosen — and the member's explicit
 *   choice becomes `reading=<id>`. Write from Review removes only `reading`.
 *   ⛔ No reading is ever inferred. ⛔ Ordinary Write fetches nothing until the
 *   member invokes Review. ⛔ A choice is a location, never a mount. ⛔ No
 *   legacy bridge, no second shell, no second state store.
 *
 * TRUTHFUL STATUS
 *   Derived from the writing session's own per-section statuses. The fixture
 *   phrase of the controlled witness never reaches this file.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { useLivingWorks } from '../useLivingWorks';
import { useMemberIdentity } from '../useMemberIdentity';
import { currentWork, resolveWorkContext } from '../workContext';
import { chapterSpanFor, type RebuildSection } from '@/lib/writersStudio/rebuild/model';
import type { SectionWriting } from '@/lib/writersStudio/useSectionWriting';
import type { SectionStatus } from '@/lib/writersStudio/sectionSaveQueue';
import { locationForSection, replacePlaceAddress, resolveInitialSection, SECTION_PARAM } from '@/lib/writersStudio/placeInWork';
import { canvasWithRelationship, canvasWithoutRelationship, relationshipIdFrom } from '../canvasIdentity';
import { toWriteFoot, toWriteHeading, toWritePlace } from '@/lib/writersStudio/studio/adapters/writeView';
import { liveManuscriptView } from '@/lib/writersStudio/studio/adapters/liveV10Manuscript';
import type { StudioState } from '@/lib/writersStudio/studio/machine';
import { readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';
import { openBoundEditorialPassage, sendBoundEditorialTurn } from '@/lib/writersStudio/rebuild/editorialCollaboration';
import { StudioShell, type MemberIdentity } from '../flagship/StudioChrome';
import {
  WriteRoom, type MaiaCopy, type MaiaTab, type VersionEntry,
  type WritePresentationPhase, type WriteRoomPorts,
} from '../flagship/WriteRoom';
import RebuildWritingBoundary from './RebuildWritingBoundary';
import RebuildAuthoredBody, { type RebuildAuthoredBodyProps } from './RebuildAuthoredBody';
import { DiscussLayer, discussHighlight, type DiscussState } from './DiscussLayer';
import { commissionDiscuss, createInFlightGuard, discussAfterHold, resultAttaches, DISCUSS_COPY, type InFlightGuard } from './discussAct';
import type { LensId } from '../flagship/DevelopReview';
import type { Facet } from '../flagship/flagshipTokens';
import { LiveReviewView } from './LiveReviewView';
import { attachReview, hostFactsFrom, loadSelectedReading, selectedReadingId, type LiveReviewState, type ReviewPorts } from './liveReview';
import { attachChoices, chooseReading, loadReadingChoices, navActionsFor, shouldLoadChoices, studioMode, type ChooserState, type StudioNav } from './reviewNavigation';
import { ReviewChooser } from './ReviewChooser';
import { navigationFor } from './reviewReturn';
import type { ReviewNavigation } from '../flagship/DevelopReview';
import { commissionReviewDiscuss, REVIEW_DISCUSS_COPY, type ReviewDiscussionState } from '@/lib/writersStudio/rebuild/reviewDiscuss';
import { useExactV10Editorial } from './useExactV10Editorial';
import { useExactV10Relationship } from './useExactV10Relationship';
import {
  ExactV10CarryControls, ExactV10EditorialComposer,
  ExactV10FacetMenu, ExactV10RelationshipControls,
} from './ExactV10LiveControls';

export interface ContextReady {
  state: 'section_aware';
  manuscriptId: string;
  title: string | null;
  version: number;
  updatedAt: string;
  sections: RebuildSection[];
}
type ContextPayload = ContextReady | { state: 'no_draft' | 'continuous'; manuscriptId: string; title: string | null };
type Phase = 'loading' | 'ready' | 'unauthorized' | 'error';

export interface HeldPassageAt {
  readonly sectionId: string;
  readonly start: number;
  readonly end: number;
  readonly text: string;
}

/**
 * ⭐ The one status line, from the substrate and nothing else.
 * Precedence mirrors the proven host: conflict > error > dirty > saving.
 * All clean means the server-acknowledged draft version IS the text on screen.
 */
export function truthfulStatus(statuses: readonly SectionStatus[], version: number): string {
  if (statuses.includes('conflict')) return 'Needs attention';
  if (statuses.includes('error')) return 'Save unavailable';
  if (statuses.includes('dirty')) return 'Unsaved';
  if (statuses.includes('saving')) return 'Saving…';
  return `Saved · v${version}`;
}

/**
 * ⭐ The authorship seam, as data. Every callback binds the SAME writing
 * session the boundary created; the held address is the exact code-point
 * range `RebuildAuthoredBody` measured. Exported so the law can call it.
 */
export function authoredBodyProps(
  writing: Pick<SectionWriting, 'bodyOf' | 'editSection' | 'captureForUnmount'>,
  section: RebuildSection,
  held: { start: number; end: number } | null,
  hooks: { onFocus: (sectionId: string) => void; onHold: (sectionId: string, start: number, end: number, text: string) => void },
): RebuildAuthoredBodyProps {
  const id = section.draftSectionId;
  return {
    section,
    body: writing.bodyOf(id),
    held,
    onEdit: (body) => writing.editSection(id, body),
    onEditingBegan: () => hooks.onFocus(id),
    onFocusPlace: () => hooks.onFocus(id),
    onCaptureBeforeBlur: (body) => { writing.captureForUnmount(id, body); },
    onSelectPassage: (start, end, text) => hooks.onHold(id, start, end, text),
  };
}

export interface LiveV10WriteBinding {
  readonly phase: WritePresentationPhase;
  readonly copy: MaiaCopy;
  readonly facet?: Facet;
  readonly tab?: MaiaTab;
  readonly history?: readonly VersionEntry[];
  readonly historyOpen?: boolean;
  readonly ports?: WriteRoomPorts;
}

export interface FlagshipWriteViewProps {
  readonly context: ContextReady;
  /** The Work's own name, else the manuscript's own title, else null. ⛔ Never invented. */
  readonly workTitle: string | null;
  /** The member's own word for what the Work is becoming, or null. */
  readonly workForm: string | null;
  readonly member?: MemberIdentity;
  readonly focusId: string | null;
  readonly held: HeldPassageAt | null;
  readonly onFocus: (sectionId: string) => void;
  readonly onHold: (sectionId: string, start: number, end: number, text: string) => void;
  readonly epoch?: number;
  /** C1C1 — server-owned presentation state. ⛔ Never inferred client-side. Default false. */
  readonly editorialEnabled?: boolean;
  readonly discuss?: DiscussState | null;
  readonly onAskMaia?: () => void;
  readonly onSubmitAsk?: (text: string) => void;
  readonly onRelease?: () => void;
  /** C1C1 — the host keeps a ref to the ONE session the boundary created, for settlement. ⛔ Never a second session. */
  readonly onWriting?: (writing: SectionWriting) => void;
  /** Full Editorial/A2 state projected into exact V10 presentation. */
  readonly v10Write?: LiveV10WriteBinding;
  /** R1-1B — the live Review state for an explicitly selected reading. `idle`/absent → ordinary Write. */
  readonly review?: LiveReviewState;
  readonly reviewLens?: LensId | 'all';
  readonly onReviewLens?: (lens: LensId | 'all') => void;
  /** R1-1C — the reading chooser's state (`closed` or absent → not the selection state). */
  readonly chooser?: ChooserState;
  /** R1-1C — the mode the URL (and the transient chooser flag) resolve to, and the lawful action behind each destination. */
  readonly studioNav?: StudioNav;
  /** R1-2 — the host's return navigation for a mounted reading: exact durable section → location. */
  readonly reviewNavigation?: ReviewNavigation;
  /** R2-2 — one history-empty Review Discuss act bound to one exact finding. */
  readonly reviewDiscussion?: ReviewDiscussionState | null;
  readonly onReviewDiscuss?: (findingId: string) => void;
  readonly onSubmitReviewDiscuss?: (findingId: string, text: string) => void;
  readonly onCloseReviewDiscuss?: () => void;
}

const noAction = () => {};

/** The composition. Renders under react-dom/server; the laws render it directly. */
export function FlagshipWriteView({
  context, workTitle, workForm, member, focusId, held, onFocus, onHold, epoch = 0,
  editorialEnabled = false, discuss = null, onAskMaia = noAction, onSubmitAsk = noAction, onRelease = noAction, onWriting, v10Write,
  review, reviewLens = 'all', onReviewLens = noAction, chooser, studioNav, reviewNavigation,
  reviewDiscussion = null, onReviewDiscuss, onSubmitReviewDiscuss, onCloseReviewDiscuss,
}: FlagshipWriteViewProps) {
  const focus = context.sections.find((s) => s.draftSectionId === focusId) ?? null;
  const span = focusId ? chapterSpanFor(context.sections, focusId) : null;
  const sections = span?.sections ?? (focus ? [focus] : []);
  const project = workTitle ? (workForm ? { workTitle, workKind: workForm } : { workTitle }) : undefined;
  /* R1-1C — the mode is what the URL resolved to (an explicit reading outranks the chooser flag);
     absent a host-supplied resolution, it is derived from the same two facts and nothing else. */
  const reviewing = !!review && review.kind !== 'idle';
  const choosing = !reviewing && !!chooser && chooser.kind !== 'closed' && !!studioNav?.choose;
  const mode = studioNav?.mode ?? (reviewing ? 'review' : choosing ? 'review-choose' : 'write');
  const developQuery = new URLSearchParams({ m: context.manuscriptId });
  if (focusId) developQuery.set('s', focusId);
  const developHref = `/writers-studio/develop?${developQuery.toString()}`;
  const nav = {
    ...(studioNav?.actions ?? {}),
    develop: studioNav?.actions.develop ?? { kind: 'link' as const, href: developHref },
  };
  const current = mode === 'write' ? 'write' : 'review';

  /* R1-1B — an explicit selected reading replaces the Write frame with the live read-only Review.
     R1-1C — the shell names Write and Review; Review is current, Write is a link that removes only `reading`. */
  if (reviewing) {
    return (
      <div className="fsw-viewport">
        <StudioShell current={current} destinations={['write', 'develop', 'review']} affordance="orientation" nav={nav} project={project} member={member}>
          <LiveReviewView state={review} lens={reviewLens} onLens={onReviewLens} navigation={reviewNavigation}
            discussion={reviewDiscussion} onDiscussFinding={onReviewDiscuss}
            onSubmitDiscuss={onSubmitReviewDiscuss} onCloseDiscuss={onCloseReviewDiscuss} />
        </StudioShell>
      </div>
    );
  }
  /* R1-1C — the selection state: the ledger's own metadata, nothing chosen. Only reachable while no reading is selected. */
  if (choosing && chooser && studioNav?.choose) {
    return (
      <div className="fsw-viewport">
        <StudioShell current={current} destinations={['write', 'develop', 'review']} affordance="orientation" nav={nav} project={project} member={member}>
          <ReviewChooser state={chooser} hrefFor={studioNav.choose.hrefFor} onChoose={studioNav.choose.onChoose} />
        </StudioShell>
      </div>
    );
  }

  return (
    <div className="fsw-viewport">
      <StudioShell current={current} destinations={['write', 'develop', 'review']} affordance="orientation" nav={nav} project={project} member={member}>
        <RebuildWritingBoundary
          key={`${context.manuscriptId}:${epoch}`}
          manuscriptId={context.manuscriptId}
          version={context.version}
          sections={context.sections}
          initialSectionId={focusId}
          epoch={epoch}
        >
          {(writing) => {
            onWriting?.(writing);
            const bodies = sections.map((section) => writing.bodyOf(section.draftSectionId));
            const statuses = sections.map((section) => writing.statusOf(section.draftSectionId));
            const place = toWritePlace({ workTitle: workTitle ?? '', section: focus, span });
            const heading = toWriteHeading(span);
            const foot = toWriteFoot({ span, bodies });
            const bodyMap = new Map(sections.map((section) => [
              section.draftSectionId, writing.bodyOf(section.draftSectionId),
            ] as const));
            const view = liveManuscriptView({
              workTitle, manuscriptTitle: context.title, focus, span, bodies: bodyMap, held,
            });

            /* The old Discuss controller remains a lawful fallback until the full
               Editorial controller is bound. It now projects into V10 rather than
               rendering a second visual system. */
            const fallbackPhase: WritePresentationPhase = discuss ? { name: 'conversation' } : { name: 'writing' };
            const fallbackCopy: MaiaCopy = discuss?.kind === 'answered'
              ? { memberAsk: discuss.ask, opening: discuss.reply }
              : discuss?.kind === 'pending'
                ? { memberAsk: discuss.ask, opening: DISCUSS_COPY.waiting }
                : discuss?.kind === 'refused'
                  ? { memberAsk: discuss.ask, opening: discuss.copy }
                  : { opening: '' };
            const presentation: LiveV10WriteBinding = v10Write ?? {
              phase: fallbackPhase, copy: fallbackCopy, tab: 'Discuss',
            };

            const state: StudioState = {
              phase: { name: 'writing' },
              place: { sectionId: focusId ?? '', anchor: null },
              overlay: presentation.historyOpen ? 'history' : null,
              version: writing.currentRevisionId(),
              history: [],
              coverage: 0,
            };
            const selectionHere = held && focus && held.sectionId === focus.draftSectionId
              ? { start: held.start, end: held.end } : null;
            const answeredAt = !v10Write && editorialEnabled
              ? discussHighlight(discuss, writing.bodyOf) : undefined;
            const visuallyHeld = v10Write
              ? selectionHere
              : answeredAt && focus && answeredAt.sectionId === focus.draftSectionId
                ? answeredAt.range
                : selectionHere;
            const manuscript = focus ? (
              <div className="fs-p" data-held={visuallyHeld ? 'true' : 'false'}
                data-flagship-section={focus.draftSectionId}
                data-held-passage-address={visuallyHeld ? `${visuallyHeld.start}:${visuallyHeld.end}` : undefined}>
                <RebuildAuthoredBody
                  {...authoredBodyProps(writing, focus, null, { onFocus, onHold })}
                  inheritTypography
                />
              </div>
            ) : null;

            const fallbackComposer = discuss?.kind === 'composing' ? (
              <form className="fs-mcompose" onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                onSubmitAsk(String(data.get('ask') ?? ''));
              }}>
                <textarea name="ask" className="fs-mtext" rows={3}
                  aria-label="Your question about this passage" placeholder="Ask MAIA about this passage…" />
                <button type="submit" className="fs-btn fs-btn--key">Ask</button>
              </form>
            ) : null;
            const fallbackMessage = discuss?.kind === 'pending'
              ? { text: DISCUSS_COPY.waiting, speaker: 'studio' as const }
              : discuss?.kind === 'refused'
                ? { text: discuss.copy, speaker: 'studio' as const }
                : discuss?.kind === 'answered'
                  ? { text: discuss.reply, speaker: 'maia' as const }
                  : null;
            const staleTrail = !v10Write && discuss?.kind === 'answered' && answeredAt?.range === null
              ? <p className="fs-say" data-notice="true" data-stale-context="true">{DISCUSS_COPY.stale}</p>
              : undefined;
            const askMaia = editorialEnabled && held && !discuss
              ? <button type="button" className="fs-btn fs-btn--key"
                  data-event="ASK_MAIA" onClick={onAskMaia}>Ask MAIA</button>
              : null;
            const suppliedPorts = presentation.ports ?? {};
            const ports: WriteRoomPorts = {
              ...suppliedPorts,
              presentationPhase: presentation.phase,
              place: suppliedPorts.place ?? place,
              heading: suppliedPorts.heading ?? heading,
              foot: suppliedPorts.foot ?? { ...foot, actions: suppliedPorts.footActions },
              status: suppliedPorts.status ?? truthfulStatus(statuses, writing.currentRevisionId()),
              manuscript,
              actions: Object.prototype.hasOwnProperty.call(suppliedPorts, 'actions')
                ? suppliedPorts.actions : askMaia,
              ...(v10Write ? {} : {
                maiaTabs: ['Discuss'] as const,
                maiaComposer: fallbackComposer,
                maiaMessage: fallbackMessage,
                maiaTrail: staleTrail,
                onReleaseMaia: onRelease,
              }),
            };

            return (
              <WriteRoom
                state={state}
                view={view}
                copy={presentation.copy}
                tab={presentation.tab ?? 'Discuss'}
                history={presentation.history}
                facet={presentation.facet ?? 'guided'}
                ports={ports}
              />
            );
          }}
        </RebuildWritingBoundary>
      </StudioShell>
    </div>
  );
}

export interface FlagshipWriteHostProps {
  /** C1C1 — read ONCE on the server by page.tsx. Presentation state, never authorization. */
  readonly editorialEnabled?: boolean;
  /** R2-2 — independent Review Discuss presentation flag. Server route re-checks it. */
  readonly reviewDiscussEnabled?: boolean;
}

/** R1-1B — the two existing member-scoped GET seams, and nothing else. ⛔ No POST exists here. */
const reviewPorts: ReviewPorts = {
  listReadings: async (manuscriptId) => {
    const r = await apiFetch(`/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/readings`, { method: 'GET' });
    return { ok: r.ok, status: r.status, json: await r.json().catch(() => null) };
  },
  getReading: async (manuscriptId, readingId) => {
    const r = await apiFetch(`/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/readings/${encodeURIComponent(readingId)}`, { method: 'GET' });
    return { ok: r.ok, status: r.status, json: await r.json().catch(() => null) };
  },
};

export default function FlagshipWriteHost({ editorialEnabled = false, reviewDiscussEnabled = false }: FlagshipWriteHostProps = {}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const requested = params?.get('m') ?? null;
  const requestedSection = params?.get(SECTION_PARAM) ?? null;
  /* R1-1B — explicit selection only; empty or absent means Write. */
  const requestedReading = selectedReadingId(params);
  const [phase, setPhase] = useState<Phase>('loading');
  const [context, setContext] = useState<ContextReady | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [held, setHeld] = useState<HeldPassageAt | null>(null);
  const { phase: worksPhase, works } = useLivingWorks();
  const memberIdentity = useMemberIdentity();
  const shellMember = useMemo<MemberIdentity | undefined>(() => {
    if (memberIdentity.phase !== 'ready' || !memberIdentity.name?.trim()) return undefined;
    const name = memberIdentity.name.trim();
    const initials = name.split(/\s+/).filter(Boolean).slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '').join('');
    return { name, initials: initials || name.slice(0, 2).toUpperCase() };
  }, [memberIdentity]);
  const workContext = resolveWorkContext(worksPhase, works, context?.manuscriptId ?? null);
  const work = currentWork(workContext);
  const requestedRelationship = params ? relationshipIdFrom(params) : null;
  const validSectionIds = useMemo(
    () => context?.sections.map((section) => section.draftSectionId) ?? [],
    [context?.sections],
  );
  const [receiverThreadId, setReceiverThreadId] = useState<string | null>(null);
  const [writingEpoch, setWritingEpoch] = useState(0);
  /* C1C1 — ephemeral Discuss state remains only as a temporary fallback controller. */
  const [discuss, setDiscuss] = useState<DiscussState | null>(null);
  const discussGen = useRef(0);
  const guard = useRef<InFlightGuard | null>(null);
  const writingRef = useRef<SectionWriting | null>(null);
  const focusRef = useRef<string | null>(null);
  focusRef.current = focusId;
  /* R1-3 — the passage held NOW, for exact late-result identity. */
  const heldRef = useRef<HeldPassageAt | null>(null);
  heldRef.current = held;
  const discussRef = useRef<DiscussState | null>(null);
  discussRef.current = discuss;
  /* R1-1B — live Review state, its generation, and the lens the member is filtering by. */
  const [review, setReview] = useState<LiveReviewState>({ kind: 'idle' });
  const [reviewLens, setReviewLens] = useState<LensId | 'all'>('all');
  const reviewGen = useRef(0);
  const [reviewDiscussion, setReviewDiscussion] = useState<ReviewDiscussionState | null>(null);
  const reviewDiscussGen = useRef(0);
  const requestedReadingRef = useRef<string | null>(null);
  requestedReadingRef.current = requestedReading;
  const workTitleRef = useRef<string | null>(null);
  const workFormRef = useRef<string | null>(null);
  /* R1-1C — the transient selection flag. ⛔ Not a mode store: `studioMode` resolves the URL first. */
  const [chooserOpen, setChooserOpen] = useState(false);
  const [chooser, setChooser] = useState<ChooserState>({ kind: 'closed' });
  const chooserGen = useRef(0);
  const chooserOpenRef = useRef(false);
  chooserOpenRef.current = chooserOpen;

  const load = useCallback(async () => {
    setPhase('loading'); setMessage(null);
    try {
      let manuscriptId = requested;
      if (!manuscriptId) {
        const list = await apiFetch('/api/sovereign/manuscripts', { method: 'GET' });
        if (list.status === 401) { setPhase('unauthorized'); return; }
        if (!list.ok) throw new Error('manuscript list');
        const body = await list.json();
        const manuscripts = Array.isArray(body?.manuscripts) ? body.manuscripts : [];
        if (manuscripts.length !== 1) { setPhase('error'); setMessage('Open the Studio with a specific manuscript.'); return; }
        manuscriptId = manuscripts[0].id;
      }
      if (!manuscriptId) throw new Error('manuscript identity');
      const res = await apiFetch(`/api/writers-studio/rebuild/context?manuscriptId=${encodeURIComponent(manuscriptId)}`);
      if (res.status === 401) { setPhase('unauthorized'); return; }
      if (!res.ok) throw new Error('context');
      const body = await res.json() as ContextPayload;
      if (body.state !== 'section_aware') {
        setPhase('error');
        setMessage('This manuscript is not section-addressable yet. The Studio will not guess at its structure.');
        return;
      }
      setContext(body);
      const resolved = resolveInitialSection(requestedSection, body.sections.map((s) => s.draftSectionId));
      setFocusId(resolved.sectionId);
      if (resolved.rewriteLocation && typeof window !== 'undefined') {
        replacePlaceAddress(locationForSection(window.location.pathname, window.location.search, resolved.sectionId));
      }
      setPhase('ready');
    } catch {
      setPhase('error');
      setMessage('The Studio could not read this manuscript just now. Nothing has changed.');
    }
  }, [requested, requestedSection]);
  useEffect(() => { void load(); }, [load]);

  const replaceAddress = useCallback((sectionId: string) => {
    if (typeof window === 'undefined') return;
    replacePlaceAddress(locationForSection(window.location.pathname, window.location.search, sectionId));
  }, []);
  const onFocus = useCallback((sectionId: string) => {
    setFocusId((prev) => {
      if (prev !== sectionId) {
        setHeld(null);
        /* C1C1 — moving sections releases the panel; anything in flight stays on its thread and never attaches here. */
        setDiscuss(null); discussGen.current += 1;
      }
      return sectionId;
    });
    replaceAddress(sectionId);
  }, [replaceAddress]);
  const onHold = useCallback((sectionId: string, start: number, end: number, text: string) => {
    if (text.trim().length === 0) return;
    const next: HeldPassageAt = { sectionId, start, end, text };
    /* R1-3 — a different passage (same section or not) releases an open Discuss and
       advances the generation; a pending server act finishes on its thread and its
       result does not become this passage's response. The same passage keeps it. */
    const kept = discussAfterHold(discussRef.current, next);
    if (discussRef.current && !kept) { setDiscuss(null); discussGen.current += 1; }
    setFocusId(sectionId);
    setHeld(next);
    replaceAddress(sectionId);
  }, [replaceAddress]);

  const replaceRelationshipAddress = useCallback((relationshipId: string | null) => {
    if (typeof window === 'undefined') return;
    const next = relationshipId
      ? canvasWithRelationship(window.location.pathname, window.location.search, relationshipId)
      : canvasWithoutRelationship(window.location.pathname, window.location.search);
    replacePlaceAddress(next);
  }, []);

  const restoreReturnedPlace = useCallback((sectionId: string) => {
    setFocusId(sectionId);
    setHeld(null);
    replaceAddress(sectionId);
  }, [replaceAddress]);

  const refreshContext = useCallback(async (): Promise<void> => {
    const manuscriptId = context?.manuscriptId;
    if (!manuscriptId) return;
    try {
      const res = await apiFetch(`/api/writers-studio/rebuild/context?manuscriptId=${encodeURIComponent(manuscriptId)}`);
      if (!res.ok) return;
      const body = await res.json() as ContextPayload;
      if (body.state !== 'section_aware') return;
      setContext(body);
      setWritingEpoch((epoch) => epoch + 1);
    } catch {
      /* The durable mutation receipt remains authoritative. A failed refresh
         never turns an applied/undone act into a false failure. */
    }
  }, [context?.manuscriptId]);

  const relationship = useExactV10Relationship({
    livingWorkId: work?.id ?? null,
    manuscriptId: context?.manuscriptId ?? requested ?? '',
    requestedRelationshipId: requestedRelationship,
    requestedSectionId: requestedSection,
    currentSectionId: focusId,
    receiverThreadId,
    validSectionIds,
    onRelationshipAddress: replaceRelationshipAddress,
    onRestorePlace: restoreReturnedPlace,
  });

  const editorial = useExactV10Editorial({
    enabled: editorialEnabled,
    manuscriptId: context?.manuscriptId ?? requested ?? '',
    focusId,
    held,
    writingRef,
    contextVersion: context?.version ?? 0,
    relationshipId: relationship.relationship?.id,
    carry: relationship.carrySelector,
    consumeCarry: relationship.consumeCarry,
    refreshAfterMutation: refreshContext,
  });

  useEffect(() => {
    setReceiverThreadId(editorial.thread?.threadId ?? null);
  }, [editorial.thread?.threadId]);

  useEffect(() => {
    if (focusId) relationship.rememberPlace(focusId);
  }, [focusId, relationship.rememberPlace]);

  const [facetOpen, setFacetOpen] = useState(false);
  useEffect(() => { setFacetOpen(false); }, [focusId, relationship.relationship?.id]);

  const liveTab: MaiaTab = editorial.tab === 'Revise' ? 'Revise' : 'Discuss';
  const v10Write = useMemo<LiveV10WriteBinding>(() => {
    const relationshipLead = (
      <ExactV10RelationshipControls
        relationship={relationship.relationship}
        choices={relationship.choices}
        busy={relationship.busy}
        message={relationship.message}
        chooserOpen={relationship.chooserOpen}
        onToggleChooser={() => relationship.setChooserOpen(!relationship.chooserOpen)}
        onBegin={() => { void relationship.begin(); }}
        onChoose={(id) => { void relationship.choose(id); }}
        onLeave={() => { void relationship.leave(); }}
      />
    );
    const carryTrail = (
      <ExactV10CarryControls
        relationshipSelected={Boolean(relationship.relationship)}
        receiverThreadId={receiverThreadId}
        chooser={relationship.carryChooser}
        selected={relationship.selectedCarry}
        onOpen={relationship.openCarryChooser}
        onClose={relationship.closeCarryChooser}
        onSelect={relationship.selectCarry}
        onRemove={relationship.removeCarry}
      />
    );
    const composer = editorial.panelOpen ? (
      <ExactV10EditorialComposer
        value={editorial.draft}
        busy={editorial.busy}
        tab={liveTab === 'Revise' ? 'Revise' : 'Discuss'}
        onChange={editorial.setDraft}
        onSend={() => { void editorial.send(); }}
      />
    ) : null;
    const ports: WriteRoomPorts = {
      actions: editorialEnabled ? (
        <button type="button" className="fs-tool fs-tool--key"
          data-event="HOLD_PASSAGE" disabled={!held || editorial.panelOpen}
          title={!held ? 'Select a passage first' : undefined}
          onClick={editorial.open}>Ask MAIA</button>
      ) : null,
      onFacet: () => setFacetOpen((open) => !open),
      facetMenu: facetOpen ? (
        <ExactV10FacetMenu current={editorial.depth}
          onChoose={editorial.setDepth} onClose={() => setFacetOpen(false)} />
      ) : undefined,
      maiaComposer: composer,
      maiaTabs: ['Discuss', 'Revise'],
      maiaLead: relationshipLead,
      maiaTrail: carryTrail,
      onReleaseMaia: editorial.close,
      onMaiaTab: (tab) => {
        if (tab === 'Discuss' || tab === 'Revise') editorial.setTab(tab);
      },
      onReadInContext: editorial.readInContext,
      onApply: () => { void editorial.apply(); },
      onBackToAlternatives: editorial.backToAlternatives,
      onUndo: () => { void editorial.undo(); },
      onOpenHistory: editorial.openHistory,
      onCloseHistory: editorial.closeHistory,
      showCompareHistory: false,
      ...(editorial.message ? { maiaMessage: editorial.message } : {}),
    };
    return {
      phase: editorial.phase,
      copy: editorial.copy,
      facet: editorial.depth,
      tab: liveTab,
      history: editorial.history,
      historyOpen: editorial.historyOpen,
      ports,
    };
  }, [
    editorial.panelOpen, editorial.draft, editorial.busy, editorial.depth,
    editorial.phase, editorial.copy, editorial.history, editorial.historyOpen,
    editorial.message, editorial.open, editorial.close, editorial.setDraft,
    editorial.setDepth, editorial.setTab, editorial.send, editorial.readInContext,
    editorial.apply, editorial.backToAlternatives, editorial.undo,
    editorial.openHistory, editorial.closeHistory,
    relationship.relationship, relationship.choices, relationship.busy,
    relationship.message, relationship.chooserOpen, relationship.carryChooser,
    relationship.selectedCarry, relationship.setChooserOpen, relationship.begin,
    relationship.choose, relationship.leave, relationship.openCarryChooser,
    relationship.closeCarryChooser, relationship.selectCarry,
    relationship.removeCarry, receiverThreadId, editorialEnabled, held, facetOpen, liveTab,
  ]);

  /* C1C1 — the commissioning gesture, in the founder-fixed order. */
  const onAskMaia = useCallback(() => {
    if (!editorialEnabled || !held) return;
    setDiscuss({ kind: 'composing', held });
  }, [editorialEnabled, held]);
  const onRelease = useCallback(() => {
    /* Release, never cancel: hide; a pending act finishes on the server; its result will not attach. */
    setDiscuss(null); discussGen.current += 1;
  }, []);
  const onSubmitAsk = useCallback((text: string) => {
    if (!editorialEnabled || !discuss || discuss.kind !== 'composing') return;
    /* R1-1 — emptiness predicate only; the member's exact bytes go forward. */
    if (text.trim().length === 0) return;
    const ask = text;
    const commissioned = discuss.held;
    const writing = writingRef.current;
    if (!writing) { setDiscuss({ kind: 'refused', held: commissioned, ask, copy: DISCUSS_COPY.failed }); return; }
    guard.current ??= createInFlightGuard();
    if (guard.current.held()) { setDiscuss({ kind: 'refused', held: commissioned, ask, copy: DISCUSS_COPY.busy }); return; }
    const gen = ++discussGen.current;
    setDiscuss({ kind: 'pending', held: commissioned, ask, gen });
    void commissionDiscuss(guard.current, commissioned, ask, {
      readPosture: () => readCurrentSanctuaryPosture(),
      session: writing,
      openPassage: openBoundEditorialPassage,
      sendTurn: sendBoundEditorialTurn,
    }).then((outcome) => {
      /* LATE RESULT — attaches only to the gesture that commissioned it, on the section still in focus. */
      if (!resultAttaches({ gen, held: commissioned }, { gen: discussGen.current, focusSectionId: focusRef.current, held: heldRef.current })) return;
      if (outcome.ok) {
        setDiscuss({ kind: 'answered', held: commissioned, ask, threadId: outcome.threadId, locusText: outcome.locusText, reply: outcome.reply });
      } else if (outcome.stage !== 'in_flight') {
        setDiscuss({ kind: 'refused', held: commissioned, ask, copy: outcome.copy });
      }
    });
  }, [editorialEnabled, discuss]);

  const onReviewDiscuss = useCallback((findingId: string) => {
    if (!reviewDiscussEnabled || review.kind !== 'ready') return;
    const truth = review.durable[findingId];
    if (!truth) return;
    setReviewDiscussion({ kind: 'composing', findingId });
  }, [reviewDiscussEnabled, review]);

  const onCloseReviewDiscuss = useCallback(() => {
    setReviewDiscussion(null);
    reviewDiscussGen.current += 1;
  }, []);

  const onSubmitReviewDiscuss = useCallback((findingId: string, text: string) => {
    if (!reviewDiscussEnabled || review.kind !== 'ready' || !context || text.trim().length === 0) return;
    const truth = review.durable[findingId];
    if (!truth) return;
    const ask = text;
    const gen = ++reviewDiscussGen.current;
    const readingAtGesture = review.readingId;
    setReviewDiscussion({ kind: 'pending', findingId, ask, gen });
    const posture = readCurrentSanctuaryPosture();
    void commissionReviewDiscuss({
      manuscriptId: context.manuscriptId,
      readingId: truth.address.readingId,
      observationKey: truth.address.observationKey,
      question: ask,
    }, posture).then((outcome) => {
      if (gen !== reviewDiscussGen.current || requestedReadingRef.current !== readingAtGesture) return;
      if (outcome.ok) {
        setReviewDiscussion({ kind: 'answered', findingId, ask, reply: outcome.reply, threadId: outcome.threadId, posture: outcome.posture });
        return;
      }
      const copy = outcome.reason === 'posture_unresolved' ? REVIEW_DISCUSS_COPY.posture
        : outcome.reason === 'sanctuary_unavailable' ? REVIEW_DISCUSS_COPY.sanctuary
        : REVIEW_DISCUSS_COPY.failed;
      setReviewDiscussion({ kind: 'refused', findingId, ask, copy });
    });
  }, [reviewDiscussEnabled, review, context]);

  workTitleRef.current = work?.title ?? context?.title ?? null;
  workFormRef.current = work?.form ?? null;

  /* R1-1B — retrieval happens ONLY when explicit Review state exists. ⛔ Write opens make no reading GET. */
  useEffect(() => {
    if (!context) return;
    if (!requestedReading) { reviewGen.current += 1; setReview({ kind: 'idle' }); setReviewLens('all'); return; }
    const gen = ++reviewGen.current;
    setReview({ kind: 'loading', readingId: requestedReading, gen });
    setReviewLens('all');
    const host = hostFactsFrom({
      manuscriptId: context.manuscriptId, workTitle: workTitleRef.current, workKind: workFormRef.current,
      sections: context.sections, focusId: focusRef.current,
    });
    void loadSelectedReading(requestedReading, host, reviewPorts).then((r) => {
      /* LATE RESULT — attaches only to the exact selection (reading id + generation) that commissioned it. */
      if (!attachReview({ gen, readingId: requestedReading }, { gen: reviewGen.current, readingId: requestedReadingRef.current })) return;
      setReview(r.kind === 'ready'
        ? { kind: 'ready', readingId: requestedReading, gen, view: r.view, durable: r.durable }
        : { kind: 'unavailable', readingId: requestedReading, gen });
    });
  }, [requestedReading, context]);

  /* R1-1C — an explicit reading in the URL closes the selection state: the URL is the authority. */
  useEffect(() => {
    if (requestedReading) setChooserOpen(false);
    setReviewDiscussion(null);
    reviewDiscussGen.current += 1;
  }, [requestedReading]);
  /* R1-1C — the ledger is read ONLY in the selection state. ⛔ Never on an ordinary Write open. ⛔ Never a reading GET. */
  useEffect(() => {
    if (!context) return;
    if (!shouldLoadChoices({ reading: requestedReading, chooserOpen })) { chooserGen.current += 1; setChooser({ kind: 'closed' }); return; }
    const gen = ++chooserGen.current;
    setChooser({ kind: 'loading', gen });
    void loadReadingChoices(context.manuscriptId, reviewPorts).then((r) => {
      /* LATE LEDGER — attaches only while the chooser is still open, nothing is selected, and the generation matches. */
      if (!attachChoices({ gen }, { gen: chooserGen.current, chooserOpen: chooserOpenRef.current, reading: requestedReadingRef.current })) return;
      setChooser(r.kind === 'choices' ? { kind: 'choices', gen, readings: r.readings } : { kind: 'unavailable', gen });
    });
  }, [requestedReading, chooserOpen, context]);

  /* R1-1C — navigation is a location change through the router; leaving the selection state closes it. */
  const go = useCallback((href: string) => { setChooserOpen(false); router.push(href); }, [router]);
  const openChooser = useCallback(() => { setChooserOpen(true); }, []);
  const closeChooser = useCallback(() => { setChooserOpen(false); }, []);
  const mode = studioMode({ reading: requestedReading, chooserOpen });
  const search = params && params.toString().length > 0 ? `?${params.toString()}` : '';
  const loc = { pathname: pathname ?? '/writers-studio/rebuild', search };
  const studioNav: StudioNav = {
    mode,
    actions: navActionsFor(mode, loc, { go, openChooser, closeChooser }),
    choose: { hrefFor: (id) => chooseReading(id, loc).href, onChoose: (_id, href) => go(href) },
  };
  /* R1-2 — return navigation exists only for a mounted reading, over its own context, through the same `go`. */
  const reviewNavigation = review.kind === 'ready' ? navigationFor(review.view, loc, { go }) : undefined;

  if (phase !== 'ready' || !context) {
    return (
      <main className="fs-tokens fsw-state" data-phase={phase}>
        <div>
          {phase === 'loading' && 'Opening your Writer’s Studio…'}
          {phase === 'unauthorized' && 'Sign in to open your Writer’s Studio.'}
          {phase === 'error' && (message ?? 'The Studio could not be opened.')}
        </div>
      </main>
    );
  }
  return (
    <FlagshipWriteView
      context={context}
      workTitle={work?.title ?? context.title ?? null}
      workForm={work?.form ?? null}
      member={shellMember}
      focusId={focusId}
      held={held}
      onFocus={onFocus}
      onHold={onHold}
      epoch={writingEpoch}
      editorialEnabled={editorialEnabled}
      discuss={discuss}
      onAskMaia={onAskMaia}
      onSubmitAsk={onSubmitAsk}
      onRelease={onRelease}
      onWriting={(writing) => { writingRef.current = writing; }}
      v10Write={v10Write}
      review={review}
      reviewLens={reviewLens}
      onReviewLens={setReviewLens}
      chooser={chooser}
      studioNav={studioNav}
      reviewNavigation={reviewNavigation}
      reviewDiscussion={reviewDiscussion}
      onReviewDiscuss={reviewDiscussEnabled && review.kind === 'ready' ? onReviewDiscuss : undefined}
      onSubmitReviewDiscuss={onSubmitReviewDiscuss}
      onCloseReviewDiscuss={onCloseReviewDiscuss}
    />
  );
}
