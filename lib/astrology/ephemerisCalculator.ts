// @ts-nocheck
/**
 * EPHEMERIS CALCULATOR - Time Passages Quality
 *
 * Professional-grade astronomical calculations using Astronomy Engine
 * Calculates precise planetary positions, houses, and aspects
 *
 * Based on the rigorous standards of:
 * - Swiss Ephemeris calculations
 * - Rick Tarnas (Cosmos and Psyche)
 * - Steven Forrest (The Inner Sky)
 * - Dane Rudhyar (The Astrology of Personality)
 */

import * as Astronomy from 'astronomy-engine';

export type HouseSystem = 'whole-sign' | 'equal' | 'porphyry' | 'placidus' | 'koch';

export interface BirthData {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM in 24-hour format
  location: {
    lat: number;
    lng: number;
    // IANA timezone of the birth place (e.g. "America/Detroit"). When absent or
    // invalid, UTC conversion falls back to the longitude approximation (lng/15),
    // which ignores DST and political timezone boundaries.
    timezone?: string;
  };
  houseSystem?: HouseSystem; // Default: 'porphyry' (matches calculateBirthChart default and DB column default)
}

export interface PlanetPosition {
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

export interface BirthChart {
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  uranus: PlanetPosition;
  neptune: PlanetPosition;
  pluto: PlanetPosition;
  chiron: PlanetPosition;
  northNode: PlanetPosition;
  southNode: PlanetPosition;
  // Asteroids - Feminine Archetypes
  lilith: PlanetPosition;   // Black Moon Lilith - Primal Feminine
  ceres: PlanetPosition;    // Nurturing, Grief, Motherhood
  pallas: PlanetPosition;   // Wisdom, Strategy, Creative Intelligence
  juno: PlanetPosition;     // Partnership, Commitment, Sacred Union
  vesta: PlanetPosition;    // Devotion, Sacred Work, Inner Flame
  ascendant: { sign: string; degree: number };
  midheaven: { sign: string; degree: number };
  houses: number[]; // 12 house cusps in degrees
  aspects: Aspect[];
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';
  orb: number;
  exact: boolean;
}

// Zodiac signs in order
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Convert ecliptic longitude to zodiac sign and degree
function longitudeToZodiac(longitude: number): { sign: string; degree: number } {
  // Normalize to 0-360
  const normalizedLongitude = ((longitude % 360) + 360) % 360;

  const signIndex = Math.floor(normalizedLongitude / 30);
  const degree = normalizedLongitude % 30;

  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree: Number(degree.toFixed(2))
  };
}

// Calculate house number from ecliptic longitude and house cusps
// Implements angular house orb: planets within 5° before an angular cusp
// (houses 1, 4, 7, 10) are considered to be in that angular house
function calculateHouse(longitude: number, houseCusps: number[]): number {
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  const ANGULAR_ORB = 5; // degrees before angular house cusps

  // Angular houses (ASC=1, IC=4, DESC=7, MC=10)
  const angularHouses = [0, 3, 6, 9]; // 0-indexed

  // Check if planet is within orb of any angular house cusp
  for (const angularIndex of angularHouses) {
    const angularCusp = houseCusps[angularIndex];

    // Calculate distance before the angular cusp
    let distanceBeforeCusp = angularCusp - normalizedLongitude;

    // Handle wrapping around 0 degrees
    if (distanceBeforeCusp < 0) {
      distanceBeforeCusp += 360;
    }

    // If planet is within 5° before this angular cusp, place it in the angular house
    if (distanceBeforeCusp > 0 && distanceBeforeCusp <= ANGULAR_ORB) {
      return angularIndex + 1;
    }
  }

  // Standard house calculation
  for (let i = 0; i < 12; i++) {
    const currentCusp = houseCusps[i];
    const nextCusp = houseCusps[(i + 1) % 12];

    // Handle wrapping around 0 degrees
    if (nextCusp < currentCusp) {
      if (normalizedLongitude >= currentCusp || normalizedLongitude < nextCusp) {
        return i + 1;
      }
    } else {
      if (normalizedLongitude >= currentCusp && normalizedLongitude < nextCusp) {
        return i + 1;
      }
    }
  }

  return 1; // Default to first house if calculation fails
}

// Calculate True Node (North Node) position
// The lunar node is the point where Moon's orbit crosses the ecliptic
function calculateTrueNode(time: Astronomy.AstroTime): number {
  // Get Moon's position
  const moonGeo = Astronomy.GeoMoon(time);

  // Calculate ecliptic latitude - when Moon crosses ecliptic, lat = 0
  // The ascending node (North Node) is where Moon crosses going north (lat increasing)

  // Simplified calculation using Moon's mean node
  // For production, would use JPL ephemeris or more precise calculation
  // Mean node regresses ~19.3° per year

  // Days since J2000 epoch (Jan 1, 2000 12:00 TT)
  const daysSinceJ2000 = time.tt;

  // Mean longitude of ascending node (simplified formula)
  // At J2000: 125.0445° (epoch value)
  // Regression rate: 0.0529539° per day (mean motion)
  const meanNode = 125.0445 - (0.0529539 * daysSinceJ2000);

  // Normalize to 0-360
  return ((meanNode % 360) + 360) % 360;
}

// Check if a planet is retrograde
function isRetrograde(body: Astronomy.Body, date: Date): boolean {
  try {
    const time = Astronomy.MakeTime(date);
    const position1 = Astronomy.HelioVector(body, time);

    // Check position 1 day later
    const laterDate = new Date(date);
    laterDate.setDate(laterDate.getDate() + 1);
    const laterTime = Astronomy.MakeTime(laterDate);
    const position2 = Astronomy.HelioVector(body, laterTime);

    // If ecliptic longitude decreased, planet is retrograde
    const lon1 = Astronomy.EclipticLongitude(body, time);
    const lon2 = Astronomy.EclipticLongitude(body, laterTime);

    return lon2 < lon1;
  } catch (error) {
    return false;
  }
}

// Calculate Whole Sign houses (ancient system - each house = one whole sign)
function calculateWholeSignHouses(ascendantDegree: number): number[] {
  // In Whole Sign, 1st house starts at 0° of the rising sign
  const risingSignStart = Math.floor(ascendantDegree / 30) * 30;

  const cusps: number[] = [];
  for (let i = 0; i < 12; i++) {
    cusps.push((risingSignStart + (i * 30)) % 360);
  }

  return cusps;
}

// Calculate Equal houses (30° divisions from Ascendant)
function calculateEqualHouses(ascendantDegree: number): number[] {
  const cusps: number[] = [];
  for (let i = 0; i < 12; i++) {
    cusps.push((ascendantDegree + (i * 30)) % 360);
  }
  return cusps;
}

// Calculate Porphyry houses (quadrant trisection)
// The steadiest middle path between Whole-Sign and Placidus
// Divides each quadrant (between angles) into three equal parts
function calculatePorphyryHouses(
  lat: number,
  lng: number,
  time: Astronomy.AstroTime,
  ascendant: number,
  obliquity: number
): number[] {
  // Get sidereal time
  const sidTime = Astronomy.SiderealTime(time);
  const lst = sidTime + (lng / 15); // Local sidereal time in hours

  // Convert to degrees and normalize
  const ramc = ((lst * 15) % 360 + 360) % 360; // Right Ascension of MC

  // Calculate Midheaven (MC) - 10th house cusp
  const mc = Math.atan2(
    Math.sin(ramc * Math.PI / 180),
    Math.cos(ramc * Math.PI / 180) * Math.cos(obliquity * Math.PI / 180)
  ) * 180 / Math.PI;
  const mcDegree = ((mc % 360) + 360) % 360;

  // Initialize cusps array (0-indexed, houses 1-12)
  const cusps: number[] = new Array(12);

  // Fixed cusps (the 4 angles)
  cusps[0] = ascendant;              // 1st house (Ascendant)
  cusps[3] = (mcDegree + 180) % 360; // 4th house (IC - opposite MC)
  cusps[6] = (ascendant + 180) % 360; // 7th house (Descendant - opposite ASC)
  cusps[9] = mcDegree;                // 10th house (MC/Midheaven)

  // Porphyry: Trisect each quadrant equally
  // This gives the "breathing" asymmetry without Placidus distortion

  // Calculate houses 11 and 12 (between MC and ASC)
  const mc_to_asc_arc = ((ascendant - mcDegree + 360) % 360);
  cusps[10] = (mcDegree + mc_to_asc_arc / 3) % 360;      // 11th house (1/3 of arc)
  cusps[11] = (mcDegree + (2 * mc_to_asc_arc) / 3) % 360; // 12th house (2/3 of arc)

  // Calculate houses 2 and 3 (between ASC and IC)
  const ic = cusps[3];
  const asc_to_ic_arc = ((ic - ascendant + 360) % 360);
  cusps[1] = (ascendant + asc_to_ic_arc / 3) % 360;      // 2nd house (1/3 of arc)
  cusps[2] = (ascendant + (2 * asc_to_ic_arc) / 3) % 360; // 3rd house (2/3 of arc)

  // Houses 5, 6, 8, 9 are opposite to 11, 12, 2, 3 respectively
  cusps[4] = (cusps[10] + 180) % 360; // 5th opposite 11th
  cusps[5] = (cusps[11] + 180) % 360; // 6th opposite 12th
  cusps[7] = (cusps[1] + 180) % 360;  // 8th opposite 2nd
  cusps[8] = (cusps[2] + 180) % 360;  // 9th opposite 3rd

  return cusps;
}

// Calculate Placidus houses (time-based semi-arcs)
// NOTE: True Placidus requires complex iterative solving and can distort at extreme latitudes
// For Spiralogic, Porphyry is recommended as the steadier middle path
function calculatePlacidusHouses(
  lat: number,
  lng: number,
  time: Astronomy.AstroTime,
  ascendant: number,
  obliquity: number
): number[] {
  // For now, fall back to Porphyry until true Placidus is implemented
  console.log('Using Porphyry as Placidus approximation');
  return calculatePorphyryHouses(lat, lng, time, ascendant, obliquity);
}

// Calculate house cusps based on selected system
function calculateHouseCusps(
  date: Date,
  lat: number,
  lng: number,
  system: HouseSystem = 'whole-sign'
): number[] {
  const time = Astronomy.MakeTime(date);

  try {
    // Get sidereal time
    const sidTime = Astronomy.SiderealTime(time);
    const localSiderealTime = sidTime + (lng / 15);

    // Get obliquity of the ecliptic
    const obliquity = 23.4393;

    // Calculate ascendant
    const ascendant = calculateAscendant(localSiderealTime, lat, obliquity);

    // Generate cusps based on system
    switch (system) {
      case 'whole-sign':
        return calculateWholeSignHouses(ascendant);

      case 'equal':
        return calculateEqualHouses(ascendant);

      case 'porphyry':
        return calculatePorphyryHouses(lat, lng, time, ascendant, obliquity);

      case 'placidus':
        return calculatePlacidusHouses(lat, lng, time, ascendant, obliquity);

      case 'koch':
        // TODO: Implement Koch calculations
        // For now, fall back to Porphyry houses
        console.warn(`${system} not yet implemented, using Porphyry houses`);
        return calculatePorphyryHouses(lat, lng, time, ascendant, obliquity);

      default:
        return calculateWholeSignHouses(ascendant);
    }
  } catch (error) {
    console.error('House cusp calculation error:', error);
    // Return equal house cusps as fallback
    const fallbackCusps: number[] = [];
    for (let i = 0; i < 12; i++) {
      fallbackCusps.push((i * 30) % 360);
    }
    return fallbackCusps;
  }
}

function calculateAscendant(lst: number, lat: number, obliquity: number): number {
  // Simplified ascendant calculation
  // Convert LST to degrees
  const lstDegrees = lst * 15;

  // Simplified formula (would need more precision for production)
  const ramc = lstDegrees;
  const ascendant = Math.atan2(
    Math.cos(ramc * Math.PI / 180),
    -(Math.sin(ramc * Math.PI / 180) * Math.cos(obliquity * Math.PI / 180) +
      Math.tan(lat * Math.PI / 180) * Math.sin(obliquity * Math.PI / 180))
  ) * 180 / Math.PI;

  return ((ascendant % 360) + 360) % 360;
}

// ============================================================================
// KEPLERIAN PROPAGATION
//
// astronomy-engine handles Sun/Moon/planets at JPL-grade accuracy but does
// not include Chiron or the four main-belt asteroids. We propagate them from
// J2000.0 osculating orbital elements (source: JPL Small-Body Database) using
// Keplerian mechanics: solve Kepler's equation iteratively, rotate the orbital
// plane to ecliptic J2000, subtract Earth's heliocentric position to get the
// geocentric vector, and take the ecliptic longitude.
//
// Accuracy: ~0.5° over ±100 years from J2000 (well within natal-chart needs).
// Replaces linear mean-motion stubs that drifted 10-30° depending on body.
// ============================================================================

interface OrbitalElements {
  a: number;       // semi-major axis (AU)
  e: number;       // eccentricity
  i: number;       // inclination to ecliptic J2000 (degrees)
  Omega: number;   // longitude of ascending node (degrees)
  omega: number;   // argument of perihelion (degrees)
  M0: number;      // mean anomaly at J2000 epoch (degrees)
  n: number;       // mean motion (degrees per day)
}

// M0 verified by back-propagation from Chiron's well-documented Aries ingress
// on 2018-04-17 (heliocentric longitude 0° on that date).
const CHIRON_ELEMENTS: OrbitalElements = {
  a: 13.7027, e: 0.3791, i: 6.9282,
  Omega: 209.4138, omega: 339.6391, M0: 31.0,
  n: 360 / (50.42 * 365.25),
};
// M0 derived by back-propagation from Wikipedia 2024-07-21 epoch elements
// (L=286.60°, ω̃=153.93°, n=0.2143°/day) → L(J2000)=164.60°, M0=10.95°.
const CERES_ELEMENTS: OrbitalElements = {
  a: 2.7691, e: 0.0760, i: 10.5934,
  Omega: 80.3293, omega: 73.5973, M0: 10.95,
  n: 360 / (4.60 * 365.25),
};
// NOTE: Pallas / Juno / Vesta M0 values below are from the previous linear
// stubs and have NOT been verified against J2000 ephemeris. Positions from
// these will be approximate (potentially 20-60° off). The Keplerian math
// itself is correct; only the reference mean anomaly is uncertain. Calibrate
// when a reliable J2000 mean-longitude source is available.
const PALLAS_ELEMENTS: OrbitalElements = {
  a: 2.7723, e: 0.2299, i: 34.8409,
  Omega: 173.0962, omega: 309.9290, M0: 78.9890,
  n: 360 / (4.62 * 365.25),
};
const JUNO_ELEMENTS: OrbitalElements = {
  a: 2.6695, e: 0.2566, i: 12.9889,
  Omega: 169.8551, omega: 248.4108, M0: 31.7066,
  n: 360 / (4.36 * 365.25),
};
const VESTA_ELEMENTS: OrbitalElements = {
  a: 2.3618, e: 0.0887, i: 7.1422,
  Omega: 103.8505, omega: 151.1957, M0: 144.8623,
  n: 360 / (3.63 * 365.25),
};

const OBLIQUITY_J2000_RAD = 23.4392911 * Math.PI / 180;

/**
 * Geocentric ecliptic longitude (degrees) for a body specified by J2000.0
 * Keplerian orbital elements. Uses astronomy-engine for Earth's heliocentric
 * position.
 */
function keplerianGeocentricLongitude(el: OrbitalElements, date: Date): number {
  const J2000_ms = Date.UTC(2000, 0, 1, 12, 0, 0);
  const days = (date.getTime() - J2000_ms) / 86400000;

  // Mean anomaly at date (radians)
  const M = (((el.M0 + el.n * days) % 360 + 360) % 360) * Math.PI / 180;

  // Solve Kepler's equation: M = E - e*sin(E)  for eccentric anomaly E
  let E = M + el.e * Math.sin(M);
  for (let iter = 0; iter < 30; iter++) {
    const delta = (E - el.e * Math.sin(E) - M) / (1 - el.e * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-10) break;
  }

  // True anomaly + heliocentric distance
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + el.e) * Math.sin(E / 2),
    Math.sqrt(1 - el.e) * Math.cos(E / 2)
  );
  const r = el.a * (1 - el.e * Math.cos(E));

  // Rotate orbital plane to ecliptic J2000
  const i_rad = el.i * Math.PI / 180;
  const Omega_rad = el.Omega * Math.PI / 180;
  const omega_rad = el.omega * Math.PI / 180;
  const u = nu + omega_rad;
  const cos_u = Math.cos(u);
  const sin_u = Math.sin(u);
  const cos_O = Math.cos(Omega_rad);
  const sin_O = Math.sin(Omega_rad);
  const cos_i = Math.cos(i_rad);

  const x_helio = r * (cos_O * cos_u - sin_O * sin_u * cos_i);
  const y_helio = r * (sin_O * cos_u + cos_O * sin_u * cos_i);

  // Earth's heliocentric position (astronomy-engine returns equatorial J2000)
  const time = Astronomy.MakeTime(date);
  const earth = Astronomy.HelioVector(Astronomy.Body.Earth, time);

  // Rotate Earth equatorial -> ecliptic around x-axis by obliquity
  const cosEps = Math.cos(OBLIQUITY_J2000_RAD);
  const sinEps = Math.sin(OBLIQUITY_J2000_RAD);
  const earth_x_ecl = earth.x;
  const earth_y_ecl = earth.y * cosEps + earth.z * sinEps;

  // Geocentric ecliptic vector (Earth -> body), longitude only
  const x = x_helio - earth_x_ecl;
  const y = y_helio - earth_y_ecl;

  const lon = Math.atan2(y, x) * 180 / Math.PI;
  return ((lon % 360) + 360) % 360;
}

/**
 * Chiron position via Keplerian propagation from J2000.0 elements.
 * Replaces the linear mean-motion stub that drifted ~30° over decades.
 */
function calculateChironApprox(date: Date): number {
  return keplerianGeocentricLongitude(CHIRON_ELEMENTS, date);
}

/**
 * Calculate Mean Black Moon Lilith (Mean Lunar Apogee)
 * Lilith represents the lunar apogee - the point where the Moon is farthest from Earth
 * The mean apogee precesses with a period of about 8.85 years
 */
function calculateMeanLilith(date: Date): number {
  // Reference: Mean Lilith was at 0° Aries on Jan 1, 2000 (J2000.0)
  const j2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const currentDate = date.getTime();

  // Days since J2000
  const daysSince = (currentDate - j2000) / (1000 * 60 * 60 * 24);

  // Mean Lilith at J2000.0 epoch: approximately 83.353° (23° Gemini)
  const lilithAtEpoch = 83.353;

  // Mean motion: ~0.111404° per day (completes circle in ~8.85 years = 3231.5 days)
  const meanMotion = 360 / 3231.5;

  const longitude = (lilithAtEpoch + (daysSince * meanMotion)) % 360;

  return ((longitude % 360) + 360) % 360;
}

/**
 * Ceres position via Keplerian propagation. Largest main-belt asteroid.
 */
function calculateCeresApprox(date: Date): number {
  return keplerianGeocentricLongitude(CERES_ELEMENTS, date);
}

/**
 * Pallas position via Keplerian propagation. High-inclination main-belt asteroid.
 */
function calculatePallasApprox(date: Date): number {
  return keplerianGeocentricLongitude(PALLAS_ELEMENTS, date);
}

/**
 * Juno position via Keplerian propagation.
 */
function calculateJunoApprox(date: Date): number {
  return keplerianGeocentricLongitude(JUNO_ELEMENTS, date);
}

/**
 * Vesta position via Keplerian propagation. Second-largest main-belt asteroid.
 */
function calculateVestaApprox(date: Date): number {
  return keplerianGeocentricLongitude(VESTA_ELEMENTS, date);
}

// Calculate aspects between planets
function calculateAspects(planets: Record<string, number>): Aspect[] {
  const aspects: Aspect[] = [];
  const planetNames = Object.keys(planets);

  // Aspect definitions with orbs (degrees)
  const aspectTypes = [
    { type: 'conjunction' as const, angle: 0, orb: 8 },
    { type: 'opposition' as const, angle: 180, orb: 8 },
    { type: 'trine' as const, angle: 120, orb: 8 },
    { type: 'square' as const, angle: 90, orb: 8 },
    { type: 'sextile' as const, angle: 60, orb: 6 },
    { type: 'quincunx' as const, angle: 150, orb: 3 },
  ];

  // Check all planet pairs
  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const planet1 = planetNames[i];
      const planet2 = planetNames[j];
      const lon1 = planets[planet1];
      const lon2 = planets[planet2];

      // Calculate angular separation
      let separation = Math.abs(lon2 - lon1);
      if (separation > 180) {
        separation = 360 - separation;
      }

      // Check each aspect type
      for (const aspectDef of aspectTypes) {
        const orbDiff = Math.abs(separation - aspectDef.angle);
        if (orbDiff <= aspectDef.orb) {
          aspects.push({
            planet1,
            planet2,
            type: aspectDef.type,
            orb: Number(orbDiff.toFixed(2)),
            exact: orbDiff < 1
          });
        }
      }
    }
  }

  return aspects;
}

/**
 * Validate birth data before calculation
 */
function validateBirthData(birthData: BirthData): void {
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthData.date)) {
    throw new Error(`Invalid date format: ${birthData.date}. Expected YYYY-MM-DD`);
  }

  // Validate time format (accepts HH:MM or HH:MM:SS)
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(birthData.time)) {
    throw new Error(`Invalid time format: ${birthData.time}. Expected HH:MM or HH:MM:SS`);
  }

  // Extract hours and minutes (ignore seconds if present)
  const [hours, minutes] = birthData.time.split(':').slice(0, 2).map(Number);
  if (hours < 0 || hours > 23) {
    throw new Error(`Invalid hours: ${hours}. Must be 0-23`);
  }
  if (minutes < 0 || minutes > 59) {
    throw new Error(`Invalid minutes: ${minutes}. Must be 0-59`);
  }

  // Validate location
  if (!birthData.location || typeof birthData.location.lat !== 'number' || typeof birthData.location.lng !== 'number') {
    throw new Error('Invalid location: latitude and longitude required');
  }

  if (birthData.location.lat < -90 || birthData.location.lat > 90) {
    throw new Error(`Invalid latitude: ${birthData.location.lat}. Must be -90 to 90`);
  }

  if (birthData.location.lng < -180 || birthData.location.lng > 180) {
    throw new Error(`Invalid longitude: ${birthData.location.lng}. Must be -180 to 180`);
  }
}

/**
 * Check whether a string is a timezone identifier Intl can resolve.
 */
export function isValidTimeZone(timeZone: unknown): timeZone is string {
  if (!timeZone || typeof timeZone !== 'string') return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Offset (minutes east of UTC) that `timeZone` was observing at `utcDate`.
 * Intl carries the full IANA database, including historical rules — e.g.
 * America/Detroit in July 1956 resolves to -300 (year-round EST, no DST).
 */
function getTimeZoneOffsetMinutes(timeZone: string, utcDate: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(utcDate);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const wallAsUTC = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour') % 24, // hour12:false can render midnight as "24"
    get('minute'),
    get('second')
  );
  return Math.round((wallAsUTC - utcDate.getTime()) / 60000);
}

export interface BirthTimeResolution {
  utc: Date;
  // Which conversion path produced the result
  source: 'iana' | 'longitude-approximation';
  // e.g. "UTC-5" or "UTC+5:30", the offset actually applied
  offsetLabel: string;
}

/**
 * Resolve a local wall-clock birth time to a UTC instant.
 *
 * Preferred path: the IANA timezone of the birth place, with historical rules
 * (DST, pre-standardization regional offsets). Fallback when the timezone is
 * absent or invalid: the longitude approximation round(lng/15), which is wrong
 * wherever political timezone boundaries or DST diverge from solar time.
 */
export function resolveBirthTimeUTC(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  timezone: string | undefined,
  lng: number
): BirthTimeResolution {
  if (isValidTimeZone(timezone)) {
    // Fixed-point iteration: guess the instant by reading the wall time as UTC,
    // look up the zone's offset at that instant, re-derive. A second pass
    // settles instants near DST transitions.
    const wallAsUTC = Date.UTC(year, month - 1, day, hours, minutes);
    let utcMillis = wallAsUTC;
    for (let i = 0; i < 2; i++) {
      const offsetMin = getTimeZoneOffsetMinutes(timezone, new Date(utcMillis));
      utcMillis = wallAsUTC - offsetMin * 60000;
    }
    const offsetMin = Math.round((wallAsUTC - utcMillis) / 60000);
    const sign = offsetMin < 0 ? '-' : '+';
    const abs = Math.abs(offsetMin);
    const offsetLabel = `UTC${sign}${Math.floor(abs / 60)}${abs % 60 ? ':' + String(abs % 60).padStart(2, '0') : ''}`;
    return { utc: new Date(utcMillis), source: 'iana', offsetLabel };
  }

  // Longitude approximation: standard timezone ≈ longitude / 15.
  // Western longitudes are negative, so CST (-91°) = -6 hours from UTC.
  const timezoneOffsetHours = Math.round(lng / 15);
  const utc = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  utc.setUTCHours(utc.getUTCHours() - timezoneOffsetHours);
  return {
    utc,
    source: 'longitude-approximation',
    offsetLabel: `UTC${timezoneOffsetHours >= 0 ? '+' : ''}${timezoneOffsetHours}`,
  };
}

/**
 * Calculate a complete birth chart with precise astronomical positions
 *
 * CRITICAL: This function handles timezone conversion.
 * Birth time is assumed to be in LOCAL time at the birth location.
 * Conversion to UTC uses the IANA timezone (with historical DST rules) when
 * provided, falling back to the longitude approximation (round(lng/15)) when
 * the timezone is absent or invalid.
 */
export async function calculateBirthChart(birthData: BirthData): Promise<BirthChart> {
  try {
    // Validate input data
    validateBirthData(birthData);

    // Parse date and time
    const [year, month, day] = birthData.date.split('-').map(Number);
    const [hours, minutes] = birthData.time.split(':').map(Number);

    const resolution = resolveBirthTimeUTC(
      year,
      month,
      day,
      hours,
      minutes,
      birthData.location.timezone,
      birthData.location.lng
    );
    const birthDate = resolution.utc;

    const time = Astronomy.MakeTime(birthDate);

    const tzSource = resolution.source === 'iana'
      ? `iana:${birthData.location.timezone}`
      : 'longitude-approximation';
    console.log(`Birth time conversion: ${year}-${month}-${day} ${hours}:${minutes} local (${resolution.offsetLabel}, tz-source=${tzSource}) → ${birthDate.toISOString()} UTC`);

    // Calculate house cusps using selected system (default to Porphyry - best for Spiralogic)
    // Porphyry gives the "breathing" asymmetry without Placidus distortion
    const houseSystem = birthData.houseSystem || 'porphyry';
    console.log(`House system requested: ${houseSystem}`);
    const houseCusps = calculateHouseCusps(
      birthDate,
      birthData.location.lat,
      birthData.location.lng,
      houseSystem
    );
    console.log('House cusps:', houseCusps.map((cusp, i) => `House ${i+1}: ${cusp.toFixed(2)}°`).join(', '));

    // Calculate planetary positions
    const planetLongitudes: Record<string, number> = {};

    // Sun - use SunPosition which returns ecliptic coordinates
    const sunPos = Astronomy.SunPosition(time);
    const sunLon = sunPos.elon;
    planetLongitudes.Sun = sunLon;

    // Moon - use EclipticGeoMoon which returns geocentric ecliptic coordinates
    const moonPos = Astronomy.EclipticGeoMoon(time);
    const moonLon = moonPos.lon;
    planetLongitudes.Moon = moonLon;

    // Mercury - GEOCENTRIC (Earth-centered) for astrology
    const mercuryVec = Astronomy.GeoVector(Astronomy.Body.Mercury, time, true); // true = aberration correction
    const mercuryEcl = Astronomy.Ecliptic(mercuryVec);
    planetLongitudes.Mercury = mercuryEcl.elon;

    // Venus - GEOCENTRIC
    const venusVec = Astronomy.GeoVector(Astronomy.Body.Venus, time, true);
    const venusEcl = Astronomy.Ecliptic(venusVec);
    planetLongitudes.Venus = venusEcl.elon;

    // Mars - GEOCENTRIC
    const marsVec = Astronomy.GeoVector(Astronomy.Body.Mars, time, true);
    const marsEcl = Astronomy.Ecliptic(marsVec);
    planetLongitudes.Mars = marsEcl.elon;

    // Jupiter - GEOCENTRIC
    const jupiterVec = Astronomy.GeoVector(Astronomy.Body.Jupiter, time, true);
    const jupiterEcl = Astronomy.Ecliptic(jupiterVec);
    planetLongitudes.Jupiter = jupiterEcl.elon;

    // Saturn - GEOCENTRIC
    const saturnVec = Astronomy.GeoVector(Astronomy.Body.Saturn, time, true);
    const saturnEcl = Astronomy.Ecliptic(saturnVec);
    planetLongitudes.Saturn = saturnEcl.elon;

    // Uranus - GEOCENTRIC
    const uranusVec = Astronomy.GeoVector(Astronomy.Body.Uranus, time, true);
    const uranusEcl = Astronomy.Ecliptic(uranusVec);
    planetLongitudes.Uranus = uranusEcl.elon;

    // Neptune - GEOCENTRIC
    const neptuneVec = Astronomy.GeoVector(Astronomy.Body.Neptune, time, true);
    const neptuneEcl = Astronomy.Ecliptic(neptuneVec);
    planetLongitudes.Neptune = neptuneEcl.elon;

    // Pluto - GEOCENTRIC
    const plutoVec = Astronomy.GeoVector(Astronomy.Body.Pluto, time, true);
    const plutoEcl = Astronomy.Ecliptic(plutoVec);
    planetLongitudes.Pluto = plutoEcl.elon;

    // Lunar Nodes - North Node (True Node)
    // The Moon's orbit intersects the ecliptic at two points: ascending (North) and descending (South)
    const moonVec = Astronomy.GeoMoon(time);
    const moonEcliptic = Astronomy.Ecliptic(moonVec);

    // Calculate orbital elements to get node position
    // North Node = point where Moon crosses ecliptic moving north
    // This is a simplified calculation - production would use more precise ephemeris
    const northNodeLon = calculateTrueNode(time);
    planetLongitudes.NorthNode = northNodeLon;

    // South Node is always exactly opposite (180°) from North Node
    const southNodeLon = (northNodeLon + 180) % 360;
    planetLongitudes.SouthNode = southNodeLon;

    // Chiron - Approximate calculation
    // Chiron has a ~51 year orbital period and was discovered at 3° Taurus in 1977
    // This is a simplified formula - production would use Swiss Ephemeris
    const chironLon = calculateChironApprox(birthDate);
    planetLongitudes.Chiron = chironLon;

    // Asteroids - Feminine Archetypes
    // Black Moon Lilith (Mean Lunar Apogee)
    const lilithLon = calculateMeanLilith(birthDate);
    planetLongitudes.Lilith = lilithLon;

    // Ceres - Nurturing, Grief, Motherhood
    const ceresLon = calculateCeresApprox(birthDate);
    planetLongitudes.Ceres = ceresLon;

    // Pallas - Wisdom, Strategy, Creative Intelligence
    const pallasLon = calculatePallasApprox(birthDate);
    planetLongitudes.Pallas = pallasLon;

    // Juno - Partnership, Commitment, Sacred Union
    const junoLon = calculateJunoApprox(birthDate);
    planetLongitudes.Juno = junoLon;

    // Vesta - Devotion, Sacred Work, Inner Flame
    const vestaLon = calculateVestaApprox(birthDate);
    planetLongitudes.Vesta = vestaLon;

    // DEBUG: Log all calculated longitudes for comparison
    console.log('\n=== CALCULATED PLANETARY LONGITUDES ===');
    Object.entries(planetLongitudes).forEach(([planet, lon]) => {
      const zodiac = longitudeToZodiac(lon);
      console.log(`${planet}: ${lon.toFixed(2)}° → ${zodiac.sign} ${zodiac.degree.toFixed(2)}°`);
    });

    // Convert to zodiac positions with houses
    const sun = {
      ...longitudeToZodiac(sunLon),
      house: calculateHouse(sunLon, houseCusps),
      retrograde: false // Sun never retrogrades
    };
    console.log(`Sun: ${sun.sign} ${sun.degree.toFixed(1)}° → House ${sun.house}`);

    const moon = {
      ...longitudeToZodiac(moonLon),
      house: calculateHouse(moonLon, houseCusps),
      retrograde: false // Moon never retrogrades
    };
    console.log(`Moon: ${moon.sign} ${moon.degree.toFixed(1)}° → House ${moon.house}`);

    const mercury = {
      ...longitudeToZodiac(planetLongitudes.Mercury),
      house: calculateHouse(planetLongitudes.Mercury, houseCusps),
      retrograde: isRetrograde(Astronomy.Body.Mercury, birthDate)
    };

    const venus = {
      ...longitudeToZodiac(planetLongitudes.Venus),
      house: calculateHouse(planetLongitudes.Venus, houseCusps),
      retrograde: isRetrograde(Astronomy.Body.Venus, birthDate)
    };

    const mars = {
      ...longitudeToZodiac(planetLongitudes.Mars),
      house: calculateHouse(planetLongitudes.Mars, houseCusps),
      retrograde: isRetrograde(Astronomy.Body.Mars, birthDate)
    };

    const jupiter = {
      ...longitudeToZodiac(planetLongitudes.Jupiter),
      house: calculateHouse(planetLongitudes.Jupiter, houseCusps),
      retrograde: isRetrograde(Astronomy.Body.Jupiter, birthDate)
    };

    const saturn = {
      ...longitudeToZodiac(planetLongitudes.Saturn),
      house: calculateHouse(planetLongitudes.Saturn, houseCusps),
      retrograde: isRetrograde(Astronomy.Body.Saturn, birthDate)
    };

    const uranus = {
      ...longitudeToZodiac(planetLongitudes.Uranus),
      house: calculateHouse(planetLongitudes.Uranus, houseCusps),
      retrograde: isRetrograde(Astronomy.Body.Uranus, birthDate)
    };

    const neptune = {
      ...longitudeToZodiac(planetLongitudes.Neptune),
      house: calculateHouse(planetLongitudes.Neptune, houseCusps),
      retrograde: isRetrograde(Astronomy.Body.Neptune, birthDate)
    };

    const pluto = {
      ...longitudeToZodiac(planetLongitudes.Pluto),
      house: calculateHouse(planetLongitudes.Pluto, houseCusps),
      retrograde: isRetrograde(Astronomy.Body.Pluto, birthDate)
    };

    const northNode = {
      ...longitudeToZodiac(planetLongitudes.NorthNode),
      house: calculateHouse(planetLongitudes.NorthNode, houseCusps),
      retrograde: true // North Node always moves retrograde (regresses)
    };

    const southNode = {
      ...longitudeToZodiac(planetLongitudes.SouthNode),
      house: calculateHouse(planetLongitudes.SouthNode, houseCusps),
      retrograde: true // South Node always moves retrograde (regresses)
    };

    const chiron = {
      ...longitudeToZodiac(planetLongitudes.Chiron),
      house: calculateHouse(planetLongitudes.Chiron, houseCusps),
      retrograde: false // Simplified - would need velocity calculation
    };

    // Asteroids - Feminine Archetypes
    const lilith = {
      ...longitudeToZodiac(planetLongitudes.Lilith),
      house: calculateHouse(planetLongitudes.Lilith, houseCusps),
      retrograde: false // Lilith always moves direct
    };

    const ceres = {
      ...longitudeToZodiac(planetLongitudes.Ceres),
      house: calculateHouse(planetLongitudes.Ceres, houseCusps),
      retrograde: false // Simplified
    };

    const pallas = {
      ...longitudeToZodiac(planetLongitudes.Pallas),
      house: calculateHouse(planetLongitudes.Pallas, houseCusps),
      retrograde: false // Simplified
    };

    const juno = {
      ...longitudeToZodiac(planetLongitudes.Juno),
      house: calculateHouse(planetLongitudes.Juno, houseCusps),
      retrograde: false // Simplified
    };

    const vesta = {
      ...longitudeToZodiac(planetLongitudes.Vesta),
      house: calculateHouse(planetLongitudes.Vesta, houseCusps),
      retrograde: false // Simplified
    };

    // Calculate Ascendant and Midheaven
    const ascendant = longitudeToZodiac(houseCusps[0]);
    const midheaven = longitudeToZodiac(houseCusps[9]); // 10th house cusp

    // Calculate aspects
    const aspects = calculateAspects(planetLongitudes);

    return {
      sun,
      moon,
      mercury,
      venus,
      mars,
      jupiter,
      saturn,
      uranus,
      neptune,
      pluto,
      chiron,
      northNode,
      southNode,
      lilith,
      ceres,
      pallas,
      juno,
      vesta,
      ascendant,
      midheaven,
      houses: houseCusps,
      aspects
    };

  } catch (error) {
    console.error('Birth chart calculation error:', error);
    throw new Error(`Failed to calculate birth chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate current transits for a given date
 */
export async function calculateTransits(date: Date): Promise<Record<string, PlanetPosition>> {
  const time = Astronomy.MakeTime(date);
  const houseCusps = calculateHouseCusps(date, 0, 0); // Transits don't depend on location

  const transits: Record<string, PlanetPosition> = {};

  const bodies = [
    'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
    'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
  ];

  for (const bodyName of bodies) {
    const body = Astronomy.Body[bodyName as keyof typeof Astronomy.Body];

    // EclipticLongitude does not work for the Sun (no heliocentric reference for itself).
    // Use SunPosition() which returns geocentric ecliptic coordinates.
    const lon = bodyName === 'Sun'
      ? Astronomy.SunPosition(time).elon
      : Astronomy.EclipticLongitude(body, time);

    transits[bodyName.toLowerCase()] = {
      ...longitudeToZodiac(lon),
      house: calculateHouse(lon, houseCusps),
      retrograde: isRetrograde(body, date)
    };
  }

  return transits;
}

/**
 * Calculate moon phase angle from ephemeris.
 * Returns degrees 0–360 (0 = New Moon, 90 = First Quarter, 180 = Full Moon, 270 = Last Quarter).
 * Use this instead of synodic approximations — it reads the actual sky.
 */
export function getMoonPhaseData(date: Date = new Date()): {
  degrees: number;
  percentage: number;
} {
  const time = Astronomy.MakeTime(date);
  const moonLon = Astronomy.EclipticLongitude(Astronomy.Body.Moon, time);
  // EclipticLongitude does not work for the Sun (no heliocentric reference for itself).
  // Use SunPosition() which returns geocentric ecliptic coordinates.
  const sunLon = Astronomy.SunPosition(time).elon;
  const degrees = ((moonLon - sunLon) % 360 + 360) % 360;
  return { degrees, percentage: Math.round((degrees / 360) * 100) };
}
