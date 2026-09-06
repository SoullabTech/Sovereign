/**
 * WS2-07 · BUILD-07F — the standing surface's decisions, as pure functions.
 *
 * WHY THESE ARE FUNCTIONS AND NOT `if`s INSIDE THE COMPONENT. 07E's lesson,
 * carried forward: the dangerous state must be directly falsifiable rather than
 * inferred from a regex over JSX. There is exactly one dangerous state here —
 * ACTING WHILE THE CURRENT STANDING IS UNKNOWN — and `expectationFor` makes it
 * unrepresentable: while the lookup has not succeeded there is no token to
 * send, and the caller cannot invent one, because the shape it needs does not
 * come back.
 *
 * UNKNOWN IS NOT UNSET — the hard acceptance condition (design §10):
 *
 *   available + no event   →  UNSET · "No standing taken"
 *   loading / unavailable  →  UNKNOWN · the act is disabled and says so
 *
 * A failed lookup rendered as UNSET would tell a writer they have never ruled
 * on something they may have ruled on, and would then let them overwrite that
 * ruling from a state they never saw. Absence of evidence from the instrument
 * is not evidence of absence in the object.
 */

import type { Standing } from '@/lib/manuscript/standing/contract';

/** One current standing, as the resource returns it. */
export interface StandingWire {
  readonly observationKey: string;
  readonly standing: Standing;
  readonly currentEventId: string;
  readonly recordedAt: string;
}

/** What the room knows about this reading's standings, including not knowing. */
export type StandingLookup =
  | { readonly state: 'loading' }
  | { readonly state: 'unavailable' }
  | { readonly state: 'available'; readonly standings: readonly StandingWire[] };

export type StandingView =
  | { readonly state: 'unknown'; readonly reason: 'loading' | 'unavailable' }
  | { readonly state: 'unset' }
  | { readonly state: 'taken'; readonly standing: Standing; readonly currentEventId: string };

/** The three-state read for ONE observation. */
export function standingView(lookup: StandingLookup, observationKey: string): StandingView {
  if (lookup.state !== 'available') return { state: 'unknown', reason: lookup.state };
  const found = lookup.standings.find((s) => s.observationKey === observationKey);
  if (!found) return { state: 'unset' };
  return { state: 'taken', standing: found.standing, currentEventId: found.currentEventId };
}

/**
 * The expectation a write must carry, or the refusal to write at all.
 *
 * `null` is a REAL answer — the writer is acting from an observed UNSET — and
 * is returned only when the lookup succeeded and found no event. An unknown
 * lookup returns no token at all rather than `null`, because those two are the
 * exact pair this unit exists to keep apart.
 */
export function expectationFor(
  view: StandingView,
): { readonly canAct: true; readonly expectedCurrentEventId: string | null } | { readonly canAct: false } {
  switch (view.state) {
    case 'unknown': return { canAct: false };
    case 'unset': return { canAct: true, expectedCurrentEventId: null };
    case 'taken': return { canAct: true, expectedCurrentEventId: view.currentEventId };
  }
}

/**
 * What the row says beneath the observation. Never a value while unknown, and
 * never a claim that a standing can be taken back: a writer who no longer
 * wishes to rule takes `unresolved`, which is an act, not the absence of one.
 */
export function standingSentence(view: StandingView): string {
  switch (view.state) {
    case 'unknown':
      return view.reason === 'loading'
        ? 'Reading your standing…'
        : 'Your standing could not be reached. Nothing has been changed.';
    case 'unset': return 'No standing taken.';
    case 'taken': return `You marked this ${LABEL[view.standing].toLowerCase()}.`;
  }
}

export const LABEL: Record<Standing, string> = {
  keep: 'Keep', dismiss: 'Dismiss', unresolved: 'Unresolved',
};

/**
 * The surface identity, for the same reason 07E minted `dialogueSurfaceKey`:
 * `o1` is stable only WITHIN one reading, so a control keyed by the observation
 * key alone would carry reading A's state into reading B.
 */
export const standingSurfaceKey = (readingId: string, observationKey: string): string =>
  `${readingId}::${observationKey}`;
