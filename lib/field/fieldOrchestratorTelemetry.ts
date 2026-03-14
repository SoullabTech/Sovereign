/**
 * FIELD ORCHESTRATOR TELEMETRY — Fire-and-forget persistence
 *
 * Persists FieldContext metrics to field_orchestrator_telemetry table
 * for Command Center dashboards. Same pattern as spiralStatePersistence:
 * - Never awaited (fire-and-forget)
 * - Never blocks the oracle
 * - Graceful degradation on failure
 * - No conversation content, only structural metrics
 */

import { query } from '@/lib/db/postgres';
import type { FieldContext } from './fieldOrchestrator';

/**
 * Log field orchestrator telemetry — FIRE AND FORGET
 *
 * Call without await after buildFieldContext() returns.
 * Failures are swallowed silently (console.warn only).
 */
export function logFieldOrchestratorTelemetry(
  fieldContext: FieldContext | null,
  meta: {
    memberId?: string;
    sessionId?: string;
    path?: string; // FAST / CORE / DEEP
  }
): void {
  if (!fieldContext) return;

  // Fire-and-forget — do NOT await
  _persistTelemetry(fieldContext, meta).catch((err) => {
    console.warn(
      '[field-orchestrator-telemetry] Write failed (non-fatal):',
      err instanceof Error ? err.message : 'unknown'
    );
  });
}

async function _persistTelemetry(
  ctx: FieldContext,
  meta: { memberId?: string; sessionId?: string; path?: string }
): Promise<void> {
  await query(
    `INSERT INTO field_orchestrator_telemetry (
      member_id, session_id, path, ms, sources, chars, truncated, depth,
      pfi_element, pfi_coherence, pfi_field_work_safe,
      unified_dominant, unified_coherence_level,
      resonance_word_density, resonance_silence_prob
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [
      meta.memberId ?? null,
      meta.sessionId ?? null,
      meta.path ?? null,
      ctx.meta.ms,
      ctx.meta.sources,
      ctx.meta.chars,
      ctx.meta.truncated,
      ctx.meta.depth,
      ctx.pfi?.element ?? null,
      ctx.pfi?.coherence ?? null,
      ctx.pfi?.fieldWorkSafe ?? null,
      ctx.unified?.dominantElement ?? null,
      ctx.unified?.coherenceLevel ?? null,
      ctx.resonance?.wordDensity ?? null,
      ctx.resonance?.silenceProbability ?? null,
    ]
  );
}

/**
 * Get aggregated telemetry for Command Center dashboard
 */
export async function getFieldOrchestratorSummary(
  days: number = 30
): Promise<{
  avgMs: number;
  total: number;
  hitRate: { pfi: number; resonance: number; unified: number };
  truncationRate: number;
} | null> {
  try {
    const result = await query(
      `SELECT
        COALESCE(AVG(ms), 0)::int as avg_ms,
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE 'pfi' = ANY(sources))::int as pfi_hits,
        COUNT(*) FILTER (WHERE 'resonance' = ANY(sources))::int as resonance_hits,
        COUNT(*) FILTER (WHERE 'unified' = ANY(sources))::int as unified_hits,
        COUNT(*) FILTER (WHERE truncated = true)::int as truncated_count
      FROM field_orchestrator_telemetry
      WHERE created_at >= now() - ($1::int || ' days')::interval`,
      [days]
    );

    const row = result.rows[0];
    if (!row || row.total === 0) return null;

    const total = row.total;
    return {
      avgMs: row.avg_ms,
      total,
      hitRate: {
        pfi: (row.pfi_hits / total) * 100,
        resonance: (row.resonance_hits / total) * 100,
        unified: (row.unified_hits / total) * 100,
      },
      truncationRate: (row.truncated_count / total) * 100,
    };
  } catch (err) {
    // Table might not exist yet — graceful degradation
    console.warn('[field-orchestrator-telemetry] Read failed:', err instanceof Error ? err.message : 'unknown');
    return null;
  }
}
