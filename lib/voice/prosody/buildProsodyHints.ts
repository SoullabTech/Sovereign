/**
 * Build Prosody Hints — derive semantic delivery intent from relational state.
 *
 * This is MAIA deciding HOW she wants to speak (warmth, pace, emphasis).
 * The TTS adapter then translates these hints to provider-specific controls.
 *
 * SOVEREIGNTY: These hints come from MAIA's own relational stack.
 * No external model decides prosody — MAIA is the author of delivery.
 */

import type {
  ProsodyHints,
  ProsodyContext,
  ProsodyEnergy,
  ProsodyWarmth,
  ProsodyPace,
  ProsodyClarity,
  ProsodyEmphasis,
  ProsodyIntentTag,
} from '@/src/types/voice';

/**
 * Build base prosody hints from MAIA's relational context.
 * These are then scaled by the user's Range of Effect setting.
 */
export function buildProsodyHints(ctx: ProsodyContext): ProsodyHints {
  const { activation, mode, sanctuary, brevity, posture, element } = ctx;

  // ─── ENERGY (from activation) ───
  const energy: ProsodyEnergy =
    activation < 0.15 ? 'very_low' :
    activation < 0.30 ? 'low' :
    activation < 0.55 ? 'medium' :
    activation < 0.75 ? 'high' : 'very_high';

  // ─── WARMTH (from posture + sanctuary + mode) ───
  let warmth: ProsodyWarmth = 'neutral';
  if (sanctuary) {
    warmth = 'very_warm';
  } else if (posture.includes('MEET') || posture.includes('HOLD')) {
    warmth = 'warm';
  } else if (posture.includes('WITNESS')) {
    warmth = 'very_warm';
  } else if (mode.toUpperCase().includes('CARE')) {
    warmth = 'warm';
  } else if (mode.toUpperCase().includes('REGULATOR')) {
    warmth = activation > 0.5 ? 'warm' : 'neutral';
  }

  // Element can nudge warmth
  if (element) {
    const el = element.toLowerCase();
    if (el.includes('water') || el.includes('earth')) {
      warmth = warmth === 'neutral' ? 'warm' : warmth;
    }
  }

  // ─── PACE (from brevity + activation) ───
  let pace: ProsodyPace =
    brevity === 'brief' ? 'brisk' :
    brevity === 'expansive' ? 'slow' : 'steady';

  // High activation with regulator mode → slow down to settle
  if (activation > 0.6 && mode.toUpperCase().includes('REGULATOR')) {
    pace = 'slow';
  }

  // ─── CLARITY (from mode + posture) ───
  let clarity: ProsodyClarity = 'clear';
  if (posture.includes('HOLD') || sanctuary) {
    clarity = 'soft';
  } else if (mode.toUpperCase().includes('NOTE')) {
    clarity = 'crisp'; // Scribe mode is clear and precise
  }

  // ─── EMPHASIS (from posture + mode) ───
  let emphasis: ProsodyEmphasis = 'minimal';
  if (posture.includes('LEAD') || posture.includes('GUIDE')) {
    emphasis = 'selective';
  } else if (mode.toUpperCase().includes('NAVIGATOR')) {
    emphasis = 'selective';
  } else if (mode.toUpperCase().includes('MYTHOPOET')) {
    emphasis = activation > 0.4 ? 'selective' : 'minimal';
  }

  // ─── PAUSE TIMING (base values, scaled by range later) ───
  const pauseMs = {
    beforeSentence: sanctuary ? 120 : 80,
    afterSentence: sanctuary ? 180 : 120,
  };

  // ─── INTENT TAG (what kind of delivery this is) ───
  let intentTag: ProsodyIntentTag | undefined;
  if (sanctuary && activation < 0.3) {
    intentTag = 'regulate';
  } else if (posture.includes('HOLD')) {
    intentTag = 'attune';
  } else if (posture.includes('LEAD')) {
    intentTag = 'encourage';
  } else if (mode.toUpperCase().includes('NOTE')) {
    intentTag = 'instruct';
  } else if (mode.toUpperCase().includes('MYTHOPOET')) {
    intentTag = 'play';
  } else {
    intentTag = 'attune'; // Default: warm presence
  }

  return {
    energy,
    warmth,
    pace,
    clarity,
    emphasis,
    pauseMs,
    intentTag,
    ssmlOk: false, // Only enable for engines we explicitly trust
  };
}
