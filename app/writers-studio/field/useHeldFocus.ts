'use client';

/**
 * CAPTURING A HELD FOCUS WITHOUT TOUCHING THE ENGINE.
 *
 * ⭐ The substrate is not modified to obtain focus. This hook listens, from the
 * room, to selection events that bubble out of the Work, and reads the two
 * things the writer's own act already produced: WHICH SECTION, and WHICH
 * OFFSETS. Everything after that is `heldFocus.ts`, which is pure.
 *
 * Two shapes of section, because the substrate renders two:
 *   editable      <textarea>  → selectionStart / selectionEnd, natively
 *   read-only     <pre>       → the document selection, mapped to offsets
 *
 * ⛔ NO SUBSTITUTE NAVIGATION. Nothing here scrolls anything, and nothing here
 * moves the writer. Product Finding A's mechanism stays the only way a writer
 * travels through their book.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  capture, isValid, narrow as narrowLadder, widen as widenFocus,
  type BodyOf, type HeldFocus, type SectionRef,
} from './heldFocus';

const SECTION_ATTR = 'data-whole-manuscript-section';

/** Offsets of the document selection inside one element's text content. */
function offsetsWithin(el: HTMLElement): [number, number] | null {
  const sel = typeof window === 'undefined' ? null : window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!el.contains(range.commonAncestorContainer)) return null;
  const pre = range.cloneRange();
  pre.selectNodeContents(el);
  pre.setEnd(range.startContainer, range.startOffset);
  const start = pre.toString().length;
  return [start, start + range.toString().length];
}

export interface HeldFocusApi {
  focus: HeldFocus | null;
  /** Attach to the element that contains the Work. */
  rootRef: (node: HTMLElement | null) => void;
  widen: () => void;
  narrow: () => void;
  release: () => void;
  canWiden: boolean;
  canNarrow: boolean;
}

export function useHeldFocus(sections: SectionRef[], bodyOf: BodyOf): HeldFocusApi {
  const [focus, setFocus] = useState<HeldFocus | null>(null);
  const [ladder, setLadder] = useState<HeldFocus[]>([]);
  const node = useRef<HTMLElement | null>(null);
  /* Read through refs inside the native listener so re-subscribing is not
     needed on every keystroke — a listener torn down and rebuilt mid-selection
     is a listener that misses the selection. */
  const bodies = useRef(bodyOf);
  bodies.current = bodyOf;

  const onSelect = useCallback((e: Event) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const shell = target.closest?.(`[${SECTION_ATTR}]`) as HTMLElement | null;
    if (!shell) return;
    const sectionId = shell.getAttribute(SECTION_ATTR);
    if (!sectionId) return;

    let start: number | null = null;
    let end: number | null = null;
    if (target instanceof HTMLTextAreaElement) {
      start = target.selectionStart;
      end = target.selectionEnd;
    } else {
      const o = offsetsWithin(shell);
      if (o) [start, end] = o;
    }
    if (start === null || end === null || end <= start) return;

    const next = capture(sectionId, start, end, bodies.current);
    if (!next) return;
    /* A new selection starts a new ladder: the writer is framing something
       else, not narrowing what they framed before. */
    setLadder([]);
    setFocus(next);
  }, []);

  const rootRef = useCallback((n: HTMLElement | null) => {
    if (node.current) {
      node.current.removeEventListener('select', onSelect, true);
      node.current.removeEventListener('mouseup', onSelect, true);
      node.current.removeEventListener('keyup', onSelect, true);
    }
    node.current = n;
    if (n) {
      /* Capture phase, so a section that stops propagation cannot make the
         writer's own act invisible to the room. */
      n.addEventListener('select', onSelect, true);
      n.addEventListener('mouseup', onSelect, true);
      n.addEventListener('keyup', onSelect, true);
    }
  }, [onSelect]);

  useEffect(() => () => {
    if (!node.current) return;
    node.current.removeEventListener('select', onSelect, true);
    node.current.removeEventListener('mouseup', onSelect, true);
    node.current.removeEventListener('keyup', onSelect, true);
  }, [onSelect]);

  /**
   * ⛔ THE HELD FOCUS IS RELEASED, NEVER RELOCATED. Checked on every render
   * because the text can change on any keystroke, and a focus that outlived the
   * words it named would be pointing at something the writer never framed.
   */
  useEffect(() => {
    if (focus && !isValid(focus, bodyOf)) {
      setFocus(null);
      setLadder([]);
    }
  });

  const widen = useCallback(() => {
    setFocus((f) => {
      if (!f) return f;
      const next = widenFocus(f, sections, bodies.current);
      if (!next) return f;
      setLadder((l) => [...l, f]);
      return next;
    });
  }, [sections]);

  const narrow = useCallback(() => {
    setLadder((l) => {
      const r = narrowLadder(l);
      if (r.focus) setFocus(r.focus);
      return r.ladder;
    });
  }, []);

  const release = useCallback(() => {
    setFocus(null);
    setLadder([]);
  }, []);

  return {
    focus,
    rootRef,
    widen,
    narrow,
    release,
    canWiden: !!focus && focus.scale !== 'work',
    canNarrow: ladder.length > 0,
  };
}
