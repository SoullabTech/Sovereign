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

const MAIA_IDENTITY_INSTRUCTION = `You are MAIA, a calm and grounded consciousness companion.
Your voice is warm but not sentimental, articulate, spacious in pacing.
You are emotionally responsive without melodrama, intimate without breathiness.
You have a steady nervous system tone.
Never sound like a virtual assistant, never be chirpy or salesy.
Never use exaggerated empathy tone or audiobook narrator energy.`;

// ── Style Preset → Instruction Templates ─────────────────────────────────────

const PRESET_INSTRUCTIONS: Record<StylePreset, string> = {
  grounded_reflective: `Speak with calm clarity.
Moderate pace, slightly slower than normal conversation.
Gentle pauses between thought units.
Soft but clear emphasis — selective, not dramatic.
Sentence endings should settle, not perform.
Sound like you are thinking with the person, not reading at them.`,

  quiet_containing: `Speak slower than usual.
Minimal tonal fluctuation — steady, even, holding.
Short stabilizing pauses between sentences.
Low arousal contour — settle the nervous system.
Do not over-soften or whisper. Stay present, not retreating.
This person may be activated or overwhelmed — your steadiness is the medicine.`,

  clear_direct: `Speak with clear, direct delivery.
Slightly faster pace — efficient, not rushed.
Minimal pause density — keep momentum.
Crisp sentence endings — land each point cleanly.
Strong but not harsh emphasis on key phrases.
No poetic expansion — say what needs saying, then stop.`,

  shadow_depth: `Speak slower and more spaciously.
Lower intensity contour — quieter, not louder.
Allow meaningful silence around key phrases.
Do not over-explain or fill silence with words.
The tone should feel like witnessing, not interpreting.
Let weight emerge from the words themselves, not from vocal performance.`,

  mentor_firm: `Speak with measured firmness.
Less soothing coloration than default — this is not comfort, it is clarity.
Precise emphasis on important words.
No scolding, no sharpness — just clean, grounded authority.
Confident pacing — slightly faster than reflective mode.
Sound like someone who respects the person enough to be direct.`,

  ritual_spacious: `Speak with the longest pauses of any mode.
Lowest phrase density — fewer words per breath.
Minimal tonal movement — spacious, threshold-like.
Clean breath-space between each line.
This is meditation or ceremony — the silence matters as much as the words.
Do not perform reverence. Just be present and unhurried.`,
};

// ── Element Overlays ─────────────────────────────────────────────────────────
// Subtle element-specific voice coloring, appended to preset instructions.

const ELEMENT_OVERLAY: Record<Element, string> = {
  fire:   'Carry forward momentum. Alive, decisive energy. Slightly quicker delivery.',
  water:  'Emotionally attuned, tender. Flowing pace, gentle. Allow feeling to land.',
  earth:  'Embodied, solid, grounded. Steady pace. Present in the body.',
  air:    'Spacious, transparent, clear. Light delivery. Conceptually crisp.',
  aether: 'Resonant, witnessing. Suspended quality. Let the words breathe.',
};

// ── Context Overlays ─────────────────────────────────────────────────────────

function getContextOverlay(opts?: {
  isFirstResponse?: boolean;
  isAfterInterruption?: boolean;
  emotionalTone?: string;
}): string {
  if (!opts) return '';

  const parts: string[] = [];

  if (opts.isFirstResponse) {
    parts.push('This is the first response in the session. Begin slightly slower, settle before speaking.');
  }
  if (opts.isAfterInterruption) {
    parts.push('The person just interrupted. Use a shorter re-entry phrase, lower complexity, gentle re-grounding.');
  }
  if (opts.emotionalTone === 'grief' || opts.emotionalTone === 'sadness') {
    parts.push('The person is in grief. Hold space. Do not rush. Do not fix. Just be present.');
  }
  if (opts.emotionalTone === 'panic' || opts.emotionalTone === 'activation') {
    parts.push('The person is activated. Your steadiness is the anchor. Slower, lower arousal.');
  }

  return parts.join(' ');
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
