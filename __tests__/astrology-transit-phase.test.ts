/**
 * Applying/separating must follow the body's real motion. Facts used here are
 * independent of the code: the Sun never retrogrades, so it approaches a point
 * ahead of it and leaves a point behind it; Saturn was retrograde between
 * 13 Jul and 28 Nov 2025 and stood at about 0° Aries on 1 Oct 2025, so it was
 * approaching a point at 355° (behind it) and leaving a point at 5° (ahead).
 */
import { findTransitAspects, isApplying, transitPositionsAt, type TransitPositions } from '@/lib/astrology/transitCalculator';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const natalAt = (lon: number) => ({ sign: SIGNS[Math.floor(lon / 30)], degree: lon % 30, house: 1, retrograde: false });
const chartWith = (planet: string, lon: number): any => {
  const far = natalAt(200);
  const c: any = {};
  for (const k of ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto']) c[k] = natalAt(k === planet ? lon : 200);
  return c;
};
const conj = (aspects: any[], t: string, n: string) => aspects.find(a => a.transitPlanet === t && a.natalPlanet === n && a.aspectType === 'conjunction');

describe('isApplying', () => {
  it('closing and opening', () => {
    expect(isApplying(100, 95, 95.1, 0)).toBe(true);   // behind and moving toward
    expect(isApplying(100, 105, 105.1, 0)).toBe(false); // ahead and moving away
    expect(isApplying(100, 95, 94.9, 0)).toBe(false);   // retrograde, moving away
  });
  it('is null when nothing changes', () => {
    expect(isApplying(100, 95, 95, 0)).toBeNull();
  });
  it('handles the 0° Aries wrap', () => {
    expect(isApplying(5, 359, 359.1, 0)).toBe(true);
  });
});

describe('findTransitAspects uses real motion', () => {
  it('Sun approaches a point 3° ahead and leaves a point 3° behind', () => {
    const date = new Date('2026-03-10T12:00:00Z');
    const t = transitPositionsAt(date);
    const ahead = findTransitAspects(t, chartWith('mars', (t.sun + 3) % 360));
    const behind = findTransitAspects(t, chartWith('mars', (t.sun - 3 + 360) % 360));
    expect(conj(ahead, 'Sun', 'Mars').applying).toBe(true);
    expect(conj(behind, 'Sun', 'Mars').applying).toBe(false);
  });
  it('retrograde Saturn approaches a point behind it and leaves one ahead', () => {
    const date = new Date('2025-10-01T12:00:00Z');
    const t = transitPositionsAt(date);
    expect(t.saturn > 355 || t.saturn < 5).toBe(true);
    const behind = findTransitAspects(t, chartWith('mars', 355));
    const ahead = findTransitAspects(t, chartWith('mars', 5));
    expect(conj(behind, 'Saturn', 'Mars').applying).toBe(true);
    expect(conj(ahead, 'Saturn', 'Mars').applying).toBe(false);
  });
  it('does not invent exact dates or windows', () => {
    const t = transitPositionsAt(new Date('2026-03-10T12:00:00Z'));
    const a = findTransitAspects(t, chartWith('mars', (t.sun + 3) % 360));
    expect(a.length).toBeGreaterThan(0);
    for (const x of a) { expect(x.exactDate).toBeNull(); expect(x.activeFrom).toBeNull(); expect(x.activeTo).toBeNull(); }
  });
});

import { buildTransitImpacts } from '@/lib/astrology/transitInterpretation';

describe('buildTransitImpacts phase (outer planets to natal personal planets)', () => {
  const chart: any = {
    sun: { sign: 'Aries', degree: 5 }, moon: { sign: 'Aries', degree: 5 }, mercury: { sign: 'Aries', degree: 5 },
    venus: { sign: 'Aries', degree: 5 }, mars: { sign: 'Aries', degree: 5 }, chiron: { sign: 'Aries', degree: 5 },
    ascendant: { sign: 'Aries', degree: 5 },
  };
  const phase = (retrograde: boolean, sign: string, degree: number) =>
    buildTransitImpacts(chart, [{ planet: 'Saturn', sign, degree, retrograde }])[0].forces[0].applying;

  it('direct planet behind the point approaches; ahead of it separates', () => {
    expect(phase(false, 'Aries', 2)).toBe(true);
    expect(phase(false, 'Aries', 8)).toBe(false);
  });
  it('retrograde reverses it', () => {
    expect(phase(true, 'Aries', 2)).toBe(false);
    expect(phase(true, 'Aries', 8)).toBe(true);
  });
  it('is not claimed for an exact aspect', () => {
    expect(phase(false, 'Aries', 5)).toBeNull();
  });
});
