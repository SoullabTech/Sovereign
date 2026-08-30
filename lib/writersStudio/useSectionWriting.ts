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
): boolean {
  /* A read-only section has no text of the member's to capture. */
  if (!leaving?.editable) return false;

  /* Compare against what is already known — the pending/in-flight body if one
     exists, otherwise the server copy. Comparing against the server copy alone
     would re-enqueue text already queued, and comparing against nothing would
     enqueue on every switch. */
  const lastKnown = queue.localBody(leaving.id) ?? leaving.body;
  const changed = visibleBody !== lastKnown;
  /* Still dirty and unchanged since it was queued: nothing new to capture, and
     the queue is already carrying it. */
  if (!changed) return false;

  queue.enqueue(leaving.id, visibleBody);
  return true;
}

export function useSectionWriting(
  initialSections: WritingSection[],
  initialVersion: number,
  save: SaveFn,
): SectionWriting {
  const queue = useMemo(() => new SectionSaveQueue(initialVersion, save), [initialVersion, save]);
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
  void queueVersion;

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
     queue's copy and the server's. */
  void stagedTick;
  const activeBody = activeId
    ? (staged.current.get(activeId) ?? queue.localBody(activeId) ?? active?.body ?? '')
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
    captureOnLeave(queue, activeId ? sectionsById.get(activeId) ?? null : null, visibleBody.current);

    /* Now switch. Not awaited: the queue is already serialized, and blocking
       here would make navigation as slow as the network. */
    setActiveId(nextId);
    const next = sectionsById.get(nextId);
    visibleBody.current = queue.localBody(nextId) ?? next?.body ?? '';
  }, [activeId, queue, sectionsById]);

  return {
    sections: initialSections,
    activeId,
    active,
    activeBody,
    /* Staged-but-unflushed is dirty. Reporting `clean` while text sits in a
       debounce would tell the writer their words are safe before they are. */
    statusOf: (id) => (staged.current.has(id) ? 'dirty' : queue.statusOf(id)),
    edit,
    goToSection,
    hasUnsavedWork: () => staged.current.size > 0 || queue.hasUnsavedWork(),
  };
}
