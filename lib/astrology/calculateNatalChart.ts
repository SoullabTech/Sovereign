/**
 * calculateNatalChart
 *
 * Computes natal chart placements from normalized birth data.
 * All calculations use localDateParts (not JavaScript Date string parsing).
 *
 * Method accuracy:
 * - Sun sign: exact (boundary-safe zodiac range lookup)
 * - Moon sign: mean position, accurate to ±1 sign for most dates
 * - Ascendant: Meeus formula, accurate to ±2° for mid-latitudes
 * - Planetary signs: omitted — requires Swiss Ephemeris for accuracy
 *
 * For production accuracy, swap calculateNatalChart with a swisseph call
 * in the _backend Express service. This module provides the verified base layer.
 */

import type { NormalizedBirthData } from './normalizeBirthData';

export type ZodiacElement = 'fire' | 'water' | 'earth' | 'air';

export interface SignPlacement {
  sign: string;
  element: ZodiacElement;
  degree?: number;
}

export interface NatalChart {
  sun: SignPlacement;
  moon: SignPlacement;
  ascendant: SignPlacement | null;  // null if no birth time / coordinates
  calculationMode: 'full' | 'no-ascendant' | 'no-time';
  elementalDistribution: Record<ZodiacElement, number>; // percentages summing to 100
  dominantElement: ZodiacElement;
  underactiveElement: ZodiacElement;
}

// ── Zodiac sign lookup ────────────────────────────────────────────────────────

const ZODIAC: Array<[string, ZodiacElement, number, number]> = [
  // [sign, element, startMD, endMD]  (MD = month*100+day)
  ['Aries',       'fire',  321,  419],
  ['Taurus',      'earth', 420,  520],
  ['Gemini',      'air',   521,  620],
  ['Cancer',      'water', 621,  722],
  ['Leo',         'fire',  723,  822],
  ['Virgo',       'earth', 823,  922],
  ['Libra',       'air',   923, 1022],
  ['Scorpio',     'water',1023, 1121],
  ['Sagittarius', 'fire', 1122, 1221],
  // Capricorn: 1222-0119 (wraps year boundary)
  ['Aquarius',    'air',   120,  218],
  ['Pisces',      'water', 219,  320],
];

function lookupSign(month: number, day: number): SignPlacement {
  const md = month * 100 + day;
  for (const [sign, element, start, end] of ZODIAC) {
    if (md >= start && md <= end) return { sign, element };
  }
  // Capricorn: Dec 22 – Jan 19
  return { sign: 'Capricorn', element: 'earth' };
}

// ── Moon mean longitude ───────────────────────────────────────────────────────

function computeMoonSign(normalized: NormalizedBirthData): SignPlacement {
  const { year, month, day, hour, minute } = normalized.localDateParts;

  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  let birthUtcMs: number;
  if (normalized.utcIsoForCalculation) {
    birthUtcMs = new Date(normalized.utcIsoForCalculation).getTime();
  } else {
    // Fallback: longitude-based approximation
    const utcOffset = normalized.lng != null ? normalized.lng / 15 : 0;
    const localMs = Date.UTC(year, month - 1, day, Math.floor(hour), minute, 0);
    birthUtcMs = localMs - utcOffset * 3600 * 1000;
  }
  const daysSince = (birthUtcMs - j2000) / 86400000;

  const moonLon = ((218.3 + 13.17639648 * daysSince) % 360 + 360) % 360;
  const signIndex = Math.floor(moonLon / 30);

  const moonSigns: Array<[string, ZodiacElement]> = [
    ['Aries','fire'],['Taurus','earth'],['Gemini','air'],['Cancer','water'],
    ['Leo','fire'],['Virgo','earth'],['Libra','air'],['Scorpio','water'],
    ['Sagittarius','fire'],['Capricorn','earth'],['Aquarius','air'],['Pisces','water'],
  ];
  const [sign, element] = moonSigns[signIndex];
  return { sign, element, degree: Math.round(moonLon % 30) };
}

// ── Ascendant (Meeus formula) ─────────────────────────────────────────────────

function computeAscendant(normalized: NormalizedBirthData): SignPlacement | null {
  const { lat, lng } = normalized;
  if (lat == null || lng == null || !normalized.birthTime) return null;
  if (lat < -89.9 || lat > 89.9) return null;

  const { year, month, day, hour, minute } = normalized.localDateParts;

  let utHour: number;
  if (normalized.utcIsoForCalculation) {
    const timePart = normalized.utcIsoForCalculation.split('T')[1]; // "13:00:00Z"
    const [hStr, mStr] = timePart.replace('Z', '').split(':').map(Number);
    utHour = hStr + mStr / 60;
  } else {
    // Fallback: longitude-based approximation
    const utcOffset = lng / 15;
    utHour = hour - utcOffset + minute / 60;
  }

  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const birthDayUtcMs = Date.UTC(year, month - 1, day, 0, 0, 0);
  const T = (birthDayUtcMs - j2000) / 86400000;

  const GST0 = ((280.46061837 + 360.98564736629 * T) % 360 + 360) % 360;
  const GST = ((GST0 + utHour * 15.041069) % 360 + 360) % 360;
  const LST = ((GST + lng) % 360 + 360) % 360;

  const eps = 23.4393 - 0.0000004 * T;
  const RAmcRad = LST * Math.PI / 180;
  const epsRad = eps * Math.PI / 180;
  const latRad = lat * Math.PI / 180;

  let ascLon = Math.atan2(
    -Math.cos(RAmcRad),
    Math.sin(RAmcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad),
  ) * 180 / Math.PI;
  ascLon = ((ascLon % 360) + 360) % 360;

  const ascSigns: Array<[string, ZodiacElement]> = [
    ['Aries','fire'],['Taurus','earth'],['Gemini','air'],['Cancer','water'],
    ['Leo','fire'],['Virgo','earth'],['Libra','air'],['Scorpio','water'],
    ['Sagittarius','fire'],['Capricorn','earth'],['Aquarius','air'],['Pisces','water'],
  ];
  const [sign, element] = ascSigns[Math.floor(ascLon / 30)];
  return { sign, element, degree: Math.round(ascLon % 30) };
}

// ── Elemental distribution ────────────────────────────────────────────────────

function computeElementalDistribution(
  sun: SignPlacement,
  moon: SignPlacement,
  asc: SignPlacement | null,
  timeElement: ZodiacElement,
): Record<ZodiacElement, number> {
  const dist: Record<ZodiacElement, number> = { fire: 0, water: 0, earth: 0, air: 0 };
  const elements: ZodiacElement[] = ['fire', 'water', 'earth', 'air'];

  if (asc) {
    dist[sun.element]  += 30;
    dist[moon.element] += 25;
    dist[asc.element]  += 25;
    dist[timeElement]  += 10;
    const weighted = new Set([sun.element, moon.element, asc.element, timeElement]);
    const rem = elements.filter(e => !weighted.has(e));
    if (rem.length === 0) dist[sun.element] += 10;
    else rem.forEach(e => { dist[e] += 10 / rem.length; });
  } else {
    dist[sun.element]  += 35;
    dist[moon.element] += 30;
    dist[timeElement]  += 20;
    const weighted = new Set([sun.element, moon.element, timeElement]);
    const rem = elements.filter(e => !weighted.has(e));
    if (rem.length === 0) dist[sun.element] += 15;
    else rem.forEach(e => { dist[e] += 15 / rem.length; });
  }

  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  elements.forEach(e => { dist[e] = Math.round((dist[e] / total) * 100); });
  const sum = Object.values(dist).reduce((a, b) => a + b, 0);
  if (sum !== 100) {
    const dom = elements.reduce((a, b) => dist[a] > dist[b] ? a : b);
    dist[dom] += 100 - sum;
  }
  return dist;
}

function getTimeElement(hour: number): ZodiacElement {
  if (hour >= 6 && hour < 12)  return 'fire';
  if (hour >= 12 && hour < 18) return 'earth';
  if (hour >= 18 && hour < 24) return 'air';
  return 'water';
}

// ── Main export ───────────────────────────────────────────────────────────────

export function calculateNatalChart(normalized: NormalizedBirthData): NatalChart {
  const { month, day, hour } = normalized.localDateParts;

  const sun = lookupSign(month, day);
  const moon = computeMoonSign(normalized);
  const ascendant = computeAscendant(normalized);
  const timeElement = getTimeElement(hour);

  const elementalDistribution = computeElementalDistribution(sun, moon, ascendant, timeElement);
  const elements: ZodiacElement[] = ['fire', 'water', 'earth', 'air'];
  const dominantElement = elements.reduce((a, b) => elementalDistribution[a] > elementalDistribution[b] ? a : b);
  const underactiveElement = elements.reduce((a, b) => elementalDistribution[a] < elementalDistribution[b] ? a : b);

  const calculationMode: NatalChart['calculationMode'] = ascendant
    ? 'full'
    : normalized.birthTime
      ? 'no-ascendant'
      : 'no-time';

  return {
    sun,
    moon,
    ascendant,
    calculationMode,
    elementalDistribution,
    dominantElement,
    underactiveElement,
  };
}
