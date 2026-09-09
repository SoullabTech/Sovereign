/**
 * WS-WHOLE-MANUSCRIPT-01 · the falsifier's fixture identities.
 *
 * ⛔ SYNTHETIC, DETERMINISTIC, AND NON-PRODUCTION BY CONSTRUCTION. These ids are
 * fixed so the seed and the falsifier address the same rows without passing a
 * handoff file between them — the two halves of the harness agree because they
 * import the same constants, never because they counted to the same number.
 *
 * The credential below is a FIXTURE, not a secret. It exists only inside an
 * ephemeral PostgreSQL cluster this harness creates and destroys, it is never
 * written to any durable database, and it grants nothing anywhere else. It is
 * in the file rather than the environment precisely so nobody is tempted to
 * reuse a real one here.
 */

export const MEMBER_ID = 'a0000000-0000-4000-8000-000000000001';
export const MANUSCRIPT_ID = 'a0000000-0000-4000-8000-000000000002';
export const DRAFT_ID = 'a0000000-0000-4000-8000-000000000003';

export const USERNAME = 'wm_falsifier';
export const PASSWORD = 'wm-falsifier-fixture-not-a-secret';
export const PASSKEY = 'SOULLAB-WM-FALSIFIER';

/**
 * 262 — the count the constitution names, and the reason this view exists at
 * all. A manuscript small enough to mount whole would prove nothing about a
 * manuscript that is not.
 */
export const SECTION_COUNT = 262;

const pad = (n: number) => String(n).padStart(12, '0');

/** Source section (`manuscript_sections`) id for position `i` (0-based). */
export const sourceSectionId = (i: number) => `b0000000-0000-4000-8000-${pad(i)}`;
/** Draft section (`manuscript_draft_sections`) id — the NAVIGATION identity. */
export const draftSectionId = (i: number) => `c0000000-0000-4000-8000-${pad(i)}`;

/** The heading the Source records, and so the editor's accessible name. */
export const headingFor = (i: number) => `Section ${i + 1}`;

/**
 * A body long enough that a section occupies real vertical space — a view whose
 * subject is continuous scrolling cannot be falsified against stubs — and
 * carrying its own position, so a check that lands on the wrong section can say
 * so rather than merely passing.
 */
export function bodyFor(i: number): string {
  const mark = `MARK-${i + 1}`;
  const lines = Array.from({ length: 6 }, (_, k) =>
    `${mark} line ${k + 1}: the book continues down the page, and the divisions recede without dissolving.`);
  return lines.join('\n');
}

/**
 * What `manuscript_draft_sections.text` holds: the heading, then the body — and
 * then the separator that belongs to THIS section, not to the join.
 *
 * ⛔ THE FLATTENING HAS NO SEPARATOR. The database enforces a round trip:
 * while a draft is section-addressable, its `content` must byte-equal
 * `string_agg(text, '' ORDER BY position)`. A seed that joined sections with
 * `\n\n` was refused by that trigger — correctly, and by exactly the 522
 * characters the 261 joins had invented. Every character between two sections
 * is a character some section owns.
 */
export const storedTextFor = (i: number) =>
  `${headingFor(i)}\n\n${bodyFor(i)}${i < SECTION_COUNT - 1 ? '\n\n' : ''}`;

/** The continuous `content` the draft must hold: the flattening, exactly. */
export const flattenedContent = () =>
  Array.from({ length: SECTION_COUNT }, (_, i) => storedTextFor(i)).join('');
