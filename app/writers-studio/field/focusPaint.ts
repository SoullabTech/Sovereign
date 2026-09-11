/**
 * WHAT A FOCUS ACTUALLY LOOKS LIKE, per treatment.
 *
 * ⭐ THE GAP THIS MODULE CLOSES. The study declares that A and C draw the focus
 * as a FRAME and B draws it as an INSET, and it treats `form` as part of a
 * mark's identity — that is what the collision falsifier compares. But the room
 * painted every treatment the same way, consuming only colour and weight. The
 * falsifier was therefore proving that the DECLARATIONS differ, while the
 * writer would have seen one treatment three times.
 *
 * ⛔ A study can pass its own specification and still show the writer something
 * else. Declaration is not rendering. This module is the place the two meet,
 * and it is pure so the meeting can be asserted rather than eyeballed.
 */

import type { Form, ResolvedMark } from './fieldTreatments';

/** A style object, kept plain so a test can compare it without a DOM. */
export type PaintStyle = Record<string, string | number>;

/**
 * A FRAME encloses. Every line fragment of the focused run gets the whole
 * outline, which is what makes it read as a deliberate aperture the writer drew
 * rather than as a margin note.
 */
function frame(color: string, weight: number): PaintStyle {
  const w = Math.max(weight, 1);
  return {
    background: 'transparent',
    boxShadow: `inset 0 0 0 ${w}px ${color}`,
    borderRadius: '3px',
    /* Without this a wrapped run gets one border around the whole fragmented
       box and the middle lines lose their edges entirely. */
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
    padding: '0.05em 0.15em',
    margin: '0 -0.15em',
  };
}

/**
 * An INSET marks from the side. It is the subordinate treatment: it says "this,
 * within where you already are" rather than "this, enclosed".
 */
function inset(color: string, weight: number): PaintStyle {
  const w = Math.max(weight, 2);
  return {
    background: 'transparent',
    borderLeft: `${w}px solid ${color}`,
    borderRadius: '0',
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
    paddingLeft: '0.35em',
    marginLeft: '-0.35em',
  };
}

/** A wash tints the run rather than bounding it. */
function wash(color: string): PaintStyle {
  return {
    background: `color-mix(in srgb, ${color} 18%, transparent)`,
    borderRadius: '2px',
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
  };
}

/**
 * The one place a form becomes a style. If a treatment's declared form has no
 * case here it paints NOTHING rather than falling back to another treatment's
 * look — a silent fallback is exactly how three treatments become one again.
 */
export function focusPaint(mark: ResolvedMark): PaintStyle | null {
  switch (mark.form) {
    case 'frame': return frame(mark.color, mark.weight);
    case 'inset': return inset(mark.color, mark.weight);
    case 'wash': return wash(mark.color);
    case 'row':
    case 'edge':
      /* Forms that belong to the rail and the orbit. Neither is a mark on the
         Work, and drawing one here would put a location or a thread into the
         writer's prose. */
      return null;
    default: return null;
  }
}

/** Which CSS property carries the form's meaning. Used by the conformance guard. */
export function bearingProperty(form: Form): string | null {
  switch (form) {
    case 'frame': return 'boxShadow';
    case 'inset': return 'borderLeft';
    case 'wash': return 'background';
    default: return null;
  }
}
