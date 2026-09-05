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

/**
 * The same read, against already-parsed search params.
 *
 * The Canvas takes its identity from the ROUTE's params rather than from
 * `window.location.search`, because those are not the same clock: on a client
 * navigation the room can render before the browser URL carries the identity
 * the link was built with, and a room that samples the address bar once has
 * then sampled it too early — with no second look, it stays wrong. Reading
 * the route's own params removes the race instead of racing it.
 *
 * Structurally typed on `get` so this accepts both `URLSearchParams` and
 * Next's ReadonlyURLSearchParams without importing the framework into a file
 * the identity tests exercise directly.
 */
export function requestedManuscriptIdFrom(
  params: { get(name: string): string | null },
): string | null {
  return params.get(CANVAS_MANUSCRIPT_PARAM);
}

/**
 * The identity the room holds, given what it already holds and what the route
 * now says. Adopt when empty; NEVER overwrite.
 *
 * Both halves are load-bearing and they failed in opposite directions:
 *
 *   adopt      The room used to sample `window.location.search` once, in a
 *              `useState` initializer, and never look again. On a client
 *              navigation from Studio Home that sample was empty — the room
 *              rendered before the browser URL carried the id the link was
 *              built with — so `requested` stayed null forever and no
 *              manuscript ever resolved. Looking again is the repair.
 *
 *   never swap A room that simply followed the route would swap the
 *              manuscript under a draft that is already mounted. The exit
 *              guard flushes on teardown, so that swap can carry one
 *              manuscript's words toward another's row. Once an identity is
 *              held — taken from the route, or given by the member answering
 *              the chooser — it is the room's until the room unmounts.
 *
 * A route that goes quiet never clears a held identity: absence is not an
 * instruction. And this never invents one, so it cannot become the
 * fall-back-to-first substitution this contract exists to forbid — every
 * result is either what was held or exactly what the route named.
 */
export function adoptRouteIdentity(
  held: string | null,
  fromRoute: string | null,
): string | null {
  return held ?? fromRoute;
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
   table and said nothing.

   ── THE WS2-01 FINDING, STATED CORRECTLY ─────────────────────────────────

   CORRECTED 2026-08-29 (founder). An earlier draft of this block read the two
   ids in the finding as two manuscripts and labelled the second "owned". They
   are not the same kind of thing:

     manuscript requested   a3ae67fd-a21e-4948-8766-4c397d2e4712
                            "Elemental Alchemy (KDP print)", 174 sections
     authenticated member   ce284751-e457-42f6-89b6-bc07d0876682

   The requested manuscript WAS owned by the authenticated member. That is the
   whole severity of the finding and the misreading inverted it: this was not a
   member asking for someone else's book and being sensibly redirected — it was
   a member asking for their OWN book, by identity, and being handed a
   different one silently.

   The root cause stays in the WS2-01 lane. What belongs here is the property
   the Canvas must hold regardless of the cause: an identity the room cannot
   resolve exactly FAILS VISIBLY. It is never silently swapped.

   Note the consequence for testing. Because the requested manuscript was
   owned, no unit test of this function can reproduce the original defect —
   the list it was given is the thing that was wrong, one layer up. What the
   tests below CAN establish, and all they claim, is the generic property:
   whatever the list contains, an unresolved explicit identity refuses.

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
