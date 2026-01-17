/**
 * Ashtakavarga Calculator
 *
 * The Ashtakavarga system is a unique Vedic technique for assessing
 * planetary strength in transit. Each planet gets "bindus" (points, 0-8)
 * in each house based on contributions from all 7 planets + Lagna.
 *
 * Higher bindu count = more favorable transit through that house.
 * Lower bindu count = more challenging transit.
 *
 * This follows Brihat Parashara Hora Shastra's Ashtakavarga rules.
 */

import { GrahaName, RashiName, RASHIS } from './types/vedic';

// =============================================================================
// TYPES
// =============================================================================

export type AshtakavargaPlanet = 'Surya' | 'Chandra' | 'Mangala' | 'Budha' | 'Guru' | 'Shukra' | 'Shani';

export interface BinduMatrix {
  /** Planet whose Ashtakavarga this represents */
  planet: AshtakavargaPlanet;
  /** Bindu count for each house (1-12) */
  bindus: number[];
  /** Total bindus across all houses (should be 337 for each planet) */
  total: number;
}

export interface SarvaAshtakavarga {
  /** Individual planet Ashtakavarga */
  planetaryBindus: Record<AshtakavargaPlanet, BinduMatrix>;
  /** Combined bindus for each house (sum of all planets) */
  sarvaBindus: number[];
  /** Total of all sarva bindus (should be 337) */
  totalSarva: number;
}

export interface TransitStrength {
  planet: AshtakavargaPlanet;
  transitHouse: number;
  bindus: number;
  strength: 'excellent' | 'good' | 'average' | 'weak' | 'poor';
  interpretation: string;
}

export interface AshtakavargaProfile {
  /** Full Ashtakavarga calculation */
  sarvaAshtakavarga: SarvaAshtakavarga;
  /** Current transit strengths */
  transitStrengths: TransitStrength[];
  /** Houses with high combined strength (>= 30 bindus) */
  strongHouses: number[];
  /** Houses with low combined strength (< 25 bindus) */
  weakHouses: number[];
  /** Overall transit assessment */
  overallStrength: 'excellent' | 'good' | 'average' | 'weak' | 'poor';
  calculatedAt: string;
}

// =============================================================================
// CLASSICAL ASHTAKAVARGA RULES
// =============================================================================

/**
 * Benefic positions for each planet
 *
 * These are the houses (from a reference point) where a planet contributes
 * a bindu to the Ashtakavarga of the target planet.
 *
 * Format: targetPlanet -> contributorPlanet -> benefic houses from contributor
 *
 * Reference: Brihat Parashara Hora Shastra, Chapter 66-72
 */
const ASHTAKAVARGA_RULES: Record<AshtakavargaPlanet, Record<AshtakavargaPlanet | 'Lagna', number[]>> = {
  Surya: {
    Surya: [1, 2, 4, 7, 8, 9, 10, 11],
    Chandra: [3, 6, 10, 11],
    Mangala: [1, 2, 4, 7, 8, 9, 10, 11],
    Budha: [3, 5, 6, 9, 10, 11, 12],
    Guru: [5, 6, 9, 11],
    Shukra: [6, 7, 12],
    Shani: [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna: [3, 4, 6, 10, 11, 12],
  },
  Chandra: {
    Surya: [3, 6, 7, 8, 10, 11],
    Chandra: [1, 3, 6, 7, 10, 11],
    Mangala: [2, 3, 5, 6, 9, 10, 11],
    Budha: [1, 3, 4, 5, 7, 8, 10, 11],
    Guru: [1, 4, 7, 8, 10, 11, 12],
    Shukra: [3, 4, 5, 7, 9, 10, 11],
    Shani: [3, 5, 6, 11],
    Lagna: [3, 6, 10, 11],
  },
  Mangala: {
    Surya: [3, 5, 6, 10, 11],
    Chandra: [3, 6, 11],
    Mangala: [1, 2, 4, 7, 8, 10, 11],
    Budha: [3, 5, 6, 11],
    Guru: [6, 10, 11, 12],
    Shukra: [6, 8, 11, 12],
    Shani: [1, 4, 7, 8, 9, 10, 11],
    Lagna: [1, 3, 6, 10, 11],
  },
  Budha: {
    Surya: [5, 6, 9, 11, 12],
    Chandra: [2, 4, 6, 8, 10, 11],
    Mangala: [1, 2, 4, 7, 8, 9, 10, 11],
    Budha: [1, 3, 5, 6, 9, 10, 11, 12],
    Guru: [6, 8, 11, 12],
    Shukra: [1, 2, 3, 4, 5, 8, 9, 11],
    Shani: [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna: [1, 2, 4, 6, 8, 10, 11],
  },
  Guru: {
    Surya: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Chandra: [2, 5, 7, 9, 11],
    Mangala: [1, 2, 4, 7, 8, 10, 11],
    Budha: [1, 2, 4, 5, 6, 9, 10, 11],
    Guru: [1, 2, 3, 4, 7, 8, 10, 11],
    Shukra: [2, 5, 6, 9, 10, 11],
    Shani: [3, 5, 6, 12],
    Lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  Shukra: {
    Surya: [8, 11, 12],
    Chandra: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mangala: [3, 5, 6, 9, 11, 12],
    Budha: [3, 5, 6, 9, 11],
    Guru: [5, 8, 9, 10, 11],
    Shukra: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Shani: [3, 4, 5, 8, 9, 10, 11],
    Lagna: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  Shani: {
    Surya: [1, 2, 4, 7, 8, 10, 11],
    Chandra: [3, 6, 11],
    Mangala: [3, 5, 6, 10, 11, 12],
    Budha: [6, 8, 9, 10, 11, 12],
    Guru: [5, 6, 11, 12],
    Shukra: [6, 11, 12],
    Shani: [3, 5, 6, 11],
    Lagna: [1, 3, 4, 6, 10, 11],
  },
};

// =============================================================================
// CORE CALCULATOR
// =============================================================================

/**
 * Get rashi number from name (1-12)
 */
function getRashiNumber(rashiName: RashiName | string): number {
  const rashi = RASHIS.find(
    r => r.name === rashiName || r.westernEquivalent.toLowerCase() === rashiName.toLowerCase()
  );
  return rashi?.number || 1;
}

/**
 * Calculate house distance from reference
 *
 * @param fromHouse - Reference house (1-12)
 * @param toHouse - Target house (1-12)
 * @returns Distance (1-12)
 */
function getHouseDistance(fromHouse: number, toHouse: number): number {
  let distance = toHouse - fromHouse + 1;
  if (distance <= 0) distance += 12;
  return distance;
}

/**
 * Calculate Ashtakavarga for a single planet
 *
 * @param targetPlanet - Planet whose Ashtakavarga to calculate
 * @param natalPositions - Natal positions of all planets (house 1-12)
 * @param lagnaHouse - Lagna (Ascendant) house position
 * @returns BinduMatrix for the target planet
 */
export function calculatePlanetaryAshtakavarga(
  targetPlanet: AshtakavargaPlanet,
  natalPositions: Record<AshtakavargaPlanet, number>,
  lagnaHouse: number
): BinduMatrix {
  const bindus: number[] = new Array(12).fill(0);
  const rules = ASHTAKAVARGA_RULES[targetPlanet];

  // For each house (1-12)
  for (let house = 1; house <= 12; house++) {
    // Check contribution from each planet
    const contributors: (AshtakavargaPlanet | 'Lagna')[] = [
      'Surya', 'Chandra', 'Mangala', 'Budha', 'Guru', 'Shukra', 'Shani', 'Lagna'
    ];

    for (const contributor of contributors) {
      const beneficHouses = rules[contributor];
      if (!beneficHouses) continue;

      // Get contributor's position
      const contributorHouse = contributor === 'Lagna'
        ? lagnaHouse
        : natalPositions[contributor];

      // Check if this house is benefic from contributor
      const distanceFromContributor = getHouseDistance(contributorHouse, house);

      if (beneficHouses.includes(distanceFromContributor)) {
        bindus[house - 1]++;
      }
    }
  }

  return {
    planet: targetPlanet,
    bindus,
    total: bindus.reduce((sum, b) => sum + b, 0),
  };
}

/**
 * Calculate complete Sarva Ashtakavarga
 *
 * @param natalPositions - Natal positions of all planets (house 1-12)
 * @param lagnaHouse - Lagna (Ascendant) house position
 * @returns Complete Sarva Ashtakavarga
 */
export function calculateSarvaAshtakavarga(
  natalPositions: Record<AshtakavargaPlanet, number>,
  lagnaHouse: number
): SarvaAshtakavarga {
  const planets: AshtakavargaPlanet[] = ['Surya', 'Chandra', 'Mangala', 'Budha', 'Guru', 'Shukra', 'Shani'];

  const planetaryBindus: Record<AshtakavargaPlanet, BinduMatrix> = {} as Record<AshtakavargaPlanet, BinduMatrix>;

  // Calculate individual Ashtakavarga for each planet
  for (const planet of planets) {
    planetaryBindus[planet] = calculatePlanetaryAshtakavarga(planet, natalPositions, lagnaHouse);
  }

  // Calculate Sarva (combined) bindus for each house
  const sarvaBindus: number[] = new Array(12).fill(0);
  for (let i = 0; i < 12; i++) {
    for (const planet of planets) {
      sarvaBindus[i] += planetaryBindus[planet].bindus[i];
    }
  }

  return {
    planetaryBindus,
    sarvaBindus,
    totalSarva: sarvaBindus.reduce((sum, b) => sum + b, 0),
  };
}

/**
 * Get transit strength based on Ashtakavarga bindus
 *
 * @param planet - Transit planet
 * @param transitHouse - House being transited (1-12)
 * @param sarvaAshtakavarga - Pre-calculated Sarva Ashtakavarga
 * @returns Transit strength assessment
 */
export function getTransitStrength(
  planet: AshtakavargaPlanet,
  transitHouse: number,
  sarvaAshtakavarga: SarvaAshtakavarga
): TransitStrength {
  const bindus = sarvaAshtakavarga.planetaryBindus[planet].bindus[transitHouse - 1];
  const sarvaBindus = sarvaAshtakavarga.sarvaBindus[transitHouse - 1];

  // Determine strength category
  // Individual planet: 0-8 bindus possible
  // Average is 4, so:
  // 6-8 = excellent, 5 = good, 4 = average, 3 = weak, 0-2 = poor
  let strength: TransitStrength['strength'];
  if (bindus >= 6) strength = 'excellent';
  else if (bindus === 5) strength = 'good';
  else if (bindus === 4) strength = 'average';
  else if (bindus === 3) strength = 'weak';
  else strength = 'poor';

  // Generate interpretation
  const interpretations: Record<TransitStrength['strength'], string> = {
    excellent: `${planet}'s transit through house ${transitHouse} is highly favorable (${bindus}/8 bindus). Excellent time for ${planet}-related matters.`,
    good: `${planet}'s transit through house ${transitHouse} is favorable (${bindus}/8 bindus). Good period for steady progress.`,
    average: `${planet}'s transit through house ${transitHouse} is neutral (${bindus}/8 bindus). Mixed results expected.`,
    weak: `${planet}'s transit through house ${transitHouse} is somewhat challenging (${bindus}/8 bindus). Proceed with caution.`,
    poor: `${planet}'s transit through house ${transitHouse} is challenging (${bindus}/8 bindus). Remedial measures recommended.`,
  };

  return {
    planet,
    transitHouse,
    bindus,
    strength,
    interpretation: interpretations[strength],
  };
}

/**
 * Calculate complete Ashtakavarga profile with transit analysis
 *
 * @param natalPositions - Natal positions of all planets (house 1-12)
 * @param lagnaHouse - Lagna house position
 * @param currentTransits - Current transit positions (planet -> house)
 * @returns Complete Ashtakavarga profile
 */
export function calculateAshtakavargaProfile(
  natalPositions: Record<AshtakavargaPlanet, number>,
  lagnaHouse: number,
  currentTransits: Partial<Record<AshtakavargaPlanet, number>>
): AshtakavargaProfile {
  const sarvaAshtakavarga = calculateSarvaAshtakavarga(natalPositions, lagnaHouse);

  // Calculate transit strengths
  const transitStrengths: TransitStrength[] = [];
  const planets: AshtakavargaPlanet[] = ['Surya', 'Chandra', 'Mangala', 'Budha', 'Guru', 'Shukra', 'Shani'];

  for (const planet of planets) {
    const transitHouse = currentTransits[planet];
    if (transitHouse) {
      transitStrengths.push(getTransitStrength(planet, transitHouse, sarvaAshtakavarga));
    }
  }

  // Identify strong and weak houses
  const strongHouses = sarvaAshtakavarga.sarvaBindus
    .map((bindus, i) => ({ house: i + 1, bindus }))
    .filter(h => h.bindus >= 30)
    .map(h => h.house);

  const weakHouses = sarvaAshtakavarga.sarvaBindus
    .map((bindus, i) => ({ house: i + 1, bindus }))
    .filter(h => h.bindus < 25)
    .map(h => h.house);

  // Calculate overall strength
  const avgBindus = transitStrengths.reduce((sum, t) => sum + t.bindus, 0) / (transitStrengths.length || 1);
  let overallStrength: AshtakavargaProfile['overallStrength'];
  if (avgBindus >= 5.5) overallStrength = 'excellent';
  else if (avgBindus >= 4.5) overallStrength = 'good';
  else if (avgBindus >= 3.5) overallStrength = 'average';
  else if (avgBindus >= 2.5) overallStrength = 'weak';
  else overallStrength = 'poor';

  return {
    sarvaAshtakavarga,
    transitStrengths,
    strongHouses,
    weakHouses,
    overallStrength,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Get recommended remedial measures based on Ashtakavarga weakness
 */
export function getRemedialMeasures(planet: AshtakavargaPlanet, bindus: number): string[] {
  if (bindus >= 4) return []; // No remedies needed for average or better

  const remedies: Record<AshtakavargaPlanet, string[]> = {
    Surya: [
      'Offer water to the Sun at sunrise',
      'Chant Aditya Hridayam or Gayatri Mantra',
      'Wear ruby or red garnet (after consultation)',
      'Fast on Sundays',
    ],
    Chandra: [
      'Offer milk to Shiva Lingam on Mondays',
      'Chant Chandra Beej Mantra',
      'Wear pearl or moonstone (after consultation)',
      'Donate white items on Mondays',
    ],
    Mangala: [
      'Chant Hanuman Chalisa on Tuesdays',
      'Donate red lentils or red cloth',
      'Wear red coral (after consultation)',
      'Exercise patience and avoid anger',
    ],
    Budha: [
      'Chant Vishnu Sahasranama on Wednesdays',
      'Donate green vegetables',
      'Wear emerald (after consultation)',
      'Practice clear communication',
    ],
    Guru: [
      'Visit temples on Thursdays',
      'Chant Guru Beej Mantra',
      'Wear yellow sapphire (after consultation)',
      'Donate to educational causes',
    ],
    Shukra: [
      'Donate white items on Fridays',
      'Chant Lakshmi Stotram',
      'Wear diamond or white sapphire (after consultation)',
      'Practice artistic pursuits',
    ],
    Shani: [
      'Visit Shani temple on Saturdays',
      'Chant Shani Beej Mantra',
      'Wear blue sapphire only after careful consultation',
      'Feed crows and donate to the elderly',
    ],
  };

  return remedies[planet] || [];
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { BinduMatrix, SarvaAshtakavarga, TransitStrength, AshtakavargaProfile, AshtakavargaPlanet };
