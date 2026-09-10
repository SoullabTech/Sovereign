'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS } from '../pressTheme';
import {
  BREAKPOINT,
  GOLD,
  GROUND,
  INK,
  MAIA_ACCENT,
  MEASURE,
  RADIUS,
  RULE,
  SPACE,
  writingFieldLayout,
  type StudioLayout,
} from '../studioTheme';
import { StudioPanel } from '../studio/StudioPanel';
import { StudioShellRail } from '../studio/StudioRail';
import { WriterStudioShell } from '../studio/WriterStudioShell';
import { StudioModeBar } from '../studio/StudioModeBar';
import { StudioScrollbars } from '../studio/StudioScrollbars';
import { StudioText } from '../studio/StudioType';
import { IMPORT_HREF } from '../studioMap';
import {
  adoptRouteIdentity,
  canvasForManuscript,
  requestedManuscriptId,
  requestedManuscriptIdFrom,
  resolveManuscript,
  type ManuscriptResolution,
} from '../canvasIdentity';
import { UNTITLED_EXPRESSION } from '../shellIdentity';
import { useLivingWorks } from '../useLivingWorks';
import { resolveWorkContext, currentWork, mintStudioConversationId } from '../workContext';
import { WritingFieldVisual } from '../WorkVisual';
import { AppearanceMenu } from '../atmosphere/AppearanceMenu';
import { useCanvasSurfaceVariables } from '../atmosphere/StudioAtmosphere';
import type { CurrentManuscript } from '../useCurrentManuscript';
import { loadRevisions, type RevisionSummary } from '../../press/manuscript/workingDraftClient';
import Worktable from './Worktable';
import SectionWritingSession, { type ManuscriptSession } from './SectionWritingSession';
import { WholeManuscriptSurface, type WholeManuscriptSurfaceHandle } from './WholeManuscriptSurface';
import { placeForMode } from '@/lib/writersStudio/manuscriptViewPlace';
import SectionWritingSurface from './SectionWritingSurface';
import {
  chooseMount,
  fetchWriteState,
  type WriteState,
  type WriteMount,
} from '@/lib/writersStudio/writeStateClient';
import type { SectionWriting } from '@/lib/writersStudio/useSectionWriting';
import WorkDrawer from './WorkDrawer';
import MaterialsDrawer from './MaterialsDrawer';
import FieldRoom from '../field/FieldRoom';
import FocusStrip from '../field/FocusStrip';
import FocusOverlay from '../field/FocusOverlay';
import { useHeldFocus } from '../field/useHeldFocus';
import { focusPaint } from '../field/focusPaint';
import { TREATMENTS, resolve as resolveMark } from '../field/fieldTreatments';
import ManuscriptOutline, { useManuscriptSections } from './ManuscriptOutline';
import { confirmSectionBreaks, SECTION_BREAKS_COPY } from '@/lib/writersStudio/confirmSectionBreaks';
import StructuredOutline from './StructuredOutline';
import StructureReview from './StructureReview';
import ReadingsEntry from './ReadingsEntry';
import MaiaColumn from './MaiaColumn';
import StudioConversation from './StudioConversation';
import StudioLowerBand from './StudioLowerBand';

/**
 * THE WRITER'S STUDIO — the persistent shell, at /writers-studio/canvas.
 *
 * ── WHAT 03A WAS, AND WHY THIS IS DIFFERENT ────────────────────────────────
 *
 * WS2-03A routed the accepted WS2-02 primitives into this room and stopped.
 * The result looked like the old Canvas because it WAS the old Canvas: a
 * folded drawer spine showing one drawer at a time, with a rail bolted to its
 * left edge. New paint, old composition. The founder's reading of it —
 * "the projection seam" — is exactly right, and 03B is the composition.
 *
 * What changed structurally:
 *
 *   GONE  the vertical drawer spine, and the one-drawer-at-a-time rule that
 *         made the manuscript share the room with a 288px accordion.
 *   GONE  the folded Window, a 40px strip that had to be pried open before
 *         MAIA had any presence at all.
 *   NEW   the five-mode bar, the sixteen-destination shell rail, a standing
 *         outline column, the writing field at its MEASURED share, MAIA as a
 *         column rather than a hinge, Materials in 04's right-hand geometry,
 *         and the lower band 04 carries and this room never had.
 *
 * ── GEOMETRY: THE MEASURED PROPORTIONS, AT EVERY WIDTH ─────────────────────
 *
 * 03A could not adjudicate column proportion, because this room had a
 * different column set. It now has 04's. `writingFieldLayout` allocates the
 * measured gutters first and divides the remainder in the measured ratio; the
 * result is resolved here as PERCENTAGES rather than at one assumed viewport,
 * so the reference proportions hold at 1680 and at 1280 alike and no layout
 * depends on reading `window` during render.
 *
 * The column SET varies with what is honestly present — a dismissed panel
 * leaves the row and its share is redivided among the rest in the same
 * measured ratio. What never varies: the writing field is an explicit width,
 * never a `flex: 1` remainder. That was the WS2-02B defect and it is the one
 * failure mode this layout is built to make impossible.
 *
 * ── WHAT IS REAL IN THIS ROOM, REGION BY REGION ────────────────────────────
 *
 *   mode bar     WRITE real. Develop/Explore/Review/Publish have no rooms and
 *                are unpressable spans.
 *   shell rail   Home and Export are routes. Manuscript is this room.
 *                Materials, Structure and Versions are satisfied HERE as
 *                panels. Notes, Goals and the whole MAIA band are unavailable.
 *   outline      REAL sections from manuscript_sections.
 *   field        REAL. The Working Draft engine, unchanged.
 *   MAIA         Present, honest, and holding no member material.
 *   materials    REAL declarations only. Opens when there are some.
 *   lower band   Versions and Statistics real; Goals has no substrate.
 *
 * ── IDENTITY: THE WS2-01 MINIMUM, HELD HERE ────────────────────────────────
 *
 * This room used to read `manuscripts.find(...) ?? manuscripts[0]`. A named
 * manuscript that could not be found was silently replaced by whichever came
 * back first, and the room then told the member "the most recent of your N
 * manuscripts is on the table" — a true sentence about the wrong book.
 *
 * `resolveManuscript` returns a decision, and every branch of it is rendered:
 * an unresolvable identity REFUSES, and an unnamed arrival with several
 * manuscripts ASKS. Neither substitutes. Root-causing how a member came to be
 * sent an id they do not own stays in the WS2-01 lane; this room's job is to
 * stop being the place where that becomes invisible.
 */

/** Panels that can stand in the row beside the field. */
type ColumnId = 'outline' | 'maia' | 'materials' | 'conversation';

/** Rail destinations this room satisfies in place rather than by navigation. */
/**
 * ⭐ ONE TREATMENT, RULED. The design study offered three ways of keeping
 * location, focus and thread visually distinct; `?field=A|B|C` selected between
 * them and was a STUDY MECHANISM, never a product entry.
 *
 * C is the ruling (founder, 2026-09-10): location stays quiet in the rail,
 * Focus alone is framed inside the Work, and the thread stays in MAIA's orbit.
 * B was refused because it washes the manuscript itself to say where you are —
 * a mark on the writing for a reason that has nothing to do with the writing.
 *
 * ⛔ Not a prop, not a parameter, not a preference. A writer choosing between
 * three grammars for the same three meanings is the study leaking into the
 * product, and the falsifier the study existed to answer is only meaningful
 * once one answer is chosen.
 */
const WRITE_TREATMENT = 'C' as const;

/**
 * ⭐ THE ORDINARY GEOMETRY OF WRITE, FIXED. Canonical opened a Work that has
 * sections with its outline shown (`sections.length > 0`) and MAIA present
 * (defaulted true), so this is the measure a writer actually had — not the
 * widest the field could ever be, and not the narrowest.
 *
 * Materials is deliberately ABSENT: in the room it is a Workbench orbit at the
 * bottom, so it takes no width from the manuscript at all. Canonical narrowed
 * the field to 33.973% when Materials opened; under R1 it no longer does.
 */
const ORDINARY_COLUMNS = ['rail', 'outlinePanel', 'writingField', 'maiaPanel'] as const;

const SATISFIED_IN_ROOM = ['materials', 'structure', 'versions', 'conversations'] as const;

/* Named, and no longer the default export: `useSearchParams()` reads route
   state, so this room renders under a Suspense boundary (the default export
   below). Without one, `next build` refuses to prerender this route. */
function CanvasRoom() {
  const { phase: worksPhase, works, reload: reloadWorks } = useLivingWorks();

  const [listPhase, setListPhase] = useState<
    'loading' | 'ready' | 'unauthorized' | 'error'
  >('loading');
  const [manuscripts, setManuscripts] = useState<CurrentManuscript[]>([]);

  /* IDENTITY, FROM THE ROUTE — AND LATCHED ONCE TAKEN.
     ─────────────────────────────────────────────────────────────────────
     This used to be a one-shot read of `window.location.search` in a
     `useState` initializer. Two properties were wanted and only the second
     was obtained: take the identity the link carried, and never swap the
     manuscript out from under a mounted draft.

     The first property failed on client navigation. Studio Home's
     "Continue writing" is a `Link` whose href comes from
     `canvasForManuscript(...)`, so the identity was correct at the producer
     — but on that navigation the room rendered before the browser URL
     carried it. The initializer sampled `null`, and because nothing ever
     looked again, `requested` STAYED null: no manuscript resolved, the
     write-state effect returned before fetching, `chooseMount` never left
     `loading`, and the writer got the shell with no body. A cold reload of
     the same URL worked, because then the address bar was already correct
     before mount. Observed in production on de0f35434, 2026-09-05.

     `useSearchParams()` reads the ROUTE's params, which are committed with
     the navigation rather than trailing it, so the identity is there to be
     read on the first render that has one. That is a removal of the race,
     not a wait for it: no timer, no retry, no reload.

     The second property is kept explicitly, by LATCHING. Once `requested`
     holds an id — from the route, or from the member answering the chooser
     — a later route param never replaces it. The exit guard flushes on
     teardown, so a silent swap underneath a mounted draft would flush one
     manuscript's words toward another's. `prev ?? next` is the whole rule:
     adopt when empty, never overwrite. */
  const searchParams = useSearchParams();
  /* `useSearchParams()` is typed nullable (it has no params to give during a
     static prerender). No params means no requested identity — which is the
     chooser's case, not a substitution. */
  const routeRequested = searchParams === null ? null : requestedManuscriptIdFrom(searchParams);
  const [requested, setRequested] = useState<string | null>(routeRequested);

  useEffect(() => {
    if (routeRequested === null) return;
    setRequested((prev) => adoptRouteIdentity(prev, routeRequested));
  }, [routeRequested]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/sovereign/manuscripts', { method: 'GET' });
        if (cancelled) return;
        if (res.status === 401) return setListPhase('unauthorized');
        if (!res.ok) return setListPhase('error');
        const data = await res.json();
        if (cancelled) return;
        setManuscripts(Array.isArray(data.manuscripts) ? data.manuscripts : []);
        setListPhase('ready');
      } catch {
        if (!cancelled) setListPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolution = useMemo(
    () => resolveManuscript(requested, manuscripts),
    [requested, manuscripts],
  );
  const manuscript = resolution.kind === 'resolved' ? resolution.manuscript : null;

  /* PERSISTENT WORK CONTEXT, ACROSS RELOAD.
     The manuscript identity is pinned into the URL whenever one is resolved.
     That is what makes reload preserve the current Work: the Work is
     re-derived from the member's declarations for THIS manuscript, so pinning
     the manuscript pins the Work — without storing a second, staleable copy
     of it anywhere.

     CORRECTED after the first authenticated capture. This effect used to skip
     whenever `wasRequested` was true, on the reasoning that an identity that
     came FROM the URL is already in it. That reasoning had a hole: choosing a
     manuscript in the ambiguity chooser also sets `requested`, in React state
     and nowhere else. So the founder's own session — four manuscripts, none
     named, one chosen — ran with a bare /writers-studio/canvas in the address
     bar, and a reload would have dropped them back at the chooser. The
     capture is what showed it; no test could, because the URL is the one
     piece of state the room does not own.

     The condition is now about the URL rather than about provenance: pin
     whenever what is on the table differs from what the address bar names. */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (resolution.kind !== 'resolved') return;
    const id = resolution.manuscript.id;
    if (requestedManuscriptId(window.location.search) === id) return;
    window.history.replaceState(
      null,
      '',
      canvasForManuscript(window.location.pathname, id),
    );
  }, [resolution]);

  const workContext = resolveWorkContext(worksPhase, works, manuscript?.id ?? null);
  const work = currentWork(workContext);

  const { phase: sectionsPhase, sections } = useManuscriptSections(manuscript?.id ?? null);

  /* ── WS2-04B: which engine may write this draft. Resolved by the server in
     one response; the room never assembles it from parts. */
  const [writePhase, setWritePhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [writeState, setWriteState] = useState<WriteState | null>(null);
  const [writing, setWriting] = useState<SectionWriting | null>(null);
  /* WS-WHOLE-MANUSCRIPT-01. The outline is rendered here, outside the session,
     so it needs the session's MODE and observed PLACE to route by. Held beside
     `writing` rather than derived from it: `writing.activeId` is the
     single-editor seam and says nothing about where a Whole reader is. */
  const [session, setSession] = useState<ManuscriptSession | null>(null);
  const [jumpTo, setJumpTo] = useState<string | null>(null);

  useEffect(() => {
    const id = manuscript?.id;
    if (!id) { setWritePhase('loading'); setWriteState(null); return; }
    let cancelled = false;
    setWritePhase('loading');
    setWriteState(null);
    (async () => {
      const r = await fetchWriteState(id, (url) => apiFetch(url));
      if (cancelled) return;
      setWritePhase(r.phase);
      setWriteState(r.state);
    })();
    return () => { cancelled = true; };
  }, [manuscript?.id]);

  /* WS2-NAV-01 — the member act that makes a Work navigable.

     Conversion is NEVER automatic: not on import, not on save. The boundaries
     were detected at ingest and are only offered; this is the act that turns
     them into the Work's durable sections. Success is taken from the server
     alone — on failure the continuous draft is untouched and stays that way on
     screen, because an optimistic remount would claim an identity assignment
     that never happened. */
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  /* NAV-03 — the single way this page re-reads write authority. Conversion and
     first-draft creation both change what the server would answer; neither may
     invent its own remount. */
  const refreshWriteState = useCallback(async () => {
    const id = manuscript?.id;
    if (!id) return;
    const refreshed = await fetchWriteState(id, (url) => apiFetch(url));
    setWritePhase(refreshed.phase);
    setWriteState(refreshed.state);
  }, [manuscript?.id]);

  const onConfirmSectionBreaks = useCallback(async () => {
    const id = manuscript?.id;
    if (!id || confirming) return;
    setConfirming(true);
    setConfirmError(null);
    const outcome = await confirmSectionBreaks(id, (url, init) => apiFetch(url, init));
    if (!outcome.ok) {
      setConfirmError(outcome.message);
      setConfirming(false);
      return;
    }
    /* Re-read the authority rather than assuming it. The draft is section-
       addressable because the server says so, and the outline remounts through
       the existing 'sections' branch — no second navigation path is created. */
    await refreshWriteState();
    setConfirming(false);
  }, [manuscript?.id, confirming, refreshWriteState]);

  const writeMount = chooseMount(writePhase, writeState);
  /* Development only, and only when a witness asks: holds the save RESPONSE so
     a section can be seen still saving while the next opens. */
  const witnessDelayMs =
    typeof window === 'undefined'
      ? undefined
      : Number(new URLSearchParams(window.location.search).get('witnessDelayMs') ?? 0) || undefined;

  const [draftMeta, setDraftMeta] = useState<{
    updatedAt: string | null;
    revisionCount: number | null;
    words: number;
  } | null>(null);

  const [revisions, setRevisions] = useState<RevisionSummary[] | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  useEffect(() => {
    if (!manuscript) return;
    let cancelled = false;
    (async () => {
      const r = await loadRevisions(apiFetch, manuscript.id);
      if (!cancelled) setRevisions(r.kind === 'ok' ? r.revisions : null);
    })();
    return () => {
      cancelled = true;
    };
  }, [manuscript, historyKey]);

  /* ── WHAT STANDS OPEN, AND WHY ──────────────────────────────────────────
     The outline is not contextual by contract — it is standing furniture the
     member may dismiss. MAIA is present because §1 makes her a companion
     across the modes, and dismissible because her panel contract says so.

     MATERIALS IS THE DELICATE ONE. 04 draws it open, and the founder's rule
     is explicit: Materials are NOT permanent furniture just because the
     reference depicts them open. So it is not open by default and it is not
     closed by default either — it is CONTEXTUAL, which is what its contract
     actually says. It opens when the current Work has materials the member
     declared, and stays shut when there is nothing real to hold. Opening an
     empty Materials column to reach 04's five would be furniture pretending
     to be context. */
  const [dismissed, setDismissed] = useState<Partial<Record<ColumnId, boolean>>>({});
  const [summoned, setSummoned] = useState<Partial<Record<ColumnId, boolean>>>({});
  const [bandOpen, setBandOpen] = useState(true);
  const [workOpen, setWorkOpen] = useState(false);
  /* WS2-05B - the reading being looked at, or null. It takes the outline's
     place rather than becoming a seventh column: a proposal is ABOUT the
     manuscript column, and two structure columns side by side would invite the
     reading to be mistaken for the Work. */
  const [readingId, setReadingId] = useState<string | null>(null);

  const declaredMaterials = work?.materials.length ?? 0;
  const materialsInContext = declaredMaterials > 0;

  const open = (id: ColumnId, standing: boolean) =>
    summoned[id] === true || (standing && dismissed[id] !== true);

  const outlineOpen = open('outline', sections.length > 0);
  const maiaOpen = open('maia', true);
  const materialsOpen = open('materials', materialsInContext);

  /* 📖 WS2-03D — the conversation, open in this room rather than away from it.
     Gated on a declared Work for the same reason Conversations is: with none
     there is nothing to situate, and the room does not choose between several. */
  const conversationOpen = summoned.conversation === true && Boolean(work);

  /* Minted once per page life, when the panel first opens — never discovered.
     Dismissing and reopening the panel continues the SAME exchange; a reload
     starts a new one, because asking "which conversation was this Work's?" is
     a most-recent question and this lane refuses those. */
  const [conversationId] = useState(mintStudioConversationId);

  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT.compact - 1}px)`);
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  /* At compact the ONE collapse either reference establishes applies:
     Materials yields its right-hand column before the outline does, and
     before the field gives up its measure (YIELDS_BEFORE). It is not deleted
     — PRESENT_AT_COMPACT keeps it — it simply cannot hold a column here. */
  /**
   * ⭐⭐ R1 · A — THE COLUMN SET IS CONSTANT, SO THE MEASURE NEVER MOVES.
   * Founder ruling, 2026-09-10.
   *
   * ⛔ THE DEFECT THIS REPLACES, AND HOW IT HID. This list used to grow and
   * shrink with `outlineOpen` / `maiaOpen` / `materialsOpen` / `conversationOpen`,
   * and `writingFieldLayout` divides the notional width among whatever is in it.
   * So the manuscript's own percentage moved with the panels:
   *
   *     rail + field                        68.088%
   *     + outline                           52.054%
   *     + outline + maia    ← ORDINARY      41.293%
   *     + outline + maia + materials        33.973%
   *
   * Toggling MAIA from the header re-wrapped the writer's paragraphs. The first
   * R1 repair made `aperture()` constant and asserted that the field's STYLE
   * expression named no orbit state — which it does not, and never did. The
   * dependency was one level up, in `L`. An assertion that inspects the wrong
   * place reports clean and proves nothing.
   *
   * ⭐ R1 · B — BASELINE CONTINUITY. The constant chosen is not an arbitrary
   * safe number: it is EXACTLY canonical's ordinary arrival geometry, where a
   * Work with sections opens with its outline and MAIA present. State
   * invariance bought by quietly narrowing the writer's page would be the
   * supporting UI consuming the Work continuously instead of intermittently —
   * formally invariant, substantively worse.
   *
   * ⛔ Do not make this depend on anything again. `apertureIsIndependentOfOrbits`
   * cannot catch a regression here, because the dependency would be in `L`.
   * `shellProjection` pins the number itself against writingFieldLayout.
   */
  const columnsShown = useMemo(
    () => ORDINARY_COLUMNS,
    [],
  );

  /* Resolved at a large notional width and expressed as percentages, so the
     MEASURED ratio holds at every viewport and nothing reads `window` during
     render. writingFieldLayout still owns the arithmetic. */
  const NOTIONAL = 100000;
  const L = writingFieldLayout(NOTIONAL, columnsShown);
  const pct = (n: number) => `${((n / NOTIONAL) * 100).toFixed(4)}%`;

  const summon = useCallback((id: ColumnId) => {
    setSummoned((s) => ({ ...s, [id]: true }));
    setDismissed((d) => ({ ...d, [id]: false }));
  }, []);
  const dismiss = useCallback((id: ColumnId) => {
    setSummoned((s) => ({ ...s, [id]: false }));
    setDismissed((d) => ({ ...d, [id]: true }));
  }, []);

  // ── Signed out ───────────────────────────────────────────────────────────
  if (listPhase === 'unauthorized') {
    return (
      <Bare>
        The Studio holds your own words, so it opens only to you.{' '}
        <a href="/signin" style={{ textDecoration: 'underline' }}>
          Sign in
        </a>{' '}
        to enter.
      </Bare>
    );
  }

  const manuscriptLabel = manuscript ? (manuscript.title ?? UNTITLED_EXPRESSION) : '';

  /**
   * ── THE HELD FOCUS ────────────────────────────────────────────────────────
   *
   * What the writer has framed for attention. Called unconditionally, as every
   * hook must be, and inert until they frame something — with no Work resolved
   * it has no sections to read and captures nothing.
   *
   * ⛔ IT TRANSMITS NOTHING. The focus is held, painted and carried beside the
   * conversation; it is not sent anywhere. Handing it to a boundary is
   * FOCUS-PRODUCER's work and is out of scope for this lane.
   */
  const focusSections = useMemo(
    () => (writing?.sections ?? []).map((sec) => ({
      id: sec.id, position: sec.position, heading: sec.heading ?? null,
    })),
    [writing],
  );
  const focusBodyOf = useCallback(
    (sectionId: string) => writing?.bodyOf(sectionId) ?? '',
    [writing],
  );
  const held = useHeldFocus(focusSections, focusBodyOf);

  /**
   * The focus, drawn where the writer put it. Built here because it needs both
   * the held focus and the ruled treatment; handed to the substrate as a
   * read-only mark and nothing else.
   */
  const renderSectionOverlay = useCallback((sectionId: string, body: string) => {
    const f = held.focus;
    if (!f || !f.sectionIds.includes(sectionId)) return null;
    const first = f.sectionIds[0] === sectionId;
    const last = f.sectionIds[f.sectionIds.length - 1] === sectionId;
    return (
      <FocusOverlay
        body={body}
        start={first ? f.start : 0}
        end={last ? f.end : body.length}
        paint={focusPaint(resolveMark(TREATMENTS[WRITE_TREATMENT], 'focus'))}
      />
    );
  }, [held.focus]);
  const headline = work?.title ?? (manuscript ? manuscriptLabel : 'Writer’s Studio');
  const named = Boolean(work?.title ?? manuscript?.title);

  /* 📖 WS2-03D — Conversations opens HERE.
     
     At 03C it was a link to /maia, and the founder's runtime witness showed
     what that costs: speaking with MAIA ejected the writer from the Studio,
     the manuscript vanished, and the Work went with it. MAIA is adjacent to
     the Work — not a destination you abandon your book to reach.
     
     So Conversations joins Materials, Structure and Versions as a destination
     this room satisfies in place. The /maia handoff is not discarded; it
     becomes the explicit "Open in MAIA" inside the panel.
     
     The gate is unchanged: exactly one declared Work. None, and there is
     nothing to situate; several, and the room does not choose. */
  const railCounts: Record<string, number> = {};
  if (manuscript) {
    railCounts.structure = sections.length;
    railCounts.versions = revisions?.length ?? 0;
    if (work) railCounts.materials = declaredMaterials;
  }

  /* The header's right-hand controls are Write's own, so the shell takes them
     as a slot rather than knowing about them. */
  /* The page's variables. Applied to the writing field alone — see the
     comment at that element for why this is the whole containment mechanism. */
  const canvasSurfaceVars = useCanvasSurfaceVariables();

  const headerRight = (
    <>
        {/* ── APPEARANCE — both axes, reachable from inside the editor ────
            Founder ruling 2026-09-07: a writer must never have to leave their
            manuscript to change the room OR the page. This is the editor's
            door onto the SAME preference the Home control writes — not a
            second setting that could disagree with it. */}
        <AppearanceMenu />
        {/* ── WS2-03B correction: a way back to MAIA ────────────────────────
            Her panel was dismissible with no route home. Every other panel is
            re-opened from the rail, but her whole rail band is unavailable and
            must stay that way — so a control had to exist somewhere else.

            It is deliberately a SHOW/HIDE TOGGLE and not a destination: it
            carries aria-pressed rather than an href, it sits in the header
            chrome rather than in the rail's grammar, and its label names the
            panel it reveals. Putting a live "MAIA" entry in the rail would
            have fixed the same bug by making the MAIA band look reachable,
            which is precisely the promise WS2-03B refuses to make. */}
        <button
          type="button"
          data-panel-toggle="maia"
          aria-pressed={maiaOpen}
          onClick={() => (maiaOpen ? dismiss('maia') : summon('maia'))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACE.snug,
            background: maiaOpen ? GROUND.active : 'transparent',
            border: `1px solid ${maiaOpen ? RULE.soft : RULE.quiet}`,
            borderRadius: RADIUS.pill,
            padding: `${SPACE.tight}px ${SPACE.base}px`,
            cursor: 'pointer',
            marginRight: SPACE.base,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 6,
              height: 6,
              borderRadius: RADIUS.pill,
              background: maiaOpen ? MAIA_ACCENT.voice : 'transparent',
              border: `1px solid ${MAIA_ACCENT.voice}`,
            }}
          />
          <StudioText role="metadata" as="span" tone={maiaOpen ? 'secondary' : 'quiet'}>
            MAIA
          </StudioText>
        </button>
        {draftMeta && (
          <StudioText role="metadata" as="span">
            {draftMeta.words.toLocaleString()} words
          </StudioText>
        )}
    </>
  );

  const lowerBand = (
    <>
      {/* ══ LOWER BAND ══════════════════════════════════════════════════ */}
      {bandOpen && manuscript && (
        <StudioLowerBand
          revisions={revisions}
          wordCount={draftMeta?.words ?? null}
          sectionCount={
            writeMount.mount === 'sections'
              ? writeMount.rows.length
              : sectionsPhase === 'ready' ? sections.length : null
          }
          outlineOpen={outlineOpen}
          onShowOutline={() => summon('outline')}
          onDismiss={() => setBandOpen(false)}
        />
      )}
    </>
  );

  return (
    <WriterStudioShell
      currentMode="write"
      manuscriptId={manuscript?.id ?? null}
      workName={headline}
      workNamed={named}
      /* The member's own statement, in their words, only when their own
         declaration united a Work with what is on the table. */
      workNote={
        work?.purpose ? work.purpose
          : work && manuscript ? `${manuscriptLabel} — a form of this work, declared by you`
          : null
      }
      headerRight={headerRight}
      lowerBand={lowerBand}
      bodyGutter={pct(L.gutter)}
      compact={compact}
    >

      {/* ══ WRITE'S INTERIOR — THE FIELD + ORBIT ROOM ════════════════════════
          ⭐ THE ROOM IS THE INTERIOR, NOT A SECOND SHELL. The wordmark, the
          Work's name, the mode bar, the header controls and the lower band
          belong to the Studio and persist across WRITE and DEVELOP. Only what
          sits inside changes. An earlier form of this room returned INSTEAD of
          <WriterStudioShell>, which would have given WRITE one environment and
          DEVELOP another — the second destination this integration exists to
          eliminate.

          ── EVERY LIVE CAPABILITY, ACCOUNTED FOR ────────────────────────────
          Nothing that worked before may vanish because the visual shell
          changed. `SATISFIED_IN_ROOM` names what WRITE actually satisfied:

            structure      → the Struct orbit
            conversations  → the MAIA orbit
            materials      → the Workbench orbit  (with Work declarations)
            versions       → the Studio's lower band, untouched

          and outside the room, unchanged in the shell: Work identity and the
          mode bar, Appearance, word count, and Home by the wordmark. Export
          moves into Workbench rather than disappearing with the old rail.

          Notes, Goals and the rail's Tools were already rendered `unavailable`
          — spans with no href, `aria-disabled`, dimmed. They have no substrate.
          Removing chrome that promised nothing is honesty, not loss.

          ⛔ NO AUTHORITY MOVES HERE. Write authority, autosave, section
          identity, revisions, navigation and provenance are exactly what they
          were: this is a relocation of already-resolved pieces, and the room
          re-derives none of them. */}
      <FieldRoom
        treatment={WRITE_TREATMENT}
        /* The shell already names the Work. The room takes no title, so no
           second masthead can appear for the same manuscript. */
        title=""
        workRef={held.rootRef}
        focus={held.focus
          ? ({ openMaia }) => (
            <FocusStrip
              focus={held.focus!}
              sections={focusSections}
              bodyOf={focusBodyOf}
              canWiden={held.canWiden}
              canNarrow={held.canNarrow}
              onWiden={held.widen}
              onNarrow={held.narrow}
              onRelease={held.release}
              /* EXPLICIT ONLY, AND IT SENDS NOTHING. The gesture opens her and
                 leaves the focus standing beside the conversation. Carrying it
                 across a boundary is FOCUS-PRODUCER's lane. */
              onAsk={openMaia}
            />
          )
          : undefined}
        structure={
          /* THE SAME ROWS, THE SAME NAMESPACE RULE. In section_aware the rows
             are manuscript_draft_sections ids and carry navigation; otherwise
             they are the immutable Source and carry none. The room does not get
             to relax that — an outline that looks wired and misses every click
             is the same defect wherever it is drawn. */
          writeMount.mount === 'sections' && writing && manuscript?.id ? (
            <StructuredOutline
              manuscriptId={manuscript.id}
              sections={writeMount.rows}
              activeId={outlinePlace(session, writing)}
              statusOf={writing.statusOf}
              onSelect={outlineSelect(session, writing, setJumpTo)}
            />
          ) : (
            /* Source rows, and therefore NO navigation props — the namespace
               rule holds inside the room exactly as it did beside it. */
            <ManuscriptOutline
              manuscriptId={manuscript?.id ?? null}
              phase={sectionsPhase}
              sections={sections}
            />
          )
        }
        maia={
          work && manuscript ? (
            <StudioConversation
              work={work}
              manuscriptId={manuscript.id}
              conversationId={conversationId}
              /* The orbit is the dismissal. Closing it hides the panel and
                 never unmounts the exchange, so reopening returns to the same
                 conversation id. */
              onClose={() => undefined}
            />
          ) : (
            <MaiaColumn context={workContext} />
          )
        }
        workbench={
          /* WHERE THE SURROUNDING CAPABILITIES LAND. Work declarations and
             Materials both lived in the old rail; both are live and both keep
             working. Export keeps its route rather than losing its door. */
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.roomy, minHeight: 0 }}>
            <WorkDrawer
              works={works}
              unitedWork={work}
              manuscript={manuscript ? { id: manuscript.id, title: manuscript.title } : null}
              manuscriptLabel={manuscriptLabel}
              onChanged={reloadWorks}
            />
            <MaterialsDrawer
              work={work ?? (works.length === 1 ? works[0] : null)}
              manuscript={manuscript}
              manuscripts={manuscripts}
              onChanged={reloadWorks}
            />
            {manuscript && (
              <Link
                href={`/writers-studio/canvas/export?m=${manuscript.id}`}
                data-workbench-export
                style={{ color: INK.secondary, textDecoration: 'none', fontSize: 12 }}
              >
                Export
              </Link>
            )}
          </div>
        }
        work={
          /* ── THE MEMBER'S OWN SURFACE, CARRIED INTO THE ROOM ──────────────
             ⭐ APPEARANCE MUST STILL REACH THE MANUSCRIPT. These tokens are the
             page the writer chose, and the ink declared here is what makes
             "the ink belongs to the material, not the room" true in the
             cascade: an element that merely inherits colour resolves against
             the dark Studio shell instead. The old interior declared them on
             its writing-field <main>; that element is gone, so they are
             declared here, on the Work itself.

             ⛔ `--ws-bg` is deliberately never among them — that is the page
             gradient behind the whole Studio, and a writing surface able to
             repaint the room is exactly the leak this design prevents.

             What is NOT carried over: width, flexShrink and minWidth. Those
             were the old column's measure. The room's aperture owns the Work's
             box now, and two things computing one width is how they disagree. */
          <div
            data-panel-role="writing-field"
            data-canvas-surface={canvasSurfaceVars['--ws-ground-field'] ? 'material' : 'studio'}
            style={{
              ...canvasSurfaceVars,
              color: INK.primary,
              /* ⭐⭐ R1 — THE MEASURED COLUMN, UNCHANGED BY ANY ORBIT.
                 Founder ruling 2026-09-10: the Work's measured width and its
                 resulting line reflow are invariant. This is the explicit width
                 WS2-02B requires — never a flex remainder, and never derived
                 from what happens to be open. Opening MAIA and watching your
                 paragraphs acquire new line breaks is conversation physically
                 perturbing the writing it is about. */
              width: compact ? '100%' : pct(L.writingField),
              flexShrink: 0,
              minWidth: compact ? 0 : MEASURE.fieldMinWidth,
              background: GROUND.field,
              border: `1px solid ${RULE.soft}`,
              borderRadius: RADIUS.panel,
              display: 'flex', flexDirection: 'column',
              /* ⛔ NEVER `flex: 1`. That is the WS2-02B defect by another name:
                 a field whose width is whatever the row had left over. The
                 explicit width above is the measure; height fills the room. */
              minHeight: compact ? '60vh' : 0,
              height: '100%',
              overflow: 'auto',
            }}
          >
            {/* ⭐ THE TEXT ITSELF, NOT ONLY ITS CONTAINER. The variables above
                are inherited, but a <pre> or <textarea> written before those
                tokens existed — or one a browser gives its own default fill to
                — resolves against something else. These two rules are what make
                the member's words actually take the page they chose, and the
                `-webkit-text-fill-color` line is not redundant: WebKit ignores
                `color` on a textarea without it. */}
            <style>{`
              [data-canvas-surface='material'] pre,
              [data-canvas-surface='material'] textarea {
                color: var(--ws-ink-primary) !important;
                -webkit-text-fill-color: var(--ws-ink-primary) !important;
              }
              [data-canvas-surface='material'] ::selection {
                background: var(--ws-ground-active);
              }
            `}</style>
          <FieldBody
            writeMount={writeMount}
            witnessDelayMs={witnessDelayMs}
            onWriting={setWriting}
            onSession={setSession}
            jumpTo={jumpTo}
            onJumpHandled={() => setJumpTo(null)}
            listPhase={listPhase}
            resolution={resolution}
            manuscript={manuscript}
            onPick={(id) => setRequested(id)}
            onMeta={setDraftMeta}
            onCheckpointed={() => setHistoryKey((k) => k + 1)}
            onWriteAuthorityChanged={refreshWriteState}
            renderSectionOverlay={renderSectionOverlay}
          />
          </div>
        }
      />
    </WriterStudioShell>
  );
}

/* ── The field's contents, one honest branch per resolution ──────────────── */

function FieldBody({
  listPhase,
  resolution,
  manuscript,
  onPick,
  onMeta,
  onCheckpointed,
  onWriteAuthorityChanged,
  writeMount,
  witnessDelayMs,
  onWriting,
  onSession,
  jumpTo,
  onJumpHandled,
  renderSectionOverlay,
}: {
  listPhase: 'loading' | 'ready' | 'unauthorized' | 'error';
  resolution: ManuscriptResolution<CurrentManuscript>;
  manuscript: CurrentManuscript | null;
  onPick: (id: string) => void;
  onMeta: (m: { updatedAt: string | null; revisionCount: number | null; words: number }) => void;
  onCheckpointed: () => void;
  /** NAV-03 — the write authority moved; re-read what the server now says. */
  onWriteAuthorityChanged: () => void;
  /**
   * A read-only mark the room draws over a section's text — the writer's own
   * held focus. Forwarded to the substrate untouched; it confers no authority
   * and this component neither reads nor interprets it.
   */
  renderSectionOverlay?: (sectionId: string, body: string) => React.ReactNode;
  /** What the server said to mount. Resolved above; never guessed here. */
  writeMount: WriteMount;
  witnessDelayMs?: number;
  /** Publishes the section session so the outline can share it. */
  onWriting?: (w: SectionWriting | null) => void;
  /** WS-WHOLE-MANUSCRIPT-01 — the view mode and observed place, for the rail. */
  onSession?: (s: ManuscriptSession | null) => void;
  jumpTo?: string | null;
  onJumpHandled?: () => void;
}) {
  if (listPhase === 'loading') {
    return <StudioText role="metadata">opening…</StudioText>;
  }
  if (listPhase === 'error') {
    return (
      <StudioText role="prose" style={{ opacity: 0.75 }}>
        The Studio could not be reached just now. Your work is not affected —
        please try again in a moment.
      </StudioText>
    );
  }

  /* THE REFUSAL. An identity was named and does not resolve here.
     This is the branch that used to be `?? manuscripts[0]`, and it is a
     refusal rather than an error: the room is declining to guess, which is
     correct behaviour and must not be dressed as a fault (STATE.refusal). */
  if (resolution.kind === 'unresolved') {
    return (
      <div data-state="refusal" style={{ maxWidth: '46ch' }}>
        <StudioText role="chapterSubtitle" as="h2" style={{ marginBottom: SPACE.base }}>
          That manuscript is not on your shelf.
        </StudioText>
        <StudioText role="prose" style={{ opacity: 0.8, marginBottom: SPACE.comfortable }}>
          The Studio was asked to open a specific manuscript and cannot find it
          among yours. Nothing else has been put on the table in its place, and
          nothing has been changed.
        </StudioText>
        <StudioText role="metadata" style={{ marginBottom: SPACE.comfortable }}>
          requested: {resolution.requested}
        </StudioText>
        <Link href="/writers-studio" style={{ textDecoration: 'underline' }}>
          <StudioText role="navItem" as="span">
            Go to Studio Home →
          </StudioText>
        </Link>
      </div>
    );
  }

  /* THE QUESTION. Nothing was named and several exist. Not a fallback and not
     a dead end: the member is the only one who can answer, so ask them. */
  if (resolution.kind === 'ambiguous') {
    return (
      <div data-state="refusal" style={{ maxWidth: '46ch' }}>
        <StudioText role="chapterSubtitle" as="h2" style={{ marginBottom: SPACE.base }}>
          Which one are you working on?
        </StudioText>
        <StudioText role="prose" style={{ opacity: 0.8, marginBottom: SPACE.comfortable }}>
          You have {resolution.manuscripts.length} manuscripts and none was
          named. The Studio will not choose for you.
        </StudioText>
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.snug }}>
          {resolution.manuscripts.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onPick(m.id)}
              style={{
                textAlign: 'left',
                background: 'transparent',
                border: `1px solid ${RULE.soft}`,
                borderRadius: RADIUS.sm,
                padding: `${SPACE.snug}px ${SPACE.base}px`,
                cursor: 'pointer',
              }}
            >
              <StudioText role="navItem" tone="secondary">
                {m.title ?? UNTITLED_EXPRESSION}
              </StudioText>
              <StudioText role="metadata">
                {m.sectionCount} section{m.sectionCount === 1 ? '' : 's'}
              </StudioText>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (resolution.kind === 'empty') {
    return (
      <div style={{ maxWidth: '44ch' }}>
        <StudioText role="prose" style={{ opacity: 0.8, marginBottom: SPACE.comfortable }}>
          Nothing is on the table yet.
        </StudioText>
        <StudioText role="metadata">
          Begin at{' '}
          <Link href="/writers-studio" style={{ textDecoration: 'underline' }}>
            Studio Home
          </Link>{' '}
          — start writing, or{' '}
          <Link href={IMPORT_HREF} style={{ textDecoration: 'underline' }}>
            bring in existing writing
          </Link>
          .
        </StudioText>
      </div>
    );
  }

  if (!manuscript) return null;

  /* ══ THE WRITE-MODE BRANCH ══════════════════════════════════════════════
     The server resolved which engine may touch this draft. Every case below
     is one the server named; none is inferred here.

     `continuous` and `no_draft` reach the SAME unchanged Worktable — the
     second matters because Worktable owns first-draft creation
     (loadDraft → none → beginDraft), and treating the GET's 404 as an error
     would strand a newly imported manuscript.

     An unknown mode mounts NOTHING. Guessing continuous would let the
     whole-manuscript writer touch a draft that may already be
     section-authoritative, where one save overwrites every section at once. */
  if (writeMount.mount === 'pending') {
    return <StudioText role="metadata">opening…</StudioText>;
  }

  if (writeMount.mount === 'unavailable') {
    return (
      <div style={{ maxWidth: '44ch' }}>
        <StudioText role="prose" style={{ opacity: 0.8 }}>
          The writing surface could not be prepared just now. Nothing has been
          changed, and your writing is unaffected.
        </StudioText>
      </div>
    );
  }

  if (writeMount.mount === 'sections') {
    return (
      <SectionWritingSession
        manuscriptId={manuscript.id}
        sections={writeMount.sections}
        version={writeMount.version}
        witnessDelayMs={witnessDelayMs}
      >
        {(session) => (
          <SectionSurfaceBridge
            session={session}
            onWriting={onWriting}
            onSession={onSession}
            manuscriptId={manuscript.id}
            onCheckpointed={onCheckpointed}
            jumpTo={jumpTo}
            onJumpHandled={onJumpHandled}
            renderSectionOverlay={renderSectionOverlay}
          />
        )}
      </SectionWritingSession>
    );
  }

  return (
    <Worktable
      manuscriptId={manuscript.id}
      onMeta={onMeta}
      onCheckpointed={onCheckpointed}
      onWriteAuthorityChanged={onWriteAuthorityChanged}
    />
  );
}

/**
 * Publishes the section session upward so the outline renders from the SAME
 * one, then draws the surface. A second useSectionWriting for the outline
 * would give it a different queue, a different active id and statuses nobody
 * can see.
 */
/**
 * WS-WHOLE-MANUSCRIPT-01 — the outline, routed by the view in force.
 *
 * ⛔ PLACE IS OBSERVED, NOT BORROWED. In Whole view the gold current row must
 * come from what Whole observed; `writing.activeId` names the section the
 * writer arrived from. `placeForMode` returns null when nothing is known, and
 * that null reaches the outline unchanged — ManuscriptOutline already draws no
 * marker without a known current section, which is the correct behaviour and
 * not a gap to fill in.
 */
function outlinePlace(session: ManuscriptSession | null, writing: SectionWriting): string | null {
  if (!session) return writing.activeId;
  return placeForMode(session.view, {
    sectionActiveId: writing.activeId,
    wholePlaceId: session.wholePlaceId,
  });
}

/**
 * ⛔ AND NAVIGATION IS NOT OBSERVATION. In Whole view a rail click asks the
 * surface to bring that part of the book into view; it does NOT call
 * `goToSection`, which owns the single-editor switch and capture seam. Driving
 * it here would perform a real editor mutation to move a marker.
 */
function outlineSelect(
  session: ManuscriptSession | null,
  writing: SectionWriting,
  setJumpTo: (id: string) => void,
): (sectionId: string) => void {
  if (session?.view === 'whole') return setJumpTo;
  return writing.goToSection;
}

function SectionSurfaceBridge({
  session,
  onWriting,
  onSession,
  manuscriptId,
  onCheckpointed,
  jumpTo,
  onJumpHandled,
  renderSectionOverlay,
}: {
  session: ManuscriptSession;
  onWriting?: (w: SectionWriting | null) => void;
  onSession?: (s: ManuscriptSession | null) => void;
  manuscriptId: string;
  onCheckpointed?: () => void;
  jumpTo?: string | null;
  onJumpHandled?: () => void;
  /** Forwarded to the whole-manuscript surface untouched. Read-only mark only. */
  renderSectionOverlay?: (sectionId: string, body: string) => React.ReactNode;
}) {
  const { writing, view, changeView } = session;
  const whole = useRef<WholeManuscriptSurfaceHandle | null>(null);

  useEffect(() => {
    onWriting?.(writing);
    return () => onWriting?.(null);
  }, [writing, onWriting]);
  useEffect(() => {
    onSession?.(session);
    return () => onSession?.(null);
  }, [session, onSession]);

  return (
    <>
      {/* F-3 — the switch, at the top of the manuscript field. Quiet: two words
          and a rule, not a control panel. */}
      <div
        style={{
          display: 'flex', gap: SPACE.base, alignItems: 'baseline',
          marginBottom: SPACE.roomy,
        }}
        data-manuscript-view={view}
      >
        {(['section', 'whole'] as const).map((m) => (
          <button
            key={m}
            type="button"
            data-manuscript-view-choice={m}
            aria-pressed={view === m}
            onClick={() => {
              /* The capture is inside `changeView`, before the view moves —
                 leaving Whole unmounts every editor at once, and no scroll or
                 blur catches that. */
              changeView(m, () => whole.current?.captureMountedBeforeLeave());
            }}
            style={{
              background: 'transparent', border: 'none', padding: 0,
              cursor: 'pointer', font: 'inherit',
              opacity: view === m ? 1 : 0.45,
              textDecoration: view === m ? 'underline' : 'none',
              textUnderlineOffset: 5,
              color: 'inherit',
            }}
          >
            <StudioText role="metadata" as="span">
              {m === 'section' ? 'Section' : 'Whole manuscript'}
            </StudioText>
          </button>
        ))}
      </div>

      {view === 'whole' ? (
        <WholeManuscriptSurface
          ref={whole}
          writing={writing}
          initialOpenAt={session.wholeOpensAt}
          jumpTo={jumpTo}
          onJumpHandled={onJumpHandled}
          onPlaceChange={session.onWholePlace}
          renderSectionOverlay={renderSectionOverlay}
        />
      ) : (
        <SectionWritingSurface
          writing={writing}
          manuscriptId={manuscriptId}
          onCheckpointed={onCheckpointed}
        />
      )}
    </>
  );
}

function Bare({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACE.roomy,
        textAlign: 'center',
        background: GROUND.base,
        color: INK.primary,
      }}
    >
      <div style={{ maxWidth: '34ch' }}>
        <StudioText role="bandLabel" style={{ marginBottom: SPACE.base }}>
          Writer’s Studio
        </StudioText>
        <StudioText role="prose" style={{ opacity: 0.8, color: PRESS.text }}>
          {children}
        </StudioText>
      </div>
    </div>
  );
}

/**
 * THE ROUTE. The room reads its manuscript identity from route state, which
 * makes it a Suspense consumer; the boundary is here rather than around a
 * fragment of the room so the whole field arrives at once, never half-drawn.
 *
 * The fallback paints the Studio ground and nothing else. It is on screen
 * only between prerender and hydration, and every honest thing this room can
 * say — loading, refusing, asking, writing — needs the identity that is not
 * resolved yet. A spinner here would claim work was happening; a message
 * would have to guess which one. The ground is the truthful frame.
 */
export default function WritersStudioCanvasRoute() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: GROUND.base }} />}>
      <CanvasRoom />
    </Suspense>
  );
}
