/**
 * N-BODY ASTEROID PROPAGATION — Chiron, Ceres, Pallas, Juno, Vesta
 *
 * astronomy-engine covers Sun/Moon/planets at JPL-grade accuracy but not
 * Chiron or the main-belt asteroids. Two-body Keplerian propagation from
 * fixed-epoch elements accumulates real error from planetary perturbations:
 * measured 2.17° for natal Chiron at 1970-07-23 vs JPL Horizons (Saturn is
 * the dominant perturber of Chiron's orbit). This module integrates the full
 * perturbed problem instead.
 *
 * Method (validated in the 2026-07-16 asteroid-scan spike, see
 * docs/specs/ASTEROID_RESONANCE_SCAN_FEASIBILITY_2026-07-16.md):
 *   - Osculating elements from JPL SBDB (full precision, queried 2026-07-16,
 *     epoch JD 2461200.5 TDB ≈ 2026-06-09) → heliocentric state vectors
 *   - RK4 integration to the target instant, Sun + 8 planetary perturbers
 *     (positions from astronomy-engine), all five bodies advanced in lockstep
 *     so perturber positions are computed once per substep
 *   - Geocentric ecliptic-of-date longitude (precession-corrected, matching
 *     the of-date frame astronomy-engine's Ecliptic() uses for planets)
 *
 * Accuracy, verified against JPL Horizons (quantity 31, ObsEcLon) for all
 * five bodies at 1950-06-15, 1970-07-23, 1990-03-01, and 2026-01-01:
 * max error 0.008°, median ~0.004° (≈14 arcsec) — the residual is mostly
 * light-time, which is irrelevant at natal-chart precision.
 *
 * Cost: ~350ms for a 76-year span (all five bodies together), ~5ms/year of
 * span. Results are memoized per instant.
 */

import * as Astronomy from 'astronomy-engine';

const DEG = Math.PI / 180;
const OBLIQUITY_J2000_RAD = 23.4392911 * DEG;
// GM of the Sun in AU^3/day^2
const GM_SUN = 2.9591220828195577e-4;
// General precession in longitude, arcsec/Julian year (IAU value)
const PRECESSION_ARCSEC_PER_YEAR = 50.28796;
const J2000_JD = 2451545.0;
// RK4 step size in days. Step-halving at a 76-year span changes results by
// <0.02 arcsec for all five bodies (well converged; smallest perihelion in
// the set is Vesta's q≈2.15 AU, far from the fast-moving regime).
const STEP_DAYS = 2.0;

interface OsculatingElements {
  epoch: number; // JD (TDB)
  a: number;     // semi-major axis (AU)
  e: number;     // eccentricity
  i: number;     // inclination, ecliptic J2000 (deg)
  om: number;    // longitude of ascending node (deg)
  w: number;     // argument of perihelion (deg)
  ma: number;    // mean anomaly at epoch (deg)
}

export type AsteroidKey = 'chiron' | 'ceres' | 'pallas' | 'juno' | 'vesta';

export interface AsteroidPosition {
  longitude: number;   // geocentric ecliptic-of-date longitude, degrees [0, 360)
  retrograde: boolean; // apparent geocentric motion at the target instant
}

export type AsteroidPositions = Record<AsteroidKey, AsteroidPosition>;

// JPL SBDB osculating elements, full precision, common epoch JD 2461200.5.
// Order here fixes the ensemble index used throughout.
const BODIES: Array<{ key: AsteroidKey; el: OsculatingElements }> = [
  { key: 'ceres',  el: { epoch: 2461200.5, e: 0.07969229514816586, a: 2.765552595034094, i: 10.58802780183462, om: 80.24862682043221,  w: 73.29421453021587,  ma: 274.4193463761342 } },
  { key: 'pallas', el: { epoch: 2461200.5, e: 0.2307000995648547,  a: 2.769559010737709, i: 34.93279321851542, om: 172.8866193357694,  w: 310.9699161652136,  ma: 254.2496521742734 } },
  { key: 'juno',   el: { epoch: 2461200.5, e: 0.2556999836681878,  a: 2.670989527103278, i: 12.98659236598085, om: 169.8115953492418,  w: 247.8950743075613,  ma: 262.7322944883855 } },
  { key: 'vesta',  el: { epoch: 2461200.5, e: 0.09020374382834395, a: 2.361365965127599, i: 7.143925545058711, om: 103.701293265032,   w: 151.4686478221564,  ma: 81.19015607686903 } },
  { key: 'chiron', el: { epoch: 2461200.5, e: 0.3797656311453571,  a: 13.68426760850124, i: 6.930574468846328, om: 209.2961258613147,  w: 339.2878326589729,  ma: 216.7198966018106 } },
];

const ELEMENTS_EPOCH_JD = BODIES[0].el.epoch;

// Perturber GM values as GM_SUN / (solar mass / body mass), DE-series ratios.
// EMB = Earth-Moon barycenter.
const PERTURBERS: Array<{ body: Astronomy.Body; gm: number }> = [
  { body: Astronomy.Body.Mercury, gm: GM_SUN / 6023600 },
  { body: Astronomy.Body.Venus,   gm: GM_SUN / 408523.71 },
  { body: (Astronomy.Body as Record<string, Astronomy.Body>).EMB ?? Astronomy.Body.Earth, gm: GM_SUN / 328900.56 },
  { body: Astronomy.Body.Mars,    gm: GM_SUN / 3098708 },
  { body: Astronomy.Body.Jupiter, gm: GM_SUN / 1047.3486 },
  { body: Astronomy.Body.Saturn,  gm: GM_SUN / 3497.898 },
  { body: Astronomy.Body.Uranus,  gm: GM_SUN / 22902.98 },
  { body: Astronomy.Body.Neptune, gm: GM_SUN / 19412.24 },
];

type Vec3 = [number, number, number];

const jdToDate = (jd: number): Date => new Date((jd - 2440587.5) * 86400000);
const dateToJD = (d: Date): number => d.getTime() / 86400000 + 2440587.5;

/** Heliocentric position in ecliptic-J2000 frame (astronomy-engine returns equatorial J2000). */
function helioEclJ2000(body: Astronomy.Body, jd: number): Vec3 {
  const v = Astronomy.HelioVector(body, Astronomy.MakeTime(jdToDate(jd)));
  const c = Math.cos(OBLIQUITY_J2000_RAD);
  const s = Math.sin(OBLIQUITY_J2000_RAD);
  return [v.x, v.y * c + v.z * s, -v.y * s + v.z * c];
}

/** Osculating elements → heliocentric ecliptic-J2000 state vector at epoch. */
function elementsToState(el: OsculatingElements): { r: Vec3; v: Vec3 } {
  const M = (((el.ma % 360) + 360) % 360) * DEG;
  let E = M + el.e * Math.sin(M);
  for (let it = 0; it < 100; it++) {
    const d = (E - el.e * Math.sin(E) - M) / (1 - el.e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-14) break;
  }
  const cE = Math.cos(E);
  const sE = Math.sin(E);
  const xp = el.a * (cE - el.e);
  const yp = el.a * Math.sqrt(1 - el.e * el.e) * sE;
  const n = Math.sqrt(GM_SUN / (el.a * el.a * el.a)); // rad/day
  const f = n / (1 - el.e * cE);
  const vxp = -el.a * f * sE;
  const vyp = el.a * Math.sqrt(1 - el.e * el.e) * f * cE;
  const cO = Math.cos(el.om * DEG), sO = Math.sin(el.om * DEG);
  const cw = Math.cos(el.w * DEG), sw = Math.sin(el.w * DEG);
  const ci = Math.cos(el.i * DEG), si = Math.sin(el.i * DEG);
  const R: number[][] = [
    [cO * cw - sO * sw * ci, -cO * sw - sO * cw * ci],
    [sO * cw + cO * sw * ci, -sO * sw + cO * cw * ci],
    [sw * si, cw * si],
  ];
  const rot = (px: number, py: number): Vec3 => [
    R[0][0] * px + R[0][1] * py,
    R[1][0] * px + R[1][1] * py,
    R[2][0] * px + R[2][1] * py,
  ];
  return { r: rot(xp, yp), v: rot(vxp, vyp) };
}

/**
 * Acceleration on every ensemble body at time jd: solar two-body term plus
 * direct + indirect perturber terms (heliocentric formulation). Perturber
 * positions are computed once per unique jd and shared across bodies.
 */
function ensembleAccel(rs: Vec3[], jd: number, pcache: Map<number, Vec3[]>): Vec3[] {
  let ppos = pcache.get(jd);
  if (!ppos) {
    ppos = PERTURBERS.map((p) => helioEclJ2000(p.body, jd));
    pcache.set(jd, ppos);
  }
  return rs.map((r) => {
    const d2 = r[0] * r[0] + r[1] * r[1] + r[2] * r[2];
    const d3 = d2 * Math.sqrt(d2);
    const acc: Vec3 = [-GM_SUN * r[0] / d3, -GM_SUN * r[1] / d3, -GM_SUN * r[2] / d3];
    for (let p = 0; p < PERTURBERS.length; p++) {
      const [px, py, pz] = ppos![p];
      const dx = px - r[0], dy = py - r[1], dz = pz - r[2];
      const q2 = dx * dx + dy * dy + dz * dz;
      const q3 = q2 * Math.sqrt(q2);
      const s2 = px * px + py * py + pz * pz;
      const s3 = s2 * Math.sqrt(s2);
      const gm = PERTURBERS[p].gm;
      acc[0] += gm * (dx / q3 - px / s3);
      acc[1] += gm * (dy / q3 - py / s3);
      acc[2] += gm * (dz / q3 - pz / s3);
    }
    return acc;
  });
}

interface EnsembleState {
  t: number;   // current JD
  rs: Vec3[];  // positions, ecliptic J2000, AU
  vs: Vec3[];  // velocities, AU/day
}

function rk4Step(st: EnsembleState, dt: number, pcache: Map<number, Vec3[]>): EnsembleState {
  const { rs, vs, t } = st;
  const a1 = ensembleAccel(rs, t, pcache);
  const r2 = rs.map((r, i): Vec3 => [r[0] + vs[i][0] * dt / 2, r[1] + vs[i][1] * dt / 2, r[2] + vs[i][2] * dt / 2]);
  const v2 = vs.map((v, i): Vec3 => [v[0] + a1[i][0] * dt / 2, v[1] + a1[i][1] * dt / 2, v[2] + a1[i][2] * dt / 2]);
  const a2 = ensembleAccel(r2, t + dt / 2, pcache);
  const r3 = rs.map((r, i): Vec3 => [r[0] + v2[i][0] * dt / 2, r[1] + v2[i][1] * dt / 2, r[2] + v2[i][2] * dt / 2]);
  const v3 = vs.map((v, i): Vec3 => [v[0] + a2[i][0] * dt / 2, v[1] + a2[i][1] * dt / 2, v[2] + a2[i][2] * dt / 2]);
  const a3 = ensembleAccel(r3, t + dt / 2, pcache);
  const r4 = rs.map((r, i): Vec3 => [r[0] + v3[i][0] * dt, r[1] + v3[i][1] * dt, r[2] + v3[i][2] * dt]);
  const v4 = vs.map((v, i): Vec3 => [v[0] + a3[i][0] * dt, v[1] + a3[i][1] * dt, v[2] + a3[i][2] * dt]);
  const a4 = ensembleAccel(r4, t + dt, pcache);
  return {
    t: t + dt,
    rs: rs.map((r, i): Vec3 => [
      r[0] + dt / 6 * (vs[i][0] + 2 * v2[i][0] + 2 * v3[i][0] + v4[i][0]),
      r[1] + dt / 6 * (vs[i][1] + 2 * v2[i][1] + 2 * v3[i][1] + v4[i][1]),
      r[2] + dt / 6 * (vs[i][2] + 2 * v2[i][2] + 2 * v3[i][2] + v4[i][2]),
    ]),
    vs: vs.map((v, i): Vec3 => [
      v[0] + dt / 6 * (a1[i][0] + 2 * a2[i][0] + 2 * a3[i][0] + a4[i][0]),
      v[1] + dt / 6 * (a1[i][1] + 2 * a2[i][1] + 2 * a3[i][1] + a4[i][1]),
      v[2] + dt / 6 * (a1[i][2] + 2 * a2[i][2] + 2 * a3[i][2] + a4[i][2]),
    ]),
  };
}

/** Advance the ensemble from st.t to targetJD (either direction). */
function integrateTo(st: EnsembleState, targetJD: number, pcache: Map<number, Vec3[]>): EnsembleState {
  const dir = targetJD < st.t ? -1 : 1;
  const span = Math.abs(targetJD - st.t);
  const nFull = Math.floor(span / STEP_DAYS);
  for (let s = 0; s < nFull; s++) st = rk4Step(st, dir * STEP_DAYS, pcache);
  const rem = Math.abs(targetJD - st.t);
  if (rem > 1e-9) st = rk4Step(st, dir * rem, pcache);
  return st;
}

/** Geocentric ecliptic-of-date longitude from a heliocentric ecliptic-J2000 position. */
function geoLongitudeOfDate(rHelio: Vec3, jd: number, pcache: Map<number, Vec3[]>): number {
  // Earth's position is not in the perturber list (EMB is), so compute directly.
  const e = helioEclJ2000(Astronomy.Body.Earth, jd);
  const precession = (PRECESSION_ARCSEC_PER_YEAR / 3600) * ((jd - J2000_JD) / 365.25);
  const lon = Math.atan2(rHelio[1] - e[1], rHelio[0] - e[0]) / DEG + precession;
  return ((lon % 360) + 360) % 360;
}

/** Signed longitude difference a−b wrapped to (−180, 180]. */
function wrapDiff(a: number, b: number): number {
  let d = (a - b) % 360;
  if (d <= -180) d += 360;
  if (d > 180) d -= 360;
  return d;
}

// Memo of results per instant. Birth charts recompute for the same birth
// data; a small cap keeps unbounded member sets from growing the map.
const cache = new Map<number, AsteroidPositions>();
const CACHE_MAX = 64;

/**
 * Geocentric ecliptic-of-date longitudes + retrograde flags for Chiron,
 * Ceres, Pallas, Juno, and Vesta at the given instant, via perturbed N-body
 * integration from JPL SBDB epoch elements.
 *
 * Throws on numerical failure — callers keep the two-body Keplerian path as
 * fallback.
 */
export function calculateAsteroidPositionsNBody(date: Date): AsteroidPositions {
  const key = date.getTime();
  const hit = cache.get(key);
  if (hit) return hit;

  const targetJD = dateToJD(date);
  if (!Number.isFinite(targetJD)) throw new Error(`asteroidNBody: invalid date ${date}`);

  const pcache = new Map<number, Vec3[]>();
  let st: EnsembleState = { t: ELEMENTS_EPOCH_JD, rs: [], vs: [] };
  for (const b of BODIES) {
    const s = elementsToState(b.el);
    st.rs.push(s.r);
    st.vs.push(s.v);
  }

  // Probe instant 1 day on the epoch side of the target: the integration
  // passes through it on the way, giving the apparent-motion sign (retrograde)
  // without a second integration pass.
  const dir = targetJD < ELEMENTS_EPOCH_JD ? -1 : 1;
  const probeJD = targetJD - dir; // backward pass: target+1d; forward pass: target−1d
  st = integrateTo(st, probeJD, pcache);
  const probeLons = st.rs.map((r) => geoLongitudeOfDate(r, probeJD, pcache));
  st = integrateTo(st, targetJD, pcache);

  const result = {} as AsteroidPositions;
  BODIES.forEach((b, i) => {
    const lon = geoLongitudeOfDate(st.rs[i], targetJD, pcache);
    // dλ/dt over the [earlier, later] day; retrograde when longitude decreases.
    const dLon = dir === -1 ? wrapDiff(probeLons[i], lon) : wrapDiff(lon, probeLons[i]);
    result[b.key] = { longitude: lon, retrograde: dLon < 0 };
  });

  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, result);
  return result;
}
