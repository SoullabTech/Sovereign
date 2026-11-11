/** Inputs for the Pro house wheel, taken only from the calculated chart. */
import type { BirthChart } from './proEphemerisCalculator';
import { chartBodies } from './proChartGeometry';

export type WheelAspect = {
  planet1: string; planet2: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  orb: number;
};
const WHEEL_ASPECTS = new Set(['conjunction', 'sextile', 'square', 'trine', 'opposition']);

export function wheelPlanets(chart: BirthChart) {
  return chartBodies(chart).map((b) => ({
    name: b.name as string, sign: b.position.sign, house: b.position.house, degree: b.position.degree,
  }));
}

/** The five aspects the wheel draws, between bodies it actually plots. */
export function wheelAspects(chart: BirthChart): WheelAspect[] {
  const names = new Set(chartBodies(chart).map((b) => b.name as string));
  return (chart.aspects || []).filter(
    (a): a is typeof a & { type: WheelAspect['type'] } =>
      WHEEL_ASPECTS.has(a.type) && names.has(a.planet1) && names.has(a.planet2),
  );
}
