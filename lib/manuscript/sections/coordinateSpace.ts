/**
 * COORDINATE SPACE — what text an offset is an offset INTO.
 *
 * ⭐⭐ THE LAW, ratified 2026-09-12 after FOCUS-W3:
 *
 *   An identifier is meaningless without its namespace.
 *   An offset is meaningless without its text.
 *
 * ── WHAT HAPPENED ──────────────────────────────────────────────────────────
 *
 * A developmental passage anchor carried `{ start: 22, end: 1692 }` — code
 * points into the section AS READ, which is the STORED text, heading prefix
 * included. The Focus crossing applied it to the PROJECTED body, which is the
 * stored text with that prefix removed. Two different origins, one shape.
 *
 *   §56  stored 1692 · prefix 23 · body 1669
 *        range ends at exactly 1692 → overflowed the body → REFUSED ✅
 *   §45  stored 2874 · prefix 41 · body 2833
 *        range 60–1700 → FIT → handed over shifted by 41 characters ⛔
 *
 * The refusal was the lucky half. ⛔ A SUCCESSFUL SLICE IN THE WRONG SPACE IS
 * MORE DANGEROUS THAN A REFUSAL, because nothing anywhere says it happened.
 *
 * ── THE THREE SPACES THAT ALREADY EXIST ────────────────────────────────────
 *
 * All three are Unicode CODE POINTS. They differ only in origin, which is
 * exactly why they were interchangeable and must stop being:
 *
 *   stored_section_text       offsets into `manuscript_draft_sections.text` —
 *                             the stored representation, heading prefix
 *                             INCLUDED. Developmental passage evidence
 *                             (`PassageRef.range`) is in this space.
 *
 *   projected_section_body    offsets into what `splitStoredSection` returns as
 *                             `body` — what the writer sees and edits. A
 *                             passage selected directly in the Canvas would
 *                             naturally arrive in this space.
 *
 *   revision_content          offsets into a whole immutable revision's
 *                             content. `readState.sections[id].range` and
 *                             `RevisionSectionRange` are in this space — a
 *                             THIRD origin, already coexisting with the other
 *                             two, with the same `{start, end}` shape.
 *
 * ⛔ These must never be structurally interchangeable merely because each is
 * `{ start, end }`. A bare range is an attractive lie: it type-checks
 * everywhere and is correct almost nowhere.
 */

/** ⛔ Not a string union used loosely — the space travels WITH every offset. */
export type CoordinateSpace =
  | 'stored_section_text'
  | 'projected_section_body'
  | 'revision_content';

/**
 * A code-point range that knows what it is a range into.
 *
 * ⭐ `space` is required and has no default. A default would reintroduce the
 * defect the moment someone constructed a range without thinking about it —
 * which is precisely how FOCUS-W3 happened.
 */
export interface SpacedRange {
  readonly space: CoordinateSpace;
  /** Inclusive start, in Unicode CODE POINTS. */
  readonly start: number;
  /** Exclusive end, in the same unit and the same space. */
  readonly end: number;
}

export const isCoordinateSpace = (v: unknown): v is CoordinateSpace =>
  v === 'stored_section_text' || v === 'projected_section_body' || v === 'revision_content';

/**
 * ⭐ R9 · A range without a recognised space is REFUSED, never assumed.
 *
 * ⛔ There is deliberately no "and if it's missing, treat it as X". Assuming a
 * space is the whole defect, and an assumption that is right today is a
 * time bomb the day a second producer appears.
 */
export function spacedRange(v: unknown): SpacedRange | null {
  if (!v || typeof v !== 'object') return null;
  const r = v as Record<string, unknown>;
  if (!isCoordinateSpace(r.space)) return null;
  if (!Number.isInteger(r.start) || !Number.isInteger(r.end)) return null;
  if ((r.start as number) < 0 || (r.end as number) <= (r.start as number)) return null;
  return { space: r.space, start: r.start as number, end: r.end as number };
}

/** Reads as prose in a refusal without leaking the architecture's vocabulary. */
export const SPACE_NAME: Readonly<Record<CoordinateSpace, string>> = {
  stored_section_text: 'the section as stored',
  projected_section_body: 'the section as you edit it',
  revision_content: 'a whole kept version',
};
