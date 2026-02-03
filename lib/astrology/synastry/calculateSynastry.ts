/**
 * Synastry Calculator
 *
 * Calculates cross-chart aspects between two birth charts.
 * Returns sorted aspects, highlights, and summary scores.
 */

import type {
  SynastryAspect,
  SynastryAspectType,
  SynastryOptions,
  SynastryResult,
  SynastryScores,
} from './types';
import type { BirthChart, PlanetPosition } from '../ephemerisCalculator';

// Default aspect types to check
const DEFAULT_ASPECTS: SynastryAspectType[] = [
  'conjunction',
  'opposition',
  'trine',
  'square',
  'sextile',
  'quincunx',
];

// Default orbs (degrees) for each aspect type
const DEFAULT_ORBS: Record<SynastryAspectType, number> = {
  conjunction: 8,
  opposition: 8,
  trine: 7,
  square: 7,
  sextile: 5,
  quincunx: 3,
};

// Exact angles for each aspect type
const ASPECT_EXACT: Record<SynastryAspectType, number> = {
  conjunction: 0,
  opposition: 180,
  trine: 120,
  square: 90,
  sextile: 60,
  quincunx: 150,
};

// Zodiac signs for longitude conversion
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// Planet weights for scoring (personal planets weighted higher)
const PLANET_WEIGHTS: Record<string, number> = {
  sun: 1.5,
  moon: 1.5,
  mercury: 1.0,
  venus: 1.2,
  mars: 1.2,
  jupiter: 0.8,
  saturn: 0.8,
  uranus: 0.6,
  neptune: 0.6,
  pluto: 0.6,
  chiron: 0.5,
  northNode: 0.5,
  southNode: 0.4,
  ascendant: 1.3,
  midheaven: 0.7,
};

// Planet categories for tagging
const LUMINARIES = new Set(['sun', 'moon']);
const PERSONAL_PLANETS = new Set(['sun', 'moon', 'mercury', 'venus', 'mars']);
const SOCIAL_PLANETS = new Set(['jupiter', 'saturn']);
const OUTER_PLANETS = new Set(['uranus', 'neptune', 'pluto']);

/**
 * Convert zodiac sign + degree back to ecliptic longitude (0-360)
 */
function signDegreeToLongitude(sign: string, degree: number): number {
  const signIndex = ZODIAC_SIGNS.indexOf(sign);
  if (signIndex === -1) return 0;
  return (signIndex * 30) + degree;
}

/**
 * Extract raw ecliptic longitudes from a BirthChart
 */
export function chartToLongitudes(chart: BirthChart): Record<string, number> {
  const longitudes: Record<string, number> = {};

  // Extract planet positions
  const planets: Array<[string, PlanetPosition]> = [
    ['sun', chart.sun],
    ['moon', chart.moon],
    ['mercury', chart.mercury],
    ['venus', chart.venus],
    ['mars', chart.mars],
    ['jupiter', chart.jupiter],
    ['saturn', chart.saturn],
    ['uranus', chart.uranus],
    ['neptune', chart.neptune],
    ['pluto', chart.pluto],
    ['chiron', chart.chiron],
    ['northNode', chart.northNode],
    ['southNode', chart.southNode],
  ];

  for (const [name, pos] of planets) {
    longitudes[name] = signDegreeToLongitude(pos.sign, pos.degree);
  }

  // Include angles (Ascendant, Midheaven)
  longitudes['ascendant'] = signDegreeToLongitude(chart.ascendant.sign, chart.ascendant.degree);
  longitudes['midheaven'] = signDegreeToLongitude(chart.midheaven.sign, chart.midheaven.degree);

  return longitudes;
}

/**
 * Clamp a number between min and max
 */
function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Calculate shortest angular distance between two longitudes (0-180)
 */
function shortestAngleDelta(aDeg: number, bDeg: number): number {
  const raw = Math.abs(aDeg - bDeg) % 360;
  return raw > 180 ? 360 - raw : raw;
}

/**
 * Generate tags for an aspect based on the planets involved
 */
function generateTags(aBody: string, bBody: string): string[] {
  const tags: string[] = ['synastry'];

  const aLower = aBody.toLowerCase();
  const bLower = bBody.toLowerCase();

  // Luminary aspects (Sun-Moon, etc.)
  if (LUMINARIES.has(aLower) || LUMINARIES.has(bLower)) {
    tags.push('luminaries');
  }

  // Personal planet aspects
  if (PERSONAL_PLANETS.has(aLower) && PERSONAL_PLANETS.has(bLower)) {
    tags.push('personal');
  }

  // Venus-Mars (classic attraction indicator)
  if ((aLower === 'venus' && bLower === 'mars') || (aLower === 'mars' && bLower === 'venus')) {
    tags.push('attraction');
  }

  // Sun-Moon (soul connection)
  if ((aLower === 'sun' && bLower === 'moon') || (aLower === 'moon' && bLower === 'sun')) {
    tags.push('soul-connection');
  }

  // Nodal aspects (karmic)
  if (aLower.includes('node') || bLower.includes('node')) {
    tags.push('karmic');
  }

  return tags;
}

/**
 * Calculate synastry aspects between two sets of planetary longitudes
 */
export function calculateSynastry(
  aLongitudes: Record<string, number>,
  bLongitudes: Record<string, number>,
  options: SynastryOptions = {}
): SynastryResult {
  const aspectsToCheck = options.aspects ?? DEFAULT_ASPECTS;
  const orbs = { ...DEFAULT_ORBS, ...(options.orbs ?? {}) };
  const maxAspects = options.maxAspects ?? 200;
  const includeAngles = options.includeAngles ?? true;
  const includeNodes = options.includeNodes ?? true;

  // Filter out angles/nodes if not requested
  const filterBody = (body: string): boolean => {
    const lower = body.toLowerCase();
    if (!includeAngles && (lower === 'ascendant' || lower === 'midheaven')) {
      return false;
    }
    if (!includeNodes && (lower === 'northnode' || lower === 'southnode')) {
      return false;
    }
    return true;
  };

  const aspects: SynastryAspect[] = [];

  for (const [aBody, aDeg] of Object.entries(aLongitudes)) {
    if (!filterBody(aBody)) continue;

    for (const [bBody, bDeg] of Object.entries(bLongitudes)) {
      if (!filterBody(bBody)) continue;

      const delta = shortestAngleDelta(aDeg, bDeg);

      for (const aspect of aspectsToCheck) {
        const exact = ASPECT_EXACT[aspect];
        const orb = orbs[aspect];
        const orbDeg = Math.abs(delta - exact);

        if (orbDeg <= orb) {
          // Calculate strength: tighter orb = higher strength
          const baseStrength = clamp((orb - orbDeg) / orb, 0, 1);

          // Weight by planet importance
          const aWeight = PLANET_WEIGHTS[aBody.toLowerCase()] ?? 0.5;
          const bWeight = PLANET_WEIGHTS[bBody.toLowerCase()] ?? 0.5;
          const weightedStrength = baseStrength * ((aWeight + bWeight) / 2);

          aspects.push({
            aBody,
            bBody,
            aspect,
            exactDeg: exact,
            deltaDeg: delta,
            orbDeg: Number(orbDeg.toFixed(2)),
            strength: Number(weightedStrength.toFixed(3)),
            tags: generateTags(aBody, bBody),
            interpretationKey: `synastry.${aBody.toLowerCase()}_${aspect}_${bBody.toLowerCase()}`,
          });
        }
      }
    }
  }

  // Sort by strength (strongest first)
  aspects.sort((x, y) => y.strength - x.strength);

  // Select highlights: top 10 with diversity (avoid same pair dominating)
  const highlights: SynastryAspect[] = [];
  const seenPairs = new Set<string>();

  for (const asp of aspects) {
    // Create canonical pair key (order-independent)
    const pairKey = [asp.aBody, asp.bBody].sort().join(':') + ':' + asp.aspect;
    if (seenPairs.has(pairKey)) continue;
    seenPairs.add(pairKey);
    highlights.push(asp);
    if (highlights.length >= 10) break;
  }

  // Calculate summary scores
  const scores: SynastryScores = {
    attraction: 0,
    harmony: 0,
    friction: 0,
    growth: 0,
  };

  for (const asp of highlights) {
    const w = asp.strength;
    switch (asp.aspect) {
      case 'conjunction':
        scores.attraction += w;
        break;
      case 'trine':
      case 'sextile':
        scores.harmony += w;
        break;
      case 'square':
      case 'opposition':
        scores.friction += w;
        break;
      case 'quincunx':
        scores.growth += w;
        break;
    }
  }

  // Round scores
  scores.attraction = Number(scores.attraction.toFixed(2));
  scores.harmony = Number(scores.harmony.toFixed(2));
  scores.friction = Number(scores.friction.toFixed(2));
  scores.growth = Number(scores.growth.toFixed(2));

  const notes: string[] = [];

  return {
    aspects: aspects.slice(0, maxAspects),
    highlights,
    scores,
    notes,
  };
}

/**
 * Calculate synastry directly from two BirthChart objects
 */
export function calculateSynastryFromCharts(
  chartA: BirthChart,
  chartB: BirthChart,
  options?: SynastryOptions
): SynastryResult {
  const aLongitudes = chartToLongitudes(chartA);
  const bLongitudes = chartToLongitudes(chartB);
  return calculateSynastry(aLongitudes, bLongitudes, options);
}
