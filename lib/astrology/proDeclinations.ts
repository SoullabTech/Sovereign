/**
 * ASTRO-PRO-DECLINATIONS-01 — geocentric declinations at a verified UTC instant.
 *
 * Declination is the angle north (+) or south (−) of the celestial equator,
 * true equator and equinox of date. Only the Sun, Moon and planets are given:
 * the approximate minor bodies in the Pro calculator have no reliable latitude.
 * Parallel / contraparallel pairs are reported as geometry only.
 */
import * as Astronomy from 'astronomy-engine';

export const DECLINATION_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
] as const;

export type DeclinationBody = typeof DECLINATION_BODIES[number];

export interface Declination {
  body: DeclinationBody;
  declination: number; // degrees, + north / − south
  outOfBounds: boolean; // beyond the Sun's maximum declination on that date
}

export interface DeclinationPair {
  a: DeclinationBody;
  b: DeclinationBody;
  type: 'parallel' | 'contraparallel';
  orb: number;
}

export function calculateDeclinations(utc: string): Declination[] {
  const date = new Date(utc);
  if (!Number.isFinite(date.getTime())) throw new Error('invalid_instant');
  const time = Astronomy.MakeTime(date);
  const toDate = Astronomy.Rotation_EQJ_EQD(time);
  // Obliquity of date bounds "out of bounds" for the Moon and planets.
  const obliquity = Astronomy.e_tilt(time).tobl;
  return DECLINATION_BODIES.map((body) => {
    const vector = Astronomy.GeoVector(Astronomy.Body[body], time, true);
    const dec = Astronomy.EquatorFromVector(Astronomy.RotateVector(toDate, vector)).dec;
    return {
      body,
      declination: Number(dec.toFixed(2)),
      // The Sun defines the bound; nutation and aberration can put it a hair
      // past mean obliquity, so it is never flagged and others get 0.01°.
      outOfBounds: body !== 'Sun' && Math.abs(dec) > obliquity + 0.01,
    };
  });
}

export function declinationPairs(declinations: readonly Declination[], maxOrb = 1): DeclinationPair[] {
  const pairs: DeclinationPair[] = [];
  for (let i = 0; i < declinations.length; i++) {
    for (let j = i + 1; j < declinations.length; j++) {
      const a = declinations[i];
      const b = declinations[j];
      const same = Math.abs(a.declination - b.declination);
      const opposite = Math.abs(a.declination + b.declination);
      if (same <= maxOrb && Math.sign(a.declination) === Math.sign(b.declination)) {
        pairs.push({ a: a.body, b: b.body, type: 'parallel', orb: Number(same.toFixed(2)) });
      } else if (opposite <= maxOrb && Math.sign(a.declination) !== Math.sign(b.declination)) {
        pairs.push({ a: a.body, b: b.body, type: 'contraparallel', orb: Number(opposite.toFixed(2)) });
      }
    }
  }
  return pairs.sort((x, y) => x.orb - y.orb);
}
