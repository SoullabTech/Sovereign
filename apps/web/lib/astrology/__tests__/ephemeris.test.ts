/**
 * EPHEMERIS CALCULATOR TESTS
 *
 * These tests verify chart calculations against known accurate data
 * to prevent timezone and calculation bugs
 */

import { calculateBirthChart } from '../ephemerisCalculator';

describe('Ephemeris Calculator - Timezone Handling', () => {
  /**
   * Test Case: Kelly Nezat
   * Birth: Dec 9, 1966, 10:29 PM CST
   * Location: Baton Rouge, LA (30.45°N, 91.19°W)
   *
   * Expected positions from Time Passages/Astro.com:
   * - Sun: 17° Sagittarius 39'
   * - Moon: 22° Scorpio 32'
   * - Mercury: 28° Scorpio 05'
   * - Venus: 25° Sagittarius 18'
   * - Mars: 3° Libra 16'
   * - Ascendant: 29° Leo 25'
   */
  test('Kelly Nezat birth chart - CST timezone conversion', async () => {
    const chart = await calculateBirthChart({
      date: '1966-12-09',
      time: '22:29',
      location: {
        lat: 30.45,
        lng: -91.19,
        timezone: 'America/Chicago'
      }
    });

    // Verify Sun position (±1° tolerance for calculation differences)
    expect(chart.sun.sign).toBe('Sagittarius');
    expect(chart.sun.degree).toBeGreaterThan(16);
    expect(chart.sun.degree).toBeLessThan(19);

    // Verify Moon position
    expect(chart.moon.sign).toBe('Scorpio');
    expect(chart.moon.degree).toBeGreaterThan(21);
    expect(chart.moon.degree).toBeLessThan(24);

    // Verify Mercury position
    expect(chart.mercury.sign).toBe('Scorpio');
    expect(chart.mercury.degree).toBeGreaterThan(27);
    expect(chart.mercury.degree).toBeLessThan(29);

    // Verify Venus position
    expect(chart.venus.sign).toBe('Sagittarius');
    expect(chart.venus.degree).toBeGreaterThan(24);
    expect(chart.venus.degree).toBeLessThan(26);

    // Verify Mars position
    expect(chart.mars.sign).toBe('Libra');
    expect(chart.mars.degree).toBeGreaterThan(2);
    expect(chart.mars.degree).toBeLessThan(5);

    // Verify Ascendant (critical for timezone accuracy)
    expect(chart.ascendant.sign).toBe('Leo');
    expect(chart.ascendant.degree).toBeGreaterThan(28);
    expect(chart.ascendant.degree).toBeLessThan(30);
  });

  /**
   * Test Case: Different timezone (EST)
   * Birth: Jan 1, 1990, 12:00 PM EST
   * Location: New York (40.71°N, 74.01°W)
   */
  test('EST timezone conversion', async () => {
    const chart = await calculateBirthChart({
      date: '1990-01-01',
      time: '12:00',
      location: {
        lat: 40.71,
        lng: -74.01,
        timezone: 'America/New_York'
      }
    });

    // Sun should be in Capricorn on Jan 1
    expect(chart.sun.sign).toBe('Capricorn');
  });

  /**
   * Test Case: UTC (no timezone offset)
   * Birth: Jun 21, 2000, 12:00 UTC
   * Location: Greenwich (51.48°N, 0°W)
   */
  test('UTC (zero offset) timezone', async () => {
    const chart = await calculateBirthChart({
      date: '2000-06-21',
      time: '12:00',
      location: {
        lat: 51.48,
        lng: 0,
        timezone: 'UTC'
      }
    });

    // Sun should be at the beginning of Cancer (summer solstice)
    expect(chart.sun.sign).toBe('Cancer');
    expect(chart.sun.degree).toBeLessThan(2); // Near 0° Cancer
  });

  /**
   * Test Case: Western hemisphere vs Eastern hemisphere
   */
  test('Eastern hemisphere (positive longitude) timezone', async () => {
    const chart = await calculateBirthChart({
      date: '2000-01-01',
      time: '12:00',
      location: {
        lat: 35.68,
        lng: 139.69, // Tokyo
        timezone: 'Asia/Tokyo'
      }
    });

    expect(chart.sun.sign).toBe('Capricorn');
  });
});

describe('Ephemeris Calculator - House Systems', () => {
  const birthData = {
    date: '1966-12-09',
    time: '22:29',
    location: {
      lat: 30.45,
      lng: -91.19,
      timezone: 'America/Chicago'
    }
  };

  test('Whole Sign houses - each house is one complete sign', async () => {
    const chart = await calculateBirthChart({
      ...birthData,
      houseSystem: 'whole-sign'
    });

    // In Whole Sign, 1st house starts at 0° of rising sign
    // Rising sign is Leo (29°), so 1st house should start at 0° Leo
    expect(chart.houses[0]).toBe(120); // 0° Leo = 120° ecliptic longitude
  });

  test('Equal houses - 30° divisions from Ascendant', async () => {
    const chart = await calculateBirthChart({
      ...birthData,
      houseSystem: 'equal'
    });

    // In Equal houses, 1st house starts exactly at Ascendant degree
    // Ascendant is ~29° Leo = ~149° ecliptic
    expect(chart.houses[0]).toBeCloseTo(149, 1);
  });

  test('Different house systems produce different house cusps', async () => {
    const wholeSign = await calculateBirthChart({
      ...birthData,
      houseSystem: 'whole-sign'
    });

    const equal = await calculateBirthChart({
      ...birthData,
      houseSystem: 'equal'
    });

    // House cusps should differ between systems
    expect(wholeSign.houses[0]).not.toBe(equal.houses[0]);
  });
});

describe('Ephemeris Calculator - Edge Cases', () => {
  test('Handles birth near midnight', async () => {
    const chart = await calculateBirthChart({
      date: '1990-01-01',
      time: '23:59',
      location: {
        lat: 40.71,
        lng: -74.01,
        timezone: 'America/New_York'
      }
    });

    expect(chart.sun.sign).toBe('Capricorn');
  });

  test('Handles birth at exactly midnight', async () => {
    const chart = await calculateBirthChart({
      date: '1990-01-01',
      time: '00:00',
      location: {
        lat: 40.71,
        lng: -74.01,
        timezone: 'America/New_York'
      }
    });

    expect(chart.sun.sign).toBe('Capricorn');
  });

  test('Handles birth at noon', async () => {
    const chart = await calculateBirthChart({
      date: '1990-06-21',
      time: '12:00',
      location: {
        lat: 40.71,
        lng: -74.01,
        timezone: 'America/New_York'
      }
    });

    expect(chart.sun.sign).toBe('Cancer');
  });
});
