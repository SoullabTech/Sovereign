/**
 * ASTRO-PRO-COMPARE-01 — two calculated charts compared, and their composite.
 *
 * Pure geometry over charts the Pro calculator already produced. The
 * composite uses the midpoint method: each body at the shorter-arc midpoint
 * of its two positions, Ascendant and MC likewise, with equal houses from the
 * composite Ascendant. No meaning is assigned to any contact.
 */
import type { Aspect, BirthChart, PlanetPosition } from './proEphemerisCalculator';
import {
  BODY_DEFINITIONS, SIGNS, chartBodies, geometricHouseFromCusps, normalizeLongitude, toEclipticLongitude,
} from './proChartGeometry';
import type { TransitBody } from './proTransits';
import { angularSeparation } from './proTransits';

/** The engine's own orbs, so composite aspects read like natal ones. */
const ASPECTS: ReadonlyArray<readonly [Aspect['type'], number, number]> = [
  ['conjunction', 0, 8], ['opposition', 180, 8], ['trine', 120, 8],
  ['square', 90, 8], ['sextile', 60, 6], ['quincunx', 150, 3],
];

export interface CrossAspect {
  inner: string;
  outer: string;
  type: Aspect['type'];
  orb: number;
}

/** A chart's bodies, shaped for the wheel's outer ring. */
export function chartAsOuterRing(chart: BirthChart): TransitBody[] {
  return chartBodies(chart).map(({ name, glyph, longitude, position }) => ({ name, glyph, longitude, position }));
}

/** Every aspect between a body of one chart and a body of the other, within maxOrb. */
export function crossAspects(
  inner: readonly { name: string; longitude: number }[],
  outer: readonly { name: string; longitude: number }[],
  maxOrb: number,
): CrossAspect[] {
  if (!Number.isFinite(maxOrb) || maxOrb < 0) return [];
  const found: CrossAspect[] = [];
  for (const a of inner) {
    for (const b of outer) {
      const separation = angularSeparation(a.longitude, b.longitude);
      for (const [type, angle] of ASPECTS) {
        const orb = Math.abs(separation - angle);
        if (orb <= maxOrb) {
          found.push({ inner: a.name, outer: b.name, type, orb: Number(orb.toFixed(2)) });
          break;
        }
      }
    }
  }
  return found.sort((x, y) => x.orb - y.orb || x.inner.localeCompare(y.inner));
}

/** Shorter-arc midpoint of two longitudes. */
export function midpoint(a: number, b: number): number {
  const d = normalizeLongitude(b - a);
  return d <= 180 ? normalizeLongitude(a + d / 2) : normalizeLongitude(b + (360 - d) / 2);
}

function toPosition(longitude: number, house: number): PlanetPosition {
  const lon = normalizeLongitude(longitude);
  const index = Math.floor(lon / 30);
  return { sign: SIGNS[index], degree: Number((lon - index * 30).toFixed(4)), house, retrograde: false, motionStatus: 'not-evaluated' };
}

/** Returns null when either chart lacks a valid Ascendant or MC. */
export function compositeChart(a: BirthChart, b: BirthChart): BirthChart | null {
  const ascA = toEclipticLongitude(a.ascendant.sign, a.ascendant.degree);
  const ascB = toEclipticLongitude(b.ascendant.sign, b.ascendant.degree);
  const mcA = toEclipticLongitude(a.midheaven.sign, a.midheaven.degree);
  const mcB = toEclipticLongitude(b.midheaven.sign, b.midheaven.degree);
  if (ascA === null || ascB === null || mcA === null || mcB === null) return null;
  const asc = midpoint(ascA, ascB);
  const mc = midpoint(mcA, mcB);
  const houses = Array.from({ length: 12 }, (_, i) => normalizeLongitude(asc + i * 30));

  const bodiesA = new Map(chartBodies(a).map((body) => [body.key, body.longitude]));
  const bodiesB = new Map(chartBodies(b).map((body) => [body.key, body.longitude]));
  const composite = { ...a } as BirthChart;
  const longitudes: Record<string, number> = {};
  for (const [key, name] of BODY_DEFINITIONS) {
    const la = bodiesA.get(key);
    const lb = bodiesB.get(key);
    if (la === undefined || lb === undefined) {
      delete (composite as unknown as Record<string, unknown>)[key];
      continue;
    }
    const lon = midpoint(la, lb);
    const house = geometricHouseFromCusps(lon, houses) ?? 1;
    (composite as unknown as Record<string, PlanetPosition>)[key] = toPosition(lon, house);
    longitudes[name] = lon;
  }
  // Minor bodies not on the wheel are dropped rather than left as one person's.
  for (const key of ['lilith', 'ceres', 'pallas', 'juno', 'vesta'] as const) {
    delete (composite as unknown as Record<string, unknown>)[key];
  }
  const ascPos = toPosition(asc, 1);
  const mcPos = toPosition(mc, 10);
  composite.ascendant = { sign: ascPos.sign, degree: ascPos.degree };
  composite.midheaven = { sign: mcPos.sign, degree: mcPos.degree };
  composite.houses = houses;

  const names = Object.keys(longitudes);
  const aspects: Aspect[] = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const separation = angularSeparation(longitudes[names[i]], longitudes[names[j]]);
      for (const [type, angle, orbLimit] of ASPECTS) {
        const orb = Math.abs(separation - angle);
        if (orb <= orbLimit) {
          aspects.push({ planet1: names[i], planet2: names[j], type, orb: Number(orb.toFixed(2)), exact: orb < 1 });
        }
      }
    }
  }
  composite.aspects = aspects;
  return composite;
}
