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
 * So the parameter name, the href builder, and the selection rule live here
 * together and are imported by both sides. They cannot drift apart without
 * the round-trip test in __tests__/canvasIdentity.test.ts failing.
 */

/** The query parameter the Canvas reads. Do not inline this string anywhere. */
export const CANVAS_MANUSCRIPT_PARAM = 'm';

/**
 * The Canvas, opened on a specific manuscript.
 * `base` may already carry a query string, so the separator is derived.
 */
export function canvasForManuscript(base: string, manuscriptId: string | null): string {
  if (!manuscriptId) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}${CANVAS_MANUSCRIPT_PARAM}=${encodeURIComponent(manuscriptId)}`;
}

/** Reads the requested manuscript identity out of a URL query string. */
export function requestedManuscriptId(search: string): string | null {
  return new URLSearchParams(search).get(CANVAS_MANUSCRIPT_PARAM);
}

export interface SelectableManuscript {
  id: string;
}

/**
 * Which manuscript the Canvas puts on the table.
 *
 * By identity when one was asked for AND it exists. Most recent otherwise —
 * degrading rather than stranding when the asked-for id is gone.
 *
 * ⚠️ The fallback is the reason the parameter mismatch was silent: an ignored
 * identity is indistinguishable from an absent one. Callers that need to know
 * whether the ask was honoured must compare the result to what they asked for.
 */
export function selectManuscript<T extends SelectableManuscript>(
  requested: string | null,
  manuscripts: readonly T[],
): T | null {
  if (requested) {
    const asked = manuscripts.find((m) => m.id === requested);
    if (asked) return asked;
  }
  return manuscripts[0] ?? null;
}

/**
 * Did the Canvas honour the identity it was sent?
 * `true` when nothing was asked for; `false` only when an ask was overridden
 * by the fallback — which is a defect, not a degradation, when the producer
 * believed it was naming a specific work.
 */
export function identityHonoured<T extends SelectableManuscript>(
  requested: string | null,
  selected: T | null,
): boolean {
  if (!requested) return true;
  return selected?.id === requested;
}
