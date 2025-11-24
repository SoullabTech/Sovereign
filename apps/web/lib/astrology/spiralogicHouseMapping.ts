/**
 * SPIRALOGIC HOUSE MAPPING
 *
 * Maps the 12 houses to Spiralogic's Elemental Framework
 * Each element flows through Vector → Circle → Spiral across 3 houses
 */

export interface SpiralogicHouseData {
  element: 'fire' | 'water' | 'earth' | 'air';
  phase: 'vector' | 'circle' | 'spiral';
  phaseLabel: string;
  facet: string;
  lesson: string;
}

export const SPIRALOGIC_HOUSE_MAPPING: Record<number, SpiralogicHouseData> = {
  // FIRE: Vision, Activation, and Willpower
  1: {
    element: 'fire',
    phase: 'vector',
    phaseLabel: 'Intelligence',
    facet: 'Self-Awareness',
    lesson: 'Self-awareness and how you initiate action.',
  },
  5: {
    element: 'fire',
    phase: 'circle',
    phaseLabel: 'Intention',
    facet: 'Expression in the World',
    lesson: 'Passion, artistry, and personal joy.',
  },
  9: {
    element: 'fire',
    phase: 'spiral',
    phaseLabel: 'Goal',
    facet: 'Transcendent Will',
    lesson: 'Expanding wisdom and visionary leadership.',
  },

  // WATER: Emotional Depth, Healing, and Flow
  4: {
    element: 'water',
    phase: 'vector',
    phaseLabel: 'Intelligence',
    facet: 'Emotional Intelligence',
    lesson: 'Deep-rooted emotional cycles and inner foundation.',
  },
  8: {
    element: 'water',
    phase: 'circle',
    phaseLabel: 'Intention',
    facet: 'Death and Rebirth',
    lesson: 'Personal power, shared resources, and shadow work.',
  },
  12: {
    element: 'water',
    phase: 'spiral',
    phaseLabel: 'Goal',
    facet: 'Soul Depth',
    lesson: 'Past-life wisdom and spiritual healing.',
  },

  // EARTH: Stability, Manifestation, and Purpose
  10: {
    element: 'earth',
    phase: 'vector',
    phaseLabel: 'Intelligence',
    facet: 'Purpose and Mission',
    lesson: 'Public identity, long-term goals, and leadership.',
  },
  2: {
    element: 'earth',
    phase: 'circle',
    phaseLabel: 'Intention',
    facet: 'Resources and Plans',
    lesson: 'Financial security, values, and stability.',
  },
  6: {
    element: 'earth',
    phase: 'spiral',
    phaseLabel: 'Goal',
    facet: 'Endurance and Cycles',
    lesson: 'Building sustainable habits and resilience.',
  },

  // AIR: Thought, Communication, and Connection
  7: {
    element: 'air',
    phase: 'vector',
    phaseLabel: 'Intelligence',
    facet: 'Clarity and Focus',
    lesson: 'How partnerships shape self-growth.',
  },
  11: {
    element: 'air',
    phase: 'circle',
    phaseLabel: 'Intention',
    facet: 'Relationships and Dynamics',
    lesson: 'Your role in the greater human tapestry.',
  },
  3: {
    element: 'air',
    phase: 'spiral',
    phaseLabel: 'Goal',
    facet: 'Elevated Systems',
    lesson: 'Communication, learning, and mental agility.',
  },
};

/**
 * Get Spiralogic house data for a house number
 */
export function getSpiralogicHouseData(house: number): SpiralogicHouseData | undefined {
  return SPIRALOGIC_HOUSE_MAPPING[house];
}

/**
 * Generate a planet description using Spiralogic framework
 */
export function getSpiralogicPlanetDescription(house: number): string {
  const houseData = SPIRALOGIC_HOUSE_MAPPING[house];
  if (!houseData) return '';

  return `${houseData.facet} (${houseData.phase.charAt(0).toUpperCase() + houseData.phase.slice(1)}: ${houseData.phaseLabel})`;
}
