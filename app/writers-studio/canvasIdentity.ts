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

/* ══════════════════════════════════════════════════════════════════════════
   WS2-03B · RESOLUTION WITHOUT SUBSTITUTION

   `selectManuscript` above degrades: an unresolvable identity falls through to
   `manuscripts[0]`, and the caller cannot tell a degradation from a defect
   without a second call to `identityHonoured`. The Canvas never made that
   second call, so a request for one manuscript put a different one on the
   table and said nothing — the WS2-01 finding, reproduced in runtime:

     requested  a3ae67fd-a21e-4948-8766-4c397d2e4712
     owned      ce284751-e457-42f6-89b6-bc07d0876682  "Elemental Alchemy
                (KDP print)", 174 sections

   The root cause of THAT mismatch stays in the WS2-01 lane. What belongs here
   is the property the Canvas must hold regardless of the cause: an identity
   the room cannot resolve exactly FAILS VISIBLY. It is never silently swapped.

   Resolution is a decision, so it is returned as one. A caller cannot read
   `.manuscript` off this without also seeing the kind — which is the whole
   difference from the function above.

   Ambiguity is separated from absence on purpose. Arriving with no `?m=` and
   several manuscripts is not an error and not a fallback: it is a real
   question the member is the only one who can answer, so the room asks it
   rather than guessing. That is a chooser, not a dead end — refusing to guess
   must not become refusing to open.
   ══════════════════════════════════════════════════════════════════════════ */

export type ManuscriptResolution<T extends SelectableManuscript> =
  /** Exactly one manuscript is on the table, and it is the right one. */
  | { kind: 'resolved'; manuscript: T; wasRequested: boolean }
  /** An identity was named and does not exist here. Show this; never swap. */
  | { kind: 'unresolved'; requested: string }
  /** Nothing was named and several exist. The member chooses. */
  | { kind: 'ambiguous'; manuscripts: readonly T[] }
  /** The member has no manuscripts at all. */
  | { kind: 'empty' };

export function resolveManuscript<T extends SelectableManuscript>(
  requested: string | null,
  manuscripts: readonly T[],
): ManuscriptResolution<T> {
  if (requested) {
    const asked = manuscripts.find((m) => m.id === requested);
    return asked
      ? { kind: 'resolved', manuscript: asked, wasRequested: true }
      : { kind: 'unresolved', requested };
  }
  if (manuscripts.length === 0) return { kind: 'empty' };
  if (manuscripts.length === 1) {
    return { kind: 'resolved', manuscript: manuscripts[0], wasRequested: false };
  }
  return { kind: 'ambiguous', manuscripts };
}
