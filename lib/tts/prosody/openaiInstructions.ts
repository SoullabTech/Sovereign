/**
 * OpenAI TTS Instructions — maps MAIA style presets to gpt-4o-mini-tts instructions.
 *
 * OpenAI TTS is not just "text → voice." It's instruction-guided speech synthesis:
 *   - The `instructions` field controls tone, emotion, pacing, emphasis
 *   - It uses a language model, so it understands semantic meaning
 *   - It generates context-aware prosody when properly directed
 *
 * This module is the "Speech Director" — it tells OpenAI TTS *how* to speak,
 * not just *what* to speak. Same style presets as the Kokoro adapter, but
 * expressed as natural-language instructions instead of speed/pause params.
 *
 * Architecture:
 *   StylePreset + Element + Context → instructions string → gpt-4o-mini-tts
 *
 * See: docs/maia-voice-spec-v1.md
 */

import type { Element } from '@/lib/types/voiceIntent';
import type { StylePreset } from '@/lib/voice/stylePresets';

// ── Core MAIA Voice Identity (always present) ────────────────────────────────

const MAIA_IDENTITY_INSTRUCTION = `Speak naturally as a warm, intelligent companion. Clear and grounded. Vary emphasis and pacing with the meaning — let important phrases land, let lighter ones move.`;

// ── Style Preset → Instruction Templates ─────────────────────────────────────
// IMPORTANT: Keep these SHORT. gpt-4o-mini-tts over-complies with long instructions
// and sounds sedated. One or two lines max per preset.

const PRESET_INSTRUCTIONS: Record<StylePreset, string> = {
  grounded_reflective: `Calm and clear. Natural conversational pace. Warm but not soft.`,

  quiet_containing: `Steady and present. Slightly slower. Not whispery — just calm.`,

  clear_direct: `Direct and clear. Normal pace. Confident without being sharp.`,

  shadow_depth: `Quieter, more spacious. Let the words carry their own weight.`,

  mentor_firm: `Firm and clear. Respectful directness. No softening.`,

  ritual_spacious: `Unhurried. Simple. Let silence do its work.`,
};

// ── Element Overlays ─────────────────────────────────────────────────────────
// Subtle element-specific voice coloring, appended to preset instructions.

const ELEMENT_OVERLAY: Record<Element, string> = {
  fire:   '',  // Let preset handle it — less is more with gpt-4o-mini-tts
  water:  '',
  earth:  '',
  air:    '',
  aether: '',
};

// ── Context Overlays ─────────────────────────────────────────────────────────

function getContextOverlay(_opts?: {
  isFirstResponse?: boolean;
  isAfterInterruption?: boolean;
  emotionalTone?: string;
}): string {
  // DISABLED: context overlays were over-directing gpt-4o-mini-tts.
  // The model interprets stacked instructions as "be MORE of all of this"
  // which produces a sedated, over-careful delivery.
  // Keep instructions minimal — identity + one preset line is enough.
  return '';
}

// ── Main Export ──────────────────────────────────────────────────────────────

export interface OpenAIInstructionsInput {
  /** Resolved style preset */
  preset: StylePreset;
  /** Current Spiralogic element (optional) */
  element?: Element;
  /** First response in session? */
  isFirstResponse?: boolean;
  /** After user interruption? */
  isAfterInterruption?: boolean;
  /** Detected emotional tone */
  emotionalTone?: string;
}

/**
 * Generate OpenAI TTS `instructions` string from MAIA style preset + context.
 *
 * Returns a complete instruction that includes:
 *   1. MAIA voice identity (always)
 *   2. Style preset delivery instructions
 *   3. Element overlay (if available)
 *   4. Context-specific adjustments
 *
 * Pass this as the `instructions` field to gpt-4o-mini-tts.
 */
export function buildOpenAIInstructions(input: OpenAIInstructionsInput): string {
  const parts: string[] = [
    MAIA_IDENTITY_INSTRUCTION,
    '',
    PRESET_INSTRUCTIONS[input.preset] || PRESET_INSTRUCTIONS.grounded_reflective,
  ];

  if (input.element) {
    parts.push('');
    parts.push(ELEMENT_OVERLAY[input.element]);
  }

  const contextOverlay = getContextOverlay({
    isFirstResponse: input.isFirstResponse,
    isAfterInterruption: input.isAfterInterruption,
    emotionalTone: input.emotionalTone,
  });

  if (contextOverlay) {
    parts.push('');
    parts.push(contextOverlay);
  }

  return parts.join('\n').trim();
}

/**
 * Quick helper: get instructions for a preset without full context.
 */
export function getPresetInstructions(preset: StylePreset): string {
  return buildOpenAIInstructions({ preset });
}
