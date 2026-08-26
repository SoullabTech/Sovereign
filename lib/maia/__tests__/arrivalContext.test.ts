/**
 * @jest-environment jsdom
 */
/**
 * Arrival context — session-scoped handoff, pinned.
 *
 * These tests exist because the constitutional risk in this module is not that
 * it fails to work, but that it works too well: a durable doorway record would
 * turn an Encounter-layer click into biographical material (MLX-R3).
 */

import {
  writeArrivalContext,
  readArrivalContext,
  clearArrivalContext,
  consumeArrivalContext,
  __resetArrivalConsumption,
  DOORWAYS,
  DOORWAY_UNSURE,
} from '../arrivalContext';

describe('the ruled doorway set', () => {
  it('carries the six doors plus a first-class way in for someone unsure', () => {
    expect(DOORWAYS.map((d) => d.label)).toEqual([
      'Something is on my mind',
      "I'm going through a change",
      'I want to understand myself',
      'I need clarity about a decision',
      'Something in a relationship',
      "I'm making something",
    ]);
    expect(DOORWAY_UNSURE.label).toBe("I don't know where to begin");
  });

  it('asks nothing about birth, element, or philosophical lens', () => {
    const all = JSON.stringify([...DOORWAYS, DOORWAY_UNSURE]).toLowerCase();
    for (const banned of ['birth', 'fire', 'water', 'earth', 'aether', 'jung', 'maslow', 'frankl']) {
      expect(all).not.toContain(banned);
    }
  });
});

describe('the handoff', () => {
  beforeEach(() => { sessionStorage.clear(); localStorage.clear(); });

  it('carries the member’s words and their door across the navigation', () => {
    writeArrivalContext('  the same argument with my brother  ', 'relation');
    const ctx = readArrivalContext();
    expect(ctx?.attention).toBe('the same argument with my brother');
    expect(ctx?.doorway).toBe('relation');
  });

  it('survives an empty attention field — the door alone still frames the opening', () => {
    writeArrivalContext('', 'dunno');
    expect(readArrivalContext()).toMatchObject({ attention: '', doorway: 'dunno' });
  });
});

describe('constitutional shape', () => {
  beforeEach(() => { sessionStorage.clear(); localStorage.clear(); });

  it('writes to sessionStorage only — never localStorage', () => {
    writeArrivalContext('something private', 'mind');
    expect(sessionStorage.getItem('maia_arrival_context')).toBeTruthy();
    expect(localStorage.length).toBe(0);
  });

  it('leaves no trace once consumed', () => {
    writeArrivalContext('something private', 'mind');
    clearArrivalContext();
    expect(readArrivalContext()).toBeNull();
    expect(sessionStorage.getItem('maia_arrival_context')).toBeNull();
  });

  it('ignores context from an earlier sitting rather than reviving it', () => {
    sessionStorage.setItem(
      'maia_arrival_context',
      JSON.stringify({ attention: 'yesterday', doorway: 'mind', at: Date.now() - 7 * 60 * 60 * 1000 }),
    );
    expect(readArrivalContext()).toBeNull();
  });

  it('returns null on malformed context instead of guessing', () => {
    sessionStorage.setItem('maia_arrival_context', '{not json');
    expect(readArrivalContext()).toBeNull();
    sessionStorage.setItem('maia_arrival_context', JSON.stringify({ attention: 'x' }));
    expect(readArrivalContext()).toBeNull();
  });
});


describe('consumption is idempotent within a page load', () => {
  /**
   * REGRESSION. The greeting effect runs more than once. When consumption
   * cleared storage on the first run, the second run found nothing and the
   * default greeting overwrote MAIA's first contact — observed at runtime.
   */
  beforeEach(() => { sessionStorage.clear(); __resetArrivalConsumption(); });

  it('returns the same context on every call in one page load', () => {
    writeArrivalContext('the same argument with my brother', 'relation');
    const first = consumeArrivalContext();
    const second = consumeArrivalContext();
    const third = consumeArrivalContext();
    expect(first?.doorway).toBe('relation');
    expect(second).toEqual(first);
    expect(third).toEqual(first);
  });

  it('clears storage immediately, so a reload does not replay first contact', () => {
    writeArrivalContext('something', 'mind');
    consumeArrivalContext();
    expect(sessionStorage.getItem('maia_arrival_context')).toBeNull();
    __resetArrivalConsumption();            // a reload: fresh module, cache empty
    expect(consumeArrivalContext()).toBeNull();
  });

  it('caches the absence too — no context stays no context', () => {
    expect(consumeArrivalContext()).toBeNull();
    writeArrivalContext('late arrival', 'mind');
    expect(consumeArrivalContext()).toBeNull();
  });
});
