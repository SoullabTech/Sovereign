/**
 * LIFE CYCLE CALCULATOR
 *
 * Calculates astrological life cycle markers:
 * - Saturn Return (~29.5 years)
 * - Uranus Opposition (~42 years)
 * - Chiron Return (~50-51 years)
 * - Jupiter Returns (every ~12 years)
 * - Lunar Node Returns (~18.6 years)
 *
 * Integrated with Gebser consciousness structures and Spiralogic
 */

import * as Astronomy from 'astronomy-engine';

// Planetary orbital periods in years
const ORBITAL_PERIODS = {
  saturn: 29.457,      // ~29.5 years - Saturn Return
  uranus: 84.01,       // Uranus opposition at ~42 years
  chiron: 50.75,       // ~50-51 years
  jupiter: 11.86,      // ~12 years
  northNode: 18.6,     // Lunar node cycle
};

// Gebser consciousness structures
export const GEBSER_STRUCTURES = [
  { name: 'Archaic', ageRange: [0, 0], symbol: 'origin', description: 'Pre-perspectival origin state' },
  { name: 'Magical', ageRange: [0, 7], symbol: 'point', description: 'Unity consciousness, no subject-object split' },
  { name: 'Mythical', ageRange: [7, 14], symbol: 'circle', description: 'Soul-centered, imagination dominates' },
  { name: 'Mental', ageRange: [14, 21], symbol: 'triangle', description: 'Rational ego formation, abstraction' },
  { name: 'Perspectival', ageRange: [21, 28], symbol: 'square', description: 'Full ego perspective, space-time awareness' },
  { name: 'Integral', ageRange: [28, 100], symbol: 'sphere', description: 'Integration of all structures, time-freedom' },
] as const;

export interface LifeCycleMarker {
  name: string;
  type: 'return' | 'opposition' | 'square' | 'cycle';
  planetaryBody: string;
  exactDate: Date | null;
  ageAtEvent: number;
  cycleNumber: number;
  phase: number; // 0-1, position within current cycle
  isActive: boolean; // true if within orb (typically 1-2 years)
  orbStart?: Date;
  orbEnd?: Date;
  archetypeDescription: string;
}

export interface LifeCycleReport {
  birthDate: Date;
  currentAge: number;
  currentGebserStructure: typeof GEBSER_STRUCTURES[number];
  saturnCycle: {
    currentCycleNumber: number;
    phaseProgress: number;
    nextReturn: LifeCycleMarker | null;
    previousReturn: LifeCycleMarker | null;
  };
  uranusOpposition: {
    date: Date | null;
    ageAtEvent: number;
    isActive: boolean;
    phase: number;
  };
  chironReturn: {
    date: Date | null;
    ageAtEvent: number;
    phase: number;
  };
  jupiterReturns: LifeCycleMarker[];
  nodalReturns: LifeCycleMarker[];
  upcomingMarkers: LifeCycleMarker[];
  currentPhaseInsight: string;
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date, referenceDate: Date = new Date()): number {
  const ageDiff = referenceDate.getTime() - birthDate.getTime();
  const ageYears = ageDiff / (1000 * 60 * 60 * 24 * 365.25);
  return ageYears;
}

/**
 * Get Gebser consciousness structure for a given age
 */
export function getGebserStructure(age: number): typeof GEBSER_STRUCTURES[number] {
  for (const structure of [...GEBSER_STRUCTURES].reverse()) {
    if (age >= structure.ageRange[0]) {
      return structure;
    }
  }
  return GEBSER_STRUCTURES[0];
}

/**
 * Calculate planetary longitude at a specific date
 */
function getPlanetaryLongitude(planet: string, date: Date): number {
  const time = Astronomy.MakeTime(date);

  switch (planet.toLowerCase()) {
    case 'saturn': {
      const vec = Astronomy.GeoVector(Astronomy.Body.Saturn, time, true);
      return Astronomy.Ecliptic(vec).elon;
    }
    case 'jupiter': {
      const vec = Astronomy.GeoVector(Astronomy.Body.Jupiter, time, true);
      return Astronomy.Ecliptic(vec).elon;
    }
    case 'uranus': {
      const vec = Astronomy.GeoVector(Astronomy.Body.Uranus, time, true);
      return Astronomy.Ecliptic(vec).elon;
    }
    case 'chiron': {
      // Approximate Chiron calculation
      const referenceDate = new Date('1977-11-01').getTime();
      const daysSince = (date.getTime() - referenceDate) / (1000 * 60 * 60 * 24);
      const meanMotion = 360 / (50.75 * 365.25);
      return ((33 + (daysSince * meanMotion)) % 360 + 360) % 360;
    }
    case 'northnode': {
      // Mean node calculation
      const daysSinceJ2000 = (date.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / (1000 * 60 * 60 * 24);
      const meanNode = 125.0445 - (0.0529539 * daysSinceJ2000);
      return ((meanNode % 360) + 360) % 360;
    }
    default:
      return 0;
  }
}

/**
 * Find exact date when transiting planet returns to natal position
 */
function findReturnDate(
  planet: string,
  natalLongitude: number,
  searchStartDate: Date,
  cycleYears: number
): Date {
  // Binary search for exact return date
  let searchDate = new Date(searchStartDate);
  const targetLongitude = natalLongitude;

  // Search within the expected window
  const windowDays = cycleYears * 365.25 * 0.1; // 10% window
  let low = new Date(searchDate.getTime() - windowDays * 24 * 60 * 60 * 1000);
  let high = new Date(searchDate.getTime() + windowDays * 24 * 60 * 60 * 1000);

  // Find when longitude crosses target
  for (let i = 0; i < 30; i++) {
    const mid = new Date((low.getTime() + high.getTime()) / 2);
    const midLon = getPlanetaryLongitude(planet, mid);

    // Calculate angular distance
    let diff = midLon - targetLongitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) < 0.01) {
      return mid; // Close enough
    }

    // Determine direction
    const lowLon = getPlanetaryLongitude(planet, low);
    let lowDiff = lowLon - targetLongitude;
    if (lowDiff > 180) lowDiff -= 360;
    if (lowDiff < -180) lowDiff += 360;

    if (Math.sign(diff) === Math.sign(lowDiff)) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return new Date((low.getTime() + high.getTime()) / 2);
}

/**
 * Calculate Saturn Return markers
 */
function calculateSaturnReturns(
  birthDate: Date,
  natalSaturnLongitude: number,
  currentAge: number
): LifeCycleMarker[] {
  const returns: LifeCycleMarker[] = [];
  const period = ORBITAL_PERIODS.saturn;

  // Calculate up to 3 Saturn returns
  for (let cycle = 1; cycle <= 3; cycle++) {
    const approximateAge = period * cycle;
    const approximateDate = new Date(birthDate);
    approximateDate.setFullYear(approximateDate.getFullYear() + Math.floor(approximateAge));

    // Find exact return date
    const exactDate = findReturnDate('saturn', natalSaturnLongitude, approximateDate, period);
    const ageAtEvent = calculateAge(birthDate, exactDate);

    // Check if active (within 2 year orb)
    const yearsToEvent = ageAtEvent - currentAge;
    const isActive = Math.abs(yearsToEvent) <= 2;

    const orbStart = new Date(exactDate);
    orbStart.setFullYear(orbStart.getFullYear() - 2);
    const orbEnd = new Date(exactDate);
    orbEnd.setFullYear(orbEnd.getFullYear() + 1);

    const descriptions = [
      'First Saturn Return: Threshold from youth to true adulthood. Time to own your authority.',
      'Second Saturn Return: Harvest or restructuring of the life built. Elder wisdom emerges.',
      'Third Saturn Return: Transcendence and legacy. Final maturation of the soul.',
    ];

    returns.push({
      name: `Saturn Return ${cycle}`,
      type: 'return',
      planetaryBody: 'Saturn',
      exactDate,
      ageAtEvent,
      cycleNumber: cycle,
      phase: (currentAge % period) / period,
      isActive,
      orbStart,
      orbEnd,
      archetypeDescription: descriptions[cycle - 1] || 'Saturn Return: Time of restructuring',
    });
  }

  return returns;
}

/**
 * Calculate Uranus Opposition (~42 years)
 */
function calculateUranusOpposition(
  birthDate: Date,
  natalUranusLongitude: number,
  currentAge: number
): LifeCycleMarker {
  const oppositionLongitude = (natalUranusLongitude + 180) % 360;
  const approximateAge = ORBITAL_PERIODS.uranus / 2; // ~42 years

  const approximateDate = new Date(birthDate);
  approximateDate.setFullYear(approximateDate.getFullYear() + Math.floor(approximateAge));

  // Find exact opposition date
  const exactDate = findReturnDate('uranus', oppositionLongitude, approximateDate, ORBITAL_PERIODS.uranus / 4);
  const ageAtEvent = calculateAge(birthDate, exactDate);

  const yearsToEvent = ageAtEvent - currentAge;
  const isActive = Math.abs(yearsToEvent) <= 2;

  const orbStart = new Date(exactDate);
  orbStart.setFullYear(orbStart.getFullYear() - 2);
  const orbEnd = new Date(exactDate);
  orbEnd.setFullYear(orbEnd.getFullYear() + 2);

  return {
    name: 'Uranus Opposition',
    type: 'opposition',
    planetaryBody: 'Uranus',
    exactDate,
    ageAtEvent,
    cycleNumber: 1,
    phase: (currentAge / approximateAge),
    isActive,
    orbStart,
    orbEnd,
    archetypeDescription: 'Mid-life awakening. The electric breakthrough demanding authenticity. Time to liberate unlived life.',
  };
}

/**
 * Calculate Chiron Return (~50-51 years)
 */
function calculateChironReturn(
  birthDate: Date,
  natalChironLongitude: number,
  currentAge: number
): LifeCycleMarker {
  const period = ORBITAL_PERIODS.chiron;

  const approximateDate = new Date(birthDate);
  approximateDate.setFullYear(approximateDate.getFullYear() + Math.floor(period));

  // Find exact return date
  const exactDate = findReturnDate('chiron', natalChironLongitude, approximateDate, period);
  const ageAtEvent = calculateAge(birthDate, exactDate);

  const yearsToEvent = ageAtEvent - currentAge;
  const isActive = Math.abs(yearsToEvent) <= 2;

  const orbStart = new Date(exactDate);
  orbStart.setFullYear(orbStart.getFullYear() - 2);
  const orbEnd = new Date(exactDate);
  orbEnd.setFullYear(orbEnd.getFullYear() + 1);

  return {
    name: 'Chiron Return',
    type: 'return',
    planetaryBody: 'Chiron',
    exactDate,
    ageAtEvent,
    cycleNumber: 1,
    phase: currentAge / period,
    isActive,
    orbStart,
    orbEnd,
    archetypeDescription: 'The Wounded Healer returns. Integration of all wounds into wisdom. Teaching through authentic vulnerability.',
  };
}

/**
 * Calculate Jupiter Returns (~12 years each)
 */
function calculateJupiterReturns(
  birthDate: Date,
  natalJupiterLongitude: number,
  currentAge: number
): LifeCycleMarker[] {
  const returns: LifeCycleMarker[] = [];
  const period = ORBITAL_PERIODS.jupiter;

  // Calculate up to 8 Jupiter returns (covers ~100 years)
  for (let cycle = 1; cycle <= 8; cycle++) {
    const approximateAge = period * cycle;
    if (approximateAge > currentAge + 24) break; // Only show next 2 cycles ahead

    const approximateDate = new Date(birthDate);
    approximateDate.setFullYear(approximateDate.getFullYear() + Math.floor(approximateAge));

    const exactDate = findReturnDate('jupiter', natalJupiterLongitude, approximateDate, period);
    const ageAtEvent = calculateAge(birthDate, exactDate);

    const yearsToEvent = ageAtEvent - currentAge;
    const isActive = Math.abs(yearsToEvent) <= 1;

    const descriptions = [
      '~12: Adolescent expansion - first encounter with belief systems',
      '~24: Young adult vision quest - career and life direction',
      '~36: Mid-career expansion - mastery and influence',
      '~48: Wisdom harvest - teaching and mentoring',
      '~60: Elder expansion - spiritual deepening',
      '~72: Sage wisdom - legacy and transmission',
      '~84: Completion cycle - full Jupiter wisdom',
      '~96: Master teacher - transcendent understanding',
    ];

    returns.push({
      name: `Jupiter Return ${cycle}`,
      type: 'return',
      planetaryBody: 'Jupiter',
      exactDate,
      ageAtEvent,
      cycleNumber: cycle,
      phase: (currentAge % period) / period,
      isActive,
      archetypeDescription: descriptions[cycle - 1] || 'Jupiter expansion cycle',
    });
  }

  return returns;
}

/**
 * Calculate Lunar Node Returns (~18.6 years)
 */
function calculateNodalReturns(
  birthDate: Date,
  natalNodeLongitude: number,
  currentAge: number
): LifeCycleMarker[] {
  const returns: LifeCycleMarker[] = [];
  const period = ORBITAL_PERIODS.northNode;

  // Calculate up to 5 nodal returns
  for (let cycle = 1; cycle <= 5; cycle++) {
    const approximateAge = period * cycle;
    if (approximateAge > currentAge + 20) break;

    const approximateDate = new Date(birthDate);
    approximateDate.setFullYear(approximateDate.getFullYear() + Math.floor(approximateAge));

    const exactDate = findReturnDate('northnode', natalNodeLongitude, approximateDate, period);
    const ageAtEvent = calculateAge(birthDate, exactDate);

    const yearsToEvent = ageAtEvent - currentAge;
    const isActive = Math.abs(yearsToEvent) <= 1;

    const descriptions = [
      '~18.6: First nodal return - destiny calling, life path clarifies',
      '~37: Second nodal return - karmic recalibration, purpose renewal',
      '~56: Third nodal return - wisdom integration, elder path',
      '~74: Fourth nodal return - legacy transmission',
      '~93: Fifth nodal return - transcendence',
    ];

    returns.push({
      name: `North Node Return ${cycle}`,
      type: 'return',
      planetaryBody: 'North Node',
      exactDate,
      ageAtEvent,
      cycleNumber: cycle,
      phase: (currentAge % period) / period,
      isActive,
      archetypeDescription: descriptions[cycle - 1] || 'Nodal return - destiny recalibration',
    });
  }

  return returns;
}

/**
 * Generate current phase insight based on age and active cycles
 */
function generatePhaseInsight(
  age: number,
  gebserStructure: typeof GEBSER_STRUCTURES[number],
  activeMarkers: LifeCycleMarker[]
): string {
  const insights: string[] = [];

  // Gebser structure insight
  insights.push(`At ${Math.floor(age)}, you're in the ${gebserStructure.name} consciousness structure: ${gebserStructure.description}`);

  // Active cycle insights
  for (const marker of activeMarkers) {
    if (marker.isActive) {
      const yearsToExact = marker.ageAtEvent - age;
      if (yearsToExact > 0) {
        insights.push(`${marker.name} approaching in ${yearsToExact.toFixed(1)} years: ${marker.archetypeDescription}`);
      } else {
        insights.push(`${marker.name} completing (${Math.abs(yearsToExact).toFixed(1)} years past exact): Integration phase.`);
      }
    }
  }

  return insights.join('\n\n');
}

/**
 * Main entry point: Calculate complete life cycle report
 */
export function calculateLifeCycleReport(
  birthDate: Date,
  natalPlanetPositions: {
    saturn: number;
    jupiter: number;
    uranus: number;
    chiron: number;
    northNode: number;
  }
): LifeCycleReport {
  const currentAge = calculateAge(birthDate);
  const gebserStructure = getGebserStructure(currentAge);

  // Calculate all cycle markers
  const saturnReturns = calculateSaturnReturns(birthDate, natalPlanetPositions.saturn, currentAge);
  const uranusOpposition = calculateUranusOpposition(birthDate, natalPlanetPositions.uranus, currentAge);
  const chironReturn = calculateChironReturn(birthDate, natalPlanetPositions.chiron, currentAge);
  const jupiterReturns = calculateJupiterReturns(birthDate, natalPlanetPositions.jupiter, currentAge);
  const nodalReturns = calculateNodalReturns(birthDate, natalPlanetPositions.northNode, currentAge);

  // Determine current Saturn cycle
  const currentSaturnCycle = Math.floor(currentAge / ORBITAL_PERIODS.saturn) + 1;
  const saturnPhaseProgress = (currentAge % ORBITAL_PERIODS.saturn) / ORBITAL_PERIODS.saturn;

  // Find next and previous Saturn returns
  const nextSaturnReturn = saturnReturns.find(r => r.ageAtEvent > currentAge) || null;
  const previousSaturnReturn = [...saturnReturns].reverse().find(r => r.ageAtEvent <= currentAge) || null;

  // Collect upcoming markers
  const allMarkers: LifeCycleMarker[] = [
    ...saturnReturns,
    uranusOpposition,
    chironReturn,
    ...jupiterReturns,
    ...nodalReturns,
  ];

  const upcomingMarkers = allMarkers
    .filter(m => m.ageAtEvent > currentAge)
    .sort((a, b) => a.ageAtEvent - b.ageAtEvent)
    .slice(0, 5);

  // Find active markers
  const activeMarkers = allMarkers.filter(m => m.isActive);

  // Generate insight
  const currentPhaseInsight = generatePhaseInsight(currentAge, gebserStructure, activeMarkers);

  return {
    birthDate,
    currentAge,
    currentGebserStructure: gebserStructure,
    saturnCycle: {
      currentCycleNumber: currentSaturnCycle,
      phaseProgress: saturnPhaseProgress,
      nextReturn: nextSaturnReturn,
      previousReturn: previousSaturnReturn,
    },
    uranusOpposition: {
      date: uranusOpposition.exactDate,
      ageAtEvent: uranusOpposition.ageAtEvent,
      isActive: uranusOpposition.isActive,
      phase: uranusOpposition.phase,
    },
    chironReturn: {
      date: chironReturn.exactDate,
      ageAtEvent: chironReturn.ageAtEvent,
      phase: chironReturn.phase,
    },
    jupiterReturns,
    nodalReturns,
    upcomingMarkers,
    currentPhaseInsight,
  };
}

/**
 * Simplified calculation for use without full birth chart
 * Uses approximate natal positions based on birth date
 */
export function calculateLifeCycleFromBirthDate(birthDate: Date): LifeCycleReport {
  // Calculate approximate natal positions for the birth date
  const natalPlanetPositions = {
    saturn: getPlanetaryLongitude('saturn', birthDate),
    jupiter: getPlanetaryLongitude('jupiter', birthDate),
    uranus: getPlanetaryLongitude('uranus', birthDate),
    chiron: getPlanetaryLongitude('chiron', birthDate),
    northNode: getPlanetaryLongitude('northnode', birthDate),
  };

  return calculateLifeCycleReport(birthDate, natalPlanetPositions);
}
