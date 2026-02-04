/**
 * 🌀 SELFLET PHASE 2I: Surfacing Score Calculator
 *
 * Determines whether a pending selflet message should be surfaced this turn.
 * Uses cooldowns, theme overlap, context safety, and session limits.
 */

import { SELFLET_SURFACING_CONFIG, type SelfletSurfacingConfig } from './SelfletSurfacingConfig';

export type SurfacingInput = {
  sessionId?: string;
  turnNumber?: number;
  detectedThemes: string[];
  emotionalIntensity: number; // 0-1
  contextMode?: string;       // e.g. "crisis" | "normal" | etc.
  lastSelfletTurn?: number | null;
  lastSelfletTime?: Date | null;
  selfletsSurfacedThisSession: number;
};

export type SurfacingResult = {
  shouldSurface: boolean;
  score: number;     // 0-1
  reason: string;
  blockedBy?: string;
};

export function calculateSurfacingScore(
  pendingMessage: { relevanceThemes?: string[] | null },
  input: SurfacingInput,
  config: SelfletSurfacingConfig = SELFLET_SURFACING_CONFIG
): SurfacingResult {
  const mode = (input.contextMode ?? '').trim().toLowerCase();

  // === Hard blocks (instant rejection) ===

  // Block during crisis/emergency contexts
  if (mode && config.blockedContexts.some(ctx => ctx.toLowerCase() === mode)) {
    return { shouldSurface: false, score: 0, reason: 'blocked_context', blockedBy: mode };
  }

  // Block if emotional intensity too high
  if (input.emotionalIntensity > config.maxIntensity) {
    return {
      shouldSurface: false,
      score: 0,
      reason: 'intensity_too_high',
      blockedBy: `intensity=${input.emotionalIntensity.toFixed(2)}`,
    };
  }

  // Block if session limit reached
  if (input.selfletsSurfacedThisSession >= config.maxPerSession) {
    return {
      shouldSurface: false,
      score: 0,
      reason: 'session_limit',
      blockedBy: `${input.selfletsSurfacedThisSession}/${config.maxPerSession}`,
    };
  }

  // === Cooldown checks ===

  // Turn-based cooldown (only if we have turn numbers)
  if (
    typeof input.turnNumber === 'number' &&
    typeof input.lastSelfletTurn === 'number' &&
    input.turnNumber - input.lastSelfletTurn < config.cooldownTurns
  ) {
    const turnsSince = input.turnNumber - input.lastSelfletTurn;
    return {
      shouldSurface: false,
      score: 0,
      reason: 'turn_cooldown',
      blockedBy: `${turnsSince}/${config.cooldownTurns} turns`,
    };
  }

  // Time-based cooldown
  if (input.lastSelfletTime) {
    const minutesSince = (Date.now() - input.lastSelfletTime.getTime()) / 60000;
    if (minutesSince < config.cooldownMinutes) {
      return {
        shouldSurface: false,
        score: 0,
        reason: 'time_cooldown',
        blockedBy: `${minutesSince.toFixed(1)}/${config.cooldownMinutes} min`,
      };
    }
  }

  // === Theme overlap scoring ===

  const messageThemes = pendingMessage.relevanceThemes ?? [];
  const detected = new Set((input.detectedThemes ?? []).map(t => t.toLowerCase()));

  const overlap = messageThemes.filter(t => detected.has(t.toLowerCase())).length;
  const overlapScore = messageThemes.length > 0 ? overlap / messageThemes.length : 0.5;

  if (overlapScore < config.themeOverlapThreshold) {
    return {
      shouldSurface: false,
      score: overlapScore,
      reason: 'low_theme_overlap',
      blockedBy: `${(overlapScore * 100).toFixed(0)}% < ${(config.themeOverlapThreshold * 100).toFixed(0)}%`,
    };
  }

  // === Approved ===
  return {
    shouldSurface: true,
    score: overlapScore,
    reason: 'approved',
  };
}
