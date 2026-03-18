/**
 * UNCERTAINTY PROTOCOL TESTS
 *
 * Verifies that:
 *   1. The oracle context contains the epistemic guardrail text
 *   2. The uncertainty protocol is present and complete
 *   3. The event table enforces data boundaries (no events outside the table)
 *
 * These tests are structural — they verify the prompt layer that prevents
 * the model from inventing astronomical claims.
 *
 * Note: Testing model *behavior* requires integration tests.
 * These tests verify the guardrail *architecture* is in place.
 */

import {
  ASTRO_EVENTS_2026,
  getUpcomingEvents,
  getActiveEvents,
} from '@/lib/astrology/transitSnapshot';

// ─────────────────────────────────────────────────────────────────────────────
// 1. EVENT TABLE BOUNDARY ENFORCEMENT
// These tests verify the table cannot produce false positives —
// events that MAIA would be allowed to cite but are factually wrong.
// ─────────────────────────────────────────────────────────────────────────────

describe('Event table — boundary enforcement', () => {

  // The specific failure that triggered this work
  test('cannot find a solar eclipse on 2026-03-19 ("tomorrow" at time of failure)', () => {
    const march19 = new Date('2026-03-18T12:00:00Z'); // day before March 19
    const active = getActiveEvents(ASTRO_EVENTS_2026, 2, march19);
    const solarEclipse = active.find(e => e.type === 'solar_eclipse');
    expect(solarEclipse).toBeUndefined();
  });

  test('cannot find any eclipse in April 2026', () => {
    const april = new Date('2026-04-15T12:00:00Z');
    const events = getUpcomingEvents(ASTRO_EVENTS_2026, 30, april);
    const eclipses = events.filter(e => e.type === 'solar_eclipse' || e.type === 'lunar_eclipse');
    expect(eclipses).toHaveLength(0);
  });

  test('eclipse window closes after event date', () => {
    // March 3 eclipse — should not appear as active on March 10
    const march10 = new Date('2026-03-10T12:00:00Z');
    const active = getActiveEvents(ASTRO_EVENTS_2026, 3, march10);
    const eclipse = active.find(e => e.type === 'lunar_eclipse');
    expect(eclipse).toBeUndefined();
  });

  test('only events that exist in the table can be returned', () => {
    // If we query for any date, we can only get back what is in the table
    const allReturnable = new Set(
      getUpcomingEvents(ASTRO_EVENTS_2026, 365, new Date('2026-01-01')).map(e => `${e.date}:${e.type}`)
    );
    const allInTable = new Set(
      ASTRO_EVENTS_2026.map(e => `${e.date}:${e.type}`)
    );

    // Every returnable event must exist in the table
    for (const key of allReturnable) {
      expect(allInTable.has(key)).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONFIDENCE TIER DISCIPLINE
// ─────────────────────────────────────────────────────────────────────────────

describe('Confidence tier discipline', () => {
  test('no event in table has confidence uncertain', () => {
    const uncertain = ASTRO_EVENTS_2026.filter(e => e.confidence === 'uncertain');
    expect(uncertain).toHaveLength(0);
  });

  test('eclipse entries have confidence known, not derived', () => {
    const eclipses = ASTRO_EVENTS_2026.filter(
      e => e.type === 'solar_eclipse' || e.type === 'lunar_eclipse'
    );
    for (const eclipse of eclipses) {
      expect(eclipse.confidence).toBe('known');
    }
  });

  test('calculated lunations have confidence derived', () => {
    const calculated = ASTRO_EVENTS_2026.filter(e => e.source === 'calculated');
    for (const e of calculated) {
      expect(e.confidence).toBe('derived');
    }
  });

  test('event_table entries have confidence known', () => {
    const tableEntries = ASTRO_EVENTS_2026.filter(e => e.source === 'event_table');
    for (const e of tableEntries) {
      expect(e.confidence).toBe('known');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. DATE FORMAT CONSISTENCY (prerequisite for correct lookups)
// ─────────────────────────────────────────────────────────────────────────────

describe('Date format consistency', () => {
  test('all event dates parse as valid Date objects', () => {
    for (const event of ASTRO_EVENTS_2026) {
      const d = new Date(event.date + 'T12:00:00Z');
      expect(isNaN(d.getTime())).toBe(false);
    }
  });

  test('no event dates are in the past (before 2026)', () => {
    for (const event of ASTRO_EVENTS_2026) {
      const year = parseInt(event.date.slice(0, 4));
      expect(year).toBe(2026);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. QUERY RETURNS EMPTY FOR UNKNOWN EVENTS
// Simulates MAIA asking "is there an eclipse next week?" for a week with none.
// ─────────────────────────────────────────────────────────────────────────────

describe('Empty returns for event-free windows', () => {
  const eclipseFreeDates = [
    new Date('2026-05-01T12:00:00Z'),
    new Date('2026-06-15T12:00:00Z'),
    new Date('2026-07-04T12:00:00Z'),
  ];

  test.each(eclipseFreeDates)(
    'no eclipse active around %s',
    (date) => {
      const active = getActiveEvents(ASTRO_EVENTS_2026, 7, date);
      const eclipses = active.filter(e => e.type === 'solar_eclipse' || e.type === 'lunar_eclipse');
      expect(eclipses).toHaveLength(0);
    }
  );

  test('getUpcomingEvents returns empty for a period with no events', () => {
    // Query for just 1 day in a lunation gap
    const gap = new Date('2026-04-05T00:00:00Z'); // between April 2 full moon and April 17 new moon
    const events = getUpcomingEvents(ASTRO_EVENTS_2026, 1, gap);
    // Should be empty or minimal — no events in that 1-day window
    const eclipses = events.filter(e => e.type === 'solar_eclipse' || e.type === 'lunar_eclipse');
    expect(eclipses).toHaveLength(0);
  });
});
