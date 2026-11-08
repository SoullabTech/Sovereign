/**
 * Secondary progressions and solar arcs as facts for MAIA (founder request
 * 2026-11-07: an outside analysis named "progressions and solar arcs over a
 * period" as the most informative next step for a life reading).
 *
 * Progressions: the chart for the day after birth that corresponds to the
 * year of life (day for a year), cast at the birth place. Solar arcs: every
 * natal point moved forward by the progressed Sun's distance from the natal
 * Sun. Contacts are major aspects to natal points within an orb. Over a
 * period, the window is sampled monthly; each contact that came within 0.5°
 * is listed once, at the sample where it came closest.
 */
import type { BirthChart } from './proEphemerisCalculator';
import { calculateBirthChart } from './proEphemerisCalculator';
import { aspectEndpointLongitudes, chartBodies, normalizeLongitude } from './proChartGeometry';
import { crossAspects, type CrossAspect } from './proComparison';
import { admitProCalculation } from './proCalculationPolicy';
import { secondaryProgressionInstant, utcParts } from './proDerivedMoments';
import type { HouseSystem } from './proEphemerisCalculator';

const DAY_MS = 86_400_000;
export const PROGRESSION_ORB = 1;
export const PROGRESSION_MAX_YEARS = 10;

type Body = { name: string; longitude: number };

/** Natal points and solar-arc points: the ten planets and the two angles (nodes and Chiron left out, by convention). */
const POINTS = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant', 'Midheaven']);
/** Progressed points that move enough to matter: the personal planets and the angles. */
const PROGRESSED = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant', 'Midheaven']);

function points(chart: BirthChart, keep: Set<string>): Body[] {
  return [...aspectEndpointLongitudes(chart)].filter(([name]) => keep.has(name)).map(([name, longitude]) => ({ name, longitude }));
}

export interface ProgressedMoment {
  at: Date;
  chart: BirthChart;
  /** Solar arc in degrees. */
  arc: number;
  progressedToNatal: CrossAspect[];
  arcToNatal: CrossAspect[];
}

/** The progressed chart at a date, and its contacts and the solar arc contacts to natal. */
export async function progressedMoment(
  natal: BirthChart, birthUtc: Date, at: Date, place: { lat: number; lng: number }, houseSystem: HouseSystem,
): Promise<ProgressedMoment> {
  const instant = secondaryProgressionInstant(birthUtc, at);
  const parts = utcParts(instant);
  const admitted = admitProCalculation({
    date: parts.date, time: parts.time, location: { lat: place.lat, lng: place.lng, timezone: 'Etc/UTC' }, houseSystem,
  });
  if (!admitted.ok) throw new Error('PROGRESSION_UNAVAILABLE');
  const chart = await calculateBirthChart(admitted.birthData);
  const natalBodies = points(natal, POINTS);
  const progressedBodies = points(chart, PROGRESSED).map((b) => ({ name: `progressed ${b.name}`, longitude: b.longitude }));
  const natalSun = natalBodies.find((b) => b.name === 'Sun')!.longitude;
  const progressedSun = chartBodies(chart).find((b) => b.name === 'Sun')!.longitude;
  const arc = normalizeLongitude(progressedSun - natalSun);
  const directed: Body[] = natalBodies.map((b) => ({ name: `solar arc ${b.name}`, longitude: normalizeLongitude(b.longitude + arc) }));
  return {
    at, chart, arc,
    progressedToNatal: crossAspects(progressedBodies, natalBodies, PROGRESSION_ORB),
    // A solar-arc point to its own natal place is only the arc itself; leave those out.
    arcToNatal: crossAspects(directed, natalBodies, PROGRESSION_ORB).filter((c) => c.inner !== `solar arc ${c.outer}`),
  };
}

function deg(value: number): string {
  const d = Math.floor(value);
  return `${d}°${String(Math.min(59, Math.round((value - d) * 60))).padStart(2, '0')}′`;
}

/** The progressed positions and contacts at one date. */
export function progressedFacts(m: ProgressedMoment): string {
  const date = m.at.toISOString().slice(0, 10);
  const positions = chartBodies(m.chart)
    .filter((b) => ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].includes(b.name))
    // Houses here are the progressed chart's own, not the natal houses.
    .map((b) => `${b.name} ${b.position.sign} ${deg(b.position.degree)} (progressed-chart house ${b.position.house})`);
  const list = (cs: CrossAspect[]) => cs.slice(0, 16).map((c) => `${c.inner} ${c.type} natal ${c.outer} (${c.orb.toFixed(1)}°)`).join('; ') || 'none within 1°';
  return [
    `Secondary progressions for ${date}: ${positions.join(', ')}; progressed Ascendant ${m.chart.ascendant.sign} ${deg(m.chart.ascendant.degree)}, MC ${m.chart.midheaven.sign} ${deg(m.chart.midheaven.degree)}`,
    `Progressed to natal (within 1°): ${list(m.progressedToNatal)}`,
    `Solar arc ${m.arc.toFixed(1)}°; solar arc to natal (within 1°): ${list(m.arcToNatal)}`,
  ].join('\n');
}

/**
 * The progressed and solar arc contacts that came within the orb during a
 * period, each listed once at its closest sample. Sampled monthly.
 */
export async function progressionsOverPeriod(
  natal: BirthChart, birthUtc: Date, from: Date, to: Date, place: { lat: number; lng: number }, houseSystem: HouseSystem,
): Promise<string> {
  const best = new Map<string, { orb: number; at: Date; text: string }>();
  const samples: number[] = [];
  for (let t = from.getTime(); t <= to.getTime(); t += 30.44 * DAY_MS) samples.push(t);
  for (const t of samples) {
    const m = await progressedMoment(natal, birthUtc, new Date(t), place, houseSystem);
    for (const c of [...m.progressedToNatal, ...m.arcToNatal]) {
      const key = `${c.inner}|${c.type}|${c.outer}`;
      const seen = best.get(key);
      if (!seen || c.orb < seen.orb) best.set(key, { orb: c.orb, at: new Date(t), text: `${c.inner} ${c.type} natal ${c.outer}` });
    }
  }
  const first = samples[0];
  const last = samples[samples.length - 1];
  // Only contacts that came exact in the window (within 0.5°), so a long period keeps its later ones.
  const items = [...best.values()]
    .filter((v) => v.orb <= 0.5)
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .slice(0, 40)
    .map((v) => {
      const edge = v.at.getTime() === first ? ', already separating' : v.at.getTime() === last ? ', still applying' : '';
      return `${v.text}: closest about ${v.at.toISOString().slice(0, 7)} (${v.orb.toFixed(1)}°${edge})`;
    });
  const span = `${from.toISOString().slice(0, 7)} to ${to.toISOString().slice(0, 7)}`;
  return `Progressed and solar arc contacts to natal that came within 0.5° from ${span}, by when each was closest: ${items.length ? items.join('; ') : 'none'}`;
}
