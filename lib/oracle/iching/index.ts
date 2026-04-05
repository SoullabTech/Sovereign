/**
 * I Ching Symbolic Guidance Layer
 *
 * Two-layer system:
 *   Layer A — I Ching: structural engine (state, transition, movement)
 *   Layer B — Daoist voice: expression field (restraint, spaciousness, image)
 *
 * Governing principle:
 *   The existing system remains primary.
 *   Chinese and I Ching become a subtle interpretive scaffold.
 *
 * Spiralogic names the developmental terrain.
 * I Ching illuminates the posture within that terrain.
 * Daoist logic shapes how the posture is spoken.
 *
 * Phase 1: silent mapping + logging (ichingPatternLayer flag)
 * Phase 2: light single-line injection in reflective contexts (daoistVoiceLayer flag)
 * Phase 3: voice shaping post-processing
 * Phase 4: deeper symbolic integration (changing lines, recurring patterns)
 */

export type { ElementName, FacetKey, HexagramReference, FacetHexagramProfile } from './spiralogicHexagrams';
export { FACET_HEXAGRAM_MAP, getFacetHexagramProfile, toFacetKey } from './spiralogicHexagrams';

export type { DaoistVoiceOptions } from './daoistVoice';
export { toDaoistVoice } from './daoistVoice';

export type { IchingReflection } from './buildIchingReflection';
export { buildIchingReflection, buildReflectionFromConductor } from './buildIchingReflection';
