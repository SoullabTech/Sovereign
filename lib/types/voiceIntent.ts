/**
 * VoiceIntent — the single object that flows from Conductor to all voice layers.
 *
 * Only the Conductor creates this. Downstream layers consume it.
 * This is the architectural enforcement of Sovereignty Invariant 8:
 * "All layers may suggest. Only the Conductor decides relational stance."
 */

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export type VoiceArchetype = 'guide' | 'oracle' | 'companion';

export interface VoiceIntent {
  element: Element;
  phase: number;
  intensity?: number;
  motion?: 'ascending' | 'stuck' | 'breakthrough';
  archetype?: VoiceArchetype;

  // Member-adjustable synthesis preferences
  speed?: number;
  timbre?: 'soft' | 'neutral' | 'bright' | 'warm' | 'deep';
}
