/**
 * Voice Types — Sovereign prosody control
 *
 * MAIA decides prosody intent (semantic hints).
 * TTS adapter renders (translates hints to provider-specific controls).
 * No external model decides delivery — MAIA stays sovereign.
 */

// ═══════════════════════════════════════════════════════════════════════════
// RANGE OF EFFECT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Range of Effect — scales delivery intensity without changing words.
 * 0 = Neutral (minimal shaping)
 * 1 = Subtle (light pacing, neutral warmth)
 * 2 = Expressive (conversational pauses, selective emphasis)
 * 3 = Deep (clear cadence, gravity when appropriate)
 * 4 = Ceremonial (slower pace, longer rests, pronounced emphasis)
 */
export type ProsodyRange = 0 | 1 | 2 | 3 | 4;

export const PROSODY_RANGE_LABELS: Record<ProsodyRange, string> = {
  0: 'Neutral',
  1: 'Subtle',
  2: 'Expressive',
  3: 'Deep',
  4: 'Ceremonial',
};

// ═══════════════════════════════════════════════════════════════════════════
// VOICE SETTINGS (frontend → backend)
// ═══════════════════════════════════════════════════════════════════════════

export interface VoiceSettings {
  /** OpenAI voice ID (e.g., "alloy", "nova", "shimmer") */
  voice?: string;
  /** Base TTS speed (before range scaling), 0.25-4.0 */
  speed?: number;
  /** TTS model quality */
  model?: 'tts-1' | 'tts-1-hd';
  /** MAIA voice mode */
  mode?: 'talk' | 'care' | 'note';
  /** Sanctuary mode (no memory) */
  sanctuary?: boolean;
  /** Range of Effect (0-4) — scales prosody intensity */
  range?: ProsodyRange;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROSODY HINTS (semantic intent — MAIA decides)
// ═══════════════════════════════════════════════════════════════════════════

export type ProsodyEnergy = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
export type ProsodyWarmth = 'cool' | 'neutral' | 'warm' | 'very_warm';
export type ProsodyPace = 'slow' | 'steady' | 'brisk';
export type ProsodyClarity = 'soft' | 'clear' | 'crisp';
export type ProsodyEmphasis = 'minimal' | 'selective' | 'strong';
export type ProsodyIntentTag = 'regulate' | 'attune' | 'encourage' | 'instruct' | 'ritual' | 'play';

/**
 * Prosody Hints — semantic delivery intent from MAIA's relational stack.
 * These are WHAT MAIA wants, not HOW to achieve it (that's the adapter's job).
 */
export interface ProsodyHints {
  /** Energy level — maps from activation */
  energy: ProsodyEnergy;

  /** Warmth — maps from posture + sanctuary */
  warmth: ProsodyWarmth;

  /** Pace — maps from brevity + mode */
  pace: ProsodyPace;

  /** Clarity — maps from "teach/explain" vs "soothe" */
  clarity: ProsodyClarity;

  /** Emphasis — maps from "directive" vs "reflective" */
  emphasis: ProsodyEmphasis;

  /** Micro-timing for pauses */
  pauseMs?: {
    beforeSentence?: number;
    afterSentence?: number;
  };

  /** Intent tag for special delivery modes */
  intentTag?: ProsodyIntentTag;

  /** Whether SSML is allowed (for engines that support it) */
  ssmlOk?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// RELATIONAL CONTEXT (for building hints)
// ═══════════════════════════════════════════════════════════════════════════

export interface ProsodyContext {
  /** Activation level 0-1 */
  activation: number;
  /** MAIA archetype mode */
  mode: string;
  /** Sanctuary mode active */
  sanctuary: boolean;
  /** Brevity guidance */
  brevity: 'brief' | 'moderate' | 'expansive';
  /** Relational posture */
  posture: string;
  /** Element context (optional) */
  element?: string | null;
}
