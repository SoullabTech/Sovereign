/**
 * The Q2 grammar table — THE grammar. Closed, total over the zodiac,
 * version-frozen as grammar_version: 1.
 *
 * element = sign element · phase = modality (Cardinal→1, Fixed→2, Mutable→3)
 *
 * Anti-fork pin (Kelly's chip 1): the equivalence test in __tests__ asserts
 * sign-by-sign element agreement with the live engine's SIGNS_TO_ELEMENT
 * (lib/astrology/engines/spiralogicEngine.ts) — read-only, zero edits there.
 */

import type { Element, Phase } from './types';

export const GRAMMAR_VERSION = 1 as const;

export type Sign =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

/** Zodiac in ecliptic-longitude order: sign k occupies [k·30°, (k+1)·30°). */
export const SIGNS_IN_LONGITUDE_ORDER: readonly Sign[] = Object.freeze([
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const);

export interface SignRegistration {
  readonly element: Element;
  readonly phase: Phase;
}

/** The 12-row sign → (element, phase) mapping, ratified Q2. Deep-frozen. */
export const SIGN_TO_REGISTRATION: Readonly<Record<Sign, SignRegistration>> =
  Object.freeze({
    Aries: Object.freeze({ element: 'fire', phase: 1 } as const),
    Leo: Object.freeze({ element: 'fire', phase: 2 } as const),
    Sagittarius: Object.freeze({ element: 'fire', phase: 3 } as const),
    Cancer: Object.freeze({ element: 'water', phase: 1 } as const),
    Scorpio: Object.freeze({ element: 'water', phase: 2 } as const),
    Pisces: Object.freeze({ element: 'water', phase: 3 } as const),
    Capricorn: Object.freeze({ element: 'earth', phase: 1 } as const),
    Taurus: Object.freeze({ element: 'earth', phase: 2 } as const),
    Virgo: Object.freeze({ element: 'earth', phase: 3 } as const),
    Libra: Object.freeze({ element: 'air', phase: 1 } as const),
    Aquarius: Object.freeze({ element: 'air', phase: 2 } as const),
    Gemini: Object.freeze({ element: 'air', phase: 3 } as const),
  });

/**
 * Q3 / INV-5 / SH-10 — half-open longitude → sign resolution on the RAW
 * longitude: sign membership is [k·30°, (k+1)·30°). A body at 29°59′59.99″
 * Aries is Aries; at exactly 0°00′00″ Taurus (longitude 30) it is Taurus.
 *
 * Callers must have validated `longitude` as finite and within [0, 360)
 * (SH-11); this function assumes a valid input.
 */
export function longitudeToSign(longitude: number): Sign {
  return SIGNS_IN_LONGITUDE_ORDER[Math.floor(longitude / 30)];
}
