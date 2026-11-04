/**
 * ASTRO-PRO-TRANSFORMS-01 — alternate views of a calculated chart.
 *
 * Sidereal: every longitude shifted by the ayanamsa the server returned.
 * Harmonic: every longitude multiplied by n (mod 360), equal houses from the
 *   harmonic Ascendant. Aspects are recalculated for the new positions.
 * Lots: Part of Fortune and Part of Spirit, day/night by the Sun's house.
 *
 * Pure geometry over the calculator's output; no interpretation.
 */
import type { Aspect, BirthChart, PlanetPosition } from './proEphemerisCalculator';
import {
  BODY_DEFINITIONS, SIGNS, chartBodies, geometricHouseFromCusps, normalizeLongitude, toEclipticLongitude,
} from './proChartGeometry';
import { angularSeparation } from './proTransits';

const ASPECTS: ReadonlyArray<readonly [Aspect['type'], number, number]> = [
  ['conjunction', 0, 8], ['opposition', 180, 8], ['trine', 120, 8],
  ['square', 90, 8], ['sextile', 60, 6], ['quincunx', 150, 3],
];

function place(longitude: number): { sign: string; degree: number } {
  const lon = normalizeLongitude(longitude);
  const index = Math.floor(lon / 30);
  return { sign: SIGNS[index], degree: Number((lon - index * 30).toFixed(4)) };
}

function recalcAspects(longitudes: Record<string, number>): Aspect[] {
  const names = Object.keys(longitudes);
  const aspects: Aspect[] = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const separation = angularSeparation(longitudes[names[i]], longitudes[names[j]]);
      for (const [type, angle, orbLimit] of ASPECTS) {
        const orb = Math.abs(separation - angle);
        if (orb <= orbLimit) aspects.push({ planet1: names[i], planet2: names[j], type, orb: Number(orb.toFixed(2)), exact: orb < 1 });
      }
    }
  }
  return aspects;
}

/**
 * Applies `map` to every wheel body and both angles. `houses` decides the
 * new cusps from the mapped Ascendant. Bodies not on the wheel are dropped.
 */
function remap(
  chart: BirthChart,
  map: (lon: number) => number,
  houses: (asc: number) => number[],
  keepAspects: boolean,
): BirthChart | null {
  const asc = toEclipticLongitude(chart.ascendant.sign, chart.ascendant.degree);
  const mc = toEclipticLongitude(chart.midheaven.sign, chart.midheaven.degree);
  if (asc === null || mc === null) return null;
  const newAsc = normalizeLongitude(map(asc));
  const cusps = houses(newAsc);
  const out = { ...chart, ascendant: place(newAsc), midheaven: place(map(mc)), houses: cusps } as BirthChart;
  const longitudes: Record<string, number> = {};
  const onWheel = new Map(chartBodies(chart).map((b) => [b.key, b]));
  for (const [key, name] of BODY_DEFINITIONS) {
    const body = onWheel.get(key);
    if (!body) continue;
    const lon = normalizeLongitude(map(body.longitude));
    const original = chart[key] as PlanetPosition;
    (out as unknown as Record<string, PlanetPosition>)[key] = {
      ...original, ...place(lon), house: geometricHouseFromCusps(lon, cusps) ?? original.house,
    };
    longitudes[name] = lon;
  }
  for (const key of ['lilith', 'ceres', 'pallas', 'juno', 'vesta'] as const) {
    delete (out as unknown as Record<string, unknown>)[key];
  }
  out.aspects = keepAspects ? chart.aspects : recalcAspects(longitudes);
  return out;
}

/** Same houses and aspects; every position shifted back by the ayanamsa. */
export function siderealChart(chart: BirthChart, ayanamsa: number): BirthChart | null {
  if (!Number.isFinite(ayanamsa)) return null;
  return remap(chart, (lon) => lon - ayanamsa, () => chart.houses.map((c) => normalizeLongitude(c - ayanamsa)), true);
}

export function harmonicChart(chart: BirthChart, n: number): BirthChart | null {
  if (!Number.isInteger(n) || n < 2 || n > 360) return null;
  return remap(chart, (lon) => lon * n,
    (asc) => Array.from({ length: 12 }, (_, i) => normalizeLongitude(asc + i * 30)), false);
}

export interface Lot {
  name: 'Part of Fortune' | 'Part of Spirit';
  longitude: number;
  sign: string;
  degree: number;
  sect: 'day' | 'night';
}

/** Day chart when the Sun is above the horizon (houses 7–12). */
export function lots(chart: BirthChart): Lot[] {
  const asc = toEclipticLongitude(chart.ascendant.sign, chart.ascendant.degree);
  const sun = toEclipticLongitude(chart.sun.sign, chart.sun.degree);
  const moon = toEclipticLongitude(chart.moon.sign, chart.moon.degree);
  if (asc === null || sun === null || moon === null) return [];
  const sunHouse = geometricHouseFromCusps(sun, chart.houses);
  if (sunHouse === null) return [];
  const sect = sunHouse >= 7 ? 'day' : 'night';
  const fortune = sect === 'day' ? asc + moon - sun : asc + sun - moon;
  const spirit = sect === 'day' ? asc + sun - moon : asc + moon - sun;
  return [
    { name: 'Part of Fortune', longitude: normalizeLongitude(fortune), ...place(fortune), sect },
    { name: 'Part of Spirit', longitude: normalizeLongitude(spirit), ...place(spirit), sect },
  ];
}
