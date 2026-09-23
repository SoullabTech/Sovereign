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
 * WHAT THIS HOST DELIBERATELY DOES NOT EXPOSE (C1B)
 *   Aa · voice note · Comment · More · facet · Develop · Review ·
 *   Pure Canvas · chapter review. Each keeps its substrate intact behind its
 *   own routes; none is drawn here without a lawful action behind it. The only
 *   navigation asserted is Write, as non-interactive orientation.
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
 * TRUTHFUL STATUS
 *   Derived from the writing session's own per-section statuses. The fixture
 *   phrase of the controlled witness never reaches this file.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { useLivingWorks } from '../useLivingWorks';
import { currentWork, resolveWorkContext } from '../workContext';
import { chapterSpanFor, type RebuildSection } from '@/lib/writersStudio/rebuild/model';
import type { SectionWriting } from '@/lib/writersStudio/useSectionWriting';
import type { SectionStatus } from '@/lib/writersStudio/sectionSaveQueue';
import { locationForSection, replacePlaceAddress, resolveInitialSection, SECTION_PARAM } from '@/lib/writersStudio/placeInWork';
import { toWriteFoot, toWriteHeading, toWritePlace } from '@/lib/writersStudio/studio/adapters/writeView';
import { readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';
import { openBoundEditorialPassage, sendBoundEditorialTurn } from '@/lib/writersStudio/rebuild/editorialCollaboration';
import { StudioShell } from '../flagship/StudioChrome';
import { WriteFrame } from '../flagship/WriteFrame';
import RebuildWritingBoundary from './RebuildWritingBoundary';
import RebuildAuthoredBody, { type RebuildAuthoredBodyProps } from './RebuildAuthoredBody';
import { DiscussLayer, discussHighlight, type DiscussState } from './DiscussLayer';
import { commissionDiscuss, createInFlightGuard, resultAttaches, DISCUSS_COPY, type InFlightGuard } from './discussAct';

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

export interface FlagshipWriteViewProps {
  readonly context: ContextReady;
  /** The Work's own name, else the manuscript's own title, else null. ⛔ Never invented. */
  readonly workTitle: string | null;
  /** The member's own word for what the Work is becoming, or null. */
  readonly workForm: string | null;
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
}

const noAction = () => {};

/** The composition. Renders under react-dom/server; the laws render it directly. */
export function FlagshipWriteView({
  context, workTitle, workForm, focusId, held, onFocus, onHold, epoch = 0,
  editorialEnabled = false, discuss = null, onAskMaia = noAction, onSubmitAsk = noAction, onRelease = noAction, onWriting,
}: FlagshipWriteViewProps) {
  const focus = context.sections.find((s) => s.draftSectionId === focusId) ?? null;
  const span = focusId ? chapterSpanFor(context.sections, focusId) : null;
  const sections = span?.sections ?? (focus ? [focus] : []);
  const project = workTitle ? (workForm ? { workTitle, workKind: workForm } : { workTitle }) : undefined;

  return (
    <div className="fsw-viewport">
      <StudioShell current="write" destinations={['write']} affordance="orientation" project={project}>
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
            const bodies = sections.map((s) => writing.bodyOf(s.draftSectionId));
            const statuses = sections.map((s) => writing.statusOf(s.draftSectionId));
            const placeView = toWritePlace({ workTitle: workTitle ?? '', section: focus, span });
            const place = { ...placeView, work: workTitle ?? undefined };
            /* C1C1 — the ONE affordance, only while enabled + held + no panel open. */
            const askMaia = editorialEnabled && held && !discuss
              ? <button type="button" className="fs-btn fs-btn--key" data-event="ASK_MAIA" onClick={onAskMaia}>Ask MAIA</button>
              : undefined;
            const contextual = editorialEnabled
              ? <DiscussLayer discuss={discuss} focusSectionId={focusId} liveBodyOf={writing.bodyOf} onSubmit={onSubmitAsk} onRelease={onRelease} />
              : null;
            /* C1C1 — changed-passage law: an answered response whose locus no longer occurs exactly once carries no highlight. */
            const answeredAt = editorialEnabled ? discussHighlight(discuss, writing.bodyOf) : undefined;
            return (
              <WriteFrame
                place={place}
                status={truthfulStatus(statuses, writing.currentRevisionId())}
                heading={toWriteHeading(span)}
                foot={toWriteFoot({ span, bodies })}
                actions={askMaia}
                contextual={contextual}
              >
                {sections.map((section) => {
                  const id = section.draftSectionId;
                  const isRoot = span?.root.draftSectionId === id;
                  const selectionHere = held && held.sectionId === id ? { start: held.start, end: held.end } : null;
                  const heldHere = answeredAt && answeredAt.sectionId === id
                    && discuss && discuss.kind === 'answered' && held && held.sectionId === id
                    && held.start === discuss.held.start && held.end === discuss.held.end && held.text === discuss.held.text
                    ? answeredAt.range
                    : selectionHere;
                  return (
                    <section key={id} className="fsw-section fsw-body" data-flagship-section={id}
                      data-held-passage-address={heldHere ? `${heldHere.start}:${heldHere.end}` : undefined}>
                      {!isRoot && section.heading ? <h2 className="fsw-h2">{section.heading}</h2> : null}
                      <RebuildAuthoredBody {...authoredBodyProps(writing, section, heldHere, { onFocus, onHold })} />
                    </section>
                  );
                })}
              </WriteFrame>
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
}

export default function FlagshipWriteHost({ editorialEnabled = false }: FlagshipWriteHostProps = {}) {
  const params = useSearchParams();
  const requested = params?.get('m') ?? null;
  const requestedSection = params?.get(SECTION_PARAM) ?? null;
  const [phase, setPhase] = useState<Phase>('loading');
  const [context, setContext] = useState<ContextReady | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [held, setHeld] = useState<HeldPassageAt | null>(null);
  const { phase: worksPhase, works } = useLivingWorks();
  /* C1C1 — ephemeral Discuss state. ⛔ Not persisted, not derived from any thread list, not a machine phase. */
  const [discuss, setDiscuss] = useState<DiscussState | null>(null);
  const discussGen = useRef(0);
  const guard = useRef<InFlightGuard | null>(null);
  const writingRef = useRef<SectionWriting | null>(null);
  const focusRef = useRef<string | null>(null);
  focusRef.current = focusId;

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
    if (!text.trim()) return;
    setFocusId(sectionId);
    setHeld({ sectionId, start, end, text });
    replaceAddress(sectionId);
  }, [replaceAddress]);

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
    const ask = text.trim();
    if (!ask) return;
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
      if (!resultAttaches({ gen, held: commissioned }, { gen: discussGen.current, focusSectionId: focusRef.current })) return;
      if (outcome.ok) {
        setDiscuss({ kind: 'answered', held: commissioned, ask, threadId: outcome.threadId, locusText: outcome.locusText, reply: outcome.reply });
      } else if (outcome.stage !== 'in_flight') {
        setDiscuss({ kind: 'refused', held: commissioned, ask, copy: outcome.copy });
      }
    });
  }, [editorialEnabled, discuss]);

  const workContext = resolveWorkContext(worksPhase, works, context?.manuscriptId ?? null);
  const work = currentWork(workContext);

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
      focusId={focusId}
      held={held}
      onFocus={onFocus}
      onHold={onHold}
      editorialEnabled={editorialEnabled}
      discuss={discuss}
      onAskMaia={onAskMaia}
      onSubmitAsk={onSubmitAsk}
      onRelease={onRelease}
      onWriting={(writing) => { writingRef.current = writing; }}
    />
  );
}
