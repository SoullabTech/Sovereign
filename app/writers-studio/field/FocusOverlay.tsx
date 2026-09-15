'use client';

/**
 * THE FOCUS OVERLAY — a read-only mirror, never a second manuscript.
 *
 * ⭐ WHY IT EXISTS. The focus model is character-exact, but the room could only
 * paint whole sections, so widening a sentence to its paragraph changed nothing
 * a writer could see. Acts 3 and 4 were mechanically available and visually
 * indistinguishable, which is not a study.
 *
 * ⛔ WHAT IT IS NOT, and these are the limits it is built to:
 *
 *   The <textarea> remains the sole editable manuscript control. This is not a
 *   contentEditable replacement and not a second editable manuscript.
 *
 *   It is DERIVED, never authoritative. Its text is the current body, passed in
 *   by the surface that owns it. It holds no state, saves nothing, captures
 *   nothing, and owns no part of write authority, autosave or eviction.
 *
 *   It is inert: `aria-hidden`, `pointer-events: none`, no handlers. A screen
 *   reader hears the textarea, once. Nothing here can be clicked, focused,
 *   selected, or typed into.
 *
 *   It moves nobody. No scrolling, no navigation — Finding A's mechanism stays
 *   the only way a writer travels through their book.
 *
 * It renders the whole body in transparent ink so that glyphs land exactly
 * where the textarea puts them, and marks only the focused run. What the writer
 * sees is the mark; what they read is still their own text, in the control they
 * are typing into.
 */

import type { CSSProperties } from 'react';
import type { PaintStyle } from './focusPaint';

export interface FocusOverlayProps {
  /** The section's current text, exactly as the editor holds it. */
  body: string;
  /** Offsets of the focused run within `body`. */
  start: number;
  end: number;
  /** The treatment's focus paint. `null` paints nothing at all. */
  paint: PaintStyle | null;
}

/**
 * Must match the editor's own metrics exactly, or the mirror drifts from the
 * text it is marking. The surface pairs this with `padding: 0` on the textarea
 * whenever an overlay is in play, so both boxes start from the same origin.
 */
const MIRROR: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  font: 'inherit',
  lineHeight: 1.7,
  padding: 0,
  margin: 0,
  border: 'none',
  color: 'transparent',
  overflow: 'hidden',
};

export default function FocusOverlay({ body, start, end, paint }: FocusOverlayProps) {
  if (!paint || end <= start) return null;
  const a = Math.max(0, Math.min(start, body.length));
  const b = Math.max(a, Math.min(end, body.length));
  return (
    <div aria-hidden="true" data-field-focus-overlay style={MIRROR}>
      {body.slice(0, a)}
      <span data-field-focus-mark style={paint as CSSProperties}>{body.slice(a, b)}</span>
      {body.slice(b)}
    </div>
  );
}
