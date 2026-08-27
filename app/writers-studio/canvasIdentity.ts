/**
 * The Canvas manuscript-identity contract — ONE definition, both sides.
 *
 * ── Why this file exists ──────────────────────────────────────────────────
 * The rebuilt Home shipped `?id=<manuscript>` while the Canvas read `?m`.
 * The Canvas therefore ignored the identity it was sent and silently fell
 * back to `manuscripts[0]`, so "Continue writing Elemental Alchemy" could
 * open a different manuscript. Founder-caught, 2026-08-14.
 *
 * That defect was invisible to every check that had been run: the control
 * had an href, the href carried a value, the route resolved, the page
 * rendered. What none of it established was that the producer's parameter
 * name matched the consumer's. A link is not a binding.
 *
 * ── The second failure, 2026-08-27 ────────────────────────────────────────
 * The parameter drift was fixed and the room still opened the wrong writing,
 * because the hole had moved to the PRODUCER. A work with no manuscript
 * attached built its href from a null id, this file returned the bare Canvas
 * URL, and the room — asked for nothing — put the most recent manuscript on
 * the table under the clicked work's name. Founder-caught again, live:
 * "Transcription · The most recent of your 4 manuscripts is on the table."
 *
 * So the contract now enforces BOTH directions (DECISIONS.md D-008 + D-010):
 *
 *   producer  may not lose or invent identity
 *             → `canvasForManuscript` requires a real id; there is no
 *               null-shaped href that quietly means "open something"
 *   consumer  may not compensate for lost or invalid identity
 *             → `selectManuscript` returns a REFUSAL, never a substitute,
 *               and "nothing was named" is its own outcome, not a default
 *
 * Both sides import from here. They cannot drift apart without the tests in
 * __tests__/canvasIdentity.test.ts failing.
 */

/** The query parameter the Canvas reads. Do not inline this string anywhere. */
export const CANVAS_MANUSCRIPT_PARAM = 'm';

/**
 * The Canvas, opened on a specific manuscript.
 *
 * `manuscriptId` is REQUIRED and non-null by type. A caller holding a
 * possibly-absent id must decide what to do about that — see
 * `canvasHrefFor`, which is the only sanctioned way to handle absence, and
 * which returns null rather than an href so the caller cannot render a link
 * that opens something it never named.
 *
 * `base` may already carry a query string, so the separator is derived.
 */
export function canvasForManuscript(base: string, manuscriptId: string): string {
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}${CANVAS_MANUSCRIPT_PARAM}=${encodeURIComponent(manuscriptId)}`;
}

/**
 * An href for a manuscript that may not exist.
 *
 * Returns `null` when there is no identity to send — which the caller MUST
 * render as something other than a link into the Canvas. Returning null is
 * the whole point: an absent identity has to be visible at the control, not
 * discovered by the writer after the wrong text is already on the table.
 */
export function canvasHrefFor(base: string, manuscriptId: string | null): string | null {
  return manuscriptId ? canvasForManuscript(base, manuscriptId) : null;
}

/** Reads the requested manuscript identity out of a URL query string. */
export function requestedManuscriptId(search: string): string | null {
  return new URLSearchParams(search).get(CANVAS_MANUSCRIPT_PARAM);
}

export interface SelectableManuscript {
  id: string;
}

/**
 * What the Canvas resolved — a resolution, never a bare value, so that
 * "refused" is representable and cannot be flattened into "opened".
 */
export type CanvasSelection<T> =
  /** An id was asked for and is on the shelf. Open it. */
  | { kind: 'found'; manuscript: T }
  /** An id was asked for and is NOT on the shelf. Open NOTHING; say so. */
  | { kind: 'missing'; requested: string }
  /** No id was asked for. Open NOTHING; ask which writing. */
  | { kind: 'unnamed' };

/**
 * Which manuscript the Canvas puts on the table.
 *
 * ⚠️ There is no fallback. Not to the most recent, not to the only one.
 *
 *   id asked for, found      → open it
 *   id asked for, NOT found  → refuse, naming what was asked for
 *   no id asked for          → refuse, and ask which writing
 *
 * The third case used to return `manuscripts[0]` and was the more dangerous
 * of the two failures, because it produces no error anywhere: a control that
 * lost its identity looks exactly like a writer who wandered in unaddressed.
 * Production, 2026-08-27: a work with no manuscript opened a 5-page
 * transcript under its own name and announced it as "the most recent".
 */
export function selectManuscript<T extends SelectableManuscript>(
  requested: string | null,
  manuscripts: readonly T[],
): CanvasSelection<T> {
  if (requested === null) return { kind: 'unnamed' };
  const asked = manuscripts.find((m) => m.id === requested);
  return asked ? { kind: 'found', manuscript: asked } : { kind: 'missing', requested };
}

/**
 * Did the Canvas honour the identity it was sent?
 *
 * True only when an id was asked for and that exact id is what opened.
 * Anything else — refused, or nothing asked for — did not open a manuscript
 * at all, which is the correct behaviour and is not "honouring" anything.
 */
export function identityHonoured<T extends SelectableManuscript>(
  requested: string | null,
  selection: CanvasSelection<T>,
): boolean {
  return selection.kind === 'found' && selection.manuscript.id === requested;
}
