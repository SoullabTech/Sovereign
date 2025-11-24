/**
 * SPIRALOGIC ASTROLOGY MAPPING
 *
 * Maps the 12 astrological houses to Spiralogic facets, integrating:
 * - Elemental pathways (Fire, Water, Earth, Air)
 * - Brain regions (McGilchrist's 4-brain model)
 * - Consciousness states (12 facets of development)
 * - Vector-Circle-Spiral progression
 *
 * This is the core mapping that transforms traditional astrology into
 * Spiralogic Astrology - a participatory, experiential system for conscious evolution.
 */

export type SpiralogicElement = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export type SpiralogicStage = 'vector' | 'circle' | 'spiral';

export interface SpiralogicFacet {
  house: number;
  element: SpiralogicElement;
  facetNumber: 1 | 2 | 3; // Which facet of the element (1, 2, or 3)
  stage: SpiralogicStage; // Vector (Intelligence), Circle (Intention), Spiral (Goal)
  label: string;
  description: string;
  brainRegion: string;
  consciousnessFunction: string;
}

/**
 * The 12 Spiralogic Facets mapped to astrological houses
 */
export const SPIRALOGIC_FACETS: Record<number, SpiralogicFacet> = {
  // 🔥 FIRE PATHWAY - Right Prefrontal Cortex (Vision & Projection)
  // Process: Experience → Expression → Expansion
  1: {
    house: 1,
    element: 'fire',
    facetNumber: 1,
    stage: 'vector',
    label: 'I Am / Vision / Identity',
    description: 'Self-Awareness & Identity - Experience',
    brainRegion: 'Right Prefrontal Cortex',
    consciousnessFunction: 'Generates compelling vision for the future',
  },
  5: {
    house: 5,
    element: 'fire',
    facetNumber: 2,
    stage: 'circle',
    label: 'Self-Expression / Creation',
    description: 'Creative Expression & Passion - Expression',
    brainRegion: 'Right Prefrontal Cortex',
    consciousnessFunction: 'Expresses vision through creative passion',
  },
  9: {
    house: 9,
    element: 'fire',
    facetNumber: 3,
    stage: 'spiral',
    label: 'Higher Meaning / Quest',
    description: 'Higher Purpose & Expansion - Expansion',
    brainRegion: 'Right Prefrontal Cortex',
    consciousnessFunction: 'Expands vision into spiritual fulfillment',
  },

  // 💧 WATER PATHWAY - Right Hemisphere (Introspection & Depth)
  // Process: Heart → Healing → Holiness
  4: {
    house: 4,
    element: 'water',
    facetNumber: 1,
    stage: 'vector',
    label: 'Inner Child / Ancestry',
    description: 'Emotional Intelligence & Inner Stability - Heart',
    brainRegion: 'Right Hemisphere',
    consciousnessFunction: 'Reflects depth and fluidity of inner self',
  },
  8: {
    house: 8,
    element: 'water',
    facetNumber: 2,
    stage: 'circle',
    label: 'Shadow / Rebirth',
    description: 'Shadow Work & Power Mastery - Healing',
    brainRegion: 'Right Hemisphere',
    consciousnessFunction: 'Uncovers deepest truths through transformation',
  },
  12: {
    house: 12,
    element: 'water',
    facetNumber: 3,
    stage: 'spiral',
    label: 'Dream / Mystic / Transcendent',
    description: 'Mysticism & Past-Life Karma - Holiness',
    brainRegion: 'Right Hemisphere',
    consciousnessFunction: 'Facilitates internal alignment and spiritual awareness',
  },

  // 🌍 EARTH PATHWAY - Left Hemisphere (Manifestation & Grounding)
  // Process: Mission → Means → Medicine
  10: {
    house: 10,
    element: 'earth',
    facetNumber: 1,
    stage: 'vector',
    label: 'Mission / Purpose',
    description: 'Career, Authority & Life Mission - Mission',
    brainRegion: 'Left Hemisphere',
    consciousnessFunction: 'Grounds visions into tangible reality',
  },
  2: {
    house: 2,
    element: 'earth',
    facetNumber: 2,
    stage: 'circle',
    label: 'Resources / Value',
    description: 'Resources & Material Stability - Means',
    brainRegion: 'Left Hemisphere',
    consciousnessFunction: 'Shapes passions into concrete plans',
  },
  6: {
    house: 6,
    element: 'earth',
    facetNumber: 3,
    stage: 'spiral',
    label: 'Structure / Service',
    description: 'Health & Disciplined Growth - Medicine',
    brainRegion: 'Left Hemisphere',
    consciousnessFunction: 'Nurtures the mission through discipline',
  },

  // 🌬 AIR PATHWAY - Left Prefrontal Cortex (Communication & Connection)
  // Process: Connection → Community → Consciousness
  7: {
    house: 7,
    element: 'air',
    facetNumber: 1,
    stage: 'vector',
    label: 'Mirror / Relationships',
    description: 'Relationships & Balance - Connection',
    brainRegion: 'Left Prefrontal Cortex',
    consciousnessFunction: 'Involved in communication and relationships',
  },
  11: {
    house: 11,
    element: 'air',
    facetNumber: 2,
    stage: 'circle',
    label: 'Tribe / Visionary Network',
    description: 'Social Influence & Collective Impact - Community',
    brainRegion: 'Left Prefrontal Cortex',
    consciousnessFunction: 'Builds cooperative communities',
  },
  3: {
    house: 3,
    element: 'air',
    facetNumber: 3,
    stage: 'spiral',
    label: 'Mind / Messaging',
    description: 'Communication & Learning - Consciousness',
    brainRegion: 'Left Prefrontal Cortex',
    consciousnessFunction: 'Transforms experience into clear intelligence',
  },
};

/**
 * Get Spiralogic facet information for a given house
 */
export function getSpiralogicFacet(house: number): SpiralogicFacet | undefined {
  return SPIRALOGIC_FACETS[house];
}

/**
 * Get all facets for a given element
 */
export function getFacetsByElement(element: SpiralogicElement): SpiralogicFacet[] {
  return Object.values(SPIRALOGIC_FACETS).filter(facet => facet.element === element);
}

/**
 * Get element emoji
 */
export function getElementEmoji(element: SpiralogicElement): string {
  const emojis: Record<SpiralogicElement, string> = {
    fire: '🔥',
    water: '💧',
    earth: '🌍',
    air: '🌬',
    aether: '🜃',
  };
  return emojis[element];
}

/**
 * Get element name with proper capitalization
 */
export function getElementName(element: SpiralogicElement): string {
  return element.charAt(0).toUpperCase() + element.slice(1);
}

/**
 * 12-Facet Elemental Combinations for Aspects
 * Shows which consciousness facets are activated when elements interact
 */
export const ELEMENTAL_FACET_COMBINATIONS: Record<string, {
  facetName: string;
  description: string;
}> = {
  'fire-air': {
    facetName: 'Vision',
    description: 'The ability to create and articulate a compelling vision (Passion + Clarity)',
  },
  'fire-aether': {
    facetName: 'Intuition',
    description: 'Harnessing intuitive insights to guide decisions (Insight + Higher Consciousness)',
  },
  'fire-water': {
    facetName: 'Creativity',
    description: 'Using creative energy to inspire and innovate (Spark + Emotional Fluidity)',
  },
  'water-aether': {
    facetName: 'Emotional Intelligence',
    description: 'Understanding and managing emotions (Depth + Spiritual Awareness)',
  },
  'water-earth': {
    facetName: 'Resilience',
    description: 'The capacity to recover from difficulties (Flexibility + Stability)',
  },
  'water-air': {
    facetName: 'Compassion',
    description: 'Demonstrating understanding and kindness (Empathy + Communication)',
  },
  'earth-fire': {
    facetName: 'Grounded Authority',
    description: 'The ability to lead with confidence and stability (Grounding + Charisma)',
  },
  'earth-air': {
    facetName: 'Presence',
    description: 'Maintaining a strong, grounded presence (Physical Stability + Relational Clarity)',
  },
  'earth-aether': {
    facetName: 'Practical Wisdom',
    description: 'Applying spiritual insights practically (Practicality + Spiritual Guidance)',
  },
  'air-water': {
    facetName: 'Connection',
    description: 'Building strong interpersonal relationships (Intellectual Engagement + Emotional Connectivity)',
  },
  'air-aether': {
    facetName: 'Strategic Communication',
    description: 'Enhancing clarity in conveying ideas (Clear Communication + Higher Purpose)',
  },
  'earth-aether': {
    facetName: 'Unity and Purpose',
    description: 'Creating collective purpose and interconnectedness (Spiritual Connection + Practical Grounding)',
  },
};

/**
 * Get the consciousness facet activated by two elements interacting
 */
export function getElementalFacet(element1: SpiralogicElement, element2: SpiralogicElement) {
  // Normalize order (alphabetical) for lookup
  const key = [element1, element2].sort().join('-');
  return ELEMENTAL_FACET_COMBINATIONS[key];
}

/**
 * Planetary Archetypes as Inner Guides
 */
export const PLANETARY_ARCHETYPES: Record<string, {
  name: string;
  archetype: string;
  description: string;
}> = {
  sun: {
    name: 'Sun',
    archetype: 'The Core Self & Vital Force',
    description: 'The essential identity, life purpose, and creative power',
  },
  moon: {
    name: 'Moon',
    archetype: 'The Emotional Body & Subconscious Memory',
    description: 'Emotional needs, instincts, and unconscious patterns',
  },
  mercury: {
    name: 'Mercury',
    archetype: 'The Messenger & Mental Process',
    description: 'Communication, thinking, and how we process information',
  },
  venus: {
    name: 'Venus',
    archetype: 'The Harmonizer & Relational Self',
    description: 'Love, beauty, values, and how we relate to others',
  },
  mars: {
    name: 'Mars',
    archetype: 'The Warrior & Action-Taker',
    description: 'Drive, courage, assertion, and how we pursue desires',
  },
  jupiter: {
    name: 'Jupiter',
    archetype: 'The Teacher & Expander',
    description: 'Growth, wisdom, faith, and expansion of consciousness',
  },
  saturn: {
    name: 'Saturn',
    archetype: 'The Mastery Guide & Karmic Teacher',
    description: 'Structure, discipline, karmic lessons, and mastery through time',
  },
  uranus: {
    name: 'Uranus',
    archetype: 'The Awakener & Revolutionary',
    description: 'Innovation, liberation, sudden insights, and paradigm shifts',
  },
  neptune: {
    name: 'Neptune',
    archetype: 'The Mystic & Dream-Weaver',
    description: 'Spirituality, imagination, transcendence, and dissolution of boundaries',
  },
  pluto: {
    name: 'Pluto',
    archetype: 'The Alchemist & Transformational Guide',
    description: 'Deep transformation, power, death/rebirth, and shadow integration',
  },
  northNode: {
    name: 'North Node',
    archetype: 'The Evolutionary Goal',
    description: 'Soul purpose and direction of growth in this lifetime',
  },
  southNode: {
    name: 'South Node',
    archetype: 'The Past-Life Mastery',
    description: 'Gifts from the past and patterns to release',
  },
  chiron: {
    name: 'Chiron',
    archetype: 'The Wounded Healer',
    description: 'Core wounds that become sources of healing wisdom',
  },
};

/**
 * Get planetary archetype information
 */
export function getPlanetaryArchetype(planet: string) {
  return PLANETARY_ARCHETYPES[planet.toLowerCase()];
}
