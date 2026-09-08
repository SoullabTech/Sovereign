'use client';

/**
 * WS-WHOLE-MANUSCRIPT-01 — the book, flowing down the page.
 *
 *   A writer may return to a whole manuscript as a continuous living work
 *   without giving up the safety, identity, and editability of its sections.
 *
 * ⭐ THIS IS A VIEW OF THE SAME SECTIONS, NOT A SECOND MANUSCRIPT. Every section
 * remains its own editor control. There is no flattened buffer and no giant
 * `contenteditable` holding 262 nodes — that would reopen exactly the selection
 * and topology ambiguity F-2 and F-5 closed. The divisions recede visually; they
 * do not recede structurally.
 *
 * The component is deliberately thin, because everything that could lose or
 * repartition a member's work was decided in pure functions with their own
 * falsifiers, before any DOM existed:
 *
 *     sectionWindow.ts    what is mounted · what is leaving · the focus pin
 *     sectionBoundary.ts  which keystroke would reach past a section edge
 *     useSectionWriting   captureForUnmount · editSection · bodyOf
 *
 * So this file should read as: **predicate · capture · render.** Anything here
 * that starts making decisions of its own belongs in one of those instead.
 *
 * ── The two orderings that must not be got wrong ──────────────────────────
 *
 * ⛔ CAPTURE PRECEDES THE WINDOW STATE CHANGE (founder, 2026-09-08). Not an
 * unmount effect, not a cleanup callback — those run when React has already
 * decided. `commitWindow` reads each leaving editor's LIVE value from its own
 * ref and captures it before `setWindow` is called at all. A cleanup that ran
 * "on unmount" would be reading a node the writer can no longer see.
 *
 * ⛔ THE RAIL MOUNTS BEFORE IT SCROLLS. Clicking Section 218 while the window
 * sits around Section 20 has nothing to scroll to: the node does not exist. So
 * a jump captures, moves the window, and only then — once the destination ref
 * is real — scrolls. *The rail names where the writer wants to go; the windowing
 * quietly makes that place inhabitable.*
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { SectionWriting } from '@/lib/writersStudio/useSectionWriting';
import {
  evictedIndices, mountedIndices, type WindowInput,
} from '@/lib/writersStudio/sectionWindow';
import { BOUNDARY_NOTE, isBoundaryGesture } from '@/lib/writersStudio/sectionBoundary';
import { INK, RULE, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';

/** Sections kept alive beyond each edge of the viewport. */
const OVERSCAN = 3;
/** How long the boundary note stays. Long enough to read, short enough to forget. */
const NOTE_MS = 2400;

export interface WholeManuscriptSurfaceProps {
  writing: SectionWriting;
  /** A section the rail asked for. Mounted, then scrolled to. */
  jumpTo?: string | null;
  /** Cleared once the jump has been honoured, so the same request cannot repeat. */
  onJumpHandled?: () => void;
}

export function WholeManuscriptSurface({
  writing, jumpTo, onJumpHandled,
}: WholeManuscriptSurfaceProps) {
  const sections = writing.sections;
  const indexOfId = useMemo(() => {
    const m = new Map<string, number>();
    sections.forEach((s, i) => m.set(s.id, i));
    return m;
  }, [sections]);

  /* Live editor values, by section id. Read at capture time so the text is the
     text on screen — never state, which may already have moved on. */
  const fields = useRef(new Map<string, HTMLTextAreaElement>());
  /* Every mounted section's outer node, for scrolling to one. */
  const anchors = useRef(new Map<string, HTMLDivElement>());

  const [visible, setVisible] = useState({ first: 0, last: OVERSCAN * 2 });
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);

  const windowInput: WindowInput = useMemo(() => ({
    total: sections.length,
    firstVisible: visible.first,
    lastVisible: visible.last,
    overscan: OVERSCAN,
    focusedIndex,
  }), [sections.length, visible, focusedIndex]);

  const mounted = useMemo(() => mountedIndices(windowInput), [windowInput]);

  /**
   * The one transition. Capture every leaving editor from its live value, THEN
   * move the window.
   *
   * The eviction list comes from `evictedIndices`, which exists precisely so
   * this is a list the caller walks rather than a filter hidden in a render —
   * forgetting to walk it would be a visible omission.
   */
  const commitWindow = useCallback((next: { first: number; last: number }, nextFocus?: number | null) => {
    const nextInput: WindowInput = {
      ...windowInput,
      firstVisible: next.first,
      lastVisible: next.last,
      focusedIndex: nextFocus === undefined ? focusedIndex : nextFocus,
    };
    for (const i of evictedIndices(mounted, nextInput)) {
      const section = sections[i];
      if (!section) continue;
      const field = fields.current.get(section.id);
      /* The live value, from the node that still exists. */
      if (field) writing.captureForUnmount(section.id, field.value);
      fields.current.delete(section.id);
      anchors.current.delete(section.id);
    }
    if (nextFocus !== undefined) setFocusedIndex(nextFocus);
    setVisible(next);
  }, [focusedIndex, mounted, sections, windowInput, writing]);

  /* Which sections the viewport covers. Observed rather than computed from
     heights: sections differ in length, and guessing their geometry is how a
     virtual list ends up scrolling to the wrong place. */
  const scroller = useRef<HTMLDivElement | null>(null);
  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const top = el.scrollTop;
    const bottom = top + el.clientHeight;
    let first = Number.POSITIVE_INFINITY;
    let last = -1;
    for (const [id, node] of anchors.current) {
      const i = indexOfId.get(id);
      if (i === undefined) continue;
      const start = node.offsetTop;
      const end = start + node.offsetHeight;
      if (end >= top && start <= bottom) {
        if (i < first) first = i;
        if (i > last) last = i;
      }
    }
    if (last < 0) return;
    if (first !== visible.first || last !== visible.last) {
      commitWindow({ first: first === Number.POSITIVE_INFINITY ? 0 : first, last });
    }
  }, [commitWindow, indexOfId, visible.first, visible.last]);

  /* A rail request: capture, mount around the destination, and only then ask to
     scroll. The scroll itself waits for the node to exist. */
  useEffect(() => {
    if (!jumpTo) return;
    const i = indexOfId.get(jumpTo);
    if (i === undefined) { onJumpHandled?.(); return; }
    commitWindow({ first: i, last: i });
    setPendingScroll(jumpTo);
    onJumpHandled?.();
    /* commitWindow is intentionally not a dependency: re-running this on every
       window change would re-jump while the writer scrolls away. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpTo, indexOfId]);

  /* useLayoutEffect: the destination has just mounted, and scrolling after a
     paint would show the writer the wrong part of their book first. */
  useLayoutEffect(() => {
    if (!pendingScroll) return;
    const node = anchors.current.get(pendingScroll);
    if (!node) return; /* not mounted yet — the next commit will bring it */
    node.scrollIntoView({ block: 'start' });
    setPendingScroll(null);
  }, [pendingScroll, mounted]);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), NOTE_MS);
    return () => clearTimeout(t);
  }, [note]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    if (!isBoundaryGesture({
      key: e.key,
      selectionStart: el.selectionStart,
      selectionEnd: el.selectionEnd,
      valueLength: el.value.length,
    })) return;
    /* F-2. Refuse, and say so once, quietly. No merge offer, no modal, no
       structural command — merge, split and reorder are explicit acts owned
       elsewhere, and this view is for flow, not covert topology editing. */
    e.preventDefault();
    setNote(BOUNDARY_NOTE);
  }, []);

  return (
    <div
      ref={scroller}
      onScroll={onScroll}
      style={{ position: 'relative', height: '100%', overflowY: 'auto' }}
      data-whole-manuscript
    >
      {sections.map((section, i) => {
        if (!mounted.has(i)) {
          /* A placeholder holds the scroll position without holding an editor.
             Its height is the last one this section had, so the page does not
             jump as the window moves. */
          return (
            <div
              key={section.id}
              data-whole-manuscript-placeholder={section.id}
              style={{ minHeight: 320, marginBottom: SPACE.generous }}
              aria-hidden="true"
            />
          );
        }
        const body = writing.bodyOf(section.id);
        return (
          <div
            key={section.id}
            ref={(n) => { if (n) anchors.current.set(section.id, n); }}
            data-whole-manuscript-section={section.id}
            style={{ marginBottom: SPACE.generous }}
          >
            {/* W-6 — the divisions recede. A hairline and breathing space, never
                a card or a box: nine obvious text boxes moving through a list is
                not a manuscript. But the writer can still tell where they are,
                because losing that is its own defect. */}
            {i > 0 && (
              <div
                aria-hidden="true"
                style={{
                  height: 1, background: RULE.soft, opacity: 0.25,
                  margin: `0 auto ${SPACE.generous}px`, width: '38%',
                }}
              />
            )}
            {section.editable ? (
              <textarea
                ref={(n) => { if (n) fields.current.set(section.id, n); }}
                value={body}
                onChange={(e) => writing.editSection(section.id, e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => setFocusedIndex(i)}
                onBlur={() => {
                  /* Capture on blur as well as on eviction: the pin releases
                     here, and a section that loses focus far from the viewport
                     becomes evictable on the very next scroll. */
                  const field = fields.current.get(section.id);
                  if (field) writing.captureForUnmount(section.id, field.value);
                  setFocusedIndex((cur) => (cur === i ? null : cur));
                }}
                spellCheck
                aria-label={section.heading ?? `Section ${section.position + 1}`}
                rows={Math.max(3, Math.ceil(body.length / 70))}
                style={{
                  width: '100%', resize: 'none', border: 'none', outline: 'none',
                  background: 'transparent', font: 'inherit', lineHeight: 1.7,
                  color: 'inherit', overflow: 'hidden',
                }}
              />
            ) : (
              <StudioText role="prose" as="pre" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                {body}
              </StudioText>
            )}
          </div>
        );
      })}

      {note && (
        <div
          role="status"
          data-whole-manuscript-note
          style={{
            position: 'sticky', bottom: SPACE.base, textAlign: 'center',
            pointerEvents: 'none', color: INK.quiet,
          }}
        >
          <StudioText role="metadata" tone="quiet">{note}</StudioText>
        </div>
      )}
    </div>
  );
}
