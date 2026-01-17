/**
 * Vedic Astrology (Jyotish) Calculator
 *
 * Core calculations for sidereal positions, nakshatras, and planetary dignities
 */

import { calculateAyanamsa, tropicalToSidereal } from './ayanamsaCalculator';
import {
  AyanamsaType,
  AYANAMSA_CONFIGS,
  GrahaName,
  GRAHAS,
  NakshatraInfo,
  NAKSHATRAS,
  RashiInfo,
  RashiName,
  RASHIS,
  SiderealPosition,
  GrahaPosition,
  PlanetaryDignity,
  VedicChart,
  CompleteVedicProfile,
} from './types/vedic';

// =============================================================================
// NAKSHATRA CALCULATIONS
// =============================================================================

/** Each nakshatra spans 13°20' (13.333...°) */
const NAKSHATRA_SPAN = 360 / 27;

/** Each pada spans 3°20' (3.333...°) */
const PADA_SPAN = NAKSHATRA_SPAN / 4;

/**
 * Calculate nakshatra from sidereal longitude
 *
 * @param siderealLongitude - Sidereal ecliptic longitude (0-360)
 * @returns Nakshatra info with pada and degree within nakshatra
 */
export function getNakshatraFromLongitude(siderealLongitude: number): {
  nakshatra: NakshatraInfo;
  pada: 1 | 2 | 3 | 4;
  degreeInNakshatra: number;
} {
  // Normalize longitude
  const normalizedLong = ((siderealLongitude % 360) + 360) % 360;

  const nakshatraIndex = Math.floor(normalizedLong / NAKSHATRA_SPAN);
  const degreeInNakshatra = normalizedLong % NAKSHATRA_SPAN;
  const pada = (Math.floor(degreeInNakshatra / PADA_SPAN) + 1) as 1 | 2 | 3 | 4;

  return {
    nakshatra: NAKSHATRAS[nakshatraIndex],
    pada: Math.min(pada, 4) as 1 | 2 | 3 | 4, // Ensure max is 4
    degreeInNakshatra,
  };
}

/**
 * Get nakshatra by name
 */
export function getNakshatraByName(name: string): NakshatraInfo | undefined {
  return NAKSHATRAS.find(
    (n) => n.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get nakshatra by number (1-27)
 */
export function getNakshatraByNumber(number: number): NakshatraInfo | undefined {
  return NAKSHATRAS.find((n) => n.number === number);
}

// =============================================================================
// RASHI (SIGN) CALCULATIONS
// =============================================================================

/**
 * Get rashi from sidereal longitude
 *
 * @param siderealLongitude - Sidereal ecliptic longitude (0-360)
 * @returns Rashi info with degree within rashi
 */
export function getRashiFromLongitude(siderealLongitude: number): {
  rashi: RashiInfo;
  degree: number;
} {
  // Normalize longitude
  const normalizedLong = ((siderealLongitude % 360) + 360) % 360;

  const rashiIndex = Math.floor(normalizedLong / 30);
  const degree = normalizedLong % 30;

  return {
    rashi: RASHIS[rashiIndex],
    degree,
  };
}

/**
 * Get rashi by name
 */
export function getRashiByName(name: RashiName | string): RashiInfo | undefined {
  return RASHIS.find(
    (r) =>
      r.name.toLowerCase() === name.toLowerCase() ||
      r.westernEquivalent.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get rashi by number (1-12)
 */
export function getRashiByNumber(number: number): RashiInfo | undefined {
  return RASHIS.find((r) => r.number === number);
}

// =============================================================================
// PLANETARY DIGNITY CALCULATIONS
// =============================================================================

/**
 * Calculate planetary dignity based on sidereal position
 *
 * Dignity hierarchy:
 * 1. Exalted - highest strength (within 3° of exact exaltation degree)
 * 2. Moolatrikona - strong (in specific degree range of own sign)
 * 3. Own sign - comfortable
 * 4. Friendly sign - supportive
 * 5. Neutral sign - neither help nor hindrance
 * 6. Enemy sign - challenging
 * 7. Debilitated - weakest (within 3° of exact debilitation degree)
 *
 * @param graha - Planet name
 * @param siderealLongitude - Sidereal position (0-360)
 * @returns Planetary dignity
 */
export function calculateDignity(
  graha: GrahaName,
  siderealLongitude: number
): PlanetaryDignity {
  const info = GRAHAS[graha];
  const { rashi, degree } = getRashiFromLongitude(siderealLongitude);
  const rashiName = rashi.name;

  // Check debilitation (within 3° orb of exact degree)
  if (
    rashiName === info.debilitation &&
    Math.abs(degree - info.debilitationDegree) <= 3
  ) {
    return 'debilitated';
  }

  // Check exaltation (within 3° orb of exact degree)
  if (
    rashiName === info.exaltation &&
    Math.abs(degree - info.exaltationDegree) <= 3
  ) {
    return 'exalted';
  }

  // Check moolatrikona (specific degree range in sign)
  if (rashiName === info.moolatrikona) {
    const [start, end] = info.moolatrikonaRange;
    if (degree >= start && degree <= end) {
      return 'moolatrikona';
    }
  }

  // Check own sign
  if (info.ownSigns.includes(rashiName)) {
    return 'own';
  }

  // Simplified friendship calculation
  // In traditional Jyotish, this is based on complex relationships
  // For now, we use a simplified version based on element compatibility
  const grahaElement = info.element;
  const rashiElement = rashi.element;

  if (grahaElement === rashiElement) {
    return 'friendly';
  }

  // Check for natural friendships
  const friendlyPairs: Record<GrahaName, GrahaName[]> = {
    Surya: ['Chandra', 'Mangala', 'Guru'],
    Chandra: ['Surya', 'Budha'],
    Mangala: ['Surya', 'Chandra', 'Guru'],
    Budha: ['Surya', 'Shukra'],
    Guru: ['Surya', 'Chandra', 'Mangala'],
    Shukra: ['Budha', 'Shani'],
    Shani: ['Budha', 'Shukra'],
    Rahu: ['Shukra', 'Shani'],
    Ketu: ['Mangala', 'Shukra'],
  };

  const friends = friendlyPairs[graha] || [];
  if (friends.includes(rashi.ruler)) {
    return 'friendly';
  }

  // Check for natural enmities
  const enemyPairs: Record<GrahaName, GrahaName[]> = {
    Surya: ['Shukra', 'Shani'],
    Chandra: ['Rahu', 'Ketu'],
    Mangala: ['Budha'],
    Budha: ['Chandra'],
    Guru: ['Budha', 'Shukra'],
    Shukra: ['Surya', 'Chandra'],
    Shani: ['Surya', 'Chandra', 'Mangala'],
    Rahu: ['Surya', 'Chandra', 'Mangala'],
    Ketu: ['Surya', 'Chandra'],
  };

  const enemies = enemyPairs[graha] || [];
  if (enemies.includes(rashi.ruler)) {
    return 'enemy';
  }

  return 'neutral';
}

/**
 * Check if planet is combust (too close to Sun)
 *
 * Combustion weakens a planet when it's within certain degrees of the Sun.
 * Combustion orbs vary by planet:
 * - Moon: 12°
 * - Mars: 17°
 * - Mercury: 14° (12° when retrograde)
 * - Jupiter: 11°
 * - Venus: 10° (8° when retrograde)
 * - Saturn: 15°
 *
 * @param graha - Planet to check
 * @param grahaLongitude - Planet's sidereal longitude
 * @param sunLongitude - Sun's sidereal longitude
 * @param isRetrograde - Whether the planet is retrograde
 * @returns Whether the planet is combust
 */
export function isGrahaCombust(
  graha: GrahaName,
  grahaLongitude: number,
  sunLongitude: number,
  isRetrograde: boolean = false
): boolean {
  // Sun, Rahu, and Ketu cannot be combust
  if (graha === 'Surya' || graha === 'Rahu' || graha === 'Ketu') {
    return false;
  }

  const combustionOrbs: Record<string, number> = {
    Chandra: 12,
    Mangala: 17,
    Budha: isRetrograde ? 12 : 14,
    Guru: 11,
    Shukra: isRetrograde ? 8 : 10,
    Shani: 15,
  };

  const orb = combustionOrbs[graha] || 6;

  // Calculate angular distance
  let diff = Math.abs(grahaLongitude - sunLongitude);
  if (diff > 180) {
    diff = 360 - diff;
  }

  return diff <= orb;
}

// =============================================================================
// SIDEREAL POSITION CALCULATION
// =============================================================================

/**
 * Calculate complete sidereal position from tropical longitude
 *
 * @param tropicalLongitude - Tropical ecliptic longitude (0-360)
 * @param ayanamsa - Ayanamsa value in degrees
 * @returns Complete sidereal position with rashi and nakshatra
 */
export function calculateSiderealPosition(
  tropicalLongitude: number,
  ayanamsa: number
): SiderealPosition {
  const siderealLong = tropicalToSidereal(tropicalLongitude, ayanamsa);
  const { rashi, degree: rashiDegree } = getRashiFromLongitude(siderealLong);
  const { nakshatra, pada, degreeInNakshatra } =
    getNakshatraFromLongitude(siderealLong);

  return {
    longitude: siderealLong,
    rashi,
    rashiDegree,
    nakshatra,
    nakshatraPada: pada,
    nakshatraDegree: degreeInNakshatra,
  };
}

/**
 * Calculate complete graha position from tropical data
 *
 * @param graha - Planet name
 * @param tropicalLongitude - Tropical ecliptic longitude
 * @param ayanamsa - Ayanamsa value
 * @param retrograde - Whether planet is retrograde
 * @param sunLongitude - Sun's sidereal longitude (for combustion check)
 * @param house - House number (1-12)
 * @returns Complete graha position with dignity and status
 */
export function calculateGrahaPosition(
  graha: GrahaName,
  tropicalLongitude: number,
  ayanamsa: number,
  retrograde: boolean = false,
  sunLongitude?: number,
  house: number = 1
): GrahaPosition {
  const siderealPosition = calculateSiderealPosition(tropicalLongitude, ayanamsa);
  const dignity = calculateDignity(graha, siderealPosition.longitude);

  let combustion = false;
  if (sunLongitude !== undefined) {
    combustion = isGrahaCombust(
      graha,
      siderealPosition.longitude,
      sunLongitude,
      retrograde
    );
  }

  return {
    ...siderealPosition,
    graha: GRAHAS[graha],
    retrograde,
    dignity,
    combustion,
    house,
  };
}

// =============================================================================
// SPIRALOGIC INTEGRATION
// =============================================================================

/**
 * Map Vedic element to Spiralogic element
 */
export function mapVedicToSpiralogicElement(
  vedicElement: 'agni' | 'prithvi' | 'vayu' | 'jala' | 'akasha'
): 'fire' | 'earth' | 'air' | 'water' | 'aether' {
  const mapping: Record<string, 'fire' | 'earth' | 'air' | 'water' | 'aether'> = {
    agni: 'fire',
    prithvi: 'earth',
    vayu: 'air',
    jala: 'water',
    akasha: 'aether',
  };
  return mapping[vedicElement] || 'aether';
}

/**
 * Generate Spiralogic integration for a Vedic profile
 */
export function generateSpiralogicIntegration(
  moonSign: RashiInfo,
  birthNakshatra: NakshatraInfo
): {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  pathway: string;
  integration: string;
} {
  const spiralogicElement = moonSign.spiralogicElement;

  const pathways: Record<string, string> = {
    fire: 'Fire Pathway - Vision and Transformation',
    water: 'Water Pathway - Emotion and Intuition',
    earth: 'Earth Pathway - Manifestation and Grounding',
    air: 'Air Pathway - Communication and Connection',
  };

  const pathway = pathways[spiralogicElement] || 'Aether Pathway - Integration';

  const integration = `Your ${birthNakshatra.name} nakshatra (${birthNakshatra.meaning}) channels ${moonSign.name} (${moonSign.westernEquivalent}) energy through the ${pathway}. ${birthNakshatra.spiralogicConnection}`;

  return {
    element: spiralogicElement as 'fire' | 'water' | 'earth' | 'air' | 'aether',
    pathway,
    integration,
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get graha info by name
 */
export function getGrahaByName(name: GrahaName | string): typeof GRAHAS[GrahaName] | undefined {
  const normalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  return GRAHAS[normalized as GrahaName];
}

/**
 * Get graha by Western name
 */
export function getGrahaByWesternName(
  westernName: string
): typeof GRAHAS[GrahaName] | undefined {
  return Object.values(GRAHAS).find(
    (g) => g.westernName.toLowerCase() === westernName.toLowerCase()
  );
}

/**
 * Format sidereal position as string
 */
export function formatSiderealPosition(position: SiderealPosition): string {
  const degrees = Math.floor(position.rashiDegree);
  const minutes = Math.round((position.rashiDegree - degrees) * 60);

  return `${degrees}° ${minutes}' ${position.rashi.name} (${position.nakshatra.name} Pada ${position.nakshatraPada})`;
}

/**
 * Format dignity as descriptive string
 */
export function formatDignity(dignity: PlanetaryDignity): string {
  const descriptions: Record<PlanetaryDignity, string> = {
    exalted: 'Exalted (Uchcha)',
    moolatrikona: 'Moolatrikona',
    own: 'Own Sign (Swakshetra)',
    friendly: 'Friendly Sign',
    neutral: 'Neutral Sign',
    enemy: 'Enemy Sign',
    debilitated: 'Debilitated (Neecha)',
  };
  return descriptions[dignity];
}

/**
 * Get dignity strength score (for comparative analysis)
 * Higher is better
 */
export function getDignityStrength(dignity: PlanetaryDignity): number {
  const scores: Record<PlanetaryDignity, number> = {
    exalted: 100,
    moolatrikona: 85,
    own: 75,
    friendly: 60,
    neutral: 50,
    enemy: 30,
    debilitated: 0,
  };
  return scores[dignity];
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  AyanamsaType,
  AYANAMSA_CONFIGS,
  GrahaName,
  GRAHAS,
  NakshatraInfo,
  NAKSHATRAS,
  RashiInfo,
  RashiName,
  RASHIS,
  SiderealPosition,
  GrahaPosition,
  PlanetaryDignity,
  VedicChart,
  CompleteVedicProfile,
} from './types/vedic';
