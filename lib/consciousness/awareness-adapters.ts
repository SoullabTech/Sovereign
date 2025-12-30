/**
 * Awareness Level Adapters
 *
 * Converts between the canonical 7-level developmental system and
 * legacy 4-level/5-level systems used by various consumers.
 *
 * CANONICAL SOURCE: lib/consciousness/awareness-levels.ts (7-level)
 *
 * Architecture:
 *   7-Level (canonical) → to5Level() → AIN/Knowledge Gate consumers
 *   7-Level (canonical) → to4Level() → Legacy depth consumers
 *   7-Level (canonical) → toNamedLevel() → Multi-dimensional consumers
 *
 * These adapters enable gradual migration without breaking existing code.
 */

import type { AwarenessLevel } from './awareness-levels';

// Re-export canonical type for convenience
export type { AwarenessLevel } from './awareness-levels';

// ═══════════════════════════════════════════════════════════════
// 5-LEVEL ADAPTER (for AIN/Knowledge Gate consumers)
// ═══════════════════════════════════════════════════════════════

/**
 * 5-level system used by AIN/Knowledge Gate
 * Maps to mandala depth: Unconscious → Partial → Relational → Integrated → Master
 */
export type AwarenessLevel5 = 1 | 2 | 3 | 4 | 5;

export const AWARENESS_LEVEL_5_NAMES = {
  1: 'Unconscious',
  2: 'Partial',
  3: 'Relational',
  4: 'Integrated',
  5: 'Master'
} as const;

/**
 * Convert 7-level → 5-level (for AIN/Knowledge Gate consumers)
 *
 * Mapping rationale:
 * - L1 (Newcomer) → 1 (Unconscious): Just beginning
 * - L2 (Explorer) → 2 (Partial): Beginning insight
 * - L3-4 (Practitioner/Student) → 3 (Relational): Developing depth
 * - L5-6 (Integrator/Teacher) → 4 (Integrated): Systemic understanding
 * - L7 (Master) → 5 (Master): Archetypal depth
 */
export function to5Level(level: AwarenessLevel): AwarenessLevel5 {
  const map: Record<AwarenessLevel, AwarenessLevel5> = {
    1: 1, // Newcomer → Unconscious
    2: 2, // Explorer → Partial
    3: 3, // Practitioner → Relational
    4: 3, // Student → Relational
    5: 4, // Integrator → Integrated
    6: 4, // Teacher → Integrated
    7: 5, // Master → Master
  };
  return map[level];
}

/**
 * Convert 5-level → 7-level (reverse adapter)
 *
 * Note: This is lossy - we pick middle values for ranges
 */
export function from5Level(level: AwarenessLevel5): AwarenessLevel {
  const map: Record<AwarenessLevel5, AwarenessLevel> = {
    1: 1, // Unconscious → Newcomer
    2: 2, // Partial → Explorer
    3: 3, // Relational → Practitioner (not Student, pick lower)
    4: 5, // Integrated → Integrator (not Teacher, pick lower)
    5: 7, // Master → Master
  };
  return map[level];
}

// ═══════════════════════════════════════════════════════════════
// 4-LEVEL ADAPTER (for legacy depth consumers)
// ═══════════════════════════════════════════════════════════════

/**
 * 4-level system used by awarenessModel.ts
 * Maps to depth: Newcomer → Practitioner-in-Process → Adept → Steward
 */
export type AwarenessLevel4 = 1 | 2 | 3 | 4;

export const AWARENESS_LEVEL_4_NAMES = {
  1: 'Newcomer',
  2: 'Practitioner-in-Process',
  3: 'Adept',
  4: 'Steward'
} as const;

/**
 * Convert 7-level → 4-level (for legacy depth consumers)
 *
 * Mapping rationale:
 * - L1-2 (Newcomer/Explorer) → 1 (Newcomer): Early stage
 * - L3-4 (Practitioner/Student) → 2 (Practitioner-in-Process): Developing
 * - L5-6 (Integrator/Teacher) → 3 (Adept): Advanced
 * - L7 (Master) → 4 (Steward): Expert/collaborator
 */
export function to4Level(level: AwarenessLevel): AwarenessLevel4 {
  const map: Record<AwarenessLevel, AwarenessLevel4> = {
    1: 1, // Newcomer → Newcomer
    2: 1, // Explorer → Newcomer
    3: 2, // Practitioner → Practitioner-in-Process
    4: 2, // Student → Practitioner-in-Process
    5: 3, // Integrator → Adept
    6: 3, // Teacher → Adept
    7: 4, // Master → Steward
  };
  return map[level];
}

/**
 * Convert 4-level → 7-level (reverse adapter)
 *
 * Note: This is lossy - we pick representative values
 */
export function from4Level(level: AwarenessLevel4): AwarenessLevel {
  const map: Record<AwarenessLevel4, AwarenessLevel> = {
    1: 1, // Newcomer → Newcomer
    2: 3, // Practitioner-in-Process → Practitioner
    3: 5, // Adept → Integrator
    4: 7, // Steward → Master
  };
  return map[level];
}

// ═══════════════════════════════════════════════════════════════
// NAMED-LEVEL ADAPTER (for multi-dimensional consumers)
// ═══════════════════════════════════════════════════════════════

/**
 * Named level system used by awarenessLevelDetection.ts
 */
export type NamedAwarenessLevel =
  | 'newcomer'
  | 'explorer'
  | 'practitioner'
  | 'integrator'
  | 'professional';

/**
 * Convert 7-level → named level (for multi-dimensional consumers)
 *
 * Mapping rationale:
 * - L1 → newcomer: Just starting
 * - L2 → explorer: Exploring possibilities
 * - L3-4 → practitioner: Building skills
 * - L5-6 → integrator: Connecting domains
 * - L7 → professional: Expert collaborator
 */
export function toNamedLevel(level: AwarenessLevel): NamedAwarenessLevel {
  const map: Record<AwarenessLevel, NamedAwarenessLevel> = {
    1: 'newcomer',
    2: 'explorer',
    3: 'practitioner',
    4: 'practitioner',
    5: 'integrator',
    6: 'integrator',
    7: 'professional',
  };
  return map[level];
}

/**
 * Convert named level → 7-level (reverse adapter)
 */
export function fromNamedLevel(level: NamedAwarenessLevel): AwarenessLevel {
  const map: Record<NamedAwarenessLevel, AwarenessLevel> = {
    'newcomer': 1,
    'explorer': 2,
    'practitioner': 3,
    'integrator': 5,
    'professional': 7,
  };
  return map[level];
}

// ═══════════════════════════════════════════════════════════════
// LANGUAGE LEVEL ADAPTER (for awareness-language-adapter.ts)
// ═══════════════════════════════════════════════════════════════

/**
 * Language level system for vocabulary/jargon adaptation
 */
export type LanguageLevel = 'everyday' | 'curious' | 'system-aware' | 'fluent';

/**
 * Convert 7-level → language level (for vocabulary adaptation)
 *
 * Mapping rationale:
 * - L1-2 → everyday: Simple, no jargon
 * - L3 → curious: Gentle introduction
 * - L4-5 → system-aware: Can mention systems
 * - L6-7 → fluent: Full technical language
 */
export function toLanguageLevel(level: AwarenessLevel): LanguageLevel {
  if (level <= 2) return 'everyday';
  if (level === 3) return 'curious';
  if (level <= 5) return 'system-aware';
  return 'fluent';
}

/**
 * Convert language level → 7-level (reverse adapter)
 */
export function fromLanguageLevel(level: LanguageLevel): AwarenessLevel {
  const map: Record<LanguageLevel, AwarenessLevel> = {
    'everyday': 1,
    'curious': 3,
    'system-aware': 4,
    'fluent': 6,
  };
  return map[level];
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Clamp a number to valid 7-level range
 */
export function clampToAwarenessLevel(n: number): AwarenessLevel {
  return Math.min(Math.max(Math.round(n), 1), 7) as AwarenessLevel;
}

/**
 * Get the canonical level name for a 7-level value
 */
export function getAwarenessLevelName(level: AwarenessLevel): string {
  const names: Record<AwarenessLevel, string> = {
    1: 'Newcomer',
    2: 'Explorer',
    3: 'Practitioner',
    4: 'Student',
    5: 'Integrator',
    6: 'Teacher',
    7: 'Master'
  };
  return names[level];
}

/**
 * Check if a level indicates meta-awareness capability
 * (Can understand and discuss frameworks as frameworks)
 */
export function hasMetaAwareness(level: AwarenessLevel): boolean {
  return level >= 5;
}

/**
 * Check if frameworks should be visible at this level
 */
export function frameworksVisible(level: AwarenessLevel): boolean {
  return level >= 4;
}

/**
 * Get Opus/Sonnet model tier recommendation based on awareness
 * (For use with claudeClient.ts model selection)
 */
export function getModelTierForAwareness(
  level: AwarenessLevel,
  hasDeepPattern: boolean
): 'opus' | 'sonnet' | null {
  // Levels 1-2: Always Opus (trust-building)
  if (level <= 2) return 'opus';

  // Levels 3-4: Opus if deep, otherwise let other heuristics decide
  if (level <= 4) {
    return hasDeepPattern ? 'opus' : null;
  }

  // Levels 5-7: Opus for depth work, otherwise null
  return hasDeepPattern ? 'opus' : null;
}
