/**
 * Research Metric Registry
 *
 * Single source of truth for all system intelligence metrics.
 * Each metric is self-contained: it owns its query logic and direction evaluation.
 *
 * Design invariants:
 *   - No conversation content. Counts, rates, distributions, scores only.
 *   - direction = 'insufficient_data' is correct for first run or sparse data.
 *   - top_pattern_keys is a ranked list, not a scalar — deferred to v1.1.
 *   - spiralogic_distribution is a snapshot, not a rate — direction always 'stable'.
 */

import { query } from '../db/postgres';

export type PeriodType = 'daily' | 'weekly' | 'both';
export type Direction = 'improving' | 'degrading' | 'stable' | 'insufficient_data';

export interface ResearchMetricResult {
  metricValue: number | null;
  metricPayload: Record<string, unknown>;
}

export interface ResearchMetricDefinition {
  metricKey: string;
  metricVersion: string;
  label: string;
  periodType: PeriodType;
  /**
   * Compute the metric for a given period.
   * Always resolves — never rejects. Returns null values on failure.
   */
  compute: (periodStart: string, periodEnd: string) => Promise<ResearchMetricResult>;
  /**
   * Evaluate directional change.
   * Receives current result + prior period result (may be null on first run).
   * Use 'insufficient_data' liberally: first run, sparse data, snapshot metrics.
   */
  evaluateDirection: (
    current: ResearchMetricResult,
    previous: ResearchMetricResult | null
  ) => Direction;
}

// ---------------------------------------------------------------------------
// Direction helpers
// ---------------------------------------------------------------------------

function scalarDirection(
  current: number | null,
  previous: number | null,
  higherIsBetter: boolean,
  minDelta: number
): Direction {
  if (current === null || previous === null) return 'insufficient_data';
  const delta = current - previous;
  if (delta === 0) return 'stable';                  // no change is always stable
  if (Math.abs(delta) < minDelta) return 'stable';   // within threshold is stable
  return higherIsBetter
    ? delta > 0 ? 'improving' : 'degrading'
    : delta < 0 ? 'improving' : 'degrading';
}

// ---------------------------------------------------------------------------
// Metric Registry
// ---------------------------------------------------------------------------

export const METRIC_REGISTRY: ResearchMetricDefinition[] = [

  // 1. AIN Shape Pass Rate
  {
    metricKey: 'ain_shape_pass_rate',
    metricVersion: 'v1',
    label: 'AIN Shape Pass Rate (%)',
    periodType: 'both',
    async compute(periodStart, periodEnd) {
      try {
        const result = await query<{ value: string | null; payload: Record<string, unknown> }>(
          `SELECT
             ROUND(
               100.0 * COUNT(*) FILTER (WHERE pass = true) / NULLIF(COUNT(*), 0),
               2
             )::text AS value,
             jsonb_build_object(
               'total',          COUNT(*),
               'passed',         COUNT(*) FILTER (WHERE pass = true),
               'failed',         COUNT(*) FILTER (WHERE pass = false),
               'avg_score',      ROUND(AVG(score)::numeric, 3),
               'menu_mode_rate', ROUND(100.0 * COUNT(*) FILTER (WHERE menu_mode = true)   / NULLIF(COUNT(*), 0), 2),
               'bridge_rate',    ROUND(100.0 * COUNT(*) FILTER (WHERE bridge = true)      / NULLIF(COUNT(*), 0), 2),
               'permission_rate',ROUND(100.0 * COUNT(*) FILTER (WHERE permission = true)  / NULLIF(COUNT(*), 0), 2),
               'mirror_rate',    ROUND(100.0 * COUNT(*) FILTER (WHERE mirror = true)      / NULLIF(COUNT(*), 0), 2),
               'next_step_rate', ROUND(100.0 * COUNT(*) FILTER (WHERE next_step = true)   / NULLIF(COUNT(*), 0), 2)
             ) AS payload
           FROM ain_shape_telemetry
           WHERE formed_at >= $1 AND formed_at <= $2`,
          [periodStart, periodEnd]
        );
        const row = result.rows[0];
        return {
          metricValue: row?.value != null ? parseFloat(row.value) : null,
          metricPayload: (row?.payload as Record<string, unknown>) ?? {},
        };
      } catch { return { metricValue: null, metricPayload: {} }; }
    },
    evaluateDirection(current, previous) {
      return scalarDirection(current.metricValue, previous?.metricValue ?? null, true, 2);
    },
  },

  // 2. Response Latency p50
  {
    metricKey: 'response_latency_p50_ms',
    metricVersion: 'v1',
    label: 'Response Latency p50 (ms)',
    periodType: 'both',
    async compute(periodStart, periodEnd) {
      try {
        const result = await query<{ value: string | null; payload: Record<string, unknown> }>(
          `SELECT
             PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms)::text AS value,
             jsonb_build_object(
               'p50',         PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms),
               'p90',         PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY duration_ms),
               'avg',         ROUND(AVG(duration_ms)::numeric, 0),
               'total_turns', COUNT(*),
               'fast_count',  COUNT(*) FILTER (WHERE duration_ms < 2000),
               'core_count',  COUNT(*) FILTER (WHERE duration_ms >= 2000 AND duration_ms <= 6000),
               'deep_count',  COUNT(*) FILTER (WHERE duration_ms > 6000)
             ) AS payload
           FROM oracle_usage_events
           WHERE created_at >= $1
             AND created_at <= $2
             AND status = 'ok'
             AND duration_ms IS NOT NULL`,
          [periodStart, periodEnd]
        );
        const row = result.rows[0];
        return {
          metricValue: row?.value != null ? parseFloat(row.value) : null,
          metricPayload: (row?.payload as Record<string, unknown>) ?? {},
        };
      } catch { return { metricValue: null, metricPayload: {} }; }
    },
    evaluateDirection(current, previous) {
      return scalarDirection(current.metricValue, previous?.metricValue ?? null, false, 200);
    },
  },

  // 3. Depth Tier Distribution (latency proxy until depth_tier column added to oracle_usage_events)
  {
    metricKey: 'depth_tier_distribution',
    metricVersion: 'v1',
    label: 'Depth Tier Distribution (latency proxy)',
    periodType: 'both',
    async compute(periodStart, periodEnd) {
      try {
        const result = await query<{ value: string | null; payload: Record<string, unknown> }>(
          `SELECT
             COUNT(*)::text AS value,
             jsonb_build_object(
               'fast_count', COUNT(*) FILTER (WHERE duration_ms < 2000),
               'core_count', COUNT(*) FILTER (WHERE duration_ms >= 2000 AND duration_ms <= 6000),
               'deep_count', COUNT(*) FILTER (WHERE duration_ms > 6000),
               'fast_pct',   ROUND(100.0 * COUNT(*) FILTER (WHERE duration_ms < 2000)                                                          / NULLIF(COUNT(*), 0), 2),
               'core_pct',   ROUND(100.0 * COUNT(*) FILTER (WHERE duration_ms >= 2000 AND duration_ms <= 6000) / NULLIF(COUNT(*), 0), 2),
               'deep_pct',   ROUND(100.0 * COUNT(*) FILTER (WHERE duration_ms > 6000)                                                          / NULLIF(COUNT(*), 0), 2),
               'note',       'latency proxy — upgrade to depth_tier column when available'
             ) AS payload
           FROM oracle_usage_events
           WHERE created_at >= $1
             AND created_at <= $2
             AND status = 'ok'
             AND duration_ms IS NOT NULL`,
          [periodStart, periodEnd]
        );
        const row = result.rows[0];
        return {
          metricValue: row?.value != null ? parseFloat(row.value) : null,
          metricPayload: (row?.payload as Record<string, unknown>) ?? {},
        };
      } catch { return { metricValue: null, metricPayload: {} }; }
    },
    evaluateDirection(_current, _previous) {
      // Distribution, not scalar — direction not meaningful at this level
      return 'insufficient_data';
    },
  },

  // 4. Growth Edge Frequency
  {
    metricKey: 'growth_edge_frequency',
    metricVersion: 'v1',
    label: 'Growth Edge Insight Count',
    periodType: 'both',
    async compute(periodStart, periodEnd) {
      try {
        const result = await query<{ value: string | null; payload: Record<string, unknown> }>(
          `SELECT
             COUNT(*)::text AS value,
             jsonb_build_object(
               'total',            COUNT(*),
               'avg_significance', ROUND(AVG(insight_significance)::numeric, 3)
             ) AS payload
           FROM conversation_insights
           WHERE created_at >= $1
             AND created_at <= $2
             AND insight_type = 'growth_edge'`,
          [periodStart, periodEnd]
        );
        const row = result.rows[0];
        return {
          metricValue: row?.value != null ? parseFloat(row.value) : null,
          metricPayload: (row?.payload as Record<string, unknown>) ?? {},
        };
      } catch { return { metricValue: null, metricPayload: {} }; }
    },
    evaluateDirection(current, previous) {
      return scalarDirection(current.metricValue, previous?.metricValue ?? null, true, 1);
    },
  },

  // 5. Pattern Insight Frequency
  {
    metricKey: 'pattern_insight_frequency',
    metricVersion: 'v1',
    label: 'Pattern Insight Count',
    periodType: 'both',
    async compute(periodStart, periodEnd) {
      try {
        const result = await query<{ value: string | null; payload: Record<string, unknown> }>(
          `SELECT
             COUNT(*)::text AS value,
             jsonb_build_object(
               'total',            COUNT(*),
               'avg_significance', ROUND(AVG(insight_significance)::numeric, 3)
             ) AS payload
           FROM conversation_insights
           WHERE created_at >= $1
             AND created_at <= $2
             AND insight_type = 'pattern'`,
          [periodStart, periodEnd]
        );
        const row = result.rows[0];
        return {
          metricValue: row?.value != null ? parseFloat(row.value) : null,
          metricPayload: (row?.payload as Record<string, unknown>) ?? {},
        };
      } catch { return { metricValue: null, metricPayload: {} }; }
    },
    evaluateDirection(current, previous) {
      return scalarDirection(current.metricValue, previous?.metricValue ?? null, true, 1);
    },
  },

  // 6. Pattern Ledger Growth (new canonical keys created)
  {
    metricKey: 'pattern_ledger_growth',
    metricVersion: 'v1',
    label: 'New Pattern Keys Discovered',
    periodType: 'both',
    async compute(periodStart, periodEnd) {
      try {
        const result = await query<{ value: string | null; payload: Record<string, unknown> }>(
          `SELECT
             COUNT(*)::text AS value,
             jsonb_build_object('new_keys', COUNT(*)) AS payload
           FROM pattern_ledger
           WHERE first_seen_at >= $1
             AND first_seen_at <= $2
             AND pattern_key IS NOT NULL`,
          [periodStart, periodEnd]
        );
        const row = result.rows[0];
        return {
          metricValue: row?.value != null ? parseFloat(row.value) : null,
          metricPayload: (row?.payload as Record<string, unknown>) ?? {},
        };
      } catch { return { metricValue: null, metricPayload: {} }; }
    },
    evaluateDirection(current, previous) {
      return scalarDirection(current.metricValue, previous?.metricValue ?? null, true, 0);
    },
  },

  // 7. Safety Concern Count
  {
    metricKey: 'safety_concern_count',
    metricVersion: 'v1',
    label: 'Safety Concern Events (practitioner-logged)',
    periodType: 'both',
    async compute(periodStart, periodEnd) {
      try {
        const result = await query<{ value: string | null; payload: Record<string, unknown> }>(
          `SELECT
             COUNT(*)::text AS value,
             jsonb_build_object('total', COUNT(*)) AS payload
           FROM safety_concern_logs
           WHERE created_at >= $1
             AND created_at <= $2`,
          [periodStart, periodEnd]
        );
        const row = result.rows[0];
        return {
          metricValue: row?.value != null ? parseFloat(row.value) : null,
          metricPayload: (row?.payload as Record<string, unknown>) ?? {},
        };
      } catch { return { metricValue: null, metricPayload: {} }; }
    },
    evaluateDirection(current, previous) {
      return scalarDirection(current.metricValue, previous?.metricValue ?? null, false, 0);
    },
  },

  // 8. Total Oracle Turns
  {
    metricKey: 'total_oracle_turns',
    metricVersion: 'v1',
    label: 'Total Oracle Turns (success + error)',
    periodType: 'both',
    async compute(periodStart, periodEnd) {
      try {
        const result = await query<{ value: string | null; payload: Record<string, unknown> }>(
          `SELECT
             COUNT(*)::text AS value,
             jsonb_build_object(
               'total',         COUNT(*),
               'success_count', COUNT(*) FILTER (WHERE status = 'ok'),
               'error_count',   COUNT(*) FILTER (WHERE status = 'error'),
               'error_rate',    ROUND(
                 100.0 * COUNT(*) FILTER (WHERE status = 'error') / NULLIF(COUNT(*), 0),
                 2
               )
             ) AS payload
           FROM oracle_usage_events
           WHERE created_at >= $1
             AND created_at <= $2`,
          [periodStart, periodEnd]
        );
        const row = result.rows[0];
        return {
          metricValue: row?.value != null ? parseFloat(row.value) : null,
          metricPayload: (row?.payload as Record<string, unknown>) ?? {},
        };
      } catch { return { metricValue: null, metricPayload: {} }; }
    },
    evaluateDirection(current, previous) {
      return scalarDirection(current.metricValue, previous?.metricValue ?? null, true, 5);
    },
  },

  // 9. Spiralogic Distribution (weekly snapshot — not a rate, direction always insufficient)
  {
    metricKey: 'spiralogic_distribution',
    metricVersion: 'v1',
    label: 'Spiralogic Element & Phase Snapshot',
    periodType: 'weekly',
    async compute(_periodStart, _periodEnd) {
      try {
        const result = await query<{ value: string | null; payload: Record<string, unknown> }>(
          `WITH
             total   AS (SELECT COUNT(*) AS n FROM member_spiral_state),
             by_elem AS (
               SELECT COALESCE(dominant_element, 'unknown') AS key, COUNT(*) AS cnt
               FROM member_spiral_state GROUP BY dominant_element
             ),
             by_phase AS (
               SELECT COALESCE(phase::text, 'unknown') AS key, COUNT(*) AS cnt
               FROM member_spiral_state WHERE phase IS NOT NULL GROUP BY phase
             )
           SELECT
             (SELECT n FROM total)::text AS value,
             jsonb_build_object(
               'total_members', (SELECT n FROM total),
               'by_element',    (SELECT jsonb_object_agg(key, cnt) FROM by_elem),
               'by_phase',      (SELECT jsonb_object_agg(key, cnt) FROM by_phase)
             ) AS payload`,
          []
        );
        const row = result.rows[0];
        return {
          metricValue: row?.value != null ? parseFloat(row.value) : null,
          metricPayload: (row?.payload as Record<string, unknown>) ?? {},
        };
      } catch { return { metricValue: null, metricPayload: {} }; }
    },
    evaluateDirection(_current, _previous) {
      // Snapshot — directional comparison not meaningful
      return 'insufficient_data';
    },
  },

];
