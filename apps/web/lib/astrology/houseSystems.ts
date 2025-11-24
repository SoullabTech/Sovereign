/**
 * House Systems Calculator
 *
 * Implements various astrological house systems including:
 * - Porphyry (trisecting quadrants)
 * - Placidus (time-based)
 * - Whole Sign (sign = house)
 * - Equal House (30° divisions from ASC)
 * - Koch (birthplace-based)
 */

export interface HouseSystemCalculation {
  system: string;
  cusps: number[]; // Array of 12 house cusp longitudes (0-360°)
  angles: {
    ascendant: number;
    midheaven: number;
    descendant: number;
    imumCoeli: number;
  };
}

export interface BirthData {
  datetime: Date;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * Porphyry House System
 * Divides each quadrant into three equal parts
 * Excellent for psychological work and modern astrology
 */
export function calculatePorphyryHouses(
  ascendant: number,
  midheaven: number,
  birthData: BirthData
): HouseSystemCalculation {

  // Calculate the four angles
  const descendant = normalizeAngle(ascendant + 180);
  const imumCoeli = normalizeAngle(midheaven + 180);

  // Porphyry system divides each quadrant into three equal parts
  const cusps = new Array(12);

  // House 1 starts at Ascendant
  cusps[0] = ascendant;

  // House 4 starts at IC
  cusps[3] = imumCoeli;

  // House 7 starts at Descendant
  cusps[6] = descendant;

  // House 10 starts at MC
  cusps[9] = midheaven;

  // Calculate intermediate cusps by trisecting quadrants

  // Quadrant 1: ASC to MC (Houses 2, 3)
  const quad1Size = quadrantSize(ascendant, midheaven);
  cusps[1] = normalizeAngle(ascendant + quad1Size / 3);
  cusps[2] = normalizeAngle(ascendant + (2 * quad1Size) / 3);

  // Quadrant 2: MC to DESC (Houses 5, 6)
  const quad2Size = quadrantSize(midheaven, descendant);
  cusps[4] = normalizeAngle(midheaven + quad2Size / 3);
  cusps[5] = normalizeAngle(midheaven + (2 * quad2Size) / 3);

  // Quadrant 3: DESC to IC (Houses 8, 9)
  const quad3Size = quadrantSize(descendant, imumCoeli);
  cusps[7] = normalizeAngle(descendant + quad3Size / 3);
  cusps[8] = normalizeAngle(descendant + (2 * quad3Size) / 3);

  // Quadrant 4: IC to ASC (Houses 11, 12)
  const quad4Size = quadrantSize(imumCoeli, ascendant);
  cusps[10] = normalizeAngle(imumCoeli + quad4Size / 3);
  cusps[11] = normalizeAngle(imumCoeli + (2 * quad4Size) / 3);

  return {
    system: 'porphyry',
    cusps,
    angles: {
      ascendant,
      midheaven,
      descendant,
      imumCoeli
    }
  };
}

/**
 * Placidus House System
 * Time-based system - most popular in modern astrology
 */
export function calculatePlacidusHouses(
  ascendant: number,
  midheaven: number,
  birthData: BirthData
): HouseSystemCalculation {

  // This is a simplified Placidus calculation
  // Full implementation would require complex spherical trigonometry

  const descendant = normalizeAngle(ascendant + 180);
  const imumCoeli = normalizeAngle(midheaven + 180);

  const cusps = new Array(12);

  // Angular houses (same as Porphyry)
  cusps[0] = ascendant;
  cusps[3] = imumCoeli;
  cusps[6] = descendant;
  cusps[9] = midheaven;

  // Simplified intermediate cusps (would need full calculation in production)
  const quad1Size = quadrantSize(ascendant, midheaven);
  cusps[1] = normalizeAngle(ascendant + quad1Size * 0.35);
  cusps[2] = normalizeAngle(ascendant + quad1Size * 0.7);

  const quad2Size = quadrantSize(midheaven, descendant);
  cusps[4] = normalizeAngle(midheaven + quad2Size * 0.35);
  cusps[5] = normalizeAngle(midheaven + quad2Size * 0.7);

  const quad3Size = quadrantSize(descendant, imumCoeli);
  cusps[7] = normalizeAngle(descendant + quad3Size * 0.35);
  cusps[8] = normalizeAngle(descendant + quad3Size * 0.7);

  const quad4Size = quadrantSize(imumCoeli, ascendant);
  cusps[10] = normalizeAngle(imumCoeli + quad4Size * 0.35);
  cusps[11] = normalizeAngle(imumCoeli + quad4Size * 0.7);

  return {
    system: 'placidus',
    cusps,
    angles: {
      ascendant,
      midheaven,
      descendant,
      imumCoeli
    }
  };
}

/**
 * Whole Sign Houses
 * Ancient system where each house equals one zodiac sign
 */
export function calculateWholeSignHouses(
  ascendant: number,
  midheaven: number,
  birthData: BirthData
): HouseSystemCalculation {

  const descendant = normalizeAngle(ascendant + 180);
  const imumCoeli = normalizeAngle(midheaven + 180);

  // Find the sign of the ascendant
  const ascendantSign = Math.floor(ascendant / 30);

  const cusps = new Array(12);

  // Each house starts at the beginning of its sign
  for (let i = 0; i < 12; i++) {
    const signNumber = (ascendantSign + i) % 12;
    cusps[i] = signNumber * 30;
  }

  return {
    system: 'whole-sign',
    cusps,
    angles: {
      ascendant,
      midheaven,
      descendant,
      imumCoeli
    }
  };
}

/**
 * Equal House System
 * Each house is exactly 30 degrees from the ascendant
 */
export function calculateEqualHouses(
  ascendant: number,
  midheaven: number,
  birthData: BirthData
): HouseSystemCalculation {

  const descendant = normalizeAngle(ascendant + 180);
  const imumCoeli = normalizeAngle(midheaven + 180);

  const cusps = new Array(12);

  // Each house is exactly 30° from the previous
  for (let i = 0; i < 12; i++) {
    cusps[i] = normalizeAngle(ascendant + (i * 30));
  }

  return {
    system: 'equal',
    cusps,
    angles: {
      ascendant,
      midheaven,
      descendant,
      imumCoeli
    }
  };
}

/**
 * Koch House System
 * Birthplace-based system emphasizing local coordinates
 */
export function calculateKochHouses(
  ascendant: number,
  midheaven: number,
  birthData: BirthData
): HouseSystemCalculation {

  // Koch system is complex and requires birthplace latitude calculations
  // This is a simplified version - production would need full implementation

  const descendant = normalizeAngle(ascendant + 180);
  const imumCoeli = normalizeAngle(midheaven + 180);

  const cusps = new Array(12);

  cusps[0] = ascendant;
  cusps[3] = imumCoeli;
  cusps[6] = descendant;
  cusps[9] = midheaven;

  // Latitude-adjusted intermediate cusps (simplified)
  const latitudeFactor = Math.abs(birthData.latitude) / 90; // 0-1 factor

  const quad1Size = quadrantSize(ascendant, midheaven);
  cusps[1] = normalizeAngle(ascendant + quad1Size * (0.3 + 0.1 * latitudeFactor));
  cusps[2] = normalizeAngle(ascendant + quad1Size * (0.65 + 0.1 * latitudeFactor));

  const quad2Size = quadrantSize(midheaven, descendant);
  cusps[4] = normalizeAngle(midheaven + quad2Size * (0.3 + 0.1 * latitudeFactor));
  cusps[5] = normalizeAngle(midheaven + quad2Size * (0.65 + 0.1 * latitudeFactor));

  const quad3Size = quadrantSize(descendant, imumCoeli);
  cusps[7] = normalizeAngle(descendant + quad3Size * (0.3 + 0.1 * latitudeFactor));
  cusps[8] = normalizeAngle(descendant + quad3Size * (0.65 + 0.1 * latitudeFactor));

  const quad4Size = quadrantSize(imumCoeli, ascendant);
  cusps[10] = normalizeAngle(imumCoeli + quad4Size * (0.3 + 0.1 * latitudeFactor));
  cusps[11] = normalizeAngle(imumCoeli + quad4Size * (0.65 + 0.1 * latitudeFactor));

  return {
    system: 'koch',
    cusps,
    angles: {
      ascendant,
      midheaven,
      descendant,
      imumCoeli
    }
  };
}

/**
 * Calculate house system based on method name
 */
export function calculateHouses(
  method: 'porphyry' | 'placidus' | 'whole-sign' | 'equal' | 'koch',
  ascendant: number,
  midheaven: number,
  birthData: BirthData
): HouseSystemCalculation {

  switch (method) {
    case 'porphyry':
      return calculatePorphyryHouses(ascendant, midheaven, birthData);
    case 'placidus':
      return calculatePlacidusHouses(ascendant, midheaven, birthData);
    case 'whole-sign':
      return calculateWholeSignHouses(ascendant, midheaven, birthData);
    case 'equal':
      return calculateEqualHouses(ascendant, midheaven, birthData);
    case 'koch':
      return calculateKochHouses(ascendant, midheaven, birthData);
    default:
      return calculatePorphyryHouses(ascendant, midheaven, birthData);
  }
}

/**
 * Determine which house a planet is in based on its longitude
 */
export function getPlanetHouse(planetLongitude: number, houseCusps: number[]): number {
  const normalizedLongitude = normalizeAngle(planetLongitude);

  for (let i = 0; i < 12; i++) {
    const currentCusp = houseCusps[i];
    const nextCusp = houseCusps[(i + 1) % 12];

    if (isInHouse(normalizedLongitude, currentCusp, nextCusp)) {
      return i + 1; // Houses are numbered 1-12
    }
  }

  return 1; // Fallback to house 1
}

// Helper functions

function normalizeAngle(angle: number): number {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

function quadrantSize(start: number, end: number): number {
  let size = end - start;
  if (size < 0) size += 360;
  if (size > 180) size = 360 - size;
  return size;
}

function isInHouse(longitude: number, cuspStart: number, cuspEnd: number): boolean {
  if (cuspStart < cuspEnd) {
    return longitude >= cuspStart && longitude < cuspEnd;
  } else {
    // House crosses 0° (Aries point)
    return longitude >= cuspStart || longitude < cuspEnd;
  }
}

// Traditional house meanings for reference
export const houseTraditionalMeanings = {
  1: { name: 'Ascendant', keywords: 'Self, Identity, Appearance, First Impressions' },
  2: { name: 'Values', keywords: 'Money, Possessions, Self-Worth, Resources' },
  3: { name: 'Communication', keywords: 'Siblings, Learning, Local Travel, Daily Life' },
  4: { name: 'Home', keywords: 'Family, Roots, Foundation, Private Life' },
  5: { name: 'Creativity', keywords: 'Children, Romance, Creativity, Self-Expression' },
  6: { name: 'Work', keywords: 'Health, Daily Routine, Service, Employment' },
  7: { name: 'Partnership', keywords: 'Marriage, Open Enemies, One-on-One Relationships' },
  8: { name: 'Transformation', keywords: 'Death, Rebirth, Shared Resources, Occult' },
  9: { name: 'Philosophy', keywords: 'Higher Learning, Travel, Religion, Law' },
  10: { name: 'Career', keywords: 'Reputation, Public Image, Authority, Achievement' },
  11: { name: 'Community', keywords: 'Friends, Groups, Hopes, Aspirations' },
  12: { name: 'Spirituality', keywords: 'Hidden Enemies, Sacrifice, Transcendence, Karma' }
};