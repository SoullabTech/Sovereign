/**
 * Participatory Reality — Backend Detection & Storage Helper
 *
 * Three responsibilities:
 *   1. detectThemes()   — score member text against theme language markers
 *   2. storeThemeSignal() — fire-and-forget write to member_theme_signals
 *   3. getRecentThemes() — load theme history for pattern detection
 *
 * Philosophy: Same as spiral state persistence — fire-and-forget writes,
 * graceful fallback on read, never block oracle response.
 *
 * Table: member_theme_signals (migration: 20260316000001_participatory_reality_themes.sql)
 */

import { query } from '@/lib/db/postgres';
import {
  type ParticipatoryTheme,
  type ThemeSignal,
  type ThemeSignalType,
  type MemberThemeSignalRow,
  type ThemeRecurrence,
  THEME_ELEMENT_MAP,
  scoreThemesFromText,
  getThemesForElement,
} from './participatoryReality';
import type { Element } from '@/lib/types/voiceIntent';

// ═══════════════════════════════════════════════════════════════
// 1. Theme Detection (from member text)
// ═══════════════════════════════════════════════════════════════

const CONFIDENCE_FROM_SCORE: Record<number, number> = {
  1: 0.35,
  2: 0.55,
  3: 0.70,
  4: 0.80,
};

function scoreToResonance(score: number): number {
  return CONFIDENCE_FROM_SCORE[Math.min(score, 4)] ?? 0.85;
}

function inferSignalType(
  theme: ParticipatoryTheme,
  text: string
): ThemeSignalType {
  const lower = text.toLowerCase();
  const resistanceMarkers = ['can\'t', 'won\'t', 'refuse', 'fighting', 'stuck', 'resist'];
  const integratingMarkers = ['working on', 'trying to', 'getting better', 'starting to', 'learning to'];

  if (theme === 'wise_acceptance' || resistanceMarkers.some((m) => lower.includes(m))) {
    return 'blocked';
  }
  if (integratingMarkers.some((m) => lower.includes(m))) {
    return 'integrating';
  }
  return 'active';
}

/**
 * Detect which themes are present in the member's text.
 * Returns signals sorted by resonance strength.
 *
 * Low confidence by design — soft heuristic, not diagnostic.
 * Caller must apply its own threshold before acting on results.
 */
export function detectThemes(
  text: string,
  currentElement?: Element,
  minScore = 1
): ThemeSignal[] {
  const scored = scoreThemesFromText(text, minScore);

  // Also consider element-resonant themes even without explicit language markers
  const elementThemes = currentElement ? getThemesForElement(currentElement) : [];
  const elementBoostMap = new Set(elementThemes);

  const signals: ThemeSignal[] = scored.map(({ theme, score }) => {
    const boosted = elementBoostMap.has(theme) ? score + 0.5 : score;
    return {
      theme,
      signal_type: inferSignalType(theme, text),
      resonance_strength: scoreToResonance(Math.round(boosted)),
      element: THEME_ELEMENT_MAP[theme],
    };
  });

  return signals.sort((a, b) => b.resonance_strength - a.resonance_strength);
}

// ═══════════════════════════════════════════════════════════════
// 2. Store Theme Signal (fire-and-forget)
// ═══════════════════════════════════════════════════════════════

/**
 * Fire-and-forget write to member_theme_signals.
 * Returns void (not Promise) to prevent accidental await.
 * Never blocks oracle response.
 */
export function storeThemeSignal(
  memberId: string,
  signal: ThemeSignal,
  opts: {
    sessionId?: string;
    journalEntryId?: string;
    context?: Record<string, unknown>;
  } = {}
): void {
  const sql = `
    INSERT INTO member_theme_signals (
      member_id, session_id, journal_entry_id,
      theme, signal_type, resonance_strength, element, context
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;

  query(sql, [
    memberId,
    opts.sessionId ?? null,
    opts.journalEntryId ?? null,
    signal.theme,
    signal.signal_type,
    signal.resonance_strength,
    signal.element ?? null,
    JSON.stringify(opts.context ?? {}),
  ]).catch((error) => {
    // Swallow — theme signal storage must never break oracle response
    console.warn('[participatory] Failed to store theme signal:', {
      memberId,
      theme: signal.theme,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// 3. Load Recent Theme History
// ═══════════════════════════════════════════════════════════════

/**
 * Load recent theme signals for a member.
 * Returns empty array on error (graceful degradation).
 *
 * @param memberId
 * @param limit    Max signals to return (default: 20)
 * @param days     How far back to look (default: 30)
 */
export async function getRecentThemes(
  memberId: string,
  limit = 20,
  days = 30
): Promise<MemberThemeSignalRow[]> {
  try {
    const result = await query<MemberThemeSignalRow>(
      `SELECT
        id, member_id, session_id, journal_entry_id,
        theme, signal_type, resonance_strength, element,
        context, detected_at
      FROM member_theme_signals
      WHERE member_id = $1
        AND detected_at > NOW() - INTERVAL '${days} days'
      ORDER BY detected_at DESC
      LIMIT $2`,
      [memberId, limit]
    );
    return result.rows;
  } catch (error) {
    console.warn('[participatory] Failed to load recent themes:', {
      memberId,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// 4. Recurrence Detection
// ═══════════════════════════════════════════════════════════════

const RECURRENCE_THRESHOLD = 3; // appearances needed to flag as recurring

/**
 * From a list of recent signals, identify themes that have recurred
 * enough to warrant surfacing (≥ RECURRENCE_THRESHOLD appearances).
 */
export function findRecurringThemes(signals: MemberThemeSignalRow[]): ThemeRecurrence[] {
  const grouped = new Map<ParticipatoryTheme, MemberThemeSignalRow[]>();

  for (const signal of signals) {
    if (!grouped.has(signal.theme)) {
      grouped.set(signal.theme, []);
    }
    grouped.get(signal.theme)!.push(signal);
  }

  const recurrences: ThemeRecurrence[] = [];

  for (const [theme, rows] of grouped.entries()) {
    if (rows.length < RECURRENCE_THRESHOLD) continue;

    const sorted = rows.sort(
      (a, b) => new Date(a.detected_at).getTime() - new Date(b.detected_at).getTime()
    );

    // Dominant signal type = most frequent
    const typeCounts = rows.reduce(
      (acc, r) => {
        acc[r.signal_type] = (acc[r.signal_type] || 0) + 1;
        return acc;
      },
      {} as Record<ThemeSignalType, number>
    );
    const dominantSignalType = Object.entries(typeCounts).sort(
      (a, b) => b[1] - a[1]
    )[0][0] as ThemeSignalType;

    // Dominant element
    const elementCounts = rows.reduce(
      (acc, r) => {
        if (r.element) acc[r.element] = (acc[r.element] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const dominantElement = Object.entries(elementCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] as Element | null ?? null;

    recurrences.push({
      theme,
      count: rows.length,
      first_seen: sorted[0].detected_at,
      last_seen: sorted[sorted.length - 1].detected_at,
      dominant_signal_type: dominantSignalType,
      dominant_element: dominantElement,
    });
  }

  return recurrences.sort((a, b) => b.count - a.count);
}

// ═══════════════════════════════════════════════════════════════
// 5. Pattern Hint Builder (for oracle prompt injection)
// ═══════════════════════════════════════════════════════════════

/**
 * Build a short prompt hint from recurring themes.
 * This is the text injected into the oracle prompt (like existing patternHint.ts).
 *
 * Returns null if no recurrences or confidence insufficient.
 */
export function buildParticipatorryHint(
  recurrences: ThemeRecurrence[],
  minCount = RECURRENCE_THRESHOLD
): string | null {
  const eligible = recurrences.filter((r) => r.count >= minCount);
  if (eligible.length === 0) return null;

  const top = eligible[0];
  const label = top.theme.replace(/_/g, ' ');

  return `[Participatory lens — soft signal only]: The theme of "${label}" has appeared ${top.count} times recently. You may hold this as background context, but do not impose it. Bridge only if the member's language calls toward it.`;
}
