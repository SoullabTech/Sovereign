/**
 * Placidus and Koch house cusps from the sidereal-time angles.
 *
 * Pure functions: the caller supplies the right ascension of the MC, the
 * latitude, the obliquity and an Ascendant function. They throw
 * `HOUSE_GEOMETRY_UNAVAILABLE` where a quadrant system does not exist (a point
 * that never rises or sets, in practice latitudes beyond about ±66°).
 *
 * The same mathematics as proEphemerisCalculator.ts, which was checked against
 * Swiss Ephemeris and, in this repo, against an independent implementation at
 * three places (Owen's birth, London, Sydney) to within 0.003°.
 */
const DEG = Math.PI / 180;
const norm360 = (x: number) => ((x % 360) + 360) % 360;

export const HOUSE_GEOMETRY_UNAVAILABLE = 'HOUSE_GEOMETRY_UNAVAILABLE';

function eclipticLongitudeFromRA(ra: number, obliquity: number): number {
  return norm360(Math.atan2(Math.sin(ra * DEG), Math.cos(ra * DEG) * Math.cos(obliquity * DEG)) / DEG);
}
function declinationOfLongitude(longitude: number, obliquity: number): number {
  return Math.asin(Math.sin(obliquity * DEG) * Math.sin(longitude * DEG)) / DEG;
}
function diurnalSemiArc(declination: number, lat: number): number {
  const c = -Math.tan(lat * DEG) * Math.tan(declination * DEG);
  if (c < -1 || c > 1) throw new Error(HOUSE_GEOMETRY_UNAVAILABLE);
  return Math.acos(c) / DEG;
}
function fillOpposites(cusps: number[]): number[] {
  cusps[3] = norm360(cusps[9] + 180);
  cusps[6] = norm360(cusps[0] + 180);
  cusps[4] = norm360(cusps[10] + 180);
  cusps[5] = norm360(cusps[11] + 180);
  cusps[7] = norm360(cusps[1] + 180);
  cusps[8] = norm360(cusps[2] + 180);
  return cusps;
}

export function midheavenFromRamc(ramc: number, obliquity: number): number {
  return eclipticLongitudeFromRA(ramc, obliquity);
}

/** Placidus: each intermediate cusp has travelled 1/3 or 2/3 of its own semi-arc. */
export function placidusCusps(ramc: number, lat: number, obliquity: number, ascendant: number): number[] {
  const solve = (fraction: number, belowHorizon: boolean): number => {
    let ra = belowHorizon ? ramc + 180 - 90 * fraction : ramc + 90 * fraction;
    for (let i = 0; i < 60; i++) {
      const semiArc = diurnalSemiArc(declinationOfLongitude(eclipticLongitudeFromRA(ra, obliquity), obliquity), lat);
      const next = belowHorizon ? ramc + 180 - fraction * (180 - semiArc) : ramc + fraction * semiArc;
      if (Math.abs(next - ra) < 1e-9) { ra = next; break; }
      ra = next;
    }
    return eclipticLongitudeFromRA(ra, obliquity);
  };
  const cusps = new Array<number>(12);
  cusps[0] = ascendant;
  cusps[9] = midheavenFromRamc(ramc, obliquity);
  cusps[10] = solve(1 / 3, false);
  cusps[11] = solve(2 / 3, false);
  cusps[1] = solve(2 / 3, true);
  cusps[2] = solve(1 / 3, true);
  return fillOpposites(cusps);
}

/** Koch (birthplace): trisect the MC's diurnal semi-arc in time. */
export function kochCusps(
  ramc: number, lat: number, obliquity: number, ascendant: number,
  ascendantAt: (ramcDegrees: number) => number,
): number[] {
  const mc = midheavenFromRamc(ramc, obliquity);
  const semiArc = diurnalSemiArc(declinationOfLongitude(mc, obliquity), lat);
  const cusps = new Array<number>(12);
  cusps[0] = ascendant;
  cusps[9] = mc;
  cusps[10] = ascendantAt(ramc - (2 * semiArc) / 3);
  cusps[11] = ascendantAt(ramc - semiArc / 3);
  cusps[1] = ascendantAt(ramc + semiArc / 3);
  cusps[2] = ascendantAt(ramc + (2 * semiArc) / 3);
  return fillOpposites(cusps);
}
