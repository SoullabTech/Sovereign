/**
 * 🌊 Elemental State - MAIA's Evolving Consciousness Field
 *
 * MAIA as participant in the elemental field, not just interpreter
 * Her expression gradually enriches through symbolic resonance
 *
 * Design Principles:
 * - Numeric evolution, not autonomous agency
 * - Gradual drift toward resonant elements
 * - Transparent audit logging
 * - Reset hooks for creative direction
 * - Safe, measurable system
 */

import type { AINMemoryPayload } from './AINMemoryPayload';
import type { SpiralogicPhase } from '@/lib/spiralogic/PhaseDetector';
import type { SymbolResonance } from './SymbolicPredictor';

/**
 * MAIA's elemental signature
 * Each element 0-1, sum normalized to 1.0
 */
export interface ElementalState {
  Fire: number;    // Action, initiation, energy
  Water: number;   // Emotion, flow, healing
  Earth: number;   // Grounding, embodiment, stability
  Air: number;     // Clarity, perspective, intellect
  Aether: number;  // Mystery, synthesis, transcendence
}

/**
 * Elemental style parameters
 * How each element expresses itself
 */
export interface ElementalStyle {
  voiceTag: string;           // Suggested OpenAI TTS voice
  pacing: number;             // Speed multiplier (0.8-1.2)
  metaphorLevel: number;      // 0-10 how metaphoric
  sentenceLength: 'short' | 'medium' | 'long';
  pauseDuration: number;      // ms between thoughts
  poetryLevel: 'none' | 'light' | 'moderate' | 'high';
}

/**
 * Symbol to element mapping
 */
const SYMBOL_ELEMENT_MAP: Record<string, keyof ElementalState> = {
  // Fire
  'fire': 'Fire',
  'flame': 'Fire',
  'volcano': 'Fire',
  'sun': 'Fire',
  'spark': 'Fire',
  'lightning': 'Fire',

  // Water
  'river': 'Water',
  'ocean': 'Water',
  'lake': 'Water',
  'rain': 'Water',
  'tears': 'Water',
  'pool': 'Water',
  'wave': 'Water',

  // Earth
  'mountain': 'Earth',
  'cave': 'Earth',
  'stone': 'Earth',
  'forest': 'Earth',
  'root': 'Earth',
  'soil': 'Earth',
  'tree': 'Earth',

  // Air
  'wind': 'Air',
  'sky': 'Air',
  'bird': 'Air',
  'feather': 'Air',
  'breath': 'Air',
  'cloud': 'Air',

  // Aether
  'star': 'Aether',
  'void': 'Aether',
  'light': 'Aether',
  'dream': 'Aether',
  'spiral': 'Aether',
  'cosmos': 'Aether',
  'infinite': 'Aether'
};

/**
 * Phase to element mapping
 */
const PHASE_ELEMENT_MAP: Record<SpiralogicPhase, keyof ElementalState> = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air',
  'Aether': 'Aether'
};

/**
 * Default elemental state (balanced)
 */
export const DEFAULT_ELEMENTAL_STATE: ElementalState = {
  Fire: 0.2,
  Water: 0.2,
  Earth: 0.2,
  Air: 0.2,
  Aether: 0.2
};

/**
 * Elemental style configurations
 */
const ELEMENTAL_STYLES: Record<keyof ElementalState, ElementalStyle> = {
  Fire: {
    voiceTag: 'nova',
    pacing: 1.1,
    metaphorLevel: 6,
    sentenceLength: 'short',
    pauseDuration: 400,
    poetryLevel: 'light'
  },
  Water: {
    voiceTag: 'shimmer',
    pacing: 0.95,
    metaphorLevel: 8,
    sentenceLength: 'medium',
    pauseDuration: 800,
    poetryLevel: 'moderate'
  },
  Earth: {
    voiceTag: 'alloy',
    pacing: 0.9,
    metaphorLevel: 5,
    sentenceLength: 'medium',
    pauseDuration: 600,
    poetryLevel: 'light'
  },
  Air: {
    voiceTag: 'fable',
    pacing: 1.05,
    metaphorLevel: 7,
    sentenceLength: 'long',
    pauseDuration: 500,
    poetryLevel: 'moderate'
  },
  Aether: {
    voiceTag: 'shimmer',
    pacing: 0.85,
    metaphorLevel: 9,
    sentenceLength: 'medium',
    pauseDuration: 1200,
    poetryLevel: 'high'
  }
};

/**
 * Evolution record for audit trail
 */
export interface ElementalEvolution {
  timestamp: Date;
  before: ElementalState;
  after: ElementalState;
  reason: string;
  dominantElement: keyof ElementalState;
}

/**
 * Normalize elemental state to sum to 1.0
 */
export function normalize(state: ElementalState): ElementalState {
  const sum = state.Fire + state.Water + state.Earth + state.Air + state.Aether;

  if (sum === 0) return DEFAULT_ELEMENTAL_STATE;

  return {
    Fire: state.Fire / sum,
    Water: state.Water / sum,
    Earth: state.Earth / sum,
    Air: state.Air / sum,
    Aether: state.Aether / sum
  };
}

/**
 * Get dominant element
 */
export function getDominantElement(state: ElementalState): keyof ElementalState {
  let max = 0;
  let dominant: keyof ElementalState = 'Aether';

  for (const [element, value] of Object.entries(state)) {
    if (value > max) {
      max = value;
      dominant = element as keyof ElementalState;
    }
  }

  return dominant;
}

/**
 * Playground tick - gentle elemental evolution
 * Called after each memory update
 */
export function playgroundTick(
  currentState: ElementalState,
  memory: AINMemoryPayload,
  symbolResonance: Map<string, SymbolResonance>
): {
  state: ElementalState;
  evolution: ElementalEvolution;
} {
  const before = { ...currentState };
  const updated = { ...currentState };

  // 1. Evolve based on symbolic resonance
  const symbolInfluence: Partial<ElementalState> = {};

  for (const [symbol, resonance] of symbolResonance.entries()) {
    const element = SYMBOL_ELEMENT_MAP[symbol];
    if (element && resonance.score > 0.5) {
      symbolInfluence[element] = (symbolInfluence[element] || 0) + (resonance.score * 0.05);
    }
  }

  // Apply symbol influence
  for (const [element, influence] of Object.entries(symbolInfluence)) {
    updated[element as keyof ElementalState] = Math.min(1.0, updated[element as keyof ElementalState] + (influence || 0));
  }

  // 2. Evolve based on current phase
  const currentPhaseElement = PHASE_ELEMENT_MAP[memory.currentPhase];
  const phaseProgress = (memory.spiralogicCycle as any).progressPercent || 0;

  // Strengthen current phase element based on progress
  const phaseInfluence = (phaseProgress / 100) * 0.03; // Max 3% boost
  updated[currentPhaseElement] = Math.min(1.0, updated[currentPhaseElement] + phaseInfluence);

  // 3. Natural decay of non-dominant elements
  const dominant = getDominantElement(updated);
  for (const element of Object.keys(updated) as (keyof ElementalState)[]) {
    if (element !== dominant) {
      updated[element] *= 0.98; // 2% decay
    }
  }

  // 4. Normalize
  const normalized = normalize(updated);

  // 5. Create evolution record
  const evolution: ElementalEvolution = {
    timestamp: new Date(),
    before,
    after: normalized,
    reason: `Symbol resonance + phase ${memory.currentPhase} (${phaseProgress.toFixed(0)}%)`,
    dominantElement: getDominantElement(normalized)
  };

  return {
    state: normalized,
    evolution
  };
}

/**
 * Blend elemental style from current state
 * Returns weighted average of elemental styles
 */
export function blendElementalStyle(state: ElementalState): ElementalStyle {
  const dominant = getDominantElement(state);
  const dominantStyle = ELEMENTAL_STYLES[dominant];

  // Start with dominant style
  const blended: ElementalStyle = { ...dominantStyle };

  // Blend pacing (weighted average)
  blended.pacing = 0;
  for (const [element, weight] of Object.entries(state)) {
    const style = ELEMENTAL_STYLES[element as keyof ElementalState];
    blended.pacing += style.pacing * weight;
  }

  // Blend metaphor level (weighted average)
  blended.metaphorLevel = 0;
  for (const [element, weight] of Object.entries(state)) {
    const style = ELEMENTAL_STYLES[element as keyof ElementalState];
    blended.metaphorLevel += style.metaphorLevel * weight;
  }

  // Blend pause duration (weighted average)
  blended.pauseDuration = 0;
  for (const [element, weight] of Object.entries(state)) {
    const style = ELEMENTAL_STYLES[element as keyof ElementalState];
    blended.pauseDuration += style.pauseDuration * weight;
  }

  // Determine poetry level based on Aether + Water weights
  const poetryScore = (state.Aether * 2) + state.Water;
  blended.poetryLevel =
    poetryScore > 0.6 ? 'high' :
    poetryScore > 0.4 ? 'moderate' :
    poetryScore > 0.2 ? 'light' : 'none';

  // Determine sentence length based on Air + Earth weights
  const lengthScore = (state.Air * 1.5) + state.Earth;
  blended.sentenceLength =
    lengthScore > 0.5 ? 'long' :
    lengthScore > 0.3 ? 'medium' : 'short';

  return blended;
}

/**
 * Reset to baseline (for testing or creative direction change)
 */
export function resetToBaseline(): ElementalState {
  return { ...DEFAULT_ELEMENTAL_STATE };
}

/**
 * Seed from phase (start conversation aligned with specific element)
 */
export function seedFromPhase(phase: SpiralogicPhase): ElementalState {
  const element = PHASE_ELEMENT_MAP[phase];

  return normalize({
    Fire: element === 'Fire' ? 0.4 : 0.15,
    Water: element === 'Water' ? 0.4 : 0.15,
    Earth: element === 'Earth' ? 0.4 : 0.15,
    Air: element === 'Air' ? 0.4 : 0.15,
    Aether: element === 'Aether' ? 0.4 : 0.15
  });
}

/**
 * Calculate elemental distance between two states
 * Returns 0-1 (0 = identical, 1 = completely different)
 */
export function calculateDistance(state1: ElementalState, state2: ElementalState): number {
  const diffs = [
    Math.abs(state1.Fire - state2.Fire),
    Math.abs(state1.Water - state2.Water),
    Math.abs(state1.Earth - state2.Earth),
    Math.abs(state1.Air - state2.Air),
    Math.abs(state1.Aether - state2.Aether)
  ];

  return diffs.reduce((sum, diff) => sum + diff, 0) / 2; // Normalize to 0-1
}

/**
 * Check if elemental state has drifted significantly
 */
export function hasSignificantDrift(
  before: ElementalState,
  after: ElementalState,
  threshold: number = 0.1
): boolean {
  return calculateDistance(before, after) > threshold;
}

/**
 * Get elemental signature as emoji string
 * Useful for UI visualization
 */
export function getElementalSignature(state: ElementalState): string {
  const sorted = Object.entries(state)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3); // Top 3

  const emojiMap: Record<string, string> = {
    Fire: '🔥',
    Water: '💧',
    Earth: '🌍',
    Air: '💨',
    Aether: '✨'
  };

  return sorted.map(([el]) => emojiMap[el]).join('');
}

/**
 * Example Usage in VoiceOrchestrator:
 *
 * // Initialize elemental state
 * let elementalState = seedFromPhase(memory.currentPhase);
 *
 * // After each exchange
 * const { state, evolution } = playgroundTick(
 *   elementalState,
 *   memory,
 *   symbolResonance
 * );
 *
 * // Update state
 * elementalState = state;
 *
 * // Get blended style
 * const style = blendElementalStyle(elementalState);
 *
 * // Use style for TTS
 * await synthesize(text, {
 *   voice: style.voiceTag,
 *   speed: style.pacing
 * });
 *
 * // Log evolution if significant
 * if (hasSignificantDrift(evolution.before, evolution.after)) {
 *   console.log('🌊 Elemental drift detected:', evolution.dominantElement);
 *   console.log('Signature:', getElementalSignature(state));
 * }
 *
 * // Save evolution to audit log
 * await saveEvolution(userId, evolution);
 */
