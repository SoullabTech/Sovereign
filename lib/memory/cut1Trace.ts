import type { QueryResult, QueryResultRow } from 'pg';
import { pool } from '@/lib/db/postgres';

export const CUT1_TRACE_POLICY_KEY = 'developmental_nonvector_decay_v1' as const;
export const CUT1_TRACE_CUTOFF = 12 as const;

export interface Cut1TraceEntry {
  memory_id: string;
  rank: number;
  live_score: number | null;
  neutral_score: number | null;
}

export interface Cut1TracePayload {
  eligibleCount: number;
  liveTop: Cut1TraceEntry[];
  neutralTop: Cut1TraceEntry[];
  capturedAt: string | Date;
}

export interface RecordCut1TraceInput extends Cut1TracePayload {
  retrievalId: string;
  userId: string;
  sessionId: string;
  messageId: string;
}

export class Cut1TraceIdempotencyConflict extends Error {
  constructor() {
    super('CUT1_TRACE_IDEMPOTENCY_CONFLICT');
    this.name = 'Cut1TraceIdempotencyConflict';
  }
}

export const CUT1_BASELINE_NONVECTOR_SQL = `
  SELECT
    id,
    memory_type,
    facet_code,
    entity_tags,
    content_text,
    significance,
    formed_at,
    last_confirmed_at,
    confirmed_by_user,
    recall_count,
    (
      0.40 * COALESCE(
        calculate_decayed_confidence(significance, memory_type, last_confirmed_at, formed_at),
        significance
      ) +
      0.35 * EXP(-EXTRACT(EPOCH FROM (NOW() - formed_at)) / 86400.0 / 30.0) +
      0.15 * CASE WHEN confirmed_by_user THEN 0.15 ELSE 0 END +
      0.10 * LEAST(recall_count / 10.0, 1.0)
    ) AS score
  FROM developmental_memories
  WHERE user_id = $1
    AND content_text IS NOT NULL
    AND (valid_to IS NULL OR valid_to > NOW())
  ORDER BY score DESC
  LIMIT 12
`;

export const CUT1_OBSERVED_NONVECTOR_SQL = `
  WITH scored AS MATERIALIZED (
    SELECT
      id,
      memory_type,
      facet_code,
      entity_tags,
      content_text,
      significance,
      formed_at,
      last_confirmed_at,
      confirmed_by_user,
      recall_count,
      (
        0.40 * COALESCE(
          calculate_decayed_confidence(significance, memory_type, last_confirmed_at, formed_at),
          significance
        ) +
        0.35 * EXP(-EXTRACT(EPOCH FROM (NOW() - formed_at)) / 86400.0 / 30.0) +
        0.15 * CASE WHEN confirmed_by_user THEN 0.15 ELSE 0 END +
        0.10 * LEAST(recall_count / 10.0, 1.0)
      ) AS score,
      (
        0.40 * significance +
        0.35 * EXP(-EXTRACT(EPOCH FROM (NOW() - formed_at)) / 86400.0 / 30.0) +
        0.15 * CASE WHEN confirmed_by_user THEN 0.15 ELSE 0 END +
        0.10 * LEAST(recall_count / 10.0, 1.0)
      ) AS neutral_score
    FROM developmental_memories
    WHERE user_id = $1
      AND content_text IS NOT NULL
      AND (valid_to IS NULL OR valid_to > NOW())
  ),
  live_top AS MATERIALIZED (
    SELECT *
    FROM scored
    ORDER BY score DESC
    LIMIT 12
  ),
  neutral_top AS MATERIALIZED (
    SELECT *
    FROM scored
    ORDER BY neutral_score DESC
    LIMIT 12
  ),
  live_ranked AS (
    SELECT id, score, neutral_score,
           ROW_NUMBER() OVER (ORDER BY score DESC) AS rank
    FROM live_top
  ),
  neutral_ranked AS (
    SELECT id, score, neutral_score,
           ROW_NUMBER() OVER (ORDER BY neutral_score DESC) AS rank
    FROM neutral_top
  ),
  trace_meta AS (
    SELECT
      (SELECT COUNT(*)::int FROM scored) AS eligible_count,
      COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'memory_id', id,
            'rank', rank,
            'live_score', score,
            'neutral_score', neutral_score
          ) ORDER BY rank
        )
        FROM live_ranked
      ), '[]'::jsonb) AS live_top_trace,
      COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'memory_id', id,
            'rank', rank,
            'live_score', score,
            'neutral_score', neutral_score
          ) ORDER BY rank
        )
        FROM neutral_ranked
      ), '[]'::jsonb) AS neutral_top_trace,
      statement_timestamp() AS captured_at
  )
  SELECT
    l.id,
    l.memory_type,
    l.facet_code,
    l.entity_tags,
    l.content_text,
    l.significance,
    l.formed_at,
    l.last_confirmed_at,
    l.confirmed_by_user,
    l.recall_count,
    l.score,
    t.eligible_count AS "__traceEligibleCount",
    t.live_top_trace AS "__traceLiveTop",
    t.neutral_top_trace AS "__traceNeutralTop",
    t.captured_at AS "__traceCapturedAt"
  FROM live_top l
  CROSS JOIN trace_meta t
  ORDER BY l.score DESC
`;

export async function runObservedCut1Read<T extends QueryResultRow = any>(
  userId: string,
): Promise<QueryResult<T>> {
  if (!pool) {
    throw new Error('CUT1_TRACE_POOL_UNAVAILABLE');
  }

  const started = Date.now();
  const result = await pool.query<T>(CUT1_OBSERVED_NONVECTOR_SQL, [userId]);
  const durationMs = Date.now() - started;
  if (durationMs > 100) {
    console.warn(`[cut1_trace_read_slow] durationMs=${durationMs}`);
  }
  return result;
}

function sameScore(a: unknown, b: unknown): boolean {
  if (a == null || b == null) return a == null && b == null;
  return Object.is(Number(a), Number(b));
}

function sameEntries(a: unknown, b: Cut1TraceEntry[]): boolean {
  if (!Array.isArray(a) || a.length !== b.length) return false;
  return a.every((raw, index) => {
    const left = raw as Cut1TraceEntry;
    const right = b[index];
    return left?.memory_id === right.memory_id
      && Number(left?.rank) === Number(right.rank)
      && sameScore(left?.live_score, right.live_score)
      && sameScore(left?.neutral_score, right.neutral_score);
  });
}

function sameCapturedAt(a: unknown, b: string | Date): boolean {
  const left = new Date(a as any).getTime();
  const right = new Date(b).getTime();
  return Number.isFinite(left) && left === right;
}

export async function recordCut1Trace(input: RecordCut1TraceInput): Promise<'inserted' | 'existing'> {
  if (!pool) {
    throw new Error('CUT1_TRACE_POOL_UNAVAILABLE');
  }

  const inserted = await pool.query<{ retrieval_id: string }>(
    `
      INSERT INTO memory_cut1_trace_runs (
        retrieval_id, user_id, session_id, message_id,
        policy_key, cutoff, eligible_count,
        live_top, neutral_top, captured_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10)
      ON CONFLICT (retrieval_id) DO NOTHING
      RETURNING retrieval_id
    `,
    [
      input.retrievalId,
      input.userId,
      input.sessionId,
      input.messageId,
      CUT1_TRACE_POLICY_KEY,
      CUT1_TRACE_CUTOFF,
      input.eligibleCount,
      JSON.stringify(input.liveTop),
      JSON.stringify(input.neutralTop),
      input.capturedAt,
    ],
  );

  if ((inserted.rowCount ?? 0) > 0) return 'inserted';

  const existing = await pool.query<{
    user_id: string;
    session_id: string;
    message_id: string;
    policy_key: string;
    cutoff: number;
    eligible_count: number;
    live_top: unknown;
    neutral_top: unknown;
    captured_at: string | Date;
  }>(
    `
      SELECT user_id, session_id, message_id, policy_key, cutoff, eligible_count,
             live_top, neutral_top, captured_at
      FROM memory_cut1_trace_runs
      WHERE retrieval_id = $1
    `,
    [input.retrievalId],
  );

  const row = existing.rows[0];
  const equivalent = !!row
    && row.user_id === input.userId
    && row.session_id === input.sessionId
    && row.message_id === input.messageId
    && row.policy_key === CUT1_TRACE_POLICY_KEY
    && Number(row.cutoff) === CUT1_TRACE_CUTOFF
    && Number(row.eligible_count) === input.eligibleCount
    && sameEntries(row.live_top, input.liveTop)
    && sameEntries(row.neutral_top, input.neutralTop)
    && sameCapturedAt(row.captured_at, input.capturedAt);

  if (!equivalent) throw new Cut1TraceIdempotencyConflict();
  return 'existing';
}

export function extractCut1TracePayload(row: any): Cut1TracePayload | null {
  if (!row || !Array.isArray(row.__traceLiveTop) || !Array.isArray(row.__traceNeutralTop)) {
    return null;
  }

  return {
    eligibleCount: Number(row.__traceEligibleCount),
    liveTop: row.__traceLiveTop as Cut1TraceEntry[],
    neutralTop: row.__traceNeutralTop as Cut1TraceEntry[],
    capturedAt: row.__traceCapturedAt,
  };
}

export function deriveDecayExcludedIds(payload: Pick<Cut1TracePayload, 'liveTop' | 'neutralTop'>): string[] {
  const live = new Set(payload.liveTop.map((entry) => entry.memory_id));
  return payload.neutralTop
    .map((entry) => entry.memory_id)
    .filter((id) => !live.has(id));
}
