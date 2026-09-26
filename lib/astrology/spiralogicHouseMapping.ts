/**
 * SPIRALOGIC HOUSE MAPPING
 *
 * Maps the 12 houses to Spiralogic's Elemental Framework
 * Each element flows through Vector → Circle → Spiral across 3 houses
 *
 * Finding 6 RULED (Kelly, 2026-07-10): vector/circle/spiral is the
 * interpretive layer's modality-keyed display vocabulary, defined ONCE in
 * lib/spiralogic/interpretation (PHASE_DISPLAY_NAMES). This table consumes
 * that mapping via each house's pathway position; it no longer hardcodes
 * the words per house. The field is `stage`, not `phase` — "phase" is
 * reserved for the registration grammar's numeric {1,2,3} (INV-4; the
 * Finding 6 rename is load-bearing).
 */

import { PHASE_DISPLAY_NAMES, type PhaseDisplayName } from '@/lib/spiralogic/interpretation';

export interface SpiralogicHouseData {
  element: 'fire' | 'water' | 'earth' | 'air';
  stage: PhaseDisplayName;
  stageLabel: string;
  facet: string;
  lesson: string;
}

export const SPIRALOGIC_HOUSE_MAPPING: Record<number, SpiralogicHouseData> = {
  // FIRE: Vision, Activation, and Willpower
  1: {
    element: 'fire',
    stage: PHASE_DISPLAY_NAMES[1],
    stageLabel: 'Intelligence',
    facet: 'Self-Awareness',
    lesson: 'Self-awareness and how you initiate action.',
  },
  5: {
    element: 'fire',
    stage: PHASE_DISPLAY_NAMES[2],
    stageLabel: 'Intention',
    facet: 'Expression in the World',
    lesson: 'Passion, artistry, and personal joy.',
  },
  9: {
    element: 'fire',
    stage: PHASE_DISPLAY_NAMES[3],
    stageLabel: 'Goal',
    facet: 'Transcendent Will',
    lesson: 'Expanding wisdom and visionary leadership.',
  },

  // WATER: Emotional Depth, Healing, and Flow
  4: {
    element: 'water',
    stage: PHASE_DISPLAY_NAMES[1],
    stageLabel: 'Intelligence',
    facet: 'Emotional Intelligence',
    lesson: 'Deep-rooted emotional cycles and inner foundation.',
  },
  8: {
    element: 'water',
    stage: PHASE_DISPLAY_NAMES[2],
    stageLabel: 'Intention',
    facet: 'Death and Rebirth',
    lesson: 'Personal power, shared resources, and shadow work.',
  },
  12: {
    element: 'water',
    stage: PHASE_DISPLAY_NAMES[3],
    stageLabel: 'Goal',
    facet: 'Soul Depth',
    lesson: 'Past-life wisdom and spiritual healing.',
  },

  // EARTH: Stability, Manifestation, and Purpose
  10: {
    element: 'earth',
    stage: PHASE_DISPLAY_NAMES[1],
    stageLabel: 'Intelligence',
    facet: 'Purpose and Mission',
    lesson: 'Public identity, long-term goals, and leadership.',
  },
  2: {
    element: 'earth',
    stage: PHASE_DISPLAY_NAMES[2],
    stageLabel: 'Intention',
    facet: 'Resources and Plans',
    lesson: 'Financial security, values, and stability.',
  },
  6: {
    element: 'earth',
    stage: PHASE_DISPLAY_NAMES[3],
    stageLabel: 'Goal',
    facet: 'Endurance and Cycles',
    lesson: 'Building sustainable habits and resilience.',
  },

  // AIR: Thought, Communication, and Connection
  7: {
    element: 'air',
    stage: PHASE_DISPLAY_NAMES[1],
    stageLabel: 'Intelligence',
    facet: 'Clarity and Focus',
    lesson: 'How partnerships shape self-growth.',
  },
  11: {
    element: 'air',
    stage: PHASE_DISPLAY_NAMES[2],
    stageLabel: 'Intention',
    facet: 'Relationships and Dynamics',
    lesson: 'Your role in the greater human tapestry.',
  },
  3: {
    element: 'air',
    stage: PHASE_DISPLAY_NAMES[3],
    stageLabel: 'Goal',
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

  return `${houseData.facet} (${houseData.stage.charAt(0).toUpperCase() + houseData.stage.slice(1)}: ${houseData.stageLabel})`;
}
