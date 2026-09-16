import { codePointBoundaries, codePointLength } from '@/lib/manuscript/draftSections';
import { occurrences } from '@/lib/manuscript/exactText';

export interface EditorialSelectionRange {
  readonly start: number;
  readonly end: number;
}

export type SelectionProjection =
  | { readonly ok: true; readonly text: string; readonly range: EditorialSelectionRange }
  | { readonly ok: false; readonly reason: 'invalid_range' | 'empty_selection' | 'selection_ambiguous' };

/**
 * Project one member-selected passage out of the section body.
 *
 * The browser carries coordinates only. The server reads the Work and derives
 * the actual text here, so caller-supplied prose can never become the locus.
 * Coordinates are Unicode code points, matching the Studio's other passage
 * boundaries and PostgreSQL length semantics.
 */
export function projectEditorialSelection(
  body: string,
  range: EditorialSelectionRange,
): SelectionProjection {
  if (!Number.isInteger(range.start) || !Number.isInteger(range.end)
      || range.start < 0 || range.end < range.start
      || range.end > codePointLength(body)) {
    return { ok: false, reason: 'invalid_range' };
  }
  if (range.start === range.end) return { ok: false, reason: 'empty_selection' };
  const boundaries = codePointBoundaries(body);
  const text = body.slice(boundaries[range.start]!, boundaries[range.end]!);
  if (text.length === 0) return { ok: false, reason: 'empty_selection' };

  /* The proposal-chain locus persists text + section, not the chosen range.
     If the same wording appears twice, a later adoption could not distinguish
     the member's selected occurrence. Refuse the opening rather than silently
     choosing one. */
  if (occurrences(body, text) !== 1) {
    return { ok: false, reason: 'selection_ambiguous' };
  }
  return { ok: true, text, range };
}
