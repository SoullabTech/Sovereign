/**
 * calculateTransits
 *
 * Computes life-cycle transit windows from birth year / age.
 * These are mean-motion approximations — accurate for window detection,
 * not for exact degree transits (which require Swiss Ephemeris).
 */

import type { NormalizedBirthData } from './normalizeBirthData';

export interface LifeCycleTransit {
  name: string;
  description: string;
  isActive: boolean;
  ageWindow: [number, number];
  currentAge: number;
}

export function calculateTransits(
  normalized: NormalizedBirthData,
  referenceDate?: Date,
): LifeCycleTransit[] {
  const { year, month, day } = normalized.localDateParts;
  const ref = referenceDate ?? new Date();

  // Age as of reference date (accurate to the day using local parts)
  const refYear = ref.getFullYear();
  const refMonth = ref.getMonth() + 1;
  const refDay = ref.getDate();
  const age = refYear - year -
    (refMonth < month || (refMonth === month && refDay < day) ? 1 : 0);

  const transits: LifeCycleTransit[] = [];

  function check(name: string, desc: string, targetAge: number, radius = 1.5) {
    transits.push({
      name,
      description: desc,
      isActive: age >= targetAge - radius && age <= targetAge + radius,
      ageWindow: [targetAge - radius, targetAge + radius] as [number, number],
      currentAge: age,
    });
  }

  check('Saturn Return (1st)', 'Structures, career, and identity consolidation under direct pressure', 29);
  check('Saturn Return (2nd)', 'Legacy, authority, and life purpose in focus', 58);
  check('Chiron Return', 'Core wound surfaces for integration, not just management', 50);
  check('Uranus Opposition', 'Disruption of established self; authentic re-orientation is the invitation', 42);
  check('Pluto Square', 'Compulsive transformation; shadow material demands integration', 39, 3);
  check('Jupiter Return (2nd)', 'Expansion and renewed sense of purpose available', 24, 1);
  check('Jupiter Return (3rd)', 'Expansion and renewed sense of purpose available', 36, 1);
  check('Jupiter Return (4th)', 'Expansion and renewed sense of purpose available', 48, 1);
  check('Jupiter Return (5th)', 'Expansion and renewed sense of purpose available', 60, 1);
  check('Nodal Return (1st)', 'Soul-level course correction; old patterns release more easily', 18.6, 1);
  check('Nodal Return (2nd)', 'Soul-level course correction; recurring themes clarify', 37.2, 1);

  return transits;
}

export function getActiveTransitDescriptions(transits: LifeCycleTransit[]): string[] {
  const active = transits.filter(t => t.isActive);
  if (active.length === 0) {
    return ['No major life-cycle return is exact right now — this is a consolidation or integration phase between peaks'];
  }
  return active.map(t => `${t.name} (age ~${Math.round((t.ageWindow[0] + t.ageWindow[1]) / 2)}) — ${t.description}`);
}
