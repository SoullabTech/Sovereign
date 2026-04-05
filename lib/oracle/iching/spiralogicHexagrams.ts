/**
 * Spiralogic → I Ching Hexagram Mapping
 *
 * Layer A of the two-layer guidance system:
 *   - I Ching provides the structural engine (state, transition, movement)
 *   - Classical Chinese provides the expression field (voice, ambiguity, participation)
 *
 * Each facet (element × phase) maps to a primary hexagram (energetic posture)
 * and a support hexagram (developmental modifier).
 *
 * The system does NOT say "You are Hexagram 29."
 * It says: "This moment resembles Water 2, whose core movement is 29, tempered by 4."
 *
 * Canon: docs/canon/ICHING_STRUCTURAL_ENGINE.md
 * Voice: docs/canon/SOULLAB_VOICE_DOCTRINE_DAOIST.md
 */

export type ElementName = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export type FacetKey =
  | 'fire_1' | 'fire_2' | 'fire_3'
  | 'water_1' | 'water_2' | 'water_3'
  | 'earth_1' | 'earth_2' | 'earth_3'
  | 'air_1' | 'air_2' | 'air_3'
  | 'aether_1' | 'aether_2' | 'aether_3';

export interface HexagramReference {
  number: number;
  name: string;
}

export interface FacetHexagramProfile {
  facet: FacetKey;
  element: ElementName;
  phase: 1 | 2 | 3;
  primary: HexagramReference;
  support: HexagramReference;
  image: string;
  tension: string;
  practice: string;
  voiceLine: string;
}

// ═══════════════════════════════════════════════════════════════
// FIRE — Vision, emergence, ignition
// Key tone: emergence without forcing
// ═══════════════════════════════════════════════════════════════

const FIRE_1: FacetHexagramProfile = {
  facet: 'fire_1',
  element: 'fire',
  phase: 1,
  primary: { number: 51, name: 'The Arousing' },
  support: { number: 3, name: 'Difficulty at the Beginning' },
  image: 'A sudden stirring breaks the stillness.',
  tension: 'Energy arrives before form is ready to hold it.',
  practice: 'Do not rush to control the spark. Let it reveal its direction.',
  voiceLine: 'A spark has arrived before the path is known.',
};

const FIRE_2: FacetHexagramProfile = {
  facet: 'fire_2',
  element: 'fire',
  phase: 2,
  primary: { number: 14, name: 'Great Possession' },
  support: { number: 34, name: 'Great Power' },
  image: 'Power gathers and seeks worthy direction.',
  tension: 'Force can become inflation if not shaped by purpose.',
  practice: 'Hold the energy steadily and give it form through intention.',
  voiceLine: 'The flame leans toward what it is meant to serve.',
};

const FIRE_3: FacetHexagramProfile = {
  facet: 'fire_3',
  element: 'fire',
  phase: 3,
  primary: { number: 30, name: 'The Clinging, Fire' },
  support: { number: 35, name: 'Progress' },
  image: 'Light is sustained and begins to illuminate others.',
  tension: 'Visibility can become performance if cut off from source.',
  practice: 'Let clarity radiate without grasping for recognition.',
  voiceLine: 'The light no longer belongs only to itself.',
};

// ═══════════════════════════════════════════════════════════════
// WATER — Emotion, depth, transformation
// Key tone: allowing, not fixing
// ═══════════════════════════════════════════════════════════════

const WATER_1: FacetHexagramProfile = {
  facet: 'water_1',
  element: 'water',
  phase: 1,
  primary: { number: 48, name: 'The Well' },
  support: { number: 47, name: 'Oppression' },
  image: 'A deep inner source waits beneath surface feeling.',
  tension: 'Emotional life can feel depleted when cut off from depth.',
  practice: 'Return to the source rather than forcing expression.',
  voiceLine: 'Something stirs below what can yet be said.',
};

const WATER_2: FacetHexagramProfile = {
  facet: 'water_2',
  element: 'water',
  phase: 2,
  primary: { number: 29, name: 'The Abysmal, Water' },
  support: { number: 4, name: 'Youthful Folly' },
  image: 'The ravine repeats until a wiser way of moving is learned.',
  tension: 'The instinct to escape interrupts the learning of the passage.',
  practice: 'Enter carefully. Let the current teach you its shape.',
  voiceLine: 'You are already inside the crossing. Move with care, not force.',
};

const WATER_3: FacetHexagramProfile = {
  facet: 'water_3',
  element: 'water',
  phase: 3,
  primary: { number: 59, name: 'Dispersion' },
  support: { number: 63, name: 'After Completion' },
  image: 'What was frozen begins to dissolve and reorganize.',
  tension: 'Letting go can feel like losing structure before renewal appears.',
  practice: 'Allow softening. Coherence returns through release.',
  voiceLine: 'What loosens now may return in truer form.',
};

// ═══════════════════════════════════════════════════════════════
// EARTH — Form, grounding, manifestation
// Key tone: quiet solidity
// ═══════════════════════════════════════════════════════════════

const EARTH_1: FacetHexagramProfile = {
  facet: 'earth_1',
  element: 'earth',
  phase: 1,
  primary: { number: 15, name: 'Modesty' },
  support: { number: 23, name: 'Splitting Apart' },
  image: 'The essential form emerges through simplification.',
  tension: 'The wish for completion can distort early formation.',
  practice: 'Build simply. Let the first shape be small and true.',
  voiceLine: 'The outline appears before the form is complete.',
};

const EARTH_2: FacetHexagramProfile = {
  facet: 'earth_2',
  element: 'earth',
  phase: 2,
  primary: { number: 2, name: 'The Receptive' },
  support: { number: 8, name: 'Holding Together' },
  image: 'Ground receives, contains, and nourishes.',
  tension: 'Support can collapse when it tries to dominate instead of hold.',
  practice: 'Become steady enough to carry what is forming.',
  voiceLine: 'The ground is learning how to hold your weight.',
};

const EARTH_3: FacetHexagramProfile = {
  facet: 'earth_3',
  element: 'earth',
  phase: 3,
  primary: { number: 16, name: 'Enthusiasm' },
  support: { number: 45, name: 'Gathering Together' },
  image: 'Inner coherence begins moving into shared form.',
  tension: 'Momentum without rootedness can scatter embodiment.',
  practice: 'Organize the energy around what can actually be lived.',
  voiceLine: 'What was inward now begins to stand in the world.',
};

// ═══════════════════════════════════════════════════════════════
// AIR — Awareness, pattern, meaning
// Key tone: light, precise, non-heavy
// ═══════════════════════════════════════════════════════════════

const AIR_1: FacetHexagramProfile = {
  facet: 'air_1',
  element: 'air',
  phase: 1,
  primary: { number: 61, name: 'Inner Truth' },
  support: { number: 20, name: 'Contemplation' },
  image: 'A subtle truth becomes visible from within.',
  tension: 'Insight can vanish when seized too quickly by analysis.',
  practice: 'Watch gently. Let clarity arrive before naming it.',
  voiceLine: 'A pattern is beginning to show itself.',
};

const AIR_2: FacetHexagramProfile = {
  facet: 'air_2',
  element: 'air',
  phase: 2,
  primary: { number: 57, name: 'The Gentle, Wind' },
  support: { number: 9, name: 'The Taming Power of the Small' },
  image: 'Clarity advances through subtle penetration and refinement.',
  tension: 'The mind may want a total answer where only gradual precision is possible.',
  practice: 'Refine by degrees. Let discernment move like wind through leaves.',
  voiceLine: 'Clarity comes by entering gently and seeing precisely.',
};

const AIR_3: FacetHexagramProfile = {
  facet: 'air_3',
  element: 'air',
  phase: 3,
  primary: { number: 13, name: 'Fellowship with Men' },
  support: { number: 37, name: 'The Family' },
  image: 'Understanding becomes communicable and relational.',
  tension: 'Meaning hardens when it forgets the living field it came from.',
  practice: 'Speak what is true in a way that can be shared and held.',
  voiceLine: 'What you now see can begin to belong between people.',
};

// ═══════════════════════════════════════════════════════════════
// AETHER — Stillness, unity, field
// Key tone: minimal, spacious, almost silent
// ═══════════════════════════════════════════════════════════════

const AETHER_1: FacetHexagramProfile = {
  facet: 'aether_1',
  element: 'aether',
  phase: 1,
  primary: { number: 52, name: 'Keeping Still' },
  support: { number: 53, name: 'Development' },
  image: 'Stillness opens a threshold through which subtler movement appears.',
  tension: 'The urge to interpret can close the very space that is opening.',
  practice: 'Remain quiet enough for the field to become perceptible.',
  voiceLine: 'There is more room here than there first seemed.',
};

const AETHER_2: FacetHexagramProfile = {
  facet: 'aether_2',
  element: 'aether',
  phase: 2,
  primary: { number: 44, name: 'Coming to Meet' },
  support: { number: 31, name: 'Influence' },
  image: 'A larger field approaches and touches the edges of selfhood.',
  tension: 'Permeability can become confusion if there is no witnessing center.',
  practice: 'Meet what arrives without surrendering discernment.',
  voiceLine: 'Something larger is near. Let it be met, not seized.',
};

const AETHER_3: FacetHexagramProfile = {
  facet: 'aether_3',
  element: 'aether',
  phase: 3,
  primary: { number: 1, name: 'The Creative' },
  support: { number: 64, name: 'Before Completion' },
  image: 'Pure generative field remains open and not yet closed into final form.',
  tension: 'The wish to finish can interrupt deeper coherence.',
  practice: 'Stay open to the living whole before deciding what it means.',
  voiceLine: 'What is present now does not need to be closed too quickly.',
};

// ═══════════════════════════════════════════════════════════════
// Map & accessor
// ═══════════════════════════════════════════════════════════════

export const FACET_HEXAGRAM_MAP: Record<FacetKey, FacetHexagramProfile> = {
  fire_1: FIRE_1,
  fire_2: FIRE_2,
  fire_3: FIRE_3,
  water_1: WATER_1,
  water_2: WATER_2,
  water_3: WATER_3,
  earth_1: EARTH_1,
  earth_2: EARTH_2,
  earth_3: EARTH_3,
  air_1: AIR_1,
  air_2: AIR_2,
  air_3: AIR_3,
  aether_1: AETHER_1,
  aether_2: AETHER_2,
  aether_3: AETHER_3,
};

export function getFacetHexagramProfile(facet: FacetKey): FacetHexagramProfile {
  return FACET_HEXAGRAM_MAP[facet];
}

/**
 * Convert conductor element + phase into a FacetKey.
 *
 * TRANSLATION RULE (provisional, may refine after Phase 1 observation):
 *   Conductor phase 1-4  → facet phase 1 (emergence / stirring)
 *   Conductor phase 5-8  → facet phase 2 (immersion / deepening)
 *   Conductor phase 9-12 → facet phase 3 (integration / embodiment)
 *
 * This is a LOSSY compression: 12 Spiralogic phases collapse to 3 hexagram
 * phases. Phases within a band (e.g. 5 vs 8) are treated identically.
 * This is intentional for Phase 1 — the hexagram system operates at a coarser
 * grain than Spiralogic. If observation reveals that meaningful distinctions
 * are being flattened (e.g. phase 5 and phase 8 consistently need different
 * hexagram postures), the adapter can be refined to a 4-band or per-phase map.
 */
export function toFacetKey(element: ElementName, phase: number): FacetKey {
  const p = phase <= 4 ? 1 : phase <= 8 ? 2 : 3;
  return `${element}_${p}` as FacetKey;
}
