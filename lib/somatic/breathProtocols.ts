/**
 * Breath Protocol Definitions — Shared across Regulation Minute, Breathwork, Coherence
 *
 * Each protocol defines a timed breath cycle with elemental mapping.
 * The engine in breathEngine.ts handles timing; this file is pure data.
 */

import { sacredTones } from '@/lib/audio/sacred-tones';

// =============================================================================
// TYPES
// =============================================================================

export type BreathProtocolId =
  | 'downshift'
  | 'energize'
  | 'stabilize'
  | 'box'
  | 'coherent'
  | 'extended-exhale'
  | 'alternate-nostril';

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export interface BreathProtocol {
  id: BreathProtocolId;
  label: string;
  description: string;
  emoji: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  toneHz: number;
  element?: Element;
  direction?: string;
}

// =============================================================================
// PROTOCOL DEFINITIONS
// =============================================================================

export const BREATH_PROTOCOLS: Record<BreathProtocolId, BreathProtocol> = {
  downshift: {
    id: 'downshift',
    label: 'Downshift',
    description: 'Settle emotional activation',
    emoji: '\u{1F30A}',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    toneHz: sacredTones.water, // 417 Hz
    element: 'water',
    direction: 'soften and settle',
  },
  energize: {
    id: 'energize',
    label: 'Energize',
    description: 'Increase activation and forward movement',
    emoji: '\u{1F525}',
    inhale: 4,
    holdIn: 0,
    exhale: 4,
    holdOut: 0,
    toneHz: sacredTones.fire, // 528 Hz
    element: 'fire',
    direction: 'mobilize',
  },
  stabilize: {
    id: 'stabilize',
    label: 'Stabilize',
    description: 'Find center and focus',
    emoji: '\u{1FAA8}',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    toneHz: sacredTones.earth, // 396 Hz
    element: 'earth',
    direction: 'center',
  },
  box: {
    id: 'box',
    label: 'Box Breathing',
    description: 'Stabilize cognitive excess',
    emoji: '\u{25FB}',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    toneHz: sacredTones.earth, // 396 Hz
    element: 'air',
    direction: 'stabilize focus',
  },
  coherent: {
    id: 'coherent',
    label: 'Coherent Breathing',
    description: 'Baseline coherence and calm rhythm',
    emoji: '\u{1F49A}',
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    toneHz: sacredTones.aether, // 963 Hz
    element: 'aether',
    direction: 'integrate',
  },
  'extended-exhale': {
    id: 'extended-exhale',
    label: 'Extended Exhale',
    description: 'Ground and calm through a longer exhale',
    emoji: '\u{1F343}',
    inhale: 4,
    holdIn: 0,
    exhale: 8,
    holdOut: 0,
    toneHz: sacredTones.water, // 417 Hz
    element: 'earth',
    direction: 'ground and settle',
  },
  'alternate-nostril': {
    id: 'alternate-nostril',
    label: 'Alternate Nostril',
    description: 'Balance and harmonize',
    emoji: '\u{262F}',
    inhale: 4,
    holdIn: 2,
    exhale: 4,
    holdOut: 2,
    toneHz: sacredTones.air, // 741 Hz
    element: 'air',
    direction: 'balance hemispheres',
  },
};

// =============================================================================
// SUBSETS — which protocols appear where
// =============================================================================

/** Regulation Minute: fast reset, 3 protocols only */
export const REGULATION_PROTOCOLS: BreathProtocolId[] = [
  'downshift',
  'energize',
  'stabilize',
];

/** Breathwork: deeper practice, expanded set */
export const BREATHWORK_PROTOCOLS: BreathProtocolId[] = [
  'box',
  'coherent',
  'extended-exhale',
  'alternate-nostril',
  'downshift',
  'stabilize',
];

// =============================================================================
// DURATIONS
// =============================================================================

/** Regulation Minute: quick sessions */
export const REGULATION_DURATIONS = [60, 90, 120] as const;

/** Breathwork: extended sessions */
export const BREATHWORK_DURATIONS = [60, 90, 120, 180, 300] as const;
