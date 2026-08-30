/**
 * WS2-04B — the writing surface's state, and the switch seam.
 *
 * The queue owns the data guarantees. This owns exactly one thing the queue
 * cannot: THE ORDER OF OPERATIONS WHEN THE WRITER LEAVES A SECTION.
 *
 * Founder contract, 2026-08-30:
 *
 *     capture A's current body
 *     enqueue(A, that exact snapshot)
 *     switch activeSection → B          ← immediately, never awaited
 *
 * The capture must be SYNCHRONOUS and must happen BEFORE the active section
 * changes. Relying on a later blur to notice A was dirty means B has already
 * mounted, the editor's value now belongs to B, and whatever is read at that
 * point is either B's text or nothing — which is how a section switch silently
 * discards the last thing someone typed.
 *
 * The switch is never awaited. The queue already serializes at the draft level,
 * so waiting adds no safety and turns persistence latency into navigation
 * latency. Chapter 18 opens now; Chapter 17 saves behind it.
 *
 * AND A KEYSTROKE IS NOT A LOGICAL SAVE. The queue is the save serializer, not
 * the typing transport — enqueueing on every character would put one database
 * transaction, and one full-manuscript aggregation, behind each letter. Typing
 * STAGES text locally and marks the section dirty; the staged snapshot reaches
 * the queue on the autosave timer, on a section switch, or when the page is
 * hidden. That is the discipline the continuous editor already keeps, and the
 * section cut inherits it rather than quietly dropping it.
 *
 * The switch seam is cleaner for it: Chapter 17 may have a debounce timer
 * pending, and captureOnLeave forces the exact visible snapshot into the queue
 * before Chapter 18 mounts, so the timer never races the navigation.
 */

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { SectionSaveQueue, type SaveFn, type SectionStatus } from './sectionSaveQueue';
import { AUTOSAVE_DELAY_MS } from '@/app/press/manuscript/workingDraftClient';

export interface WritingSection {
  id: string;
  position: number;
  heading: string | null;
  body: string;
  editable: boolean;
}

export interface SectionWriting {
  sections: WritingSection[];
  activeId: string | null;
  active: WritingSection | null;
  /** The text to render for the active section — local if pending, else server. */
  activeBody: string;
  statusOf: (sectionId: string) => SectionStatus;
  /** Record a keystroke in the active section. */
  edit: (body: string) => void;
  /** Leave for another section. Captures, enqueues, then switches. */
  goToSection: (nextId: string) => void;
  hasUnsavedWork: () => boolean;
}

/**
 * The switch seam, as a pure function.
 *
 * Extracted from the hook so it can be tested without rendering: this is the
 * one place where a wrong order loses a member's last sentence, and it should
 * not be provable only by clicking.
 *
 * Returns true when the leaving section's text was captured.
 */
export function captureOnLeave(
  queue: Pick<SectionSaveQueue, 'localBody' | 'statusOf' | 'enqueue'>,
  leaving: WritingSection | null,
  visibleBody: string,
  /**
   * What the server is known to hold for this section NOW — the body the last
   * successful save persisted, falling back to the body the page loaded with.
   *
   * Comparing against `leaving.body` forever is wrong once anything has been
   * saved: after a successful save the initial body is stale, so leaving the
   * section would re-enqueue an edit that is already persisted.
   */
  persistedBody?: string,
): boolean {
  /* A read-only section has no text of the member's to capture. */
  if (!leaving?.editable) return false;

  /* Compare against what is already known — the pending/in-flight body if one
     exists, else what was last persisted, else the body the page loaded. */
  const lastKnown = queue.localBody(leaving.id) ?? persistedBody ?? leaving.body;
  const changed = visibleBody !== lastKnown;
  /* Still dirty and unchanged since it was queued: nothing new to capture, and
     the queue is already carrying it. */
  if (!changed) return false;

  queue.enqueue(leaving.id, visibleBody);
  return true;
}

/**
 * How a section's queue status and its staged text combine. PURE.
 *
 * Extracted so the precedence is provable rather than read: it is the rule that
 * decides whether a writer sees "needs attention" or "unsaved", and getting it
 * backwards hides a conflict behind the keystrokes that cannot resolve it.
 */
export function resolveSectionStatus(
  queueStatus: SectionStatus,
  hasStagedText: boolean,
): SectionStatus {
  /* A LATCHED CONFLICT OUTRANKS EVERYTHING. Typing more does not reconcile two
     versions, so a staged edit must not turn "needs attention" back into
     "unsaved". An `error` MAY become `dirty` — that new body is headed for a
     safe version-checked retry — but a conflict may not disappear until the
     member has reconciled it. */
  if (queueStatus === 'conflict') return 'conflict';
  /* Staged-but-unflushed is dirty. Reporting `clean` while text sits in a
     debounce would tell the writer their words are safe before they are. */
  if (hasStagedText) return 'dirty';
  return queueStatus;
}

/**
 * Retire a queue whose draft is being left. PURE.
 *
 * A different draft is allowed to create a different queue. It is NOT allowed
 * to make a staged, debounced or pending body disappear — intentional data
 * loss is still data loss. Every unsent snapshot goes into the OUTGOING
 * queue, which owns those rows, before it is let go.
 *
 * An already in-flight save may resolve normally; it belongs to the old draft
 * and writes only into the old draft's persisted map, which the new one never
 * reads.
 *
 * Returns how many bodies were flushed.
 */
export function retireQueue(
  queue: Pick<SectionSaveQueue, 'enqueue'>,
  staged: Map<string, string>,
): number {
  let flushed = 0;
  for (const [sectionId, body] of staged) {
    queue.enqueue(sectionId, body);
    flushed++;
  }
  staged.clear();
  return flushed;
}

export function useSectionWriting(
  initialSections: WritingSection[],
  initialVersion: number,
  save: SaveFn,
  /**
   * The writing session's identity — the manuscript or draft being edited.
   *
   * The queue's lifetime is THIS, not a render. Keying it on the `save`
   * callback's identity meant an inline arrow from the canvas, or any parent
   * re-render, could construct a fresh queue and discard its pending and
   * in-flight state — silently dropping saves that were about to happen.
   * Resetting is now something a different draft causes, deliberately, and
   * nothing else can.
   */
  draftKey: string,
): SectionWriting {
  /* The latest save function, reachable without making it a reset signal. */
  const saveRef = useRef(save);
  saveRef.current = save;

  /* Queue AND persisted map are created together and belong to one draft.
     Scoping the map to the queue is what stops a late completion from the
     previous draft writing into this one's baseline: the old wrapper closes
     over the old map, which nothing here reads. */
  const session = useMemo(() => {
    const persisted = new Map<string, string>();
    const queue = new SectionSaveQueue(initialVersion, async (sectionId, body, baseVersion) => {
      const outcome = await saveRef.current(sectionId, body, baseVersion);
      /* Bank what was actually persisted, here, where both the body and the
         outcome are in hand — and into THIS draft's map only. */
      if (outcome.ok) persisted.set(sectionId, body);
      return outcome;
    });
    return { queue, persisted };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);
  const queue = session.queue;
  const persisted = session.persisted;
  void initialVersion;
  const [activeId, setActiveId] = useState<string | null>(initialSections[0]?.id ?? null);

  /* The visible text of the active section, held in a ref so the switch handler
     can read it synchronously. State alone would not do: a click handler must
     see what is on screen right now, not what a render pass last committed. */
  const visibleBody = useRef<string>(initialSections[0]?.body ?? '');
  const sectionsById = useMemo(
    () => new Map(initialSections.map((s) => [s.id, s])), [initialSections]);

  /* Re-render when the queue changes so outline markers stay live. */
  const queueVersion = useSyncExternalStore(
    useCallback((cb) => queue.onChange(cb), [queue]),
    () => queue.state().inFlight + '|' + queue.state().pending.join(',') +
          '|' + queue.state().conflicted.join(',') + '|' + queue.state().errored.join(','),
    () => 'server',
  );

  /* Text typed but not yet handed to the queue. A section is dirty from the
     first keystroke; it is only SAVED on a flush. */
  const staged = useRef(new Map<string, string>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [stagedTick, setStagedTick] = useState(0);

  const flush = useCallback((sectionId: string) => {
    const text = staged.current.get(sectionId);
    if (text === undefined) return;
    staged.current.delete(sectionId);
    queue.enqueue(sectionId, text);
    setStagedTick((n) => n + 1);
  }, [queue]);

  const active = activeId ? sectionsById.get(activeId) ?? null : null;
  /* Staged text is the newest thing that exists, so it outranks both the
     queue's copy and the server's. stagedTick is what makes a staged edit
     produce a render at all — the map itself is a ref. */
  void stagedTick;
  const activeBody = activeId
    ? (staged.current.get(activeId)
        ?? queue.localBody(activeId)
        ?? persisted.get(activeId)
        ?? active?.body
        ?? '')
    : '';

  const edit = useCallback((body: string) => {
    if (!activeId) return;
    const section = sectionsById.get(activeId);
    if (!section?.editable) return;
    visibleBody.current = body;
    staged.current.set(activeId, body);
    setStagedTick((n) => n + 1);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => flush(activeId), AUTOSAVE_DELAY_MS);
  }, [activeId, flush, sectionsById]);

  /* RETIREMENT. When the draft changes, the outgoing queue takes every unsent
     body with it before it is let go. React runs this cleanup with the OLD
     queue still captured, which is exactly the ordering the invariant needs:
     the flush lands in the queue that owns those section rows. */
  useEffect(() => {
    const outgoing = queue;
    const pendingTimer = timer;
    return () => {
      if (pendingTimer.current) { clearTimeout(pendingTimer.current); pendingTimer.current = null; }
      retireQueue(outgoing, staged.current);
    };
  }, [queue]);

  /* Leaving the page is a flush point, exactly as it is for the continuous
     editor: staged text that never reached the queue would be lost with the
     tab, and losing it silently is worse than an extra save. */
  useEffect(() => {
    const flushAll = () => {
      if (timer.current) clearTimeout(timer.current);
      for (const id of [...staged.current.keys()]) flush(id);
    };
    const onHide = () => { if (document.visibilityState === 'hidden') flushAll(); };
    window.addEventListener('pagehide', flushAll);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('pagehide', flushAll);
      document.removeEventListener('visibilitychange', onHide);
      flushAll();
    };
  }, [flush]);

  const goToSection = useCallback((nextId: string) => {
    /* ORDER IS THE CONTRACT. Capture and enqueue the section being left BEFORE
       the active id changes — synchronously, from the ref, so the text read is
       the text on screen. */
    /* A pending debounce must not fire against the section we are leaving
       after the active id has moved on. */
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    if (activeId) staged.current.delete(activeId);
    const leaving = activeId ? sectionsById.get(activeId) ?? null : null;
    captureOnLeave(queue, leaving, visibleBody.current,
      leaving ? persisted.get(leaving.id) : undefined);

    /* Now switch. Not awaited: the queue is already serialized, and blocking
       here would make navigation as slow as the network. */
    setActiveId(nextId);
    const next = sectionsById.get(nextId);
    visibleBody.current =
      staged.current.get(nextId)
      ?? queue.localBody(nextId)
      ?? persisted.get(nextId)
      ?? next?.body
      ?? '';
  }, [activeId, queue, sectionsById]);

  const statusOf = useCallback(
    (id: string) => resolveSectionStatus(queue.statusOf(id), staged.current.has(id)),
    // queueVersion and stagedTick are the observable revisions this reads
    // through; without them the callback would close over a stale view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queue, queueVersion, stagedTick],
  );

  const hasUnsavedWork = useCallback(
    () => staged.current.size > 0 || queue.hasUnsavedWork(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queue, queueVersion, stagedTick],
  );

  /**
   * THE PUBLISHED SESSION MUST BE REFERENTIALLY STABLE.
   *
   * The Canvas lifts this object into state so the outline and the surface
   * share one session. If the hook returned a fresh literal every render, that
   * publication would feed itself:
   *
   *     session renders W1 → published → parent setState → parent rerenders
   *     → session rerenders → W2 → published → … forever
   *
   * It is not the two-session bug; it is one session republished by unstable
   * identity. So the object changes only when something observable about the
   * writing changes — the active section, the visible text, or a queue/staged
   * revision. A keystroke publishes exactly one new snapshot, and the rerender
   * that publication causes receives the same object, so it terminates.
   */
  return useMemo(
    () => ({
      sections: initialSections,
      activeId,
      active,
      activeBody,
      statusOf,
      edit,
      goToSection,
      hasUnsavedWork,
    }),
    [initialSections, activeId, active, activeBody, statusOf, edit, goToSection, hasUnsavedWork],
  );
}
