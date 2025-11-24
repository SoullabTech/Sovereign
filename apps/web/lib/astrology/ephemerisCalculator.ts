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
    timezone: string;
  };
  houseSystem?: HouseSystem; // Default: 'whole-sign'
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

/**
 * Approximate Chiron position
 * Chiron has an irregular orbit with ~51 year period
 * This is a simplified calculation - production code would use Swiss Ephemeris
 */
function calculateChironApprox(date: Date): number {
  // Chiron was at 3° Taurus (33°) on Nov 1, 1977
  const referenceDate = new Date('1977-11-01').getTime();
  const currentDate = date.getTime();

  // Days since reference
  const daysSince = (currentDate - referenceDate) / (1000 * 60 * 60 * 24);

  // Chiron's mean motion is approximately 0.0137° per day (360° / 51 years)
  const meanMotion = 360 / (51 * 365.25);

  // Calculate approximate longitude
  const longitude = (33 + (daysSince * meanMotion)) % 360;

  return ((longitude % 360) + 360) % 360;
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

  // Validate time format
  if (!/^\d{2}:\d{2}$/.test(birthData.time)) {
    throw new Error(`Invalid time format: ${birthData.time}. Expected HH:MM`);
  }

  const [hours, minutes] = birthData.time.split(':').map(Number);
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
 * Calculate a complete birth chart with precise astronomical positions
 *
 * CRITICAL: This function handles timezone conversion.
 * Birth time is assumed to be in LOCAL time at the birth location.
 * We calculate timezone offset from longitude and convert to UTC.
 *
 * Timezone offset = longitude / 15 (hours)
 * Example: Baton Rouge at -91° → -91/15 = -6h (CST)
 */
export async function calculateBirthChart(birthData: BirthData): Promise<BirthChart> {
  try {
    // Validate input data
    validateBirthData(birthData);

    // Parse date and time
    const [year, month, day] = birthData.date.split('-').map(Number);
    const [hours, minutes] = birthData.time.split(':').map(Number);

    // Calculate timezone offset in hours from longitude
    // Standard timezone ≈ longitude / 15
    // Western longitudes are negative, so CST (-91°) = -6 hours from UTC
    const timezoneOffsetHours = Math.round(birthData.location.lng / 15);

    // Create Date object: birth time is LOCAL, convert to UTC by subtracting the offset
    // Example: 10:29 PM CST (UTC-6) → 10:29 PM - (-6) = 10:29 PM + 6h = 4:29 AM UTC next day
    const birthDate = new Date(Date.UTC(
      year,
      month - 1,
      day,
      hours,
      minutes
    ));

    // Add timezone offset (negative for western longitudes, so this adds hours)
    birthDate.setUTCHours(birthDate.getUTCHours() - timezoneOffsetHours);

    const time = Astronomy.MakeTime(birthDate);

    console.log(`Birth time conversion: ${year}-${month}-${day} ${hours}:${minutes} local (UTC${timezoneOffsetHours}) → ${birthDate.toISOString()} UTC`);

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
    const lon = Astronomy.EclipticLongitude(body, time);

    transits[bodyName.toLowerCase()] = {
      ...longitudeToZodiac(lon),
      house: calculateHouse(lon, houseCusps),
      retrograde: isRetrograde(body, date)
    };
  }

  return transits;
}
