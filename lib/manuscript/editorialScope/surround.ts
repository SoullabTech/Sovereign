/**
 * WS-EDITORIAL-SCOPE-01 · READ SCOPE — THE SECTION AROUND THE PASSAGE.
 *
 * ⭐⭐ THE OTHER HALF OF THE SAME LAW. `contract.ts` bounds what a proposal may
 * CHANGE; this bounds what MAIA may READ, and gives it its own address so the
 * two are visibly one family rather than a rule and an accident.
 *
 * ⛔ IT LIVES HERE AND NOT IN THE ASSEMBLY because it is pure and must be
 * falsifiable without a database. A locating rule buried in a module that
 * imports `pg` is a rule nobody tests.
 *
 * ⚠️ THE DEFECT IT CLOSES. Until 2026-09-20 the surrounding section reached
 * cognition INSIDE THE WRITER'S OWN MESSAGE, pasted there by the surface as
 * *"Current section context (reference only)"*. The distinction between
 * material MAIA may read and words she may change was therefore a parenthetical
 * in prose, carried by a producer whose provenance says *this is what the member
 * said to you*. ⛔ It was not what the member said. It was the Work wearing the
 * member's voice.
 */

import { occurrences } from '@/lib/manuscript/exactText';

/**
 * ⭐ HOW MUCH SECTION TRAVELS WITH THE PASSAGE, per side.
 *
 * ⛔ A bound, not a preference. An unbounded surround puts a whole chapter into
 * every turn, and a chapter of context is how an editor starts answering
 * questions nobody asked. ⭐ Generous enough that a passage is read inside its
 * own argument; the elision is STATED when it bites, never silent.
 */
export const SURROUND_CHARS_PER_SIDE = 4000;

export interface Surround {
  readonly before: string;
  readonly after: string;
  /** ⭐ True when a long section was windowed. ⛔ Never a silent elision. */
  readonly truncated: boolean;
}

/**
 * ⭐ The writer's section on either side of the passage, or `null`.
 *
 * ⛔⛔ `null` WHEN THE PASSAGE IS NOT UNIQUELY LOCATABLE, and that absence is
 * reported rather than approximated. The exact-once law is the same one
 * acceptance uses: a surround built around *"the first occurrence"* would be a
 * section that does not exist, shown to MAIA as though it did — and she would
 * reason about a neighbourhood the writer is not in.
 *
 * ⛔ No fuzzy locate, no normalisation, no nearest match. `occurrences` is the
 * neutral Work law and this defers to it rather than restating it.
 */
export function surroundOf(sectionBody: string, passage: string): Surround | null {
  if (passage === '') return null;
  if (occurrences(sectionBody, passage) !== 1) return null;

  const at = sectionBody.indexOf(passage);
  const rawBefore = sectionBody.slice(0, at);
  const rawAfter = sectionBody.slice(at + passage.length);

  /* ⭐ The window keeps the text NEAREST the passage on each side — the end of
     what came before, the start of what comes after. ⛔ Not the opening of the
     section, which is the part least likely to explain the passage. */
  const before = rawBefore.length > SURROUND_CHARS_PER_SIDE
    ? rawBefore.slice(rawBefore.length - SURROUND_CHARS_PER_SIDE)
    : rawBefore;
  const after = rawAfter.length > SURROUND_CHARS_PER_SIDE
    ? rawAfter.slice(0, SURROUND_CHARS_PER_SIDE)
    : rawAfter;

  return {
    before, after,
    truncated: before.length !== rawBefore.length || after.length !== rawAfter.length,
  };
}
