/**
 * Arrival state — the three required journeys.
 *
 * Pins the founder ruling of 2026-07-22:
 *
 *   Returning to Arrival is opening a room, not undoing an initiation.
 *
 * The load-bearing assertion in this file is the last one in "Deliberate
 * return": the durable marker survives the return. If that ever goes red, the
 * two states have been collapsed back into one and a member's first crossing is
 * being erased in order to render a room.
 */

import {
  ARRIVAL_MARKER_KEY,
  deriveShouldRenderArrival,
  readHasArrivedBefore,
  recordFirstArrival,
} from '../arrivalState';

const store: Record<string, string> = {};

// The module reads `window.localStorage` deliberately — the `typeof window`
// check is the SSR guard, so the test stands up a window rather than patching
// it away. Jest runs this suite in the node environment, where there is none.
const fakeWindow = {
  localStorage: {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
  },
};

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  (globalThis as Record<string, unknown>).window = fakeWindow;
});

afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

describe('Journey 1 — first visit', () => {
  it('a member who has never crossed meets Arrival', () => {
    expect(readHasArrivedBefore()).toBe(false);
    expect(deriveShouldRenderArrival({
      arrivalEntryEnabled: true, hasArrivedBefore: false, arrivalInvoked: false,
    })).toBe(true);
  });

  it('first expression records the crossing, and only the first one', () => {
    expect(recordFirstArrival(1000)).toBe(true);
    expect(store[ARRIVAL_MARKER_KEY]).toBe('1000');

    // Fires on every member turn thereafter — must not move the timestamp.
    expect(recordFirstArrival(2000)).toBe(false);
    expect(recordFirstArrival(3000)).toBe(false);
    expect(store[ARRIVAL_MARKER_KEY]).toBe('1000');
  });

  it('after crossing, the member is in conversation, not Arrival', () => {
    recordFirstArrival(1000);
    expect(readHasArrivedBefore()).toBe(true);
    expect(deriveShouldRenderArrival({
      arrivalEntryEnabled: true, hasArrivedBefore: true, arrivalInvoked: false,
    })).toBe(false);
  });
});

describe('Journey 2 — returning visit', () => {
  it('a returning member opens directly into conversation', () => {
    store[ARRIVAL_MARKER_KEY] = '1000';
    expect(readHasArrivedBefore()).toBe(true);
    expect(deriveShouldRenderArrival({
      arrivalEntryEnabled: true, hasArrivedBefore: true, arrivalInvoked: false,
    })).toBe(false);
  });

  it('greeting suppression follows the render, not the flag', () => {
    // The defect this integration fixes: arrivalEntry is default-ON for every
    // member, so keying the renderer to it showed the first-visit ceremony to
    // returning members on every fresh session, and suppressed the transcript
    // greeting that is otherwise their only welcome.
    const arrivalEntryEnabled = true;
    const returning = deriveShouldRenderArrival({
      arrivalEntryEnabled, hasArrivedBefore: true, arrivalInvoked: false,
    });
    expect(arrivalEntryEnabled).toBe(true);   // flag is on...
    expect(returning).toBe(false);            // ...but Arrival does not render,
                                              // so the greeting must be shown.
  });

  it('SSR renders the returning surface — no flash of Arrival', () => {
    delete (globalThis as Record<string, unknown>).window;   // on the server
    expect(readHasArrivedBefore()).toBe(true);
    expect(recordFirstArrival(1000)).toBe(false);            // never writes server-side
  });
});

describe('Journey 3 — deliberate return', () => {
  it('The House opens Arrival for a member who has already crossed', () => {
    store[ARRIVAL_MARKER_KEY] = '1000';
    expect(deriveShouldRenderArrival({
      arrivalEntryEnabled: true, hasArrivedBefore: true, arrivalInvoked: true,
    })).toBe(true);
  });

  it('THE RULING: the durable first-crossing marker survives the return', () => {
    store[ARRIVAL_MARKER_KEY] = '1000';

    // The member invokes a return. Arrival renders...
    expect(deriveShouldRenderArrival({
      arrivalEntryEnabled: true, hasArrivedBefore: true, arrivalInvoked: true,
    })).toBe(true);

    // ...and the record of their first crossing is untouched. Opening a room,
    // not undoing an initiation.
    expect(store[ARRIVAL_MARKER_KEY]).toBe('1000');
    expect(readHasArrivedBefore()).toBe(true);
  });

  it('speaking during an invoked return ends it without rewriting history', () => {
    store[ARRIVAL_MARKER_KEY] = '1000';
    expect(recordFirstArrival(9999)).toBe(false);  // write-once holds
    expect(store[ARRIVAL_MARKER_KEY]).toBe('1000');
    // markArrived also clears arrivalInvoked, so the room gives way:
    expect(deriveShouldRenderArrival({
      arrivalEntryEnabled: true, hasArrivedBefore: true, arrivalInvoked: false,
    })).toBe(false);
  });

  it('a member may return as many times as they like', () => {
    store[ARRIVAL_MARKER_KEY] = '1000';
    for (let i = 0; i < 3; i++) {
      expect(deriveShouldRenderArrival({
        arrivalEntryEnabled: true, hasArrivedBefore: true, arrivalInvoked: true,
      })).toBe(true);
      recordFirstArrival(5000 + i);
      expect(store[ARRIVAL_MARKER_KEY]).toBe('1000');
    }
  });
});

describe('Journey 4 — crossing without speech (#736, "I\'m ready")', () => {
  it('a first-visit member who taps "I\'m ready" leaves Arrival this session', () => {
    expect(deriveShouldRenderArrival({
      arrivalEntryEnabled: true, hasArrivedBefore: false, arrivalInvoked: false,
      crossedWithoutSpeech: true,
    })).toBe(false);
  });

  it('THE RULING: activation is not expression — the durable marker is NOT written', () => {
    // The member crossed without speaking. Nothing durable was recorded...
    expect(deriveShouldRenderArrival({
      arrivalEntryEnabled: true, hasArrivedBefore: false, arrivalInvoked: false,
      crossedWithoutSpeech: true,
    })).toBe(false);
    expect(store[ARRIVAL_MARKER_KEY]).toBeUndefined();
    expect(readHasArrivedBefore()).toBe(false);

    // ...so a fresh session (crossedWithoutSpeech dies with the tab) meets the
    // ceremony again. Someone who activates, explores, and leaves is still
    // arriving.
    expect(deriveShouldRenderArrival({
      arrivalEntryEnabled: true, hasArrivedBefore: false, arrivalInvoked: false,
    })).toBe(true);
  });

  it('an invoked return ends the same way when crossed without speech', () => {
    store[ARRIVAL_MARKER_KEY] = '1000';
    // crossArrivalWithoutSpeech clears arrivalInvoked alongside setting crossed:
    expect(deriveShouldRenderArrival({
      arrivalEntryEnabled: true, hasArrivedBefore: true, arrivalInvoked: false,
      crossedWithoutSpeech: true,
    })).toBe(false);
    // Opening a room, not undoing an initiation — marker untouched:
    expect(store[ARRIVAL_MARKER_KEY]).toBe('1000');
  });

  it('the deliberate return outranks a prior same-session crossing', () => {
    // "I'm ready", then later this session: The House → Return to Arrival.
    // #736 adds an exit; it must never subtract the member-invoked entry.
    expect(deriveShouldRenderArrival({
      arrivalEntryEnabled: true, hasArrivedBefore: false, arrivalInvoked: true,
      crossedWithoutSpeech: true,
    })).toBe(true);
    expect(deriveShouldRenderArrival({
      arrivalEntryEnabled: true, hasArrivedBefore: true, arrivalInvoked: true,
      crossedWithoutSpeech: true,
    })).toBe(true);
  });

  it('omitting the input preserves every pre-#736 derivation', () => {
    for (const hasArrivedBefore of [true, false]) {
      for (const arrivalInvoked of [true, false]) {
        const legacy = deriveShouldRenderArrival({
          arrivalEntryEnabled: true, hasArrivedBefore, arrivalInvoked,
        });
        expect(legacy).toBe(!hasArrivedBefore || arrivalInvoked);
      }
    }
  });
});

describe('Kill-switch', () => {
  it('arrivalEntry=false suppresses Arrival on every path', () => {
    for (const hasArrivedBefore of [true, false]) {
      for (const arrivalInvoked of [true, false]) {
        for (const crossedWithoutSpeech of [true, false, undefined]) {
          expect(deriveShouldRenderArrival({
            arrivalEntryEnabled: false, hasArrivedBefore, arrivalInvoked,
            crossedWithoutSpeech,
          })).toBe(false);
        }
      }
    }
  });
});
