/**
 * Spiralogic Registration Grammar v1 — registerChart.
 *
 * Pure, synchronous, deterministic. No LLM, no DB, no I/O beyond node
 * crypto for the input fingerprint (pure computation). Built-unwired.
 *
 * Spec: docs/specs/SPIRALOGIC_REGISTRATION_GRAMMAR_SPEC_2026-07-09.md
 *  - Q2 table = the grammar (table.ts)
 *  - Q4 Moon-branch rule: each branch sign 0.5; same-sign branches → 1.0;
 *    `moonUncertain: true` travels either way (epistemic flag).
 *  - Q5: all weights 1.0.
 *  - Q6 = C: distribution ONLY — no dominance, no derivations.
 *  - SH-10/11/12: input contract, throw-on-invalid, canonical fingerprint.
 */

import { createHash } from 'crypto';

import { RegistrationInputError } from './errors';
import { GRAMMAR_VERSION, longitudeToSign, SIGN_TO_REGISTRATION } from './table';
import type { ChartPositions, PhaseKey, Q1Body, SpiralogicProfile } from './types';
import { PHASE_KEYS, Q1_BODIES } from './types';

const Q1_SET: ReadonlySet<string> = new Set(Q1_BODIES);

/** SH-11: a longitude must be finite and within the half-open [0, 360). */
function assertValidLongitude(longitude: number, body: string): void {
  if (typeof longitude !== 'number' || !Number.isFinite(longitude)) {
    throw new RegistrationInputError(
      'non_finite_longitude',
      `Longitude for ${body} is not a finite number`,
      body,
    );
  }
  if (longitude < 0 || longitude >= 360) {
    throw new RegistrationInputError(
      'longitude_out_of_range',
      `Longitude for ${body} (${longitude}) is outside [0, 360)`,
      body,
    );
  }
}

/**
 * Validates the SH-10 contract; throws RegistrationInputError otherwise.
 * The grammar refuses rather than repairs (SH-11).
 */
function validate(positions: ChartPositions): void {
  const { bodies, mode, moonBranches } = positions;
  const moonBranched = moonBranches !== undefined;

  if (moonBranched) {
    // SH-10: moonBranches is present IFF mode:'noon' and it REPLACES bodies.Moon.
    if (mode !== 'noon') {
      throw new RegistrationInputError(
        'invalid_moon_branches',
        "moonBranches is only valid with mode:'noon' (SH-10)",
      );
    }
    if (!Array.isArray(moonBranches) || moonBranches.length !== 2) {
      throw new RegistrationInputError(
        'invalid_moon_branches',
        'moonBranches must be a two-element tuple of longitudes (SH-10)',
      );
    }
    if ((bodies as Partial<Record<Q1Body, number>>).Moon !== undefined) {
      throw new RegistrationInputError(
        'invalid_moon_branches',
        'moonBranches replaces bodies.Moon — both were provided (SH-10)',
      );
    }
    assertValidLongitude(moonBranches[0], 'Moon (branch 1)');
    assertValidLongitude(moonBranches[1], 'Moon (branch 2)');
  }

  for (const body of Q1_BODIES) {
    if (body === 'Moon' && moonBranched) continue; // registered via branches
    const longitude = (bodies as Partial<Record<Q1Body, number>>)[body];
    if (longitude === undefined) {
      throw new RegistrationInputError(
        'missing_body',
        `Missing Q1 body: ${body}`,
        body,
      );
    }
    assertValidLongitude(longitude, body);
  }

  // Q1 is a closed set: an unlisted body is out-of-vocabulary input, and the
  // grammar throws rather than silently dropping it (Finding 9 fix-shape).
  for (const key of Object.keys(bodies)) {
    if (!Q1_SET.has(key)) {
      throw new RegistrationInputError(
        'unknown_body',
        `Unknown body outside the Q1 closed set: ${key}`,
        key,
      );
    }
  }
}

/**
 * SH-12 canonical serialization: JSON with lexicographically sorted keys,
 * numbers via Number.prototype.toString(), absent fields omitted.
 */
function canonicalize(value: unknown): string {
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(',')}]`;
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonicalize(v)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value);
}

/** SH-12: SHA-256 hex over the canonical serialization of {bodies (sorted), mode, moonBranches}. */
function fingerprint(positions: ChartPositions): string {
  const canonical = canonicalize({
    bodies: positions.bodies,
    mode: positions.mode,
    moonBranches: positions.moonBranches,
  });
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

function phaseKeyForLongitude(longitude: number): PhaseKey {
  const { element, phase } = SIGN_TO_REGISTRATION[longitudeToSign(longitude)];
  return `${element}_${phase}` as PhaseKey;
}

/**
 * The registration grammar. Deterministic: identical input → identical
 * profile and identical fingerprint (INV-1). All Q5 weights are 1.0.
 */
export function registerChart(positions: ChartPositions): SpiralogicProfile {
  validate(positions);

  const { bodies, mode, moonBranches } = positions;

  // All 12 keys always present, raw weights (SH-12 / INV-3).
  const distribution = {} as Record<PhaseKey, number>;
  for (const key of PHASE_KEYS) distribution[key] = 0;

  const moonBranched = moonBranches !== undefined;

  for (const body of Q1_BODIES) {
    if (body === 'Moon' && moonBranched) continue;
    distribution[phaseKeyForLongitude(bodies[body])] += 1.0;
  }

  if (moonBranched) {
    // Q4: each branch's sign gets 0.5; if both branches resolve to the same
    // sign the full 1.0 lands there. Either way the epistemic flag travels.
    distribution[phaseKeyForLongitude(moonBranches[0])] += 0.5;
    distribution[phaseKeyForLongitude(moonBranches[1])] += 0.5;
  }

  const profile: SpiralogicProfile = {
    distribution,
    grammar_version: GRAMMAR_VERSION,
    mode,
    input_fingerprint: fingerprint(positions),
  };
  if (moonBranched) profile.moonUncertain = true;

  return profile;
}
