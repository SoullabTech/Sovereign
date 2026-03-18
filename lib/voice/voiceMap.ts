/**
 * Voice Map — elemental state to concrete voice selection.
 *
 * This is Bridge B: the element determines the voice.
 * The Conductor provides the element via VoiceIntent.
 * This map translates element to provider-specific voice IDs.
 */

import type { Element } from '@/lib/types/voiceIntent';

// Kokoro voices (local, sovereign)
export type KokoroVoice = 'af_kore' | 'af_heart' | 'af_bella' | 'af_sarah' | 'am_adam' | 'am_michael';

// OpenAI voices (cloud fallback)
export type OpenAIVoice = 'alloy' | 'nova' | 'shimmer' | 'fable' | 'echo' | 'onyx';

/**
 * Element → Kokoro voice (local-first, sovereign)
 * Default (earth/aether) maps to af_kore — MAIA's primary voice.
 */
export const ELEMENT_TO_KOKORO: Record<Element, KokoroVoice> = {
  earth: 'af_kore',     // Primary MAIA voice, grounded
  fire: 'af_bella',     // Clear, catalytic
  water: 'af_sarah',    // Neutral, holding
  air: 'af_bella',      // Clear, articulate
  aether: 'af_kore',    // Primary MAIA voice, integrative
};

/**
 * Element → OpenAI voice (cloud fallback)
 */
export const ELEMENT_TO_OPENAI: Record<Element, OpenAIVoice> = {
  earth: 'alloy',       // Neutral, balanced
  fire: 'nova',         // Upbeat, energetic
  water: 'shimmer',     // Warm, empathetic
  air: 'fable',         // Expressive, articulate
  aether: 'shimmer',    // Warm, spacious
};

/**
 * Resolve Kokoro voice from element
 */
export function resolveKokoroVoice(element: Element): KokoroVoice {
  return ELEMENT_TO_KOKORO[element] || 'af_kore';
}

/**
 * Resolve OpenAI voice from element
 */
export function resolveOpenAIVoice(element: Element): OpenAIVoice {
  return ELEMENT_TO_OPENAI[element] || 'shimmer';
}

// Speed guardrails — keep the body from mood-swinging
const SPEED_MIN = 0.94;
const SPEED_MAX = 1.06;

function clampSpeed(speed: number): number {
  return Math.max(SPEED_MIN, Math.min(SPEED_MAX, speed));
}

/**
 * Resolve speed from element + optional member preference.
 * All outputs clamped to [0.94, 1.06] — subtle, not theatrical.
 */
export function resolveSpeed(element: Element, requested?: number): number {
  // Member preference takes precedence if valid, but still clamped
  if (typeof requested === 'number' && Number.isFinite(requested)) {
    return clampSpeed(requested);
  }

  // Elemental defaults (already within clamp range)
  const defaults: Record<Element, number> = {
    earth: 0.95,   // Grounded, slightly slower
    fire: 1.05,    // Catalytic, slightly faster
    water: 0.98,   // Flowing, natural
    air: 1.02,     // Clear, slightly lifted
    aether: 1.0,   // Centered, balanced
  };

  return clampSpeed(defaults[element] || 1.0);
}
