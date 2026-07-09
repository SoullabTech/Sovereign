/**
 * Birth-time → UTC resolution (lib/astrology/ephemerisCalculator.ts)
 *
 * Guards the fix for the longitude-approximation bug: natal charts must use
 * the IANA timezone (with historical rules) when one is provided, and only
 * fall back to round(lng/15) when it is absent or invalid.
 */
import { resolveBirthTimeUTC, isValidTimeZone } from '@/lib/astrology/ephemerisCalculator';

// Muskegon, MI: lat 43.23, lng -86.25
const MUSKEGON_LNG = -86.25;

describe('resolveBirthTimeUTC', () => {
  it('uses historical rules: Muskegon 1956-07-11 01:43 America/Detroit → 06:43Z (year-round EST, not the longitude UTC-6)', () => {
    const r = resolveBirthTimeUTC(1956, 7, 11, 1, 43, 'America/Detroit', MUSKEGON_LNG);
    expect(r.source).toBe('iana');
    expect(r.utc.toISOString()).toBe('1956-07-11T06:43:00.000Z');
    expect(r.offsetLabel).toBe('UTC-5');
    // The old longitude approximation gave 07:43Z (round(-86.25/15) = -6) — a
    // one-hour error ≈ 15° of ascendant.
    expect(r.utc.toISOString()).not.toBe('1956-07-11T07:43:00.000Z');
  });

  it('submitted timezone overrides longitude even when they disagree: Muskegon coords + America/New_York → 05:43Z (EDT), never the longitude-derived 07:43Z', () => {
    // The exact prod scenario: the form geocoded Muskegon to America/New_York.
    // Note America/New_York observed DST every summer since 1920 (July 1956 =
    // EDT, UTC-4) — it is NOT year-round EST; that was Michigan's own zone,
    // America/Detroit (see previous test). The submitted zone must win over
    // the longitude derivation regardless.
    const r = resolveBirthTimeUTC(1956, 7, 11, 1, 43, 'America/New_York', MUSKEGON_LNG);
    expect(r.source).toBe('iana');
    expect(r.utc.toISOString()).toBe('1956-07-11T05:43:00.000Z');
    expect(r.offsetLabel).toBe('UTC-4');
    expect(r.utc.toISOString()).not.toBe('1956-07-11T07:43:00.000Z');
  });

  it('applies DST: New York 2000-07-01 12:00 (EDT, UTC-4) → 16:00Z', () => {
    const r = resolveBirthTimeUTC(2000, 7, 1, 12, 0, 'America/New_York', -74.0);
    expect(r.source).toBe('iana');
    expect(r.utc.toISOString()).toBe('2000-07-01T16:00:00.000Z');
    expect(r.offsetLabel).toBe('UTC-4');
  });

  it('applies standard time outside DST: New York 2000-01-01 12:00 (EST, UTC-5) → 17:00Z', () => {
    const r = resolveBirthTimeUTC(2000, 1, 1, 12, 0, 'America/New_York', -74.0);
    expect(r.source).toBe('iana');
    expect(r.utc.toISOString()).toBe('2000-01-01T17:00:00.000Z');
    expect(r.offsetLabel).toBe('UTC-5');
  });

  it('handles non-hour offsets: Mumbai 1990-06-15 06:30 Asia/Kolkata (UTC+5:30) → 01:00Z', () => {
    const r = resolveBirthTimeUTC(1990, 6, 15, 6, 30, 'Asia/Kolkata', 72.88);
    expect(r.source).toBe('iana');
    expect(r.utc.toISOString()).toBe('1990-06-15T01:00:00.000Z');
    expect(r.offsetLabel).toBe('UTC+5:30');
  });

  it('falls back to longitude approximation when timezone is absent', () => {
    const r = resolveBirthTimeUTC(1956, 7, 11, 1, 43, undefined, MUSKEGON_LNG);
    expect(r.source).toBe('longitude-approximation');
    // round(-86.25 / 15) = -6 → 01:43 + 6h
    expect(r.utc.toISOString()).toBe('1956-07-11T07:43:00.000Z');
    expect(r.offsetLabel).toBe('UTC-6');
  });

  it('falls back to longitude approximation when timezone is invalid', () => {
    const r = resolveBirthTimeUTC(2000, 7, 1, 12, 0, 'Not/AZone', -91.0);
    expect(r.source).toBe('longitude-approximation');
    // round(-91 / 15) = -6 → 12:00 + 6h
    expect(r.utc.toISOString()).toBe('2000-07-01T18:00:00.000Z');
    expect(r.offsetLabel).toBe('UTC-6');
  });

  it('honors an explicit UTC timezone', () => {
    const r = resolveBirthTimeUTC(2000, 7, 1, 12, 0, 'UTC', -91.0);
    expect(r.source).toBe('iana');
    expect(r.utc.toISOString()).toBe('2000-07-01T12:00:00.000Z');
  });
});

describe('isValidTimeZone', () => {
  it('accepts IANA identifiers', () => {
    expect(isValidTimeZone('America/Detroit')).toBe(true);
    expect(isValidTimeZone('Asia/Kolkata')).toBe(true);
    expect(isValidTimeZone('UTC')).toBe(true);
  });

  it('rejects absent or malformed values', () => {
    expect(isValidTimeZone(undefined)).toBe(false);
    expect(isValidTimeZone('')).toBe(false);
    expect(isValidTimeZone('Not/AZone')).toBe(false);
    expect(isValidTimeZone('EST5EDT maybe')).toBe(false);
  });
});
