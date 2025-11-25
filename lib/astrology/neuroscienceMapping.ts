/**
 * Spiralogic Neuroscience-Consciousness Mapping
 *
 * Maps the 12 houses to brain regions, consciousness states, and elemental processes.
 * This is the integration layer that makes Spiralogic embodied in actual neurological function.
 *
 * 🧠 Brain-Element Mapping:
 * - FIRE (Right Prefrontal Cortex) - Vision & Projection
 * - WATER (Right Hemisphere) - Deep Introspection
 * - EARTH (Left Hemisphere) - Grounded Creativity
 * - AIR (Left Prefrontal Cortex) - Communication
 * - AETHER (Transcendent) - Non-Duality
 */

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export type Phase = 1 | 2 | 3;
export type BrainRegion =
  | 'right-prefrontal-cortex'
  | 'right-hemisphere'
  | 'left-hemisphere'
  | 'left-prefrontal-cortex'
  | 'transcendent';

export interface SpiralogicPhase {
  house: number;
  element: Element;
  phase: Phase;
  label: string; // e.g., "Fire 1", "Water 2"
  emoji: string;

  // Neuroscience Layer (internal - not displayed)
  brainRegion: BrainRegion;
  neuralActivation: string;

  // Consciousness Layer
  consciousnessState: string;
  intelligence: string;

  // Process Layer
  cardinalName: string; // Aries, Cancer, Libra, Capricorn
  fixedName: string;    // Taurus, Leo, Scorpio, Aquarius
  mutableName: string;  // Gemini, Virgo, Sagittarius, Pisces

  // Traditional house meaning
  traditionalTheme: string;

  // Spiralogic meaning
  spiralogicTheme: string;

  // Mythic language (what the user sees)
  mythicLine: string; // Evocative imagery, not clinical
  description: string; // Poetic, embodied understanding
  invitation: string; // Developmental guidance for MAIA
}

/**
 * Complete 12-house neuroscience-consciousness mapping
 * In Spiralogic spiral order: [1, 5, 9, 4, 8, 12, 10, 2, 6, 7, 11, 3]
 */
export const SPIRALOGIC_NEUROSCIENCE_MAP: Record<number, SpiralogicPhase> = {
  // FIRE TRIAD - The Horizon-Mind of Vision
  1: {
    house: 1,
    element: 'fire',
    phase: 1,
    label: 'Fire 1',
    emoji: '🔥',
    brainRegion: 'right-prefrontal-cortex',
    neuralActivation: 'Right prefrontal cortex - initiating vision projection',
    consciousnessState: 'Experience - Cardinal Fire',
    intelligence: 'Intuitive/Spiritual',
    cardinalName: 'Aries',
    fixedName: '',
    mutableName: '',
    traditionalTheme: 'Self, Identity, Physical Body',
    spiralogicTheme: 'Experience',
    mythicLine: 'Vector of Fire — where the inner sun remembers itself through vision',
    description: 'The spark of conscious self-awareness. The horizon-mind ignites here, projecting what could be before the body knows how.',
    invitation: 'Invites you to trust the vision arising from within'
  },

  5: {
    house: 5,
    element: 'fire',
    phase: 2,
    label: 'Fire 2',
    emoji: '🔥',
    brainRegion: 'right-prefrontal-cortex',
    neuralActivation: 'Right prefrontal cortex - sustaining creative expression',
    consciousnessState: 'Expression - Fixed Fire',
    intelligence: 'Intuitive/Spiritual',
    cardinalName: '',
    fixedName: 'Leo',
    mutableName: '',
    traditionalTheme: 'Creativity, Romance, Play, Children',
    spiralogicTheme: 'Expression',
    mythicLine: 'Circle of Fire — where the heart learns to radiate without burning out',
    description: 'The sustained flame of creative joy. The horizon-mind becomes embodied presence, holding vision steady through play and devotion.',
    invitation: 'Invites you to express the vision with sustained radiance'
  },

  9: {
    house: 9,
    element: 'fire',
    phase: 3,
    label: 'Fire 3',
    emoji: '🔥',
    brainRegion: 'right-prefrontal-cortex',
    neuralActivation: 'Right prefrontal cortex - expansive integration of vision',
    consciousnessState: 'Expansion - Mutable Fire',
    intelligence: 'Intuitive/Spiritual',
    cardinalName: '',
    fixedName: '',
    mutableName: 'Sagittarius',
    traditionalTheme: 'Philosophy, Higher Learning, Travel, Meaning',
    spiralogicTheme: 'Expansion',
    mythicLine: 'Spiral of Fire — where vision expands into wisdom that touches all horizons',
    description: 'The far-reaching quest for meaning. The horizon-mind dissolves boundaries, integrating vision into universal understanding.',
    invitation: 'Invites you to refine vision into transcendent wisdom'
  },

  // WATER TRIAD - The Oceanic Mirror of Introspection
  4: {
    house: 4,
    element: 'water',
    phase: 1,
    label: 'Water 1',
    emoji: '💧',
    brainRegion: 'right-hemisphere',
    neuralActivation: 'Right hemisphere - initiating emotional depth',
    consciousnessState: 'Heart - Cardinal Water',
    intelligence: 'Feeling-based',
    cardinalName: 'Cancer',
    fixedName: '',
    mutableName: '',
    traditionalTheme: 'Home, Family, Roots, Foundation',
    spiralogicTheme: 'Heart',
    mythicLine: 'Vector of Water — where feeling finds its wellspring and learns to hold',
    description: 'The emotional foundation where instinct meets nurture. The oceanic mirror reflects what matters most, creating sanctuary within.',
    invitation: 'Invites you to trust the depths of feeling as sacred ground'
  },

  8: {
    house: 8,
    element: 'water',
    phase: 2,
    label: 'Water 2',
    emoji: '💧',
    brainRegion: 'right-hemisphere',
    neuralActivation: 'Right hemisphere - sustaining transformative depth',
    consciousnessState: 'Healing - Fixed Water',
    intelligence: 'Feeling-based',
    cardinalName: '',
    fixedName: 'Scorpio',
    mutableName: '',
    traditionalTheme: 'Death/Rebirth, Shared Resources, Intimacy, Power',
    spiralogicTheme: 'Healing',
    mythicLine: 'Circle of Water — where the soul descends to compost shadow into gold',
    description: 'The deep waters of transformation. The oceanic mirror shows what must die to be reborn, sustaining intensity through the passage.',
    invitation: 'Invites you to embrace the dark waters as the womb of renewal'
  },

  12: {
    house: 12,
    element: 'water',
    phase: 3,
    label: 'Water 3',
    emoji: '💧',
    brainRegion: 'right-hemisphere',
    neuralActivation: 'Right hemisphere - dissolving into mystical unity',
    consciousnessState: 'Holiness - Mutable Water',
    intelligence: 'Feeling-based',
    cardinalName: '',
    fixedName: '',
    mutableName: 'Pisces',
    traditionalTheme: 'Spirituality, Unconscious, Hidden, Transcendence',
    spiralogicTheme: 'Holiness',
    mythicLine: 'Spiral of Water — where boundaries dissolve into the ocean of all being',
    description: 'The boundless waters of mystical union. The oceanic mirror becomes the ocean itself, dissolving separation into compassion.',
    invitation: 'Invites you to surrender into the sacred mystery'
  },

  // EARTH TRIAD - The Patient Bones of Grounded Creativity
  10: {
    house: 10,
    element: 'earth',
    phase: 1,
    label: 'Earth 1',
    emoji: '🌍',
    brainRegion: 'left-hemisphere',
    neuralActivation: 'Left hemisphere - initiating structured manifestation',
    consciousnessState: 'Mission - Cardinal Earth',
    intelligence: 'Sensate/Practical',
    cardinalName: 'Capricorn',
    fixedName: '',
    mutableName: '',
    traditionalTheme: 'Career, Public Life, Achievement, Authority',
    spiralogicTheme: 'Mission',
    mythicLine: 'Vector of Earth — where spirit touches soil and intention becomes structure',
    description: 'The first stone laid. The patient bones initiate form, grounding vision in disciplined purpose.',
    invitation: 'Invites you to honor the slow work of mastery'
  },

  2: {
    house: 2,
    element: 'earth',
    phase: 2,
    label: 'Earth 2',
    emoji: '🌍',
    brainRegion: 'left-hemisphere',
    neuralActivation: 'Left hemisphere - sustaining resource stability',
    consciousnessState: 'Means - Fixed Earth',
    intelligence: 'Sensate/Practical',
    cardinalName: '',
    fixedName: 'Taurus',
    mutableName: '',
    traditionalTheme: 'Resources, Values, Self-Worth, Material Security',
    spiralogicTheme: 'Means',
    mythicLine: 'Circle of Earth — where value takes root and patience shapes possibility',
    description: 'The craft of becoming. The patient bones sustain form, accumulating resources through devotion to what matters.',
    invitation: 'Invites you to trust the fertile ground of your worth'
  },

  6: {
    house: 6,
    element: 'earth',
    phase: 3,
    label: 'Earth 3',
    emoji: '🌍',
    brainRegion: 'left-hemisphere',
    neuralActivation: 'Left hemisphere - refining through service integration',
    consciousnessState: 'Medicine - Mutable Earth',
    intelligence: 'Sensate/Practical',
    cardinalName: '',
    fixedName: '',
    mutableName: 'Virgo',
    traditionalTheme: 'Health, Service, Daily Work, Refinement',
    spiralogicTheme: 'Medicine',
    mythicLine: 'Spiral of Earth — where the seasoned hand meets flow and craft becomes grace',
    description: 'Mastery meeting rhythm. The patient bones refine detail, transforming effort into devotional precision.',
    invitation: 'Invites you to serve with exquisite attention'
  },

  // AIR TRIAD - The Listening Wind of Communication
  7: {
    house: 7,
    element: 'air',
    phase: 1,
    label: 'Air 1',
    emoji: '💨',
    brainRegion: 'left-prefrontal-cortex',
    neuralActivation: 'Left prefrontal cortex - initiating relational thinking',
    consciousnessState: 'Connection - Cardinal Air',
    intelligence: 'Thinking/Analytical',
    cardinalName: 'Libra',
    fixedName: '',
    mutableName: '',
    traditionalTheme: 'Partnership, Marriage, One-on-One, Balance',
    spiralogicTheme: 'Connection',
    mythicLine: 'Vector of Air — where awareness meets the mirror of another mind',
    description: 'The first breath of understanding. The listening wind initiates dialogue, learning self through other.',
    invitation: 'Invites you to find yourself in the reflection of relationship'
  },

  11: {
    house: 11,
    element: 'air',
    phase: 2,
    label: 'Air 2',
    emoji: '💨',
    brainRegion: 'left-prefrontal-cortex',
    neuralActivation: 'Left prefrontal cortex - sustaining collective systems',
    consciousnessState: 'Community - Fixed Air',
    intelligence: 'Thinking/Analytical',
    cardinalName: '',
    fixedName: 'Aquarius',
    mutableName: '',
    traditionalTheme: 'Groups, Friends, Causes, Future Vision',
    spiralogicTheme: 'Community',
    mythicLine: 'Circle of Air — where individual thought weaves into collective intelligence',
    description: 'The network mind. The listening wind sustains connection, building cooperative systems from shared vision.',
    invitation: 'Invites you to trust the wisdom emerging between minds'
  },

  3: {
    house: 3,
    element: 'air',
    phase: 3,
    label: 'Air 3',
    emoji: '💨',
    brainRegion: 'left-prefrontal-cortex',
    neuralActivation: 'Left prefrontal cortex - integrating communicative understanding',
    consciousnessState: 'Consciousness - Mutable Air',
    intelligence: 'Thinking/Analytical',
    cardinalName: '',
    fixedName: '',
    mutableName: 'Gemini',
    traditionalTheme: 'Communication, Learning, Siblings, Local Environment',
    spiralogicTheme: 'Consciousness',
    mythicLine: 'Spiral of Air — where thought becomes shared clarity, the clear sky after storm',
    description: 'The curious bridge. The listening wind integrates perspectives, transforming scattered knowing into wisdom.',
    invitation: 'Invites you to speak the truth that connects all voices'
  }
};

/**
 * Get Spiralogic phase info for a house
 */
export function getSpiralogicPhase(house: number): SpiralogicPhase {
  return SPIRALOGIC_NEUROSCIENCE_MAP[house];
}

/**
 * Get all phases for an element
 */
export function getElementPhases(element: Element): SpiralogicPhase[] {
  return Object.values(SPIRALOGIC_NEUROSCIENCE_MAP)
    .filter(phase => phase.element === element)
    .sort((a, b) => a.phase - b.phase);
}

/**
 * Get brain region description
 */
export function getBrainRegionDescription(region: BrainRegion): string {
  const descriptions: Record<BrainRegion, string> = {
    'right-prefrontal-cortex': 'Right Prefrontal Cortex - Vision, intuition, spiritual synthesis',
    'right-hemisphere': 'Right Hemisphere - Emotion, instinct, holistic perception',
    'left-hemisphere': 'Left Hemisphere - Logic, planning, sequential processing',
    'left-prefrontal-cortex': 'Left Prefrontal Cortex - Analytical thought, systematic reasoning',
    'transcendent': 'Transcendent Unity - Beyond hemispheric division, pure awareness'
  };

  return descriptions[region];
}

/**
 * Get element description with neuroscience integration
 */
export function getElementNeuroscienceDescription(element: Element): string {
  const descriptions: Record<Element, string> = {
    fire: '🔥 FIRE (Right Prefrontal Cortex) - Vision & Projection. Generates compelling future vision through intuitive/spiritual intelligence. Experience → Expression → Expansion.',
    water: '💧 WATER (Right Hemisphere) - Deep Introspection. Processes emotions and instincts through feeling-based intelligence. Heart → Healing → Holiness.',
    earth: '🌍 EARTH (Left Hemisphere) - Grounded Creativity. Organizes and embodies through sensate/practical intelligence. Mission → Means → Medicine.',
    air: '💨 AIR (Left Prefrontal Cortex) - Communication. Analyzes and connects through thinking/analytical intelligence. Connection → Community → Consciousness.',
    aether: '✨ AETHER (Transcendent) - Non-Duality. Pure consciousness beyond brain division, the center point of the Self.'
  };

  return descriptions[element];
}

/**
 * Spiralogic spiral order for visualization
 */
export const SPIRALOGIC_SPIRAL_ORDER = [1, 5, 9, 4, 8, 12, 10, 2, 6, 7, 11, 3];

/**
 * Get position in spiral for a house
 */
export function getSpiralPosition(house: number): number {
  return SPIRALOGIC_SPIRAL_ORDER.indexOf(house);
}
