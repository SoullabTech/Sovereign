/**
 * Voice Style Presets — delivery modes for MAIA-native voice.
 *
 * These are delivery modes, not different characters.
 * Same MAIA identity, different delivery weights.
 *
 * See: docs/maia-voice-spec-v1.md
 */

export type StylePreset =
  | 'grounded_reflective'   // Most MAIA replies, journaling, meaning-making
  | 'quiet_containing'      // Activation, overwhelm, trauma-sensitive
  | 'clear_direct'          // Action steps, decisions, boundaries
  | 'shadow_depth'          // Shadow work, grief, dream interpretation
  | 'mentor_firm'           // Challenge, accountability, calibration
  | 'ritual_spacious';      // Meditations, ceremonies, invocations

export interface PresetParams {
  /** Kokoro speed multiplier (0.85 - 1.05 range) */
  speed: number;
  /** Milliseconds of silence between sentences */
  pauseBetweenSentences: number;
  /** Milliseconds of silence between paragraphs / thought units */
  pauseBetweenParagraphs: number;
  /** How aggressively to emphasize key phrases */
  emphasisStrength: 'minimal' | 'selective' | 'moderate' | 'strong';
  /** Tonal contour: soft (settling), firm (decisive), spacious (threshold) */
  contour: 'soft' | 'firm' | 'spacious';
}

/**
 * Preset definitions — tuned for Kokoro local TTS.
 *
 * Speed values are Kokoro-native (not the clamped 0.94-1.06 range from voiceMap.ts).
 * Kokoro accepts wider range; these are intentionally modest to avoid theatricality.
 *
 * Anti-pattern: do NOT let shadow_depth or ritual_spacious become slow-motion AI mysticism.
 * The bar is: alive, clear, relational — not "dramatic."
 */
export const STYLE_PRESETS: Record<StylePreset, PresetParams> = {
  grounded_reflective: {
    speed: 0.95,
    pauseBetweenSentences: 250,
    pauseBetweenParagraphs: 400,
    emphasisStrength: 'selective',
    contour: 'soft',
  },
  quiet_containing: {
    speed: 0.90,
    pauseBetweenSentences: 300,
    pauseBetweenParagraphs: 500,
    emphasisStrength: 'minimal',
    contour: 'soft',
  },
  clear_direct: {
    speed: 1.02,
    pauseBetweenSentences: 150,
    pauseBetweenParagraphs: 300,
    emphasisStrength: 'strong',
    contour: 'firm',
  },
  shadow_depth: {
    speed: 0.88,
    pauseBetweenSentences: 350,
    pauseBetweenParagraphs: 600,
    emphasisStrength: 'minimal',
    contour: 'spacious',
  },
  mentor_firm: {
    speed: 0.98,
    pauseBetweenSentences: 200,
    pauseBetweenParagraphs: 350,
    emphasisStrength: 'strong',
    contour: 'firm',
  },
  ritual_spacious: {
    speed: 0.85,
    pauseBetweenSentences: 450,
    pauseBetweenParagraphs: 700,
    emphasisStrength: 'minimal',
    contour: 'spacious',
  },
};

/**
 * Get preset params, defaulting to grounded_reflective if unknown.
 */
export function getPresetParams(preset: StylePreset): PresetParams {
  return STYLE_PRESETS[preset] || STYLE_PRESETS.grounded_reflective;
}
