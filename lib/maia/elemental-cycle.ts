/**
 * Elemental Cycle — Weekly Rhythm Engine
 *
 * Maps weeks to elemental phases in a repeating cycle.
 * Phase 1: 4-week cycle (Fire → Water → Earth → Air, emergence only).
 * Phase 2: Expand to 12-week full Spiralogic cycle (3 refinement phases per element).
 *
 * The cycle determines which prompt library theme is "naturally active"
 * when no theme has been explicitly activated via date windows or status.
 *
 * Design: The cycle is a background rhythm. MAIA does not announce it.
 * Members experience it as subtle seasonal attunement, not a curriculum.
 */

import { getActiveTheme, getThemeBySlug, type ThemeWithItems } from '@/lib/maia/prompt-library';

// ═══════════════════════════════════════════════════════════════
// Cycle Definition
// ═══════════════════════════════════════════════════════════════

export interface CycleWeek {
  weekNumber: number;       // 1-based position in the cycle
  element: string;
  refinementPhase: string;
  themeSlug: string;        // maps to prompt_library.slug
}

/**
 * Phase 1: 4-week elemental cycle (emergence refinement only).
 * Each element gets one week before rotating to the next.
 *
 * Phase 2 expansion: 12 weeks (emergence → deepening → mastery per element).
 */
export const ELEMENTAL_CYCLE: CycleWeek[] = [
  { weekNumber: 1, element: 'fire',  refinementPhase: 'emergence', themeSlug: 'fire-initiation' },
  { weekNumber: 2, element: 'water', refinementPhase: 'emergence', themeSlug: 'water-intuition' },
  { weekNumber: 3, element: 'earth', refinementPhase: 'emergence', themeSlug: 'earth-grounding' },
  { weekNumber: 4, element: 'air',   refinementPhase: 'emergence', themeSlug: 'air-awareness' },
];

/**
 * The date the cycle begins. Week 1 starts on this Monday.
 * Change this when starting a new cohort or content season.
 */
const CYCLE_START_DATE = new Date('2026-04-07'); // Monday of the first cycle week

// ═══════════════════════════════════════════════════════════════
// Cycle Computation
// ═══════════════════════════════════════════════════════════════

/**
 * Get the current cycle week (1-based) from the cycle start date.
 * Wraps around: week 5 → week 1, week 8 → week 4, etc.
 */
export function getCurrentCycleWeek(now: Date = new Date()): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const elapsed = now.getTime() - CYCLE_START_DATE.getTime();

  // Before cycle starts → week 1
  if (elapsed < 0) return 1;

  const weekIndex = Math.floor(elapsed / msPerWeek) % ELEMENTAL_CYCLE.length;
  return weekIndex + 1;
}

/**
 * Get the cycle entry for the current week.
 */
export function getCurrentCycleEntry(now: Date = new Date()): CycleWeek {
  const week = getCurrentCycleWeek(now);
  return ELEMENTAL_CYCLE[week - 1];
}

/**
 * Get the active theme with cycle fallback.
 *
 * Priority:
 * 1. Explicitly active theme (status='active' + within date window) → takes precedence
 * 2. Cycle-based theme → computed from current week
 * 3. null → no theme available
 *
 * This is the primary retrieval function for oracle integration.
 */
export async function getActiveCycleTheme(now: Date = new Date()): Promise<ThemeWithItems | null> {
  // 1. Check for explicitly active theme (manual override)
  const explicit = await getActiveTheme();
  if (explicit) return explicit;

  // 2. Fall back to cycle-based theme
  const cycleEntry = getCurrentCycleEntry(now);
  const cycleTheme = await getThemeBySlug(cycleEntry.themeSlug);

  if (cycleTheme) {
    console.log(`[elemental-cycle] Resolved via cycle: week ${cycleEntry.weekNumber}, slug: ${cycleEntry.themeSlug}`);
  }

  return cycleTheme;
}

/**
 * Get cycle context for telemetry / logging.
 */
export function getCycleContext(now: Date = new Date()): {
  cycleWeek: number;
  element: string;
  refinementPhase: string;
  themeSlug: string;
} {
  const entry = getCurrentCycleEntry(now);
  return {
    cycleWeek: entry.weekNumber,
    element: entry.element,
    refinementPhase: entry.refinementPhase,
    themeSlug: entry.themeSlug,
  };
}
