/**
 * CHART ANALYSIS UTILITIES
 *
 * Stellium detection, element/modality balance, pattern recognition
 * for the Stellium Pro dashboard
 *
 * Philosophy:
 * - These are patterns, not prescriptions
 * - Balance is context-dependent, not normative
 * - Analysis supports observation, not interpretation
 */

import type { BirthChart, PlanetPosition } from '@/lib/astrology/ephemerisCalculator';

// ============================================
// TYPES
// ============================================

export interface ElementBalance {
  fire: number;
  earth: number;
  air: number;
  water: number;
  total: number;
  dominant: string;
  weakest: string;
}

export interface ModalityBalance {
  cardinal: number;
  fixed: number;
  mutable: number;
  total: number;
  dominant: string;
  weakest: string;
}

export interface Stellium {
  type: 'sign' | 'house';
  location: string | number;
  planets: string[];
  count: number;
  element?: string;
}

export interface ChartAnalysis {
  elements: ElementBalance;
  modalities: ModalityBalance;
  stelliums: Stellium[];
  patterns: PatternSummary[];
}

export interface PatternSummary {
  name: string;
  description: string;
  involved: string[];
}

// ============================================
// MAPPINGS
// ============================================

const SIGN_ELEMENTS: Record<string, string> = {
  'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
  'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth',
  'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
  'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water',
};

const SIGN_MODALITIES: Record<string, string> = {
  'Aries': 'cardinal', 'Cancer': 'cardinal', 'Libra': 'cardinal', 'Capricorn': 'cardinal',
  'Taurus': 'fixed', 'Leo': 'fixed', 'Scorpio': 'fixed', 'Aquarius': 'fixed',
  'Gemini': 'mutable', 'Virgo': 'mutable', 'Sagittarius': 'mutable', 'Pisces': 'mutable',
};

const PLANET_NAMES = [
  'sun', 'moon', 'mercury', 'venus', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
];

// ============================================
// ELEMENT BALANCE
// ============================================

/**
 * Calculate element distribution in a chart
 */
export function calculateElementBalance(chart: BirthChart): ElementBalance {
  const counts = { fire: 0, earth: 0, air: 0, water: 0 };

  PLANET_NAMES.forEach(name => {
    const planet = chart[name as keyof BirthChart] as PlanetPosition;
    if (planet?.sign) {
      const element = SIGN_ELEMENTS[planet.sign];
      if (element) {
        counts[element as keyof typeof counts]++;
      }
    }
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const entries = Object.entries(counts);
  const sorted = entries.sort((a, b) => b[1] - a[1]);

  return {
    ...counts,
    total,
    dominant: sorted[0][0],
    weakest: sorted[sorted.length - 1][0],
  };
}

// ============================================
// MODALITY BALANCE
// ============================================

/**
 * Calculate modality distribution in a chart
 */
export function calculateModalityBalance(chart: BirthChart): ModalityBalance {
  const counts = { cardinal: 0, fixed: 0, mutable: 0 };

  PLANET_NAMES.forEach(name => {
    const planet = chart[name as keyof BirthChart] as PlanetPosition;
    if (planet?.sign) {
      const modality = SIGN_MODALITIES[planet.sign];
      if (modality) {
        counts[modality as keyof typeof counts]++;
      }
    }
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const entries = Object.entries(counts);
  const sorted = entries.sort((a, b) => b[1] - a[1]);

  return {
    ...counts,
    total,
    dominant: sorted[0][0],
    weakest: sorted[sorted.length - 1][0],
  };
}

// ============================================
// STELLIUM DETECTION
// ============================================

/**
 * Detect stelliums (3+ planets in same sign or house)
 */
export function detectStelliums(chart: BirthChart): Stellium[] {
  const stelliums: Stellium[] = [];

  // Count by sign
  const signCounts: Record<string, string[]> = {};
  // Count by house
  const houseCounts: Record<number, string[]> = {};

  PLANET_NAMES.forEach(name => {
    const planet = chart[name as keyof BirthChart] as PlanetPosition;
    if (planet?.sign) {
      // Sign tracking
      if (!signCounts[planet.sign]) {
        signCounts[planet.sign] = [];
      }
      signCounts[planet.sign].push(name);

      // House tracking
      if (planet.house) {
        if (!houseCounts[planet.house]) {
          houseCounts[planet.house] = [];
        }
        houseCounts[planet.house].push(name);
      }
    }
  });

  // Sign stelliums
  Object.entries(signCounts).forEach(([sign, planets]) => {
    if (planets.length >= 3) {
      stelliums.push({
        type: 'sign',
        location: sign,
        planets: planets.map(p => p.charAt(0).toUpperCase() + p.slice(1)),
        count: planets.length,
        element: SIGN_ELEMENTS[sign],
      });
    }
  });

  // House stelliums
  Object.entries(houseCounts).forEach(([house, planets]) => {
    if (planets.length >= 3) {
      stelliums.push({
        type: 'house',
        location: parseInt(house),
        planets: planets.map(p => p.charAt(0).toUpperCase() + p.slice(1)),
        count: planets.length,
      });
    }
  });

  return stelliums;
}

// ============================================
// PATTERN DETECTION
// ============================================

/**
 * Detect common chart patterns (T-square, Grand Trine, Grand Cross, etc.)
 */
export function detectPatterns(chart: BirthChart): PatternSummary[] {
  const patterns: PatternSummary[] = [];

  // Note: Full pattern detection would use aspects
  // This is a simplified version based on the aspects array

  const aspects = chart.aspects || [];

  // Detect T-Square (two planets in opposition, both square a third)
  const oppositions = aspects.filter(a => a.type === 'opposition');
  const squares = aspects.filter(a => a.type === 'square');

  oppositions.forEach(opp => {
    // Find if both planets are squared by the same third planet
    const planet1Squares = squares.filter(
      s => s.planet1 === opp.planet1 || s.planet2 === opp.planet1
    );
    const planet2Squares = squares.filter(
      s => s.planet1 === opp.planet2 || s.planet2 === opp.planet2
    );

    // Find common apex
    planet1Squares.forEach(sq1 => {
      const apex1 = sq1.planet1 === opp.planet1 ? sq1.planet2 : sq1.planet1;
      const matchingSquare = planet2Squares.find(
        sq2 => sq2.planet1 === apex1 || sq2.planet2 === apex1
      );

      if (matchingSquare) {
        patterns.push({
          name: 'T-Square',
          description: `Dynamic tension focused through ${apex1}`,
          involved: [opp.planet1, opp.planet2, apex1],
        });
      }
    });
  });

  // Detect Grand Trine (three planets in mutual trines)
  const trines = aspects.filter(a => a.type === 'trine');
  const trineGraph: Record<string, string[]> = {};

  trines.forEach(t => {
    if (!trineGraph[t.planet1]) trineGraph[t.planet1] = [];
    if (!trineGraph[t.planet2]) trineGraph[t.planet2] = [];
    trineGraph[t.planet1].push(t.planet2);
    trineGraph[t.planet2].push(t.planet1);
  });

  Object.keys(trineGraph).forEach(planet1 => {
    const connected1 = trineGraph[planet1];
    connected1.forEach(planet2 => {
      if (planet2 > planet1) { // Avoid duplicates
        const connected2 = trineGraph[planet2] || [];
        connected2.forEach(planet3 => {
          if (planet3 > planet2 && connected1.includes(planet3)) {
            // Found a triangle
            const element = SIGN_ELEMENTS[
              (chart[planet1.toLowerCase() as keyof BirthChart] as PlanetPosition)?.sign
            ];
            patterns.push({
              name: 'Grand Trine',
              description: `Harmonious flow in ${element || 'element'}`,
              involved: [planet1, planet2, planet3],
            });
          }
        });
      }
    });
  });

  return patterns;
}

// ============================================
// FULL ANALYSIS
// ============================================

/**
 * Run complete chart analysis
 */
export function analyzeChart(chart: BirthChart): ChartAnalysis {
  return {
    elements: calculateElementBalance(chart),
    modalities: calculateModalityBalance(chart),
    stelliums: detectStelliums(chart),
    patterns: detectPatterns(chart),
  };
}

// ============================================
// KEY PLACEMENTS EXTRACTION
// ============================================

export interface KeyPlacement {
  name: string;
  sign: string;
  degree: number;
  house?: number;
  element: string;
}

/**
 * Extract key placements for quick reference
 */
export function extractKeyPlacements(chart: BirthChart): KeyPlacement[] {
  const keys: KeyPlacement[] = [];

  // Sun
  keys.push({
    name: 'Sun',
    sign: chart.sun.sign,
    degree: chart.sun.degree,
    house: chart.sun.house,
    element: SIGN_ELEMENTS[chart.sun.sign],
  });

  // Moon
  keys.push({
    name: 'Moon',
    sign: chart.moon.sign,
    degree: chart.moon.degree,
    house: chart.moon.house,
    element: SIGN_ELEMENTS[chart.moon.sign],
  });

  // Ascendant
  keys.push({
    name: 'Ascendant',
    sign: chart.ascendant.sign,
    degree: chart.ascendant.degree,
    element: SIGN_ELEMENTS[chart.ascendant.sign],
  });

  // Midheaven
  keys.push({
    name: 'Midheaven',
    sign: chart.midheaven.sign,
    degree: chart.midheaven.degree,
    element: SIGN_ELEMENTS[chart.midheaven.sign],
  });

  // Saturn (for Saturn return awareness)
  keys.push({
    name: 'Saturn',
    sign: chart.saturn.sign,
    degree: chart.saturn.degree,
    house: chart.saturn.house,
    element: SIGN_ELEMENTS[chart.saturn.sign],
  });

  // North Node
  keys.push({
    name: 'North Node',
    sign: chart.northNode.sign,
    degree: chart.northNode.degree,
    house: chart.northNode.house,
    element: SIGN_ELEMENTS[chart.northNode.sign],
  });

  return keys;
}

// ============================================
// TRANSIT SIGNIFICANCE
// ============================================

export interface TransitSignificance {
  planet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
  significance: 'high' | 'medium' | 'low';
  description: string;
}

/**
 * Evaluate significance of transits to natal chart
 */
export function evaluateTransitSignificance(
  transitPlanet: string,
  natalPlanet: string,
  aspectType: string,
  orb: number
): TransitSignificance {
  // High significance: outer planets (Saturn+) to personal planets/angles
  const outerPlanets = ['saturn', 'uranus', 'neptune', 'pluto'];
  const personalPoints = ['sun', 'moon', 'mercury', 'venus', 'mars', 'ascendant', 'midheaven'];
  const hardAspects = ['conjunction', 'opposition', 'square'];

  const isOuter = outerPlanets.includes(transitPlanet.toLowerCase());
  const isPersonal = personalPoints.includes(natalPlanet.toLowerCase());
  const isHard = hardAspects.includes(aspectType.toLowerCase());
  const isTight = orb <= 2;

  let significance: 'high' | 'medium' | 'low' = 'low';
  let description = 'Minor transit';

  if (isOuter && isPersonal && isHard && isTight) {
    significance = 'high';
    description = `Major ${transitPlanet} transit to natal ${natalPlanet} - significant life phase`;
  } else if (isOuter && isPersonal && isTight) {
    significance = 'medium';
    description = `${transitPlanet} contacting natal ${natalPlanet} - notable influence`;
  } else if (isOuter && isHard && isTight) {
    significance = 'medium';
    description = `${transitPlanet} ${aspectType} to ${natalPlanet} - active period`;
  }

  return {
    planet: transitPlanet,
    natalPlanet,
    aspect: aspectType,
    orb,
    significance,
    description,
  };
}
