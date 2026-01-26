/**
 * Scale Prosody — apply Range of Effect to prosody hints.
 *
 * Range scales delivery intensity without changing words:
 * 0 = Neutral (minimal shaping)
 * 1 = Subtle (light pacing, neutral warmth)
 * 2 = Expressive (conversational pauses, selective emphasis)
 * 3 = Deep (clear cadence, gravity when appropriate)
 * 4 = Ceremonial (slower pace, longer rests, pronounced emphasis)
 *
 * SOVEREIGNTY: Range is a member preference that scales MAIA's prosody intent.
 * MAIA still decides the base hints; range just amplifies them.
 */

import type { ProsodyHints, ProsodyRange } from '@/src/types/voice';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/**
 * Scale prosody hints by the Range of Effect setting.
 *
 * Higher range = more pauses, more warmth, more emphasis.
 * But words stay exactly the same.
 */
export function scaleProsody(hints: ProsodyHints, range: ProsodyRange): ProsodyHints {
  // Range 0 = minimal shaping, return hints mostly unchanged
  if (range === 0) {
    return {
      ...hints,
      pauseMs: {
        beforeSentence: 40,
        afterSentence: 60,
      },
    };
  }

  // Scale factor: 0..4 → 0.0..1.0
  const k = range / 4;

  // ─── PAUSE SCALING ───
  const baseBefore = hints.pauseMs?.beforeSentence ?? 80;
  const baseAfter = hints.pauseMs?.afterSentence ?? 120;

  // Pauses increase significantly as range rises
  const pauseBefore = clamp(Math.round(baseBefore + 160 * k), 40, 420);
  const pauseAfter = clamp(Math.round(baseAfter + 240 * k), 60, 680);

  // ─── WARMTH SCALING ───
  // Range 2+ bumps warmth up one level (unless already max)
  let warmth = hints.warmth;
  if (range >= 4) {
    warmth = 'very_warm';
  } else if (range >= 2) {
    warmth = warmth === 'cool' ? 'neutral' :
             warmth === 'neutral' ? 'warm' :
             warmth; // Keep warm/very_warm as is
  }

  // ─── EMPHASIS SCALING ───
  // Range 2+ bumps emphasis up (selective → strong at range 4)
  let emphasis = hints.emphasis;
  if (range >= 4) {
    emphasis = 'strong';
  } else if (range >= 2) {
    emphasis = emphasis === 'minimal' ? 'selective' : emphasis;
  }

  // ─── PACE SCALING ───
  // Range 3+ tends toward slower (more gravitas)
  let pace = hints.pace;
  if (range >= 4) {
    pace = 'slow';
  } else if (range >= 3 && pace === 'brisk') {
    pace = 'steady';
  }

  // ─── CLARITY SCALING ───
  // Range 4 (ceremonial) softens clarity for intimacy
  let clarity = hints.clarity;
  if (range >= 4 && clarity === 'crisp') {
    clarity = 'clear';
  } else if (range >= 4 && clarity === 'clear') {
    clarity = 'soft';
  }

  // ─── INTENT TAG SCALING ───
  // Range 4 = ritual mode; range 3 = deepen existing intent
  let intentTag = hints.intentTag;
  if (range >= 4) {
    intentTag = 'ritual';
  } else if (range >= 3) {
    // Deepen: attune → regulate (more holding), encourage → attune
    if (intentTag === 'attune') intentTag = 'regulate';
    if (intentTag === 'encourage') intentTag = 'attune';
  }

  return {
    ...hints,
    warmth,
    emphasis,
    pace,
    clarity,
    intentTag,
    pauseMs: {
      beforeSentence: pauseBefore,
      afterSentence: pauseAfter,
    },
  };
}

/**
 * Get human-readable description of what range does.
 */
export function getRangeDescription(range: ProsodyRange): string {
  switch (range) {
    case 0: return 'Minimal shaping, clean speech';
    case 1: return 'Light pacing, subtle warmth';
    case 2: return 'Conversational pauses, selective emphasis';
    case 3: return 'Clear cadence, grounded delivery';
    case 4: return 'Spacious pauses, ceremonial presence';
    default: return 'Unknown range';
  }
}
