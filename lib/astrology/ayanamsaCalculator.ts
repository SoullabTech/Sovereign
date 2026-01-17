/**
 * Ayanamsa Calculator for Vedic Astrology
 *
 * Calculates the precession offset between tropical and sidereal zodiacs
 * Supports multiple ayanamsa systems (Lahiri, True Chitra, Krishnamurti)
 */

import { AyanamsaType, AYANAMSA_CONFIGS } from './types/vedic';

/** J2000.0 epoch: January 1, 2000 at 12:00 TT */
const J2000_EPOCH = new Date('2000-01-01T12:00:00Z');

/** Milliseconds per Julian year (365.25 days) */
const MS_PER_JULIAN_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/**
 * Calculate ayanamsa value for a given date
 *
 * The ayanamsa is the angular difference between the tropical zodiac
 * (based on the spring equinox) and the sidereal zodiac (based on fixed stars).
 *
 * Formula: ayanamsa = epochOffset + (annualRate × yearsSinceJ2000)
 *
 * @param date - The date to calculate ayanamsa for
 * @param type - The ayanamsa system to use (default: 'lahiri')
 * @returns Ayanamsa value in degrees
 */
export function calculateAyanamsa(
  date: Date,
  type: AyanamsaType = 'lahiri'
): number {
  const config = AYANAMSA_CONFIGS[type];

  const msSinceEpoch = date.getTime() - J2000_EPOCH.getTime();
  const yearsSinceEpoch = msSinceEpoch / MS_PER_JULIAN_YEAR;

  const ayanamsa = config.epochOffset + config.annualRate * yearsSinceEpoch;

  return ayanamsa;
}

/**
 * Convert tropical longitude to sidereal
 *
 * Subtracts the ayanamsa from the tropical position to get the sidereal position.
 * The result is normalized to 0-360 degrees.
 *
 * @param tropicalLongitude - Tropical ecliptic longitude (0-360)
 * @param ayanamsa - Ayanamsa value in degrees
 * @returns Sidereal ecliptic longitude (0-360)
 */
export function tropicalToSidereal(
  tropicalLongitude: number,
  ayanamsa: number
): number {
  let sidereal = tropicalLongitude - ayanamsa;
  // Normalize to 0-360
  return ((sidereal % 360) + 360) % 360;
}

/**
 * Convert sidereal longitude to tropical
 *
 * Adds the ayanamsa to the sidereal position to get the tropical position.
 * The result is normalized to 0-360 degrees.
 *
 * @param siderealLongitude - Sidereal ecliptic longitude (0-360)
 * @param ayanamsa - Ayanamsa value in degrees
 * @returns Tropical ecliptic longitude (0-360)
 */
export function siderealToTropical(
  siderealLongitude: number,
  ayanamsa: number
): number {
  let tropical = siderealLongitude + ayanamsa;
  // Normalize to 0-360
  return ((tropical % 360) + 360) % 360;
}

/**
 * Get ayanamsa configuration for a given type
 *
 * @param type - The ayanamsa system
 * @returns Ayanamsa configuration object
 */
export function getAyanamsaConfig(type: AyanamsaType = 'lahiri') {
  return AYANAMSA_CONFIGS[type];
}

/**
 * Get all available ayanamsa systems
 *
 * @returns Array of ayanamsa configurations
 */
export function getAvailableAyanamsas() {
  return Object.values(AYANAMSA_CONFIGS);
}

/**
 * Calculate the difference between two ayanamsa systems at a given date
 *
 * Useful for comparing charts calculated with different ayanamsas.
 *
 * @param date - The date to compare at
 * @param type1 - First ayanamsa system
 * @param type2 - Second ayanamsa system
 * @returns Difference in degrees (type1 - type2)
 */
export function compareAyanamsas(
  date: Date,
  type1: AyanamsaType,
  type2: AyanamsaType
): number {
  const ayanamsa1 = calculateAyanamsa(date, type1);
  const ayanamsa2 = calculateAyanamsa(date, type2);
  return ayanamsa1 - ayanamsa2;
}

/**
 * Get the approximate ayanamsa for a given year (quick lookup)
 *
 * Less precise than calculateAyanamsa but faster for rough estimates.
 *
 * @param year - Calendar year
 * @param type - The ayanamsa system to use
 * @returns Approximate ayanamsa value in degrees
 */
export function getApproximateAyanamsa(
  year: number,
  type: AyanamsaType = 'lahiri'
): number {
  const config = AYANAMSA_CONFIGS[type];
  const yearsSince2000 = year - 2000;
  return config.epochOffset + config.annualRate * yearsSince2000;
}

/**
 * Format ayanamsa as degrees, minutes, seconds string
 *
 * @param ayanamsa - Ayanamsa value in degrees
 * @returns Formatted string like "23° 52' 14""
 */
export function formatAyanamsa(ayanamsa: number): string {
  const degrees = Math.floor(ayanamsa);
  const minutesDecimal = (ayanamsa - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60);

  return `${degrees}° ${minutes}' ${seconds}"`;
}
