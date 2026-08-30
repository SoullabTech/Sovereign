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
 */

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { SectionSaveQueue, type SaveFn, type SectionStatus } from './sectionSaveQueue';

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

  const active = activeId ? sectionsById.get(activeId) ?? null : null;
  const activeBody = activeId
    ? (queue.localBody(activeId) ?? active?.body ?? '')
    : '';

  const edit = useCallback((body: string) => {
    if (!activeId) return;
    const section = sectionsById.get(activeId);
    if (!section?.editable) return;
    visibleBody.current = body;
    queue.enqueue(activeId, body);
  }, [activeId, queue, sectionsById]);

  const goToSection = useCallback((nextId: string) => {
    /* ORDER IS THE CONTRACT. Capture and enqueue the section being left BEFORE
       the active id changes — synchronously, from the ref, so the text read is
       the text on screen. */
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
    statusOf: (id) => queue.statusOf(id),
    edit,
    goToSection,
    hasUnsavedWork: () => queue.hasUnsavedWork(),
  };
}
