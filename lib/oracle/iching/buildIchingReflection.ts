/**
 * I Ching Reflection Builder — combines facet map with voice layer.
 *
 * Produces a reflection object containing:
 *   - rawReflection: image + tension + practice (internal only in Phase 1)
 *   - voicedReflection: Daoist-transformed version (Phase 2+)
 *   - shortLine: single voice line for light injection (Phase 2+)
 *
 * Three usage strengths:
 *   Light  — append shortLine only
 *   Medium — voicedReflection as opening paragraph
 *   Deep   — image for opening, practice for orientation, shortLine for closing
 *
 * Canon: docs/canon/ICHING_STRUCTURAL_ENGINE.md
 */

import type { FacetKey, FacetHexagramProfile, ElementName } from './spiralogicHexagrams';
import { getFacetHexagramProfile, toFacetKey } from './spiralogicHexagrams';
import { toDaoistVoice } from './daoistVoice';

export interface IchingReflection {
  facet: FacetKey;
  element: ElementName;
  phase: 1 | 2 | 3;
  primaryHexagram: number;
  primaryName: string;
  supportHexagram: number;
  supportName: string;
  image: string;
  tension: string;
  practice: string;
  rawReflection: string;
  voicedReflection: string;
  shortLine: string;
}

export function buildIchingReflection(facet: FacetKey): IchingReflection {
  const profile: FacetHexagramProfile = getFacetHexagramProfile(facet);

  const rawReflection = [
    profile.image,
    profile.tension,
    profile.practice,
  ].join(' ');

  const voicedReflection = toDaoistVoice(rawReflection, {
    maxSentences: 3,
    preserveQuestions: false,
  });

  return {
    facet,
    element: profile.element,
    phase: profile.phase,
    primaryHexagram: profile.primary.number,
    primaryName: profile.primary.name,
    supportHexagram: profile.support.number,
    supportName: profile.support.name,
    image: profile.image,
    tension: profile.tension,
    practice: profile.practice,
    rawReflection,
    voicedReflection,
    shortLine: profile.voiceLine,
  };
}

/**
 * Convenience: build reflection directly from conductor element + phase.
 */
export function buildReflectionFromConductor(
  element: ElementName,
  phase: number,
): IchingReflection {
  const facet = toFacetKey(element, phase);
  return buildIchingReflection(facet);
}
