/**
 * WS2-07 · BUILD-07F — the surface's dangerous states, falsified.
 *
 * Two of them, and they are different failures:
 *
 *   ACTING WHILE THE STANDING IS UNKNOWN   `expectationFor` returns no token
 *   A COMPLETION LANDING IN ANOTHER READING `settleLookup` / `adoptInto` refuse
 *
 * The second is R2: this state lives ABOVE the keyed `Reading` subtree, so
 * React's remount cannot protect it, and a `StandingWire` names an observation
 * key but no reading — the room could not detect the mismatch unless the
 * transition itself carries the reading.
 */

import {
  adoptInto, beginLookup, expectationFor, settleLookup, standingRowSentence,
  standingSentence, standingSurfaceKey, standingView,
} from '../observationStanding';
import type { StandingLookup, StandingWire } from '../observationStanding';

const A = 'reading-a';
const B = 'reading-b';
const EVENT_A = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const EVENT_B = '3f2504e0-4f89-41d3-9a0c-0305e82c3302';

const wire = (key: string, id: string, standing: StandingWire['standing'] = 'dismiss'): StandingWire =>
  ({ observationKey: key, standing, currentEventId: id, recordedAt: 'now' });

const availableA: StandingLookup = { state: 'available', readingId: A, standings: [wire('o2', EVENT_A)] };

describe('unknown is not unset', () => {
  it('a lookup still loading is UNKNOWN, not "no standing taken"', () => {
    expect(standingView(beginLookup(A), A, 'o1').state).toBe('unknown');
  });

  it('a FAILED lookup is UNKNOWN, not "no standing taken"', () => {
    const failed = settleLookup(beginLookup(A), A, { ok: false });
    expect(standingView(failed, A, 'o1')).toEqual({ state: 'unknown', reason: 'unavailable' });
    expect(standingSentence(standingView(failed, A, 'o1'))).toMatch(/could not be reached/);
  });

  it('a successful lookup with no event for this observation is UNSET', () => {
    expect(standingView(availableA, A, 'o1')).toEqual({ state: 'unset' });
    expect(standingSentence(standingView(availableA, A, 'o1'))).toBe('No standing taken.');
  });

  it('a successful lookup with an event is TAKEN, and carries its token', () => {
    expect(standingView(availableA, A, 'o2')).toEqual({
      state: 'taken', standing: 'dismiss', currentEventId: EVENT_A,
    });
  });
});

describe('acting while the current standing is unknown is unrepresentable', () => {
  it('an unknown view yields NO token — not null', () => {
    const e = expectationFor(standingView(settleLookup(beginLookup(A), A, { ok: false }), A, 'o1'));
    expect(e.canAct).toBe(false);
    expect('expectedCurrentEventId' in e).toBe(false);
  });

  it('a loading view yields no token either', () => {
    expect(expectationFor(standingView(beginLookup(A), A, 'o1')).canAct).toBe(false);
  });

  it('UNSET yields an explicit null — the writer acting from an observed absence', () => {
    expect(expectationFor(standingView(availableA, A, 'o1')))
      .toEqual({ canAct: true, expectedCurrentEventId: null });
  });

  it('TAKEN yields the exact event the writer saw', () => {
    expect(expectationFor(standingView(availableA, A, 'o2')))
      .toEqual({ canAct: true, expectedCurrentEventId: EVENT_A });
  });
});

describe('R2 · a completion cannot land in a reading it does not belong to', () => {
  it("another reading's lookup reads as UNKNOWN, never as its value", () => {
    /* Not merely "not B's value" — it must not read as UNSET either, because
       UNSET is a claim that the writer has never ruled. */
    expect(standingView(availableA, B, 'o2')).toEqual({ state: 'unknown', reason: 'other-reading' });
    expect(standingView(availableA, B, 'o1')).toEqual({ state: 'unknown', reason: 'other-reading' });
    expect(expectationFor(standingView(availableA, B, 'o2')).canAct).toBe(false);
  });

  it('a lookup result for A is discarded once the room holds B', () => {
    const held = beginLookup(B);
    expect(settleLookup(held, A, { ok: true, standings: [wire('o1', EVENT_A)] })).toBe(held);
    expect(settleLookup(held, A, { ok: false })).toBe(held);
  });

  it("an event recorded under A cannot mutate B's standings", () => {
    const heldB: StandingLookup = { state: 'available', readingId: B, standings: [] };
    expect(adoptInto(heldB, A, wire('o1', EVENT_A))).toBe(heldB);
    expect(standingView(adoptInto(heldB, A, wire('o1', EVENT_A)), B, 'o1')).toEqual({ state: 'unset' });
  });

  it('THE SEQUENCE — A in flight, switch to B, B settles, A completes late', () => {
    let held = beginLookup(A);                                  // 1. A visible
    /* 2. the writer takes a standing on A/o1 — request in flight */
    held = beginLookup(B);                                      // 3. switch to B
    held = settleLookup(held, B, { ok: true, standings: [] });  // 4. B loads
    held = adoptInto(held, A, wire('o1', EVENT_A, 'keep'));     // 5. A's write returns
    /* 6. B/o1 must still be UNSET — A's standing never appears under B. */
    expect(standingView(held, B, 'o1')).toEqual({ state: 'unset' });
    expect(held).toEqual({ state: 'available', readingId: B, standings: [] });
  });

  it("B's own event still applies", () => {
    const heldB: StandingLookup = { state: 'available', readingId: B, standings: [] };
    const after = adoptInto(heldB, B, wire('o1', EVENT_B, 'keep'));
    expect(standingView(after, B, 'o1')).toEqual({
      state: 'taken', standing: 'keep', currentEventId: EVENT_B,
    });
  });

  it('a second event on the same observation replaces the first, not appends', () => {
    const one = adoptInto({ state: 'available', readingId: B, standings: [] }, B, wire('o1', EVENT_A, 'keep'));
    const two = adoptInto(one, B, wire('o1', EVENT_B, 'dismiss'));
    expect(two.state === 'available' && two.standings.length).toBe(1);
    expect(standingView(two, B, 'o1')).toEqual({
      state: 'taken', standing: 'dismiss', currentEventId: EVENT_B,
    });
  });
});

describe('a conflict explains what did not happen — it does not claim what is', () => {
  it('while the refresh is still in flight, the row does not claim current state', () => {
    const s = standingRowSentence(standingView(beginLookup(A), A, 'o1'), 'stale_expectation');
    expect(s).toMatch(/Nothing was overwritten/);
    expect(s).not.toMatch(/as it now stands/);
  });

  it('when the refresh FAILS, the unavailable truth wins over the conflict message', () => {
    const failed = settleLookup(beginLookup(A), A, { ok: false });
    const s = standingRowSentence(standingView(failed, A, 'o1'), 'stale_expectation');
    expect(s).toMatch(/could not be reached/);
    expect(s).not.toMatch(/as it now stands/);
  });

  it('only once the standing is actually known does it say so', () => {
    expect(standingRowSentence(standingView(availableA, A, 'o2'), 'stale_expectation'))
      .toMatch(/as it now stands/);
  });

  it('an ordinary refusal never claims a state either', () => {
    expect(standingRowSentence(standingView(availableA, A, 'o1'), 'unreachable'))
      .toBe('That could not be recorded. Nothing has been changed.');
    expect(standingRowSentence(standingView(settleLookup(beginLookup(A), A, { ok: false }), A, 'o1'), 'unreachable'))
      .toMatch(/could not be reached/);
  });
});

describe('identity', () => {
  it('the same observation key in two readings is two surfaces', () => {
    expect(standingSurfaceKey(A, 'o1')).not.toEqual(standingSurfaceKey(B, 'o1'));
  });
});
