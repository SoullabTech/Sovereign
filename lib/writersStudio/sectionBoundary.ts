/**
 * WS-WHOLE-MANUSCRIPT-01 · F-2 — the section edge, decided before any DOM.
 *
 * Whole Manuscript looks continuous. It is not one buffer: every section stays
 * its own editor control, so *visual continuity does not create a shared mutable
 * text buffer* (F-5 falls out of the same decision — a selection cannot span two
 * separate controls, so cross-section selection is natively unavailable rather
 * than forbidden by a rule someone must remember).
 *
 * What remains is the one gesture that would reach past an edge anyway:
 * Backspace with the caret at the very start, Delete with it at the very end.
 * In a single flattened document those merge two paragraphs. Here they would
 * have to merge two CANONICAL SECTIONS — a topology change, which W-2 and W-3
 * reserve for explicit structural acts.
 *
 * So this predicate exists to make the edge BORING: it fires, the handler calls
 * preventDefault, a quiet line says sections stay separate, and nothing else
 * happens. No merge offer, no modal, no structural command, no mutation.
 *
 * ⛔ UTF-16 ON PURPOSE (founder, 2026-09-08). `selectionStart`, `selectionEnd`
 * and `value.length` are the editor's own UTF-16 coordinates, and this test asks
 * only whether the caret sits at absolute 0 or absolute end — a question every
 * encoding answers identically. It must NOT be converted into the manuscript's
 * Unicode code-point space: that conversion is for evidence ranges, where an
 * off-by-one names the wrong characters of a member's book. Here it would add a
 * translation step to a comparison that cannot be wrong without it.
 */

/** What a keydown carries, and nothing more. No DOM node, no React event. */
export interface BoundaryProbe {
  key: string;
  /** `null` when the control cannot report a caret — then the answer is "not a boundary". */
  selectionStart: number | null;
  selectionEnd: number | null;
  /** `value.length`, in the same UTF-16 units as the selection offsets. */
  valueLength: number;
}

/**
 * Would this keystroke reach past the edge of its section?
 *
 * Only a COLLAPSED caret can: a selection with a range deletes what it covers
 * and stops there, which is ordinary editing wherever it sits.
 *
 * ⛔ Modifiers do not open a second door. Alt+Backspace (delete word) and
 * Meta+Backspace (delete to start of line) at offset 0 are the same gesture
 * asking for the same forbidden thing, so this deliberately does not inspect
 * them — a predicate that ignored modified keys would leave the boundary open
 * to every writer who uses the shortcuts.
 */
export function isBoundaryGesture(probe: BoundaryProbe): boolean {
  const { key, selectionStart, selectionEnd, valueLength } = probe;
  if (key !== 'Backspace' && key !== 'Delete') return false;
  /* A control that cannot report its caret cannot be shown to be at an edge,
     and refusing on a guess would block ordinary editing. */
  if (selectionStart === null || selectionEnd === null) return false;
  if (selectionStart !== selectionEnd) return false;
  return key === 'Backspace' ? selectionStart === 0 : selectionStart === valueLength;
}

/**
 * What the writer is told. One line, transient, in their language — not
 * "topology", not "canonical section", not an error.
 */
export const BOUNDARY_NOTE = 'Sections stay separate here.';
