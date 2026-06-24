/**
 * Single-Member Recurrence Detector  (#2 — "Activate recurrence. Keep Morphic gated.")
 *
 * Detects when one of a member's OWN participatory-reality themes has recurred
 * across their recent history, and (in the gated surfacing stage) lets MAIA note
 * it as a plain, member-owned observation: "this theme keeps coming up in your
 * own recent reflections."
 *
 * SCOPE DISCIPLINE (Kelly directive 2026-06-01):
 *   - MEMBER-SCOPED ONLY. Every query is `WHERE member_id = $1`. This module never
 *     reads, aggregates, or compares across members. It is NOT Morphic, and it
 *     does not touch MorphicPatternService (held behind the consent + aggregation
 *     gate — see docs/architecture/STATE_AND_ROADMAP_2026-05-24.md, "Later").
 *   - Reads the existing member_theme_signals substrate (migration 20260316000001)
 *     — the same rows loadRecentThemeSignals already surfaces per turn. No new
 *     producer; this is recurrence *over the member's own data*.
 *   - Surfacing language stays small: recurrence in "your own recent history",
 *     never "the field", never "morphic", never "pattern detected", never diagnosis.
 *
 * MEMBER'S OWN ACTIVATION LADDER (Invocation → Observation → Surfacing):
 *   - detectThemeRecurrence() — Invocation + Observation. Pure read, graceful;
 *     the caller leaves a receipt via a [MAIA/sovereign] recurrence log marker
 *     and memoryHealth.pattern. Ungated (observability never depends on consent).
 *   - formatRecurrenceForMember() — Surfacing. Builds the honest prompt addendum.
 *     The caller MUST gate this behind members.recurrence_recall_enabled before it
 *     reaches a prompt. Not wired into the prompt yet.
 *
 * This is Mitvollzug as architecture: the member participates in the disclosure of
 * their own pattern (their own signals, surfaced back to them, with the right to
 * opt out) — they are not harvested into a map.
 */

import { query } from '@/lib/db/postgres';

export type ParticipatoryTheme =
  | 'field_awareness'
  | 'pattern_recurrence'
  | 'embodied_coherence'
  | 'adaptive_unfolding'
  | 'wise_acceptance'
  | 'ripeness';

export interface RecurringTheme {
  theme: ParticipatoryTheme;
  occurrences: number; // total signals for this theme in the window
  distinctDays: number; // distinct calendar days the theme appeared (the recurrence unit)
  distinctSessions: number; // distinct non-null session_ids
  firstSeen: Date;
  lastSeen: Date;
}

export interface RecurrenceResult {
  recurringThemes: RecurringTheme[]; // themes meeting the threshold, strongest first
  windowDays: number;
}

export interface RecurrenceOptions {
  windowDays?: number; // lookback window (default 30)
  minDistinctDays?: number; // recurrence threshold in distinct days (default 3)
  maxThemes?: number; // cap returned themes (default 3)
}

const EMPTY: RecurrenceResult = { recurringThemes: [], windowDays: 0 };

/**
 * Detect which of the member's OWN themes have recurred across distinct days
 * within the lookback window. Member-scoped, read-only, graceful (returns an
 * empty result on missing input or DB error — never throws).
 */
export async function detectThemeRecurrence(
  userId: string,
  opts: RecurrenceOptions = {},
): Promise<RecurrenceResult> {
  if (!userId) return EMPTY;
  const windowDays = opts.windowDays ?? 30;
  const minDistinctDays = opts.minDistinctDays ?? 3;
  const maxThemes = opts.maxThemes ?? 3;

  try {
    const result = await query<{
      theme: ParticipatoryTheme;
      occurrences: string;
      distinct_days: string;
      distinct_sessions: string;
      first_seen: Date;
      last_seen: Date;
    }>(
      `SELECT theme,
              COUNT(*)                          AS occurrences,
              COUNT(DISTINCT DATE(detected_at)) AS distinct_days,
              COUNT(DISTINCT session_id)        AS distinct_sessions,
              MIN(detected_at)                  AS first_seen,
              MAX(detected_at)                  AS last_seen
         FROM member_theme_signals
        WHERE member_id = $1
          AND detected_at >= NOW() - make_interval(days => $2::int)
        GROUP BY theme
       HAVING COUNT(DISTINCT DATE(detected_at)) >= $3
        ORDER BY COUNT(DISTINCT DATE(detected_at)) DESC, COUNT(*) DESC
        LIMIT $4`,
      [userId, windowDays, minDistinctDays, maxThemes],
    );

    const recurringThemes: RecurringTheme[] = result.rows.map((r) => ({
      theme: r.theme,
      occurrences: Number(r.occurrences),
      distinctDays: Number(r.distinct_days),
      distinctSessions: Number(r.distinct_sessions),
      firstSeen: r.first_seen,
      lastSeen: r.last_seen,
    }));

    return { recurringThemes, windowDays };
  } catch (err) {
    console.warn('[recurrenceDetector] detectThemeRecurrence failed (non-fatal):', err);
    return EMPTY;
  }
}

// Plain, low-interpretation labels. Deliberately NOT evocative — MAIA phrases in
// its own voice; this only names which theme recurred, in the member's terms.
const THEME_LABEL: Record<ParticipatoryTheme, string> = {
  field_awareness: 'field awareness',
  pattern_recurrence: 'recurring patterns',
  embodied_coherence: 'embodied coherence',
  adaptive_unfolding: 'adaptive unfolding',
  wise_acceptance: 'acceptance of what is',
  ripeness: 'readiness / timing',
};

/**
 * SURFACING STAGE (gated). Build the prompt addendum that lets MAIA optionally
 * note the recurrence to the member, in the small, member-owned register.
 *
 * Returns null when nothing recurs. The CALLER must check
 * members.recurrence_recall_enabled before passing this to a prompt — this
 * function does not read consent and must not be wired ungated.
 *
 * Surfaces only the single strongest recurring theme (no overwhelm).
 */
export function formatRecurrenceForMember(result: RecurrenceResult): string | null {
  const top = result.recurringThemes[0];
  if (!top) return null;

  const label = THEME_LABEL[top.theme];

  return [
    '[Recurrence — the member\'s OWN recent history]',
    `Over roughly the last ${result.windowDays} days, one theme has recurred in this member's own reflections: "${label}" (across ${top.distinctDays} different days).`,
    'If — and only if — it fits naturally in the moment, you may gently note that this theme keeps returning in THEIR OWN recent history, e.g. "this seems to keep coming up for you lately."',
    'Constraints (do not violate):',
    '  - This is the member\'s own pattern, observed only from their own signals. Speak of it as theirs, not as something you detected about a field.',
    '  - Do NOT call it "the field", "morphic", "collective", "resonance", or a "pattern detected". No system/clinical framing.',
    '  - Do NOT diagnose, predict, or assign meaning. Name the recurrence plainly; let the member make the meaning.',
    '  - If it does not fit the moment, say nothing about it. Silence is the default.',
  ].join('\n');
}
