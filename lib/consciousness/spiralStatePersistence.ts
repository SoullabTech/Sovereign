/**
 * Spiral State Persistence — Bridge D: Anti-regression continuity.
 *
 * Two responsibilities:
 *   1. Load spiral state at conversation start (graceful fallback on error)
 *   2. Upsert spiral state after oracle response (fire-and-forget, never blocks)
 *
 * Philosophy: "Remember where we are in the spiral, not the content of our conversation."
 *
 * Table: member_spiral_state (see migrations/20260213200001_member_spiral_state.sql)
 */

import { query } from '@/lib/db/postgres';
import type { Element } from '@/lib/types/voiceIntent';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type SpiralMotion = 'ascending' | 'stuck' | 'breakthrough';

export interface ActiveReportContext {
  reportId: string;
  generatedAt: string;
  currentPhase: {
    spiralogicPhase: string;
    majorLifeLesson: string;
    edgeChallenge: string;
    emergentGift: string;
    activeTransits: string[];
  };
  elementalBalance: {
    dominantElement: string;
    underactiveElement: string;
    fire: number;
    water: number;
    earth: number;
    air: number;
  };
  nextAction: {
    actions: string[];
    watchFor: string;
    journalPrompt: string;
  };
  evolutionDelta?: {
    sinceLastReport: string;
    repeatedPatterns: string[];
    emergingStrengths: string[];
  } | null;
}

/**
 * Astrologer field-presence state — values that may be persisted to the column.
 * REQUESTED is ephemeral and never written; the schema CHECK enforces this.
 * See lib/symbolic/presence/astrologicalMaia.ts shouldPersistTransition.
 */
export type PersistedAstrologerFieldState = 'inactive' | 'active';

export interface SpiralState {
  dominant_element: Element;
  phase: number;
  motion?: SpiralMotion | null;
  intensity?: number | null;
  relational_phase: number;
  autonomy_streak: number;
  return_count: number;
  activeReportContext?: ActiveReportContext | null;
  /** Astrologer field state. Null when the column has never been written. */
  astrologer_field_state?: PersistedAstrologerFieldState | null;
  /** Last timestamp the astrologer field state was updated. */
  astrologer_field_updated_at?: Date | null;
  updated_at: Date;
  created_at: Date;
}

export interface SpiralStateUpdate {
  dominant_element?: Element;
  phase?: number;
  motion?: SpiralMotion | null;
  intensity?: number | null;
  relational_phase?: number;
  autonomy_streak?: number;
  return_count?: number;
}

// ═══════════════════════════════════════════════════════════════
// 1. Load Spiral State (at conversation start)
// ═══════════════════════════════════════════════════════════════

/**
 * Load persisted spiral state for a member.
 * Returns null if not found or on error (graceful degradation).
 *
 * Used at conversation start to seed hysteresis and prevent regression.
 */
export async function loadSpiralState(memberId: string): Promise<SpiralState | null> {
  try {
    const result = await query<SpiralState & { active_report_context: ActiveReportContext | null }>(
      `SELECT
        dominant_element,
        phase,
        motion,
        intensity,
        relational_phase,
        autonomy_streak,
        return_count,
        active_report_context,
        astrologer_field_state,
        astrologer_field_updated_at,
        updated_at,
        created_at
      FROM member_spiral_state
      WHERE member_id = $1`,
      [memberId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...row,
      activeReportContext: row.active_report_context ?? null,
    };
  } catch (error) {
    // Graceful fallback — if state loading fails, conversation still works
    console.warn('[spiral-state] Failed to load state for member:', {
      memberId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// 2. Upsert Spiral State (fire-and-forget after oracle turn)
// ═══════════════════════════════════════════════════════════════

/**
 * Upsert spiral state for a member (fire-and-forget).
 * Like voiceSovereignty.logFallbackEvent: NEVER blocks oracle response.
 * Returns void (not Promise) to prevent accidental await.
 *
 * Updates only the fields provided in the update object.
 * First insert creates baseline; subsequent updates modify existing state.
 */
export function upsertSpiralState(memberId: string, update: SpiralStateUpdate): void {
  // Build dynamic SET clause for upsert
  const setFields: string[] = [];
  const values: unknown[] = [memberId];
  let paramIndex = 2;

  if (update.dominant_element !== undefined) {
    setFields.push(`dominant_element = $${paramIndex}`);
    values.push(update.dominant_element);
    paramIndex++;
  }

  if (update.phase !== undefined) {
    setFields.push(`phase = $${paramIndex}`);
    values.push(update.phase);
    paramIndex++;
  }

  if (update.motion !== undefined) {
    setFields.push(`motion = $${paramIndex}`);
    values.push(update.motion);
    paramIndex++;
  }

  if (update.intensity !== undefined) {
    setFields.push(`intensity = $${paramIndex}`);
    values.push(update.intensity);
    paramIndex++;
  }

  if (update.relational_phase !== undefined) {
    setFields.push(`relational_phase = $${paramIndex}`);
    values.push(update.relational_phase);
    paramIndex++;
  }

  if (update.autonomy_streak !== undefined) {
    setFields.push(`autonomy_streak = $${paramIndex}`);
    values.push(update.autonomy_streak);
    paramIndex++;
  }

  if (update.return_count !== undefined) {
    setFields.push(`return_count = $${paramIndex}`);
    values.push(update.return_count);
    paramIndex++;
  }

  // If no fields to update, skip
  if (setFields.length === 0) {
    console.warn('[spiral-state] Upsert called with no fields to update');
    return;
  }

  // Build INSERT values (using defaults for missing fields on first insert)
  const insertColumns: string[] = ['member_id'];
  const insertValues: string[] = ['$1'];
  let insertParamIndex = paramIndex;

  const fieldsMap: Record<string, { column: string; value: unknown; hasDefault: boolean }> = {
    dominant_element: { column: 'dominant_element', value: update.dominant_element, hasDefault: false },
    phase: { column: 'phase', value: update.phase, hasDefault: false },
    motion: { column: 'motion', value: update.motion, hasDefault: true },
    intensity: { column: 'intensity', value: update.intensity, hasDefault: true },
    relational_phase: { column: 'relational_phase', value: update.relational_phase, hasDefault: true },
    autonomy_streak: { column: 'autonomy_streak', value: update.autonomy_streak, hasDefault: true },
    return_count: { column: 'return_count', value: update.return_count, hasDefault: true },
  };

  for (const [key, meta] of Object.entries(fieldsMap)) {
    if (update[key as keyof SpiralStateUpdate] !== undefined) {
      insertColumns.push(meta.column);
      insertValues.push(`$${insertParamIndex}`);
      values.push(meta.value);
      insertParamIndex++;
    }
  }

  // Require dominant_element and phase for first insert
  if (!update.dominant_element || !update.phase) {
    console.warn('[spiral-state] First upsert requires dominant_element and phase');
    return;
  }

  const sql = `
    INSERT INTO member_spiral_state (${insertColumns.join(', ')})
    VALUES (${insertValues.join(', ')})
    ON CONFLICT (member_id) DO UPDATE
    SET ${setFields.join(', ')}
  `;

  // Fire-and-forget — no await, catch errors silently
  query(sql, values).catch((error) => {
    // Swallow — spiral state persistence should never break oracle response
    console.warn('[spiral-state] Failed to upsert state:', {
      memberId,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// 3. Upsert Active Report Context (fire-and-forget)
// ═══════════════════════════════════════════════════════════════

/**
 * Write the active report context snapshot to member_spiral_state.
 * Fire-and-forget: returns Promise<void> so the caller can .catch() but should not await.
 * Called from spiralogic-report route after a report is persisted.
 */
export async function upsertActiveReportContext(
  memberId: string,
  context: ActiveReportContext,
): Promise<void> {
  await query(
    `INSERT INTO member_spiral_state (member_id, dominant_element, phase, active_report_context)
     VALUES ($1, 'aether', 1, $2)
     ON CONFLICT (member_id) DO UPDATE
     SET active_report_context = $2`,
    [memberId, JSON.stringify(context)],
  );
}

// ═══════════════════════════════════════════════════════════════
// 3b. Astrologer Field State (fire-and-forget, separate write path)
// ═══════════════════════════════════════════════════════════════

/**
 * Upsert the astrologer field state for a member (fire-and-forget).
 *
 * Separate write path from the main `upsertSpiralState` because astrologer
 * state is set EARLY in the route (before voiceHint / element+phase exist),
 * which means we can't reuse the spiral-state upsert (it requires
 * dominant_element + phase). We use the same INSERT-with-defaults pattern as
 * `upsertActiveReportContext` to handle first-time members cleanly.
 *
 * Persistence rule (Kelly approved 2026-04-26): only `'inactive'` and
 * `'active'` are accepted. `'requested'` is ephemeral — caller must filter
 * via `shouldPersistTransition` from the presence module before invoking
 * this function. The schema CHECK enforces it as well.
 *
 * Returns void (not Promise) to prevent accidental await — same convention
 * as `upsertSpiralState`.
 */
export function upsertAstrologerFieldState(
  memberId: string,
  state: PersistedAstrologerFieldState,
  updatedAt: Date = new Date(),
): void {
  query(
    `INSERT INTO member_spiral_state (
       member_id, dominant_element, phase,
       astrologer_field_state, astrologer_field_updated_at
     )
     VALUES ($1, 'aether', 1, $2, $3)
     ON CONFLICT (member_id) DO UPDATE
     SET astrologer_field_state = $2,
         astrologer_field_updated_at = $3`,
    [memberId, state, updatedAt],
  ).catch((error) => {
    // Swallow — astrologer state persistence must never break oracle response.
    console.warn('[spiral-state] Failed to upsert astrologer field state:', {
      memberId,
      state,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// 4. Observability Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Get spiral state distribution (for observability dashboard).
 * Returns aggregate stats without exposing individual member data.
 */
export async function getSpiralStateSummary(): Promise<{
  total_members: number;
  by_element: Record<string, number>;
  by_phase: Record<number, number>;
  by_relational_phase: Record<number, number>;
  avg_autonomy_streak: number;
  avg_return_count: number;
}> {
  try {
    const result = await query(`
      SELECT
        COUNT(*)::int as total,
        dominant_element,
        phase,
        relational_phase,
        AVG(autonomy_streak)::numeric(5,1) as avg_autonomy,
        AVG(return_count)::numeric(5,1) as avg_returns
      FROM member_spiral_state
      GROUP BY dominant_element, phase, relational_phase
    `);

    const byElement: Record<string, number> = {};
    const byPhase: Record<number, number> = {};
    const byRelationalPhase: Record<number, number> = {};
    let totalMembers = 0;
    let totalAutonomyStreak = 0;
    let totalReturnCount = 0;

    for (const row of result.rows) {
      const count = row.total || 0;
      totalMembers += count;

      byElement[row.dominant_element] = (byElement[row.dominant_element] || 0) + count;
      byPhase[row.phase] = (byPhase[row.phase] || 0) + count;
      byRelationalPhase[row.relational_phase] = (byRelationalPhase[row.relational_phase] || 0) + count;

      totalAutonomyStreak += Number(row.avg_autonomy || 0) * count;
      totalReturnCount += Number(row.avg_returns || 0) * count;
    }

    return {
      total_members: totalMembers,
      by_element: byElement,
      by_phase: byPhase,
      by_relational_phase: byRelationalPhase,
      avg_autonomy_streak: totalMembers > 0 ? totalAutonomyStreak / totalMembers : 0,
      avg_return_count: totalMembers > 0 ? totalReturnCount / totalMembers : 0,
    };
  } catch (error) {
    console.error('[spiral-state] Failed to get summary:', error);
    return {
      total_members: 0,
      by_element: {},
      by_phase: {},
      by_relational_phase: {},
      avg_autonomy_streak: 0,
      avg_return_count: 0,
    };
  }
}
