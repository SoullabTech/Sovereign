/**
 * 🌀 SELFLET PHASE 2I: Surfacing Configuration
 *
 * Config knobs for when/whether to surface pending selflet messages.
 * All values can be overridden via environment variables.
 */

export type SelfletSurfacingConfig = {
  /** Minimum turns since last selflet surfaced (per session) */
  cooldownTurns: number;
  /** Minimum minutes since last selflet surfaced */
  cooldownMinutes: number;
  /** Maximum selflet messages to surface per session */
  maxPerSession: number;
  /** Theme overlap threshold (0-1) required to surface */
  themeOverlapThreshold: number;
  /** Context modes where we NEVER surface (safety) */
  blockedContexts: string[];
  /** Don't surface if emotional intensity exceeds this (0-1) */
  maxIntensity: number;
};

const num = (v: string | undefined, fallback: number): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const SELFLET_SURFACING_CONFIG: SelfletSurfacingConfig = {
  cooldownTurns: num(process.env.SELFLET_COOLDOWN_TURNS, 3),
  cooldownMinutes: num(process.env.SELFLET_COOLDOWN_MINUTES, 10),
  maxPerSession: num(process.env.SELFLET_MAX_PER_SESSION, 2),
  themeOverlapThreshold: num(process.env.SELFLET_THEME_OVERLAP_THRESHOLD, 0.3),
  blockedContexts: (process.env.SELFLET_BLOCKED_CONTEXTS ?? 'crisis,emergency,grounding')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
  maxIntensity: num(process.env.SELFLET_MAX_INTENSITY, 0.8),
};
