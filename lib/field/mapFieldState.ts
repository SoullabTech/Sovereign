/**
 * Field State Resolver — Pure Functions
 *
 * Translates internal signals (theme counts, pattern counts, spiral motion)
 * into human-readable field language. No DB access, no side effects.
 *
 * Philosophy: Recognition, not analysis. These labels orient, never diagnose.
 */

import type { Element } from '@/lib/types/voiceIntent';
import type { SpiralMotion } from '@/lib/consciousness/spiralStatePersistence';
import type { FieldState, ThemeMovement } from './types';

// ═══════════════════════════════════════════════════════════════
// 1. Field State (from aggregate signals)
// ═══════════════════════════════════════════════════════════════

/**
 * Derive a human-readable field state from signal counts and spiral motion.
 *
 * Inputs are normalised to 0–1 and weighted:
 *   - themeCount: how many theme signals in the last 30 days (max at 10)
 *   - patternCount: how many active patterns (max at 5)
 *   - motion: spiral direction multiplier
 */
export function mapResonanceToFieldState(
  themeCount: number,
  patternCount: number,
  motion: SpiralMotion | null
): FieldState {
  const themeFactor = Math.min(themeCount / 10, 1);        // 0–1
  const patternFactor = Math.min(patternCount / 5, 1);     // 0–1

  const motionMultiplier: Record<string, number> = {
    ascending: 1.0,
    breakthrough: 1.2,
    stuck: 0.4,
  };
  const motionFactor = motion ? (motionMultiplier[motion] ?? 0.6) : 0.6;

  // Weighted composite: themes 40%, patterns 30%, motion 30%
  const score = (themeFactor * 0.4 + patternFactor * 0.3) * motionFactor + motionFactor * 0.3;
  const clamped = Math.min(Math.max(score, 0), 1);

  if (clamped < 0.2) return 'flicker';
  if (clamped < 0.5) return 'forming';
  if (clamped < 0.75) return 'stable';
  return 'converging';
}

// ═══════════════════════════════════════════════════════════════
// 2. Theme Movement (from recurrence data)
// ═══════════════════════════════════════════════════════════════

/**
 * Describe how a recurring theme is moving.
 *
 * @param count       Total appearances in the window
 * @param daysSinceLast  Days since most recent signal
 */
export function mapThemeMovement(
  count: number,
  daysSinceLast: number
): ThemeMovement {
  if (count >= 4 && daysSinceLast < 3) return 'strengthening';
  if (count >= 3 && daysSinceLast > 7)  return 'returning';
  if (daysSinceLast > 14)               return 'softening';
  return 'unresolved';
}

// ═══════════════════════════════════════════════════════════════
// 3. Orienting Line (pure lookup)
// ═══════════════════════════════════════════════════════════════

const ORIENTING_LINES: Record<Element, Record<FieldState, string>> = {
  fire: {
    flicker: 'A spark is present.',
    forming: 'Something is kindling.',
    stable: 'The fire is steady.',
    converging: 'Heat and clarity are meeting.',
  },
  water: {
    flicker: 'Something stirs beneath.',
    forming: 'A current is finding its way.',
    stable: 'The depths are holding.',
    converging: 'What was moving is beginning to settle.',
  },
  earth: {
    flicker: 'Ground is appearing.',
    forming: 'Something is taking root.',
    stable: 'The ground is solid.',
    converging: 'What was planted is ready.',
  },
  air: {
    flicker: 'A thought is forming.',
    forming: 'Ideas are beginning to circulate.',
    stable: 'The mind is clear.',
    converging: 'Insight and understanding are meeting.',
  },
  aether: {
    flicker: 'Something is present.',
    forming: 'A wider pattern is forming.',
    stable: 'The field is coherent.',
    converging: 'What needed to come together is arriving.',
  },
};

const DEFAULT_LINE = 'Welcome. MAIA is here.';

/**
 * Generate a poetic orienting sentence from element and field state.
 * No AI call — pure lookup.
 */
export function generateOrientingLine(
  element: Element | null,
  fieldState: FieldState
): string {
  if (!element) return DEFAULT_LINE;
  return ORIENTING_LINES[element]?.[fieldState] ?? DEFAULT_LINE;
}

// ═══════════════════════════════════════════════════════════════
// 4. Motion Label (human-readable spiral motion)
// ═══════════════════════════════════════════════════════════════

const MOTION_LABELS: Record<SpiralMotion, string> = {
  ascending: 'Moving',
  stuck: 'Resting',
  breakthrough: 'Shifting',
};

/** Convert spiral motion to a soft, human-readable label. */
export function motionLabel(motion: SpiralMotion | null | undefined): string | null {
  if (!motion) return null;
  return MOTION_LABELS[motion] ?? null;
}
