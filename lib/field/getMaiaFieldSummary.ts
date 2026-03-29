/**
 * Field Summary Builder — Single Source of Truth
 *
 * Aggregates spiral state, theme signals, and pattern data
 * into a MaiaFieldSummary for the field-first /maia page.
 *
 * Used by both:
 *   - app/maia/page.tsx (server-rendered, direct call)
 *   - app/api/maia/field-summary/route.ts (API wrapper)
 *
 * All imports are existing, battle-tested modules.
 * No new DB tables. No new queries. Just aggregation + translation.
 */

import { loadSpiralState } from '@/lib/consciousness/spiralStatePersistence';
import {
  getRecentThemes,
  findRecurringThemes,
} from '@/lib/consciousness/participatoryRealityHelper';
import { THEME_DISPLAY } from '@/lib/consciousness/participatoryReality';
import type { ParticipatoryTheme } from '@/lib/consciousness/participatoryReality';
import { getMaiaDetectedPatterns } from '@/lib/patterns/getMemberPatterns';
import {
  mapResonanceToFieldState,
  mapThemeMovement,
  generateOrientingLine,
  motionLabel,
} from './mapFieldState';
import type { MaiaFieldSummary, FieldTheme, FieldThread } from './types';

/**
 * Build a complete field summary for a member.
 *
 * All data fetches are parallel. Graceful degradation on any failure:
 * missing data → empty arrays, flicker state, default orienting line.
 */
export async function getMaiaFieldSummary(
  memberId: string
): Promise<MaiaFieldSummary> {
  // Parallel fetch — all existing functions, all with graceful fallback
  const [spiralState, recentSignals, maiaPatterns] = await Promise.all([
    loadSpiralState(memberId).catch(() => null),
    getRecentThemes(memberId, 50, 30),
    getMaiaDetectedPatterns(memberId).catch(() => []),
  ]);

  // ── Emerging Themes ──────────────────────────────────────────
  const recurrences = findRecurringThemes(recentSignals);
  const now = Date.now();

  const emergingThemes: FieldTheme[] = recurrences.slice(0, 3).map((r) => {
    const daysSinceLast = Math.max(
      0,
      (now - new Date(r.last_seen).getTime()) / (1000 * 60 * 60 * 24)
    );
    const display = THEME_DISPLAY[r.theme as ParticipatoryTheme];

    return {
      themeKey: r.theme,
      label: display?.label ?? r.theme,
      movement: mapThemeMovement(r.count, daysSinceLast),
      element: r.dominant_element ?? undefined,
    };
  });

  // ── Open Threads ─────────────────────────────────────────────
  // Open thread = MAIA-detected pattern that member hasn't responded to
  const openThreads: FieldThread[] = maiaPatterns
    .filter((p) => !p.memberResponse && p.confidence !== null && p.confidence >= 0.5)
    .slice(0, 3)
    .map((p) => {
      const daysSinceCreated = Math.max(
        0,
        (now - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      let whyNow: string | undefined;
      if (daysSinceCreated < 3) {
        whyNow = 'This appeared recently.';
      } else if (daysSinceCreated < 14) {
        whyNow = 'This thread appears unfinished.';
      } else {
        whyNow = 'This has been returning recently.';
      }

      return {
        id: p.id,
        statement: p.theme, // pattern_ledger.statement maps to theme
        source: (p.source ?? 'maia') as 'maia' | 'practitioner',
        firstSeen: p.createdAt ? formatRelativeDate(p.createdAt) : undefined,
        whyNow,
      };
    });

  // ── Current State ────────────────────────────────────────────
  const activeElement = spiralState?.dominant_element ?? null;
  const motion = spiralState?.motion ?? null;
  const fieldState = mapResonanceToFieldState(
    recentSignals.length,
    maiaPatterns.filter((p) => !p.memberResponse).length,
    motion
  );
  const orientingLine = generateOrientingLine(activeElement, fieldState);

  return {
    currentState: {
      fieldState,
      activeElement,
      motion: motionLabel(motion),
      orientingLine,
    },
    emergingThemes,
    openThreads,
  };
}

// ── Helpers ──────────────────────────────────────────────────────

function formatRelativeDate(date: Date): string {
  const days = Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}
