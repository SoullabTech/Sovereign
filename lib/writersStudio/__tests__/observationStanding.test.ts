/**
 * WS2-07 · BUILD-07F — the surface's one dangerous state, falsified.
 *
 * Each test below states what would go wrong if the function did not hold, so a
 * later reader can tell a real invariant from a shape assertion.
 */

import {
  expectationFor, standingSentence, standingSurfaceKey, standingView,
} from '../observationStanding';
import type { StandingLookup } from '../observationStanding';

const EVENT = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const available: StandingLookup = {
  state: 'available',
  standings: [{ observationKey: 'o2', standing: 'dismiss', currentEventId: EVENT, recordedAt: 'now' }],
};

describe('unknown is not unset', () => {
  it('a lookup still loading is UNKNOWN, not "no standing taken"', () => {
    expect(standingView({ state: 'loading' }, 'o1').state).toBe('unknown');
  });

  it('a FAILED lookup is UNKNOWN, not "no standing taken"', () => {
    /* Rendering this as UNSET would tell a writer they have never ruled on
       something they may well have ruled on. */
    expect(standingView({ state: 'unavailable' }, 'o1')).toEqual({ state: 'unknown', reason: 'unavailable' });
    expect(standingSentence(standingView({ state: 'unavailable' }, 'o1')))
      .toMatch(/could not be reached/);
  });

  it('a successful lookup with no event for this observation is UNSET', () => {
    expect(standingView(available, 'o1')).toEqual({ state: 'unset' });
    expect(standingSentence(standingView(available, 'o1'))).toBe('No standing taken.');
  });

  it('a successful lookup with an event is TAKEN, and carries its token', () => {
    expect(standingView(available, 'o2')).toEqual({
      state: 'taken', standing: 'dismiss', currentEventId: EVENT,
    });
  });
});

describe('acting while the current standing is unknown is unrepresentable', () => {
  it('an unknown view yields NO token — not null', () => {
    /* null means "I looked and there was nothing". A caller must not be able to
       spell that from a state where it never looked. */
    const e = expectationFor(standingView({ state: 'unavailable' }, 'o1'));
    expect(e.canAct).toBe(false);
    expect('expectedCurrentEventId' in e).toBe(false);
  });

  it('a loading view yields no token either', () => {
    expect(expectationFor(standingView({ state: 'loading' }, 'o1')).canAct).toBe(false);
  });

  it('UNSET yields an explicit null — the writer acting from an observed absence', () => {
    expect(expectationFor(standingView(available, 'o1')))
      .toEqual({ canAct: true, expectedCurrentEventId: null });
  });

  it('TAKEN yields the exact event the writer saw', () => {
    expect(expectationFor(standingView(available, 'o2')))
      .toEqual({ canAct: true, expectedCurrentEventId: EVENT });
  });
});

describe('identity', () => {
  it('the same observation key in two readings is two surfaces', () => {
    expect(standingSurfaceKey('A', 'o1')).not.toEqual(standingSurfaceKey('B', 'o1'));
  });
});
