/**
 * ASTRO-PRO-POINTS-01 — sensitive points that need the place and instant.
 *
 * Vertex: where the ecliptic meets the prime vertical in the west (azimuth
 *   270°). Found numerically from the actual sky rather than a closed formula,
 *   so it can be checked the same way: its azimuth must be due west.
 * Ayanamsa (Lahiri, linear approximation from J2000) for the sidereal view.
 *
 * Geometry only; no interpretation.
 */
import * as Astronomy from 'astronomy-engine';
import { calculateAyanamsa } from './ayanamsaCalculator';

export interface ChartPoints {
  vertex: number | null;
  antivertex: number | null;
  ayanamsa: { lahiri: number; method: string };
}

function signedDelta(value: number, target: number): number {
  return ((value - target) % 360 + 540) % 360 - 180;
}

/** Azimuth (degrees, from north through east) of an ecliptic-of-date longitude. */
export function eclipticAzimuth(longitude: number, time: Astronomy.AstroTime, observer: Astronomy.Observer): number {
  const ecliptic = Astronomy.VectorFromSphere(new Astronomy.Spherical(0, longitude, 1), time);
  const equatorial = Astronomy.EquatorFromVector(Astronomy.RotateVector(Astronomy.Rotation_ECT_EQD(time), ecliptic));
  return Astronomy.Horizon(time, observer, equatorial.ra, equatorial.dec).azimuth;
}

export function calculateVertex(utc: string, lat: number, lng: number): number | null {
  const date = new Date(utc);
  if (!Number.isFinite(date.getTime()) || Math.abs(lat) < 0.01) return null; // undefined at the equator
  const time = Astronomy.MakeTime(date);
  const observer = new Astronomy.Observer(lat, lng, 0);
  const f = (lon: number) => signedDelta(eclipticAzimuth(lon, time, observer), 270);
  let prevLon = 0;
  let prev = f(prevLon);
  for (let lon = 2; lon <= 360; lon += 2) {
    const value = f(lon % 360);
    if (Math.sign(prev) !== Math.sign(value) && Math.abs(value - prev) < 90) {
      let lo = prevLon;
      let hi = lon;
      let flo = prev;
      for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        const fm = f(mid % 360);
        if (Math.sign(fm) === Math.sign(flo)) { lo = mid; flo = fm; } else hi = mid;
      }
      return Number((((lo + hi) / 2) % 360).toFixed(4));
    }
    prevLon = lon;
    prev = value;
  }
  return null;
}

export function calculateChartPoints(utc: string, lat: number, lng: number): ChartPoints {
  const vertex = calculateVertex(utc, lat, lng);
  return {
    vertex,
    antivertex: vertex === null ? null : Number(((vertex + 180) % 360).toFixed(4)),
    ayanamsa: {
      lahiri: Number(calculateAyanamsa(new Date(utc), 'lahiri').toFixed(4)),
      method: 'Lahiri, linear approximation from J2000 (about one arc-minute)',
    },
  };
}
