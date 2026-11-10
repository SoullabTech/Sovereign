/**
 * Ayanamsa Calculator for Vedic Astrology
 *
 * Calculates the precession offset between tropical and sidereal zodiacs
 * Supports multiple ayanamsa systems (Lahiri, True Chitra, Krishnamurti)
 */

import { AyanamsaType, AYANAMSA_CONFIGS } from './types/vedic';

/**
 * Ayanamsa (true: includes nutation, matching the true tropical longitudes the
 * charts are built from).
 *
 * Definitions, not fits:
 *  - Lahiri (Chitrapaksha): 23°15'00.658" at 1956-03-21 (Calendar Reform
 *    Committee), a true value; the mean is that less the nutation then
 *    (0.004658035°). It advances with general precession.
 *  - True Chitra: Spica held at 0° Libra; Spica's J2000 ecliptic longitude is
 *    203.84136° (RA 13h25m11.579s, Dec -11°09'40.75"), carried forward with
 *    general precession. Spica's proper motion (about 1" per century in
 *    longitude) is neglected.
 *  - Krishnamurti: 22.363889° at 1900-01-00.5 (JD 2415020.0), the Swiss
 *    Ephemeris definition, about 5'48" less than Lahiri.
 *
 * General precession in longitude (IAU 2006): 5028.796195" T + 1.1054348" T²,
 * T in Julian centuries from J2000. Nutation: the four leading terms of the
 * IAU 1980 series (about 0.0003° accuracy).
 */
const J2000_JD = 2451545.0;
const LAHIRI_EPOCH_JD = 2435553.5;
const LAHIRI_MEAN_AT_EPOCH = 23.250182778 - 0.004658035;
const KP_EPOCH_JD = 2415020.0;
const KP_AT_EPOCH = 22.363889;
const SPICA_J2000_LONGITUDE = 203.84135638;

const toJulianDate = (date: Date) => date.getTime() / 86_400_000 + 2440587.5;
const centuries = (jd: number) => (jd - J2000_JD) / 36525;
const precessionDeg = (T: number) => (5028.796195 * T + 1.1054348 * T * T) / 3600;

function nutationInLongitudeDeg(T: number): number {
  const rad = Math.PI / 180;
  const omega = (125.04452 - 1934.136261 * T) * rad;
  const sunL = (280.4665 + 36000.7698 * T) * rad;
  const moonL = (218.3165 + 481267.8813 * T) * rad;
  return (-17.20 * Math.sin(omega) - 1.32 * Math.sin(2 * sunL)
    - 0.23 * Math.sin(2 * moonL) + 0.21 * Math.sin(2 * omega)) / 3600;
}

export function calculateAyanamsa(
  date: Date,
  type: AyanamsaType = 'lahiri'
): number {
  const jd = toJulianDate(date);
  const T = centuries(jd);
  const nutation = nutationInLongitudeDeg(T);

  let mean: number;
  switch (type) {
    case 'true_chitra':
      mean = (SPICA_J2000_LONGITUDE - 180) + precessionDeg(T);
      break;
    case 'krishnamurti':
      mean = KP_AT_EPOCH + precessionDeg(T) - precessionDeg(centuries(KP_EPOCH_JD));
      break;
    case 'lahiri':
    default:
      mean = LAHIRI_MEAN_AT_EPOCH + precessionDeg(T) - precessionDeg(centuries(LAHIRI_EPOCH_JD));
  }
  return mean + nutation;
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
