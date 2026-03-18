/**
 * EVENT INTEGRITY TESTS — transitSnapshot.ts
 *
 * Verifies the locked 2026 event table is accurate and that the
 * query helpers enforce the correct data boundaries.
 *
 * These tests are the first guardrail: if the table is wrong, all
 * downstream interpretation is wrong.
 */

import {
  ASTRO_EVENTS_2026,
  getUpcomingEvents,
  getActiveEvents,
  confidenceLabel,
  type AstroEvent,
} from '@/lib/astrology/transitSnapshot';

// ─────────────────────────────────────────────────────────────────────────────
// 1. TABLE STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────

describe('ASTRO_EVENTS_2026 — table structure', () => {
  test('table is non-empty', () => {
    expect(ASTRO_EVENTS_2026.length).toBeGreaterThan(0);
  });

  test('every entry has required fields', () => {
    for (const event of ASTRO_EVENTS_2026) {
      expect(event.type).toBeDefined();
      expect(event.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD
      expect(event.confidence).toMatch(/^(known|derived|uncertain)$/);
      expect(event.source).toMatch(/^(event_table|calculated)$/);
      expect(event.description).toBeTruthy();
    }
  });

  test('all dates are in 2026', () => {
    for (const event of ASTRO_EVENTS_2026) {
      expect(event.date.startsWith('2026-')).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. ECLIPSE INTEGRITY
// ─────────────────────────────────────────────────────────────────────────────

describe('Eclipse entries — verified dates', () => {
  const eclipses = ASTRO_EVENTS_2026.filter(
    e => e.type === 'solar_eclipse' || e.type === 'lunar_eclipse'
  );

  test('exactly 2 eclipses in 2026 table', () => {
    expect(eclipses.length).toBe(2);
  });

  test('Total Lunar Eclipse on 2026-03-03 in Virgo — confidence known', () => {
    const lunarEclipse = eclipses.find(e => e.type === 'lunar_eclipse');
    expect(lunarEclipse).toBeDefined();
    expect(lunarEclipse!.date).toBe('2026-03-03');
    expect(lunarEclipse!.sign).toBe('Virgo');
    expect(lunarEclipse!.confidence).toBe('known');
    expect(lunarEclipse!.eclipseType).toBe('total');
  });

  test('Total Solar Eclipse on 2026-08-12 in Leo — confidence known', () => {
    const solarEclipse = eclipses.find(e => e.type === 'solar_eclipse');
    expect(solarEclipse).toBeDefined();
    expect(solarEclipse!.date).toBe('2026-08-12');
    expect(solarEclipse!.sign).toBe('Leo');
    expect(solarEclipse!.confidence).toBe('known');
    expect(solarEclipse!.eclipseType).toBe('total');
  });

  // THE KEY GUARDRAIL TEST — this was the exact failure mode
  test('March 19 is NOT a solar eclipse (it is the New Moon in Pisces)', () => {
    const march19SolarEclipse = ASTRO_EVENTS_2026.find(
      e => e.date === '2026-03-19' && e.type === 'solar_eclipse'
    );
    expect(march19SolarEclipse).toBeUndefined();
  });

  test('March 19 IS a new moon in Pisces', () => {
    const march19NewMoon = ASTRO_EVENTS_2026.find(
      e => e.date === '2026-03-19' && e.type === 'new_moon'
    );
    expect(march19NewMoon).toBeDefined();
    expect(march19NewMoon!.sign).toBe('Pisces');
    expect(march19NewMoon!.confidence).toBe('known');
  });

  test('all eclipse entries are marked confidence known', () => {
    for (const eclipse of eclipses) {
      expect(eclipse.confidence).toBe('known');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. LUNATION COVERAGE
// ─────────────────────────────────────────────────────────────────────────────

describe('Lunation coverage', () => {
  const newMoons = ASTRO_EVENTS_2026.filter(e => e.type === 'new_moon');
  const fullMoons = ASTRO_EVENTS_2026.filter(e => e.type === 'full_moon');

  test('at least 10 new moons in table', () => {
    expect(newMoons.length).toBeGreaterThanOrEqual(10);
  });

  test('at least 10 full moons in table', () => {
    expect(fullMoons.length).toBeGreaterThanOrEqual(10);
  });

  test('Full Moon on 2026-03-03 matches Lunar Eclipse entry', () => {
    const fm = fullMoons.find(e => e.date === '2026-03-03');
    expect(fm).toBeDefined();
    expect(fm!.sign).toBe('Virgo');
  });

  test('New Moon on 2026-08-12 matches Solar Eclipse entry', () => {
    const nm = newMoons.find(e => e.date === '2026-08-12');
    expect(nm).toBeDefined();
    expect(nm!.sign).toBe('Leo');
  });

  test('no duplicate (same date + same type)', () => {
    const keys = ASTRO_EVENTS_2026.map(e => `${e.date}:${e.type}`);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. QUERY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

describe('getUpcomingEvents', () => {
  // Anchor: just before the New Moon in Pisces
  const anchor = new Date('2026-03-18T00:00:00Z');

  test('returns the March 19 New Moon within 30-day window', () => {
    const events = getUpcomingEvents(ASTRO_EVENTS_2026, 30, anchor);
    const nm = events.find(e => e.date === '2026-03-19');
    expect(nm).toBeDefined();
  });

  test('does not return events outside the window', () => {
    const events = getUpcomingEvents(ASTRO_EVENTS_2026, 5, anchor);
    const aug = events.find(e => e.date === '2026-08-12');
    expect(aug).toBeUndefined();
  });

  test('returns events sorted ascending by date', () => {
    const events = getUpcomingEvents(ASTRO_EVENTS_2026, 60, anchor);
    for (let i = 1; i < events.length; i++) {
      expect(events[i].date >= events[i - 1].date).toBe(true);
    }
  });

  test('empty array returns empty', () => {
    const events = getUpcomingEvents([], 30, anchor);
    expect(events).toHaveLength(0);
  });
});

describe('getActiveEvents', () => {
  // Anchor: the day of the Total Lunar Eclipse
  const eclipseDay = new Date('2026-03-03T12:00:00Z');

  test('returns Lunar Eclipse as active on its date', () => {
    const active = getActiveEvents(ASTRO_EVENTS_2026, 3, eclipseDay);
    const eclipse = active.find(e => e.type === 'lunar_eclipse');
    expect(eclipse).toBeDefined();
  });

  test('does not return eclipse 10 days later', () => {
    const later = new Date('2026-03-13T12:00:00Z');
    const active = getActiveEvents(ASTRO_EVENTS_2026, 3, later);
    const eclipse = active.find(e => e.type === 'lunar_eclipse');
    expect(eclipse).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. CONFIDENCE LABELS
// ─────────────────────────────────────────────────────────────────────────────

describe('confidenceLabel', () => {
  test('known returns (verified)', () => {
    expect(confidenceLabel('known')).toBe('(verified)');
  });

  test('derived returns approximate label', () => {
    expect(confidenceLabel('derived')).toContain('±1 day');
  });

  test('uncertain returns do-not-state label', () => {
    expect(confidenceLabel('uncertain')).toContain('do not state');
  });
});
