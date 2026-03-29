/**
 * Apply Member Offsets — bind user voice preferences into the prosody pipeline.
 *
 * Canonical pipeline position:
 *   base = buildProsodyHints(state)
 *   scaled = scaleProsody(base, range)
 *   withOffsets = applyMemberOffsets(scaled, offsets)  ← HERE
 *   guarded = aetherGuard(withOffsets)
 *   final = clampProsody(guarded)
 *
 * Rules:
 * 1. Offsets are MULTIPLICATIVE modifiers, not additive overrides.
 *    This preserves elemental intent: Water stays slow even if user nudges pace up.
 * 2. Every lane has hard bounds enforced centrally (LANE_BOUNDS).
 * 3. Offsets never introduce new prosodic categories — they nudge existing values.
 * 4. No freeform style tokens. Only numeric lane adjustments.
 *
 * SOVEREIGNTY: Member preferences shape delivery within governed bounds.
 * The system (elemental/relational state) remains primary.
 */

import type { ProsodyHints } from '@/src/types/voice';
import type { VoiceControlOffsets } from '@/lib/types/voiceControls';
import { aetherGuard } from '@/lib/voice/aetherGuard';

// ═══════════════════════════════════════════════════════════════
// Lane Bounds — single source of truth for all prosody limits
// ═══════════════════════════════════════════════════════════════

const LANE_BOUNDS = {
  pauseBefore: { min: 40, max: 420 },
  pauseAfter:  { min: 60, max: 680 },
} as const;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ═══════════════════════════════════════════════════════════════
// Categorical nudge helpers
// ═══════════════════════════════════════════════════════════════

type PaceLevel = 'slow' | 'steady' | 'brisk';
type WarmthLevel = 'cool' | 'neutral' | 'warm' | 'very_warm';
type ClarityLevel = 'crisp' | 'clear' | 'soft';
type EmphasisLevel = 'minimal' | 'selective' | 'strong';
type EnergyLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

const PACE_ORDER: PaceLevel[] = ['slow', 'steady', 'brisk'];
const WARMTH_ORDER: WarmthLevel[] = ['cool', 'neutral', 'warm', 'very_warm'];
const CLARITY_ORDER: ClarityLevel[] = ['crisp', 'clear', 'soft'];
const EMPHASIS_ORDER: EmphasisLevel[] = ['minimal', 'selective', 'strong'];
const ENERGY_ORDER: EnergyLevel[] = ['very_low', 'low', 'medium', 'high', 'very_high'];

/**
 * Nudge a categorical value along its ordered scale.
 * Positive offset → move toward end of array. Negative → toward start.
 * Threshold-based: only nudges if |offset| > 0.15 (avoids micro-drift).
 */
function nudgeCategory<T>(current: T, order: T[], offset: number, threshold = 0.15): T {
  if (Math.abs(offset) < threshold) return current;
  const idx = order.indexOf(current);
  if (idx === -1) return current;
  const direction = offset > 0 ? 1 : -1;
  const newIdx = clamp(idx + direction, 0, order.length - 1);
  return order[newIdx];
}

// ═══════════════════════════════════════════════════════════════
// Main function
// ═══════════════════════════════════════════════════════════════

/**
 * Apply member voice preference offsets to prosody hints.
 *
 * Offsets range: -0.30 to +0.30 (UI slider range).
 * Effect is multiplicative where numeric, categorical-nudge where symbolic.
 *
 * @param hints - ProsodyHints from scaleProsody (already range-scaled)
 * @param offsets - Member's VoiceControlOffsets from Settings/Voice
 * @returns Modified ProsodyHints with member preferences applied
 */
export function applyMemberOffsets(
  hints: ProsodyHints,
  offsets: VoiceControlOffsets | null | undefined,
): ProsodyHints {
  // No offsets = passthrough (default behavior preserved)
  if (!offsets) return hints;

  // Destructure with safety
  const {
    pace = 0,
    warmth = 0,
    poetry = 0,
    directiveness = 0,
    energy = 0,
  } = offsets;

  // Skip if all offsets are effectively zero
  if (Math.abs(pace) < 0.01 && Math.abs(warmth) < 0.01 &&
      Math.abs(poetry) < 0.01 && Math.abs(directiveness) < 0.01 &&
      Math.abs(energy) < 0.01) {
    return hints;
  }

  // ─── Start from copy ───
  const result = { ...hints };

  // ─── PACE → pace category + pauseMs (multiplicative) ───
  // Positive pace = faster. Negative = slower.
  result.pace = nudgeCategory(
    result.pace as PaceLevel,
    PACE_ORDER,
    pace,  // positive offset → brisk direction
  );

  // Pause timing: faster pace = shorter pauses (multiplicative scaling)
  // pace +0.30 → multiply pauses by 0.7 (30% shorter)
  // pace -0.30 → multiply pauses by 1.3 (30% longer)
  const pauseMultiplier = 1 - (pace * 1.0); // pace +0.30 → 0.7, pace -0.30 → 1.3
  if (result.pauseMs) {
    result.pauseMs = {
      beforeSentence: clamp(
        Math.round((result.pauseMs.beforeSentence ?? 80) * pauseMultiplier),
        LANE_BOUNDS.pauseBefore.min,
        LANE_BOUNDS.pauseBefore.max,
      ),
      afterSentence: clamp(
        Math.round((result.pauseMs.afterSentence ?? 120) * pauseMultiplier),
        LANE_BOUNDS.pauseAfter.min,
        LANE_BOUNDS.pauseAfter.max,
      ),
    };
  }

  // ─── WARMTH → warmth category ───
  // Positive warmth = warmer. Negative = cooler.
  result.warmth = nudgeCategory(
    result.warmth as WarmthLevel,
    WARMTH_ORDER,
    warmth,
  );

  // ─── POETRY (Clarity/Poetry) → clarity + cadence feel ───
  // Positive poetry = softer/mythic. Negative = crisper/direct.
  result.clarity = nudgeCategory(
    result.clarity as ClarityLevel,
    CLARITY_ORDER,
    poetry,  // positive → soft (mythic), negative → crisp (direct)
  );

  // ─── DIRECTIVENESS (Guidance Style) → emphasis + projection feel ───
  // Positive = more directive/emphatic. Negative = more reflective/minimal.
  result.emphasis = nudgeCategory(
    result.emphasis as EmphasisLevel,
    EMPHASIS_ORDER,
    directiveness,
  );

  // ─── ENERGY → energy level ───
  // Positive = higher energy. Negative = softer.
  result.energy = nudgeCategory(
    result.energy as EnergyLevel,
    ENERGY_ORDER,
    energy,
  );

  // ─── Aether guard (prevent collapse from offset stacking) ───
  // Then return. Final clamp happens in the caller pipeline.
  return result;
}
