/**
 * Pallas, Juno and Vesta are withheld while their orbital elements are
 * unverified (lib/astrology/unverifiedBodies.ts). A chart must not carry a
 * position for them, nor an aspect that uses one.
 */
import { calculateBirthChart } from '@/lib/astrology/ephemerisCalculator';
import { calculateBirthChart as calculateProChart } from '@/lib/astrology/proEphemerisCalculator';
import { INCLUDE_UNVERIFIED_ASTEROIDS } from '@/lib/astrology/unverifiedBodies';

const BIRTH = {
  date: '2003-09-03', time: '12:15',
  location: { lat: 41.3083, lng: -72.9279, timezone: 'UTC' },
  houseSystem: 'whole-sign' as const,
};
const ASTEROIDS = /pallas|juno|vesta/i;

describe('unverified asteroids are withheld', () => {
  it('is switched off', () => {
    expect(INCLUDE_UNVERIFIED_ASTEROIDS).toBe(false);
  });
  it.each([['free', calculateBirthChart], ['pro', calculateProChart]] as const)(
    '%s chart has no Pallas/Juno/Vesta position or aspect', async (_n, calc) => {
      const chart: any = await (calc as any)(BIRTH);
      expect(chart.pallas).toBeUndefined();
      expect(chart.juno).toBeUndefined();
      expect(chart.vesta).toBeUndefined();
      expect(JSON.stringify(chart.aspects)).not.toMatch(ASTEROIDS);
      // The verified bodies are still there.
      expect(chart.sun.sign).toBe('Virgo');
      expect(chart.ceres).toBeDefined();
      expect(chart.chiron).toBeDefined();
    });
});
