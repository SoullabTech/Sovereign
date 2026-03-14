/**
 * Greeting Scoring — deterministic lane selection via consent gates.
 *
 * Each lane gets a score based on available signals.
 * Highest score wins. If all memory lanes score -Infinity, identity wins.
 *
 * Gates (applied via scoring):
 * 1. Consent gate  — Sanctuary → identity only, zero memory
 * 2. Relevance gate — Does this help them arrive? (orientation, continuity, care)
 * 3. Closeness gate — Themes and intentions over specific facts
 * 4. Freshness gate — Recent (7-30 days) over old artifacts
 *
 * SOVEREIGNTY: Score = Consent + Recency + Explicitness + Helpfulness - Creepiness
 * If creepiness > threshold → lane disqualified.
 */

import type { GreetingLane } from './types';

/**
 * Signals available for greeting selection.
 * These are structural positions, not content — safe by design.
 */
export type GreetingSignals = {
  // ── consent ──
  sanctuary: boolean;

  // ── identity ──
  displayName?: string | null;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';

  // ── continuity (last conversation theme) ──
  lastConversationTheme?: string | null;
  lastConversationAgeDays?: number | null;

  // ── gentle recall (relationship essence) ──
  morphicResonance?: number | null;   // 0-1
  encounterCount?: number | null;
  presenceQuality?: string | null;    // "Tender vulnerability", etc.

  // ── structural state (Bridge D — safe memory) ──
  dominantElement?: string | null;
  motion?: string | null;             // ascending/stuck/breakthrough
  relationalPhase?: number | null;    // 1-4

  // ── threshold ──
  thresholdActive?: boolean | null;
  thresholdAgeDays?: number | null;

  // ── intention (onboarding/session context) ──
  onboardingReason?: string | null;   // "inner", "direction", "work", "relationships", etc.
  feelingState?: string | null;

  // ── return pattern ──
  daysSinceLastVisit?: number | null;
  autonomyStreak?: number | null;
  returnCount?: number | null;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Score a lane given available signals.
 *
 * Returns a number. -Infinity means "this lane is disqualified."
 * The highest-scoring lane wins.
 */
export function scoreLane(lane: GreetingLane, s: GreetingSignals): number {
  // Sanctuary: identity only, zero memory
  if (s.sanctuary) {
    return lane === 'identity' ? 1 : -Infinity;
  }

  switch (lane) {
    case 'identity': {
      // Always available. Gets a boost when we have a name.
      // Base score is moderate — other lanes should beat it when they have data.
      return 0.5 + (s.displayName ? 0.15 : 0);
    }

    case 'continuity': {
      // Requires a recent conversation theme.
      if (!s.lastConversationTheme) return -Infinity;
      const age = s.lastConversationAgeDays ?? 30;
      if (age > 30) return -Infinity; // stale theme, don't reference
      const freshness = clamp01(1 - age / 30);
      return 0.7 + 0.3 * freshness; // strong when recent
    }

    case 'gentle_recall': {
      // Requires meaningful relationship depth.
      const resonance = s.morphicResonance ?? 0;
      if (resonance < 0.5) return -Infinity;
      const encounters = Math.min(1, (s.encounterCount ?? 0) / 5);
      return 0.55 + 0.35 * resonance + 0.1 * encounters;
    }

    case 'threshold': {
      // Requires an active threshold event.
      if (!s.thresholdActive) return -Infinity;
      const age = s.thresholdAgeDays ?? 7;
      if (age > 14) return -Infinity; // threshold has passed
      const freshness = clamp01(1 - age / 14);
      return 0.65 + 0.25 * freshness;
    }

    case 'intention': {
      // Gentle default — available when we have onboarding context.
      // Slightly higher than identity when onboarding context exists.
      const hasReason = Boolean(s.onboardingReason?.trim());
      const hasFeeling = Boolean(s.feelingState?.trim());
      return 0.5 + (hasReason ? 0.15 : 0) + (hasFeeling ? 0.1 : 0);
    }

    default:
      return -Infinity;
  }
}
