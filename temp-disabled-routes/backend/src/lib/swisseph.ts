/**
 * Swiss Ephemeris Mock/Wrapper
 * Provides planetary calculation constants and functions
 */

// Planetary body constants
export const SE_SUN = 0;
export const SE_MOON = 1;
export const SE_MERCURY = 2;
export const SE_VENUS = 3;
export const SE_MARS = 4;
export const SE_JUPITER = 5;
export const SE_SATURN = 6;
export const SE_URANUS = 7;
export const SE_NEPTUNE = 8;
export const SE_PLUTO = 9;
export const SE_MEAN_NODE = 10;
export const SE_TRUE_NODE = 11;
export const SE_MEAN_APOG = 12;
export const SE_OSCU_APOG = 13;
export const SE_EARTH = 14;
export const SE_CHIRON = 15;

// Calculation flags
export const SEFLG_JPLEPH = 1;
export const SEFLG_SWIEPH = 2;
export const SEFLG_MOSEPH = 4;
export const SEFLG_HELCTR = 8;
export const SEFLG_TRUEPOS = 16;
export const SEFLG_J2000 = 32;
export const SEFLG_NONUT = 64;
export const SEFLG_SPEED3 = 128;
export const SEFLG_SPEED = 256;
export const SEFLG_NOGDEFL = 512;
export const SEFLG_NOABERR = 1024;
export const SEFLG_EQUATORIAL = 2048;
export const SEFLG_XYZ = 4096;
export const SEFLG_RADIANS = 8192;
export const SEFLG_BARYCTR = 16384;
export const SEFLG_TOPOCTR = 32768;
export const SEFLG_SIDEREAL = 65536;

// Return codes
export const OK = 0;
export const ERR = -1;

// House systems
export const HOUSES_PLACIDUS = 'P';
export const HOUSES_KOCH = 'K';
export const HOUSES_EQUAL = 'E';
export const HOUSES_WHOLE_SIGN = 'W';
export const HOUSES_CAMPANUS = 'C';
export const HOUSES_REGIOMONTANUS = 'R';

export interface SwissEphResult {
  longitude: number;
  latitude: number;
  distance: number;
  longitudeSpeed?: number;
  latitudeSpeed?: number;
  distanceSpeed?: number;
  flag?: number;
}

export interface HousesResult {
  cusps: number[];
  ascendant: number;
  mc: number;
  armc: number;
  vertex: number;
  equatorialAscendant: number;
  coAscendantKoch: number;
  coAscendantMunkasey: number;
  polarAscendant: number;
}

// Mock implementation - replace with actual swisseph when available
const mockPlanetaryPositions: Record<number, SwissEphResult> = {
  [SE_SUN]: { longitude: 0, latitude: 0, distance: 1.0 },
  [SE_MOON]: { longitude: 30, latitude: 5, distance: 0.0026 },
  [SE_MERCURY]: { longitude: 15, latitude: 2, distance: 1.2 },
  [SE_VENUS]: { longitude: 45, latitude: 3, distance: 0.8 },
  [SE_MARS]: { longitude: 90, latitude: 1, distance: 1.5 },
  [SE_JUPITER]: { longitude: 120, latitude: 1, distance: 5.2 },
  [SE_SATURN]: { longitude: 150, latitude: 2, distance: 9.5 },
  [SE_URANUS]: { longitude: 180, latitude: 0, distance: 19.2 },
  [SE_NEPTUNE]: { longitude: 210, latitude: 1, distance: 30.0 },
  [SE_PLUTO]: { longitude: 240, latitude: 15, distance: 39.5 },
  [SE_TRUE_NODE]: { longitude: 270, latitude: 0, distance: 0.0026 },
  [SE_CHIRON]: { longitude: 300, latitude: 5, distance: 8.5 }
};

/**
 * Calculate planetary position
 * @param tjd_ut Julian day in UT
 * @param ipl Planet number
 * @param iflag Calculation flags
 * @returns [return_code, result_array]
 */
export function swe_calc_ut(
  tjd_ut: number,
  ipl: number,
  iflag: number
): [number, number[]] {
  // Mock implementation
  const result = mockPlanetaryPositions[ipl] || {
    longitude: Math.random() * 360,
    latitude: Math.random() * 10 - 5,
    distance: Math.random() * 40 + 0.5
  };
  
  return [
    OK,
    [
      result.longitude,
      result.latitude,
      result.distance,
      result.longitudeSpeed || 0,
      result.latitudeSpeed || 0,
      result.distanceSpeed || 0
    ]
  ];
}

/**
 * Calculate house cusps and angles
 * @param tjd_ut Julian day in UT
 * @param geolat Geographic latitude
 * @param geolon Geographic longitude
 * @param hsys House system
 * @returns [cusps, ascmc]
 */
export function swe_houses(
  tjd_ut: number,
  geolat: number,
  geolon: number,
  hsys: string
): [number[], number[]] {
  // Mock implementation - generate 12 house cusps
  const cusps = [0]; // Index 0 is not used
  const ascendant = (geolon + 90) % 360;
  
  for (let i = 1; i <= 12; i++) {
    cusps.push((ascendant + (i - 1) * 30) % 360);
  }
  
  const mc = (ascendant + 270) % 360;
  
  // Return cusps and angles (ASC, MC, ARMC, Vertex, etc.)
  return [
    cusps,
    [
      ascendant,       // Ascendant
      mc,              // Midheaven
      0,               // ARMC
      0,               // Vertex
      0,               // Equatorial Ascendant
      0,               // Co-Ascendant (Koch)
      0,               // Co-Ascendant (Munkasey)
      0                // Polar Ascendant
    ]
  ];
}

/**
 * Set ephemeris path
 * @param path Path to ephemeris files
 */
export function swe_set_ephe_path(path: string): void {
  // Mock implementation - would set path in real implementation
  console.log(`Ephemeris path set to: ${path}`);
}

/**
 * Convert calendar date to Julian day
 * @param year Year
 * @param month Month (1-12)
 * @param day Day
 * @param hour Hour (decimal)
 * @returns Julian day number
 */
export function swe_julday(
  year: number,
  month: number,
  day: number,
  hour: number
): number {
  // Simplified Julian day calculation
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + 
              Math.floor(y / 4) - Math.floor(y / 100) + 
              Math.floor(y / 400) - 32045;
  
  return jdn + (hour - 12) / 24;
}

/**
 * Get planet name
 * @param ipl Planet number
 * @returns Planet name
 */
export function swe_get_planet_name(ipl: number): string {
  const names: Record<number, string> = {
    [SE_SUN]: 'Sun',
    [SE_MOON]: 'Moon',
    [SE_MERCURY]: 'Mercury',
    [SE_VENUS]: 'Venus',
    [SE_MARS]: 'Mars',
    [SE_JUPITER]: 'Jupiter',
    [SE_SATURN]: 'Saturn',
    [SE_URANUS]: 'Uranus',
    [SE_NEPTUNE]: 'Neptune',
    [SE_PLUTO]: 'Pluto',
    [SE_TRUE_NODE]: 'True Node',
    [SE_MEAN_NODE]: 'Mean Node',
    [SE_CHIRON]: 'Chiron'
  };
  
  return names[ipl] || `Planet ${ipl}`;
}

// Export as default object for compatibility
const swisseph = {
  SE_SUN,
  SE_MOON,
  SE_MERCURY,
  SE_VENUS,
  SE_MARS,
  SE_JUPITER,
  SE_SATURN,
  SE_URANUS,
  SE_NEPTUNE,
  SE_PLUTO,
  SE_MEAN_NODE,
  SE_TRUE_NODE,
  SE_CHIRON,
  SEFLG_SWIEPH,
  SEFLG_SPEED,
  OK,
  ERR,
  swe_calc_ut,
  swe_houses,
  swe_set_ephe_path,
  swe_julday,
  swe_get_planet_name
};

export default swisseph;