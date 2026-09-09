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

import {
  forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect,
  useMemo, useRef, useState,
} from 'react';
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
/**
 * What a section is assumed to be tall before it has ever rendered.
 *
 * ⛔ A LAYOUT ESTIMATE, NOTHING MORE. It is replaced by the real height the
 * first time the section is measured, and no part of the system may read it as
 * a fact about the writing.
 */
const ESTIMATED_SECTION_HEIGHT = 320;

export interface WholeManuscriptSurfaceProps {
  writing: SectionWriting;
  /**
   * ⭐ WHERE WHOLE BEGINS — consumed ONCE, at entry. Not a command.
   *
   * `wholeOpensAt` was previously passed as `jumpTo ?? session.wholeOpensAt`,
   * which made an ARRIVAL COORDINATE and a NAVIGATION COMMAND interchangeable.
   * When a real rail jump completed and `jumpTo` returned to null, the arrival
   * value fell through and became a fresh command, and the window was yanked
   * back to where Whole had opened. The rail jump was undone by its own
   * completion — found by the runtime falsifier on `0cf26e22a`, check 5.
   *
   * The one-shot is structural rather than remembered: this surface is mounted
   * when the writer enters Whole and unmounted when they leave, so mount IS
   * entry, and the value is read once there and discarded.
   */
  initialOpenAt?: string | null;
  /**
   * A section the rail asked for: an actual navigation request, and nothing
   * else. ⛔ `null` here means THERE IS NO COMMAND. It must never mean "fall
   * back to some older command-shaped value" — that equivalence is precisely
   * the defect this separation repairs.
   */
  jumpTo?: string | null;
  /** Cleared once the jump has been honoured, so the same request cannot repeat. */
  onJumpHandled?: () => void;
  /**
   * ⭐ WHERE THE WRITER IS STANDING, in this view's own terms.
   *
   * NOT `writing.activeId`. That value belongs to the single-editor seam and,
   * in this view, would keep naming whatever section was open when the writer
   * arrived — so the rail's gold row and the URL would both assert a place the
   * writer left an hour ago. `ManuscriptOutline` draws that marker only when a
   * real current section is known, precisely because drawing it otherwise is a
   * confident guess.
   *
   * The place is the focused section if one has focus, else the first section
   * the viewport covers.
   */
  onPlaceChange?: (sectionId: string) => void;
}

/** What the parent may ask of a mounted surface. */
export interface WholeManuscriptSurfaceHandle {
  /**
   * ⛔ THE THIRD WAY AN EDITOR CAN DISAPPEAR. A section's editor leaves on
   * eviction, on blur — and when this whole surface leaves, which happens all at
   * once when the writer switches back to Section view.
   *
   * This must be called BEFORE the view changes. Not from an unmount cleanup:
   * by then React has already decided and the nodes being read are nodes the
   * writer can no longer see. Staging per keystroke is not a substitute — the
   * staged copy is only as new as the last debounce, and the point of capture
   * is the text on screen right now.
   */
  captureMountedBeforeLeave: () => void;
}

export const WholeManuscriptSurface = forwardRef<
  WholeManuscriptSurfaceHandle, WholeManuscriptSurfaceProps
>(function WholeManuscriptSurface({
  writing, initialOpenAt, jumpTo, onJumpHandled, onPlaceChange,
}, handleRef) {
  const sections = writing.sections;
  const indexOfId = useMemo(() => {
    const m = new Map<string, number>();
    sections.forEach((s, i) => m.set(s.id, i));
    return m;
  }, [sections]);

  /* Live editor values, by section id. Read at capture time so the text is the
     text on screen — never state, which may already have moved on. */
  const fields = useRef(new Map<string, HTMLTextAreaElement>());
  /**
   * ⭐ A SHELL FOR EVERY SECTION, MOUNTED OR NOT. Only the EDITOR is
   * virtualized; the shell that holds its place always exists.
   *
   * The first cut observed visibility from mounted editors alone, and that
   * made ordinary scrolling impossible: once the writer moved below the mounted
   * window nothing intersected the viewport, so `last` stayed -1, `commitWindow`
   * never ran, and the next sections never mounted. The rail worked only
   * because it bypasses the scroll path and commits a window directly. A view
   * whose whole purpose is continuous scrolling could not scroll.
   *
   * 262 lightweight divs are a different thing entirely from 262 live
   * textareas, and geometry has to come from something that is always there.
   */
  const shells = useRef(new Map<string, HTMLDivElement>());
  /**
   * The last height each section actually rendered at.
   *
   * ⛔ LAYOUT ESTIMATE ONLY — it carries no manuscript authority, is never
   * persisted, and nothing downstream may read it as a fact about the work. Its
   * one job is that evicting a long section does not collapse it to a stub and
   * yank the page out from under someone mid-read.
   */
  const heights = useRef(new Map<string, number>());

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
      /* Then its height, while the editor is still laid out. Measured after the
         capture, because the capture is the part that matters and must not be
         behind anything that could throw. */
      const shell = shells.current.get(section.id);
      if (shell && shell.offsetHeight > 0) heights.current.set(section.id, shell.offsetHeight);
      fields.current.delete(section.id);
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
    for (const [id, node] of shells.current) {
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

  /**
   * ARRIVAL — read once, then gone. Held in a ref that is emptied BEFORE the
   * value is used, so a re-render cannot find it again: there is no later
   * moment at which this coordinate can behave like a command.
   */
  const arrival = useRef<string | null>(initialOpenAt ?? null);
  useEffect(() => {
    const at = arrival.current;
    arrival.current = null;
    if (!at) return;
    const i = indexOfId.get(at);
    if (i === undefined) return;
    commitWindow({ first: i, last: i });
    setPendingScroll(at);
    /* Mount only. Entry is the lifecycle boundary this one-shot is anchored to,
       and re-running it on any later change would recreate the very fallback
       that check 5 caught. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const node = shells.current.get(pendingScroll);
    if (!node) return; /* not mounted yet — the next commit will bring it */
    node.scrollIntoView({ block: 'start' });
    setPendingScroll(null);
  }, [pendingScroll, mounted]);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), NOTE_MS);
    return () => clearTimeout(t);
  }, [note]);

  /* Every mounted editor, captured from its live value, in one named act the
     parent can call before it takes this surface away. */
  const captureMountedBeforeLeave = useCallback(() => {
    for (const [sectionId, field] of fields.current) {
      writing.captureForUnmount(sectionId, field.value);
    }
  }, [writing]);

  useImperativeHandle(handleRef, () => ({ captureMountedBeforeLeave }), [captureMountedBeforeLeave]);

  /* The orientation signal. Focus if there is any, else the top of the
     viewport — and only when it actually changes, so the parent is not told the
     same thing on every scroll frame. */
  const lastPlace = useRef<string | null>(null);
  useEffect(() => {
    const i = focusedIndex ?? visible.first;
    const id = sections[i]?.id ?? null;
    if (!id || id === lastPlace.current) return;
    lastPlace.current = id;
    onPlaceChange?.(id);
  }, [focusedIndex, visible.first, sections, onPlaceChange]);

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
        const isMounted = mounted.has(i);
        const body = isMounted ? writing.bodyOf(section.id) : '';
        return (
          <div
            key={section.id}
            ref={(n) => { if (n) shells.current.set(section.id, n); else shells.current.delete(section.id); }}
            data-whole-manuscript-section={section.id}
            data-whole-manuscript-mounted={isMounted ? 'true' : 'false'}
            style={{
              marginBottom: SPACE.generous,
              /* A shell whose editor is absent still occupies the space that
                 editor occupied, so the document's geometry does not move under
                 the writer as the window slides. A section never yet rendered
                 gets a rough estimate; the measured height replaces it the
                 first time it is real. */
              minHeight: isMounted ? undefined : (heights.current.get(section.id) ?? ESTIMATED_SECTION_HEIGHT),
            }}
          >
            {/* W-6 — the divisions recede. A hairline and breathing space, never
                a card or a box: nine obvious text boxes moving through a list is
                not a manuscript. But the writer can still tell where they are,
                because losing that is its own defect.

                It lives in the shell rather than beside the editor so the
                spacing is identical whether or not the editor is mounted. */}
            {i > 0 && (
              <div
                aria-hidden="true"
                style={{
                  height: 1, background: RULE.soft, opacity: 0.25,
                  margin: `0 auto ${SPACE.generous}px`, width: '38%',
                }}
              />
            )}
            {!isMounted ? null : section.editable ? (
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
});
