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

/**
 * What the room knows about ONE reading's standings, including not knowing.
 *
 * THE READING ID IS PART OF THE STATE, not context around it. This state lives
 * in the room, ABOVE the keyed `Reading` subtree, so React's remount cannot
 * protect it: an asynchronous completion belonging to reading A could otherwise
 * land in the state the room now holds for reading B, and — because a
 * `StandingWire` names an observation key but no reading — the room could not
 * even detect the mismatch. Every transition below therefore takes the reading
 * the result belongs to and refuses to apply it to a different one.
 *
 * This is 07E's remount lesson one level higher: a keyed child cannot protect
 * state owned by an unkeyed parent.
 */
export type StandingLookup =
  | { readonly state: 'loading'; readonly readingId: string }
  | { readonly state: 'unavailable'; readonly readingId: string }
  | {
      readonly state: 'available';
      readonly readingId: string;
      readonly standings: readonly StandingWire[];
    };

export type StandingView =
  | { readonly state: 'unknown'; readonly reason: 'loading' | 'unavailable' | 'other-reading' }
  | { readonly state: 'unset' }
  | { readonly state: 'taken'; readonly standing: Standing; readonly currentEventId: string };

/** The lookup a reading starts from. */
export const beginLookup = (readingId: string): StandingLookup =>
  ({ state: 'loading', readingId });

/**
 * The three-state read for ONE observation of ONE reading.
 *
 * A lookup held for a DIFFERENT reading is UNKNOWN — never UNSET, and never
 * that other reading's value. It says nothing about this one.
 */
export function standingView(
  lookup: StandingLookup, readingId: string, observationKey: string,
): StandingView {
  if (lookup.readingId !== readingId) return { state: 'unknown', reason: 'other-reading' };
  if (lookup.state !== 'available') return { state: 'unknown', reason: lookup.state };
  const found = lookup.standings.find((s) => s.observationKey === observationKey);
  if (!found) return { state: 'unset' };
  return { state: 'taken', standing: found.standing, currentEventId: found.currentEventId };
}

/**
 * A completed lookup, applied only to the reading it was asked about. A result
 * arriving after the room moved on is DISCARDED, not merged: it is evidence
 * about a reading nobody is looking at.
 */
export function settleLookup(
  prev: StandingLookup, readingId: string,
  result: { ok: true; standings: readonly StandingWire[] } | { ok: false },
): StandingLookup {
  if (prev.readingId !== readingId) return prev;
  return result.ok
    ? { state: 'available', readingId, standings: result.standings }
    : { state: 'unavailable', readingId };
}

/**
 * One recorded event, adopted into the reading it belongs to. An event from a
 * reading the room has left cannot mutate the reading it now holds — the
 * failure R2 names, made unrepresentable rather than remembered.
 */
export function adoptInto(
  prev: StandingLookup, readingId: string, next: StandingWire,
): StandingLookup {
  if (prev.readingId !== readingId || prev.state !== 'available') return prev;
  const others = prev.standings.filter((s) => s.observationKey !== next.observationKey);
  return { state: 'available', readingId, standings: [...others, next] };
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
      return view.reason === 'unavailable'
        ? 'Your standing could not be reached. Nothing has been changed.'
        : 'Reading your standing…';
    case 'unset': return 'No standing taken.';
    case 'taken': return `You marked this ${LABEL[view.standing].toLowerCase()}.`;
  }
}

/**
 * What the row says after a refusal — and, when the refusal triggered a refresh
 * that has not landed, what it may NOT say.
 *
 * The earlier copy told the writer "here it is as it now stands" the moment a
 * conflict came back, and only then began refetching. If that refetch failed,
 * the row went UNAVAILABLE while still claiming to be showing current state.
 * The ordinary unknown truth wins over any refusal message: a conflict explains
 * what did not happen, it does not establish what is.
 */
export function standingRowSentence(view: StandingView, refusal: string | null): string {
  if (!refusal) return standingSentence(view);

  const conflict = refusal === 'stale_expectation' || refusal === 'simultaneous_write';

  if (view.state === 'unknown') {
    /* Could not be reached — say so, whatever else just happened. Nothing was
       overwritten either way, so the writer is told both facts and neither is
       dressed up as the other. */
    if (view.reason === 'unavailable') {
      return conflict
        ? 'Nothing was overwritten. Your standing could not be reached.'
        : standingSentence(view);
    }
    return conflict
      ? 'Nothing was overwritten. Reading your standing…'
      : standingSentence(view);
  }

  if (refusal === 'stale_expectation') {
    return 'This standing changed elsewhere while you were looking. Nothing was overwritten — here it is as it now stands.';
  }
  if (refusal === 'simultaneous_write') {
    return 'Another act reached this observation first. Nothing was overwritten — here it is as it now stands.';
  }
  return 'That could not be recorded. Nothing has been changed.';
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
