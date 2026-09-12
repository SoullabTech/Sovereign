/**
 * THE PASSAGE RESOLVER — one authority on passage geometry, consumed by BOTH
 * the currency preflight and the Ask crossing.
 *
 * ⭐⭐ FOUNDER RULING 2026-09-12, on FOCUS-W3:
 *
 *   Preflight and Ask consume the same resolver. If Ask would reject a passage
 *   for projectability, preflight cannot advertise it as ready.
 *
 * The witness produced exactly that contradiction — `panel: 5 ready`,
 * `actual: 4 read` — because two places answered two different questions:
 * currency ("does the historical anchor still correspond?") and projectability
 * ("can those coordinates be faithfully mapped into the body MAIA will read?").
 * Both are now answered here, once.
 *
 * ── ⛔ WHAT THIS MAY NOT DO ────────────────────────────────────────────────
 *
 * It may not compute the heading prefix. `splitStoredSection` is already the
 * authority for how stored text becomes the body the writer sees, and the
 * repair the codebase invites — `start - heading.length - 2` — is wrong twice:
 *
 *   1. it assumes the separator is exactly `\n\n`, and the projector accepts
 *      `\n` as well as the degenerate heading-only case;
 *   2. `.length` is UTF-16, and these offsets are CODE POINTS. A heading with
 *      one astral character would reintroduce the very drift R8 exists to
 *      forbid — through the fix.
 *
 * So the translation is taken from the prefix the projector actually returned,
 * measured with the project's own `codePointLength`.
 *
 *     stored-section coordinate
 *             ↓  splitStoredSection → headingPrefix
 *             ↓  codePointLength(headingPrefix)
 *     projected-body coordinate
 */

import { codePointBoundaries, codePointLength } from '@/lib/manuscript/draftSections';
import { splitStoredSection } from '@/lib/manuscript/sections/saveSection';
import { type SpacedRange } from '@/lib/manuscript/sections/coordinateSpace';

export type PassageRefusal =
  /** The section is present but this cut cannot project its body. */
  | 'section_not_projectable'
  /** ⭐ R9 · the range did not say what text its offsets address. */
  | 'coordinate_space_unknown'
  /** ⭐ R13 · a range in a space this resolver cannot translate from. */
  | 'coordinate_space_unsupported'
  /** The historical range begins inside the heading prefix. */
  | 'range_precedes_body'
  /** The translated range does not fit the current body. */
  | 'range_out_of_bounds';

export type PassageResolution =
  | {
      ok: true;
      /** The exact current text the historical range names, after translation. */
      text: string;
      /** The same span, now in `projected_section_body` coordinates. */
      inBody: SpacedRange;
      /** What was removed to get from stored to body, in code points. */
      prefixCodePoints: number;
    }
  | { ok: false; refusal: PassageRefusal };

export interface PassageInput {
  /** `manuscript_draft_sections.text` — the stored representation. */
  readonly storedText: string;
  /** The Source heading, or null. Passed to the projector, never parsed here. */
  readonly heading: string | null;
  readonly range: SpacedRange;
}

/**
 * ⭐ PURE. No database, no request. Every refusal is decided here, so the law
 * is falsifiable without a Postgres and a defect in it is a unit-test failure
 * rather than a mis-framed passage a writer never sees.
 */
export function resolveFocusPassage(input: PassageInput): PassageResolution {
  const { storedText, heading, range } = input;

  /* ⛔ R9 · A range with no space is refused. There is no default. */
  if (!range || typeof (range as { space?: unknown }).space !== 'string') {
    return { ok: false, refusal: 'coordinate_space_unknown' };
  }

  /* ⛔ R13 · `revision_content` offsets address a WHOLE KEPT VERSION, not this
     section. They have the same shape and are not the same thing: interpreting
     one as section-relative would silently name a span in another section. This
     resolver translates from the two section spaces only, and refuses the third
     at the contract boundary rather than guessing. */
  if (range.space === 'revision_content') {
    return { ok: false, refusal: 'coordinate_space_unsupported' };
  }

  /* ⭐ The projection authority. ⛔ Not re-derived, not approximated. */
  const split = splitStoredSection(storedText, heading);
  if (!split) return { ok: false, refusal: 'section_not_projectable' };

  const prefixCodePoints = codePointLength(split.headingPrefix);

  /* The translation, and the only arithmetic in this file. A range already in
     body coordinates needs none — R7's identity case is the same branch as a
     section with no heading, because the projector returns an empty prefix. */
  const start = range.space === 'projected_section_body'
    ? range.start : range.start - prefixCodePoints;
  const end = range.space === 'projected_section_body'
    ? range.end : range.end - prefixCodePoints;

  /* ⛔ A stored-space range that begins inside the heading prefix does not name
     a span of the member's body at all. Clamping it to 0 would hand MAIA a
     passage starting somewhere the writer never framed — and would do it most
     confidently where the heading was longest. */
  if (start < 0) return { ok: false, refusal: 'range_precedes_body' };
  if (end <= start) return { ok: false, refusal: 'range_out_of_bounds' };

  /* Resolved through the boundary table, never handed to `String.slice`, which
     indexes UTF-16 units and would return a lone surrogate on the first emoji. */
  const bounds = codePointBoundaries(split.body);
  if (end > bounds.length - 1) return { ok: false, refusal: 'range_out_of_bounds' };

  const text = split.body.slice(bounds[start], bounds[end]);
  if (text.length === 0) return { ok: false, refusal: 'range_out_of_bounds' };

  return {
    ok: true,
    text,
    inBody: { space: 'projected_section_body', start, end },
    prefixCodePoints,
  };
}

/**
 * ⭐ PROJECTABILITY, for the preflight — the same resolver, asked only whether
 * it could succeed.
 *
 * ⛔ It must be THIS function and not a re-implementation, or the preflight can
 * once again advertise a passage the Ask will reject on an unchanged snapshot.
 */
export function passageIsProjectable(input: PassageInput): boolean {
  return resolveFocusPassage(input).ok;
}
