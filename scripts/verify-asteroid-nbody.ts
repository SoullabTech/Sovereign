/**
 * Verify lib/astrology/asteroidNBody.ts against JPL Horizons references.
 *
 * Run: npx tsx scripts/verify-asteroid-nbody.ts
 *
 * Reference longitudes were fetched from the JPL Horizons API on 2026-07-16
 * (EPHEM_TYPE=OBSERVER, CENTER='500@399', QUANTITIES='31' → ObsEcLon,
 * geocentric ecliptic-of-date). Refresh them via:
 *   https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND='2060%3B'
 *     &OBJ_DATA=NO&MAKE_EPHEM=YES&EPHEM_TYPE=OBSERVER&CENTER='500@399'
 *     &TLIST='<JD>'&QUANTITIES='31'&ANG_FORMAT=DEG
 *
 * Tolerance 0.05°: the integrator is geometric (no light-time correction),
 * Horizons ObsEcLon is astrometric; the difference is ≤ ~0.01° for these
 * bodies, and 0.05° is far below any natal/transit interpretation threshold.
 * Context: the previous two-body Keplerian path was off by 2.17° for natal
 * Chiron at the 1970 date below.
 */

import { calculateAsteroidPositionsNBody, type AsteroidKey } from '../lib/astrology/asteroidNBody';

const KEYS: AsteroidKey[] = ['ceres', 'pallas', 'juno', 'vesta', 'chiron'];
const TOLERANCE_DEG = 0.05;

// [label, Date, {body: horizonsObsEcLon}]
const CASES: Array<[string, Date, Record<AsteroidKey, number>]> = [
  ['1950-06-15 12:00 UT', new Date(Date.UTC(1950, 5, 15, 12)), {
    ceres: 250.2626562, pallas: 211.6576142, juno: 172.3441197, vesta: 28.8491132, chiron: 258.2846891,
  }],
  ['1970-07-23 21:41 UT', new Date(Date.UTC(1970, 6, 23, 21, 41)), {
    ceres: 33.108854, pallas: 343.0115121, juno: 37.3750296, vesta: 165.7454608, chiron: 10.3242162,
  }],
  ['1990-03-01 12:00 UT', new Date(Date.UTC(1990, 2, 1, 12)), {
    ceres: 83.102866, pallas: 21.4535715, juno: 234.7354037, vesta: 346.3294067, chiron: 100.7105533,
  }],
  ['2026-01-01 00:00 UT', new Date(Date.UTC(2026, 0, 1)), {
    ceres: 7.0707539, pallas: 322.5897067, juno: 270.862225, vesta: 294.2868654, chiron: 22.6001147,
  }],
];

let failures = 0;
let worst = 0;

for (const [label, date, refs] of CASES) {
  const t0 = Date.now();
  const pos = calculateAsteroidPositionsNBody(date);
  const ms = Date.now() - t0;
  for (const key of KEYS) {
    let err = Math.abs(pos[key].longitude - refs[key]) % 360;
    if (err > 180) err = 360 - err;
    worst = Math.max(worst, err);
    const ok = err < TOLERANCE_DEG;
    if (!ok) failures++;
    console.log(
      `${ok ? '✓' : '✗'} ${label}  ${key.padEnd(6)}  nbody=${pos[key].longitude.toFixed(4).padStart(8)}  ` +
      `horizons=${refs[key].toFixed(4).padStart(8)}  err=${(err * 3600).toFixed(1).padStart(5)}″  ` +
      `retro=${pos[key].retrograde}` + (key === KEYS[0] ? `  (${ms}ms)` : '')
    );
  }
  // Memoization: repeat call must be instant
  const t1 = Date.now();
  calculateAsteroidPositionsNBody(date);
  if (Date.now() - t1 > 5) {
    console.log(`✗ ${label}  cache miss on repeated call`);
    failures++;
  }
}

console.log(`\nworst error ${worst.toFixed(5)}° (${(worst * 3600).toFixed(1)}″), tolerance ${TOLERANCE_DEG}° — ${failures === 0 ? 'PASS' : `${failures} FAILURES`}`);
process.exit(failures === 0 ? 0 : 1);
