/**
 * Spiralogic Registration Grammar v1 — types.
 *
 * Spec: docs/specs/SPIRALOGIC_REGISTRATION_GRAMMAR_SPEC_2026-07-09.md
 * (Q6 = Option C ratified: the profile is the DISTRIBUTION only — no
 * dominance, no derivations. Summaries belong to the single versioned
 * interpretive rule, outside this layer.)
 */

/** Q1 closed set (v1): the ten classical-through-modern bodies. */
export const Q1_BODIES = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
] as const;

export type Q1Body = (typeof Q1_BODIES)[number];

export type Element = 'fire' | 'water' | 'earth' | 'air';
export type Phase = 1 | 2 | 3;

/** The 12 phase keys — the closed ontology (INV-4). NO aether key (INV-7). */
export const PHASE_KEYS = [
  'fire_1',
  'fire_2',
  'fire_3',
  'water_1',
  'water_2',
  'water_3',
  'earth_1',
  'earth_2',
  'earth_3',
  'air_1',
  'air_2',
  'air_3',
] as const;

export type PhaseKey = (typeof PHASE_KEYS)[number];

export type RegistrationMode = 'timed' | 'noon';

/**
 * SH-10 — input contract.
 *
 * Longitudes are ecliptic degrees in [0, 360), full precision.
 * `moonBranches` is present iff mode:'noon' AND the Moon is sign-ambiguous
 * that day; it REPLACES `bodies.Moon` (each branch contributes weight 0.5).
 */
export interface ChartPositions {
  bodies: Record<Q1Body, number>;
  mode: RegistrationMode;
  moonBranches?: [number, number];
}

/**
 * The profile: distribution (RAW weights, all 12 keys, SH-12) plus
 * provenance and degradation metadata. Nothing else — no dominance crown,
 * no derivations at the grammar layer (INV-3, Q6 = C).
 */
export interface SpiralogicProfile {
  distribution: Record<PhaseKey, number>;
  grammar_version: 1;
  mode: RegistrationMode;
  /** Present (true) only when the Moon registered via branches (Q4). The epistemic flag travels. */
  moonUncertain?: true;
  /** SHA-256 hex over the canonical serialization of {bodies (sorted), mode, moonBranches} (SH-12). */
  input_fingerprint: string;
}
