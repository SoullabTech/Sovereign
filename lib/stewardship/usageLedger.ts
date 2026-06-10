/**
 * Stewardship Usage Ledger
 *
 * Append-only, metric-only record of what each interaction COST THE SYSTEM TO PROVIDE.
 * This is a stewardship layer, not a billing instrument: it answers "what did this cost
 * to provide?" — never "what do we charge the member?". Charging stays tier-based.
 *
 * Uses: cost visibility, routing decisions, graceful degradation, capacity planning.
 *
 * Invariants:
 *  - NEVER stores prompt/response content — counts, model, route, timestamp only.
 *  - Sanctuary sessions are recorded AGGREGATE-ANONYMOUS: member_id NULL, is_sanctuary true,
 *    no session linkage. (A DB CHECK constraint also rejects any sanctuary row with a member.)
 *  - Fire-and-forget: metering must never break or slow the primary flow.
 *
 * Table: usage_events (see migrations/20260610000001_usage_events.sql)
 */

import { query } from '@/lib/db/postgres';
import { computeCostMicros } from './rateCard';
import type { TokenUsage } from '@/lib/ai/types';

export type UsageKind = 'llm' | 'voice_stt' | 'voice_tts' | 'embedding' | 'export' | (string & {});

export interface UsageEventInput {
  kind: UsageKind;
  provider: string;            // 'anthropic' | 'local' | 'ollama' | 'moonshot' | ...
  model?: string | null;
  /** Carries userId, sanctuary, sessionId, processingProfile, tier, route when present.
   *  NOTE: meta may also carry content (e.g. currentUserMessage) — this function copies
   *  ONLY content-free fields into the ledger. The meta object itself is never persisted. */
  meta?: Record<string, unknown>;
  usage?: TokenUsage | null;   // token counts (camelCase or snake_case both read)
  audioSeconds?: number | null;
  audioBytes?: number | null;
  latencyMs?: number | null;
  /** Fallback route label when meta.route is absent. */
  routeTag?: string | null;
}

function intOrNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : null;
}

function normalizeUsage(usage?: TokenUsage | null) {
  if (!usage) return { input: null, output: null, cacheCreation: null, cacheRead: null };
  return {
    input: intOrNull(usage.inputTokens ?? usage.input_tokens),
    output: intOrNull(usage.outputTokens ?? usage.output_tokens),
    cacheCreation: intOrNull(usage.cacheCreationInputTokens ?? usage.cache_creation_input_tokens),
    cacheRead: intOrNull(usage.cacheReadInputTokens ?? usage.cache_read_input_tokens),
  };
}

/**
 * Record a single billable interaction. Fire-and-forget — returns void, swallows errors.
 */
export function recordUsageEvent(evt: UsageEventInput): void {
  const meta = (evt.meta ?? {}) as Record<string, unknown>;
  const isSanctuary = meta.sanctuary === true;

  // Sanctuary = aggregate-anonymous: no member attribution, no session linkage.
  const memberId = isSanctuary ? null : ((meta.userId as string) || null);
  const sessionId = isSanctuary ? null : ((meta.sessionId as string) || null);
  const tier = (meta.tier as string) || null;
  const processingProfile = (meta.processingProfile as string) || null;
  const route = ((meta.route as string) || evt.routeTag) || null;

  const { input, output, cacheCreation, cacheRead } = normalizeUsage(evt.usage);
  const audioSeconds = intOrNull(evt.audioSeconds);
  const audioBytes = intOrNull(evt.audioBytes);

  const costMicros = computeCostMicros({
    provider: evt.provider,
    model: evt.model ?? null,
    inputTokens: input,
    outputTokens: output,
    cacheCreationTokens: cacheCreation,
    cacheReadTokens: cacheRead,
    audioSeconds,
  });

  // Discoverable log marker (metric-only, no content).
  console.log('[stewardship/ledger]', JSON.stringify({
    kind: evt.kind,
    provider: evt.provider,
    model: evt.model ?? null,
    member: isSanctuary ? 'sanctuary' : (memberId ? memberId.substring(0, 8) : 'anon'),
    input, output, cacheCreation, cacheRead,
    audioSeconds,
    costMicros,
    profile: processingProfile,
  }));

  // Only content-free correlation fields go into meta — never the raw meta object.
  const safeMeta = JSON.stringify(sessionId ? { sessionId } : {});

  query(
    `
    INSERT INTO usage_events
      (member_id, is_sanctuary, kind, route, tier, provider, model, processing_profile,
       input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens,
       audio_seconds, audio_bytes, cost_micros, latency_ms, meta)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8,
       $9, $10, $11, $12,
       $13, $14, $15, $16, $17::jsonb)
    `,
    [
      memberId, isSanctuary, evt.kind, route, tier, evt.provider, evt.model ?? null, processingProfile,
      input, output, cacheCreation, cacheRead,
      audioSeconds, audioBytes, costMicros, intOrNull(evt.latencyMs),
      safeMeta,
    ]
  ).catch((e) => {
    // Metering must never break the primary flow.
    console.warn('[stewardship/ledger] failed to record event:', {
      error: e instanceof Error ? e.message : String(e),
      kind: evt.kind,
      provider: evt.provider,
    });
  });
}

// ── Rollups ──────────────────────────────────────────────────────────────────

export interface UsageSummary {
  events: number;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  audioSeconds: number;
  costMicros: number;
}

const EMPTY_SUMMARY: UsageSummary = {
  events: 0, inputTokens: 0, outputTokens: 0,
  cacheCreationTokens: 0, cacheReadTokens: 0, audioSeconds: 0, costMicros: 0,
};

/**
 * Per-member usage rollup for a time range. Sums member-attributed events only
 * (sanctuary events have member_id NULL and are excluded by definition).
 */
export async function getMemberUsageSummary(
  memberId: string,
  options?: { since?: Date; until?: Date; kind?: string }
): Promise<UsageSummary> {
  const { since, until, kind } = options ?? {};
  let sql = `
    SELECT
      COUNT(*)::int                         AS events,
      COALESCE(SUM(input_tokens), 0)::bigint          AS input_tokens,
      COALESCE(SUM(output_tokens), 0)::bigint         AS output_tokens,
      COALESCE(SUM(cache_creation_tokens), 0)::bigint AS cache_creation_tokens,
      COALESCE(SUM(cache_read_tokens), 0)::bigint     AS cache_read_tokens,
      COALESCE(SUM(audio_seconds), 0)::bigint         AS audio_seconds,
      COALESCE(SUM(cost_micros), 0)::bigint           AS cost_micros
    FROM usage_events
    WHERE member_id = $1
  `;
  const params: unknown[] = [memberId];
  let i = 2;
  if (since) { sql += ` AND created_at >= $${i++}`; params.push(since.toISOString()); }
  if (until) { sql += ` AND created_at <= $${i++}`; params.push(until.toISOString()); }
  if (kind)  { sql += ` AND kind = $${i++}`; params.push(kind); }

  try {
    const r = await query(sql, params);
    const row = r.rows[0];
    if (!row) return { ...EMPTY_SUMMARY };
    return {
      events: Number(row.events ?? 0),
      inputTokens: Number(row.input_tokens ?? 0),
      outputTokens: Number(row.output_tokens ?? 0),
      cacheCreationTokens: Number(row.cache_creation_tokens ?? 0),
      cacheReadTokens: Number(row.cache_read_tokens ?? 0),
      audioSeconds: Number(row.audio_seconds ?? 0),
      costMicros: Number(row.cost_micros ?? 0),
    };
  } catch {
    return { ...EMPTY_SUMMARY };
  }
}

export interface SystemUsageBucket {
  bucket: string;
  events: number;
  inputTokens: number;
  outputTokens: number;
  costMicros: number;
}

const GROUPABLE: Record<string, string> = {
  kind: 'kind',
  provider: 'provider',
  model: 'model',
  tier: 'tier',
};

/**
 * System-wide usage rollup, grouped by one dimension (kind|provider|model|tier).
 * Includes sanctuary events (anonymous) — total cost-to-provide for capacity planning.
 */
export async function getSystemUsageSummary(
  options?: { since?: Date; until?: Date; groupBy?: 'kind' | 'provider' | 'model' | 'tier' }
): Promise<SystemUsageBucket[]> {
  const { since, until } = options ?? {};
  const col = GROUPABLE[options?.groupBy ?? 'kind'] ?? 'kind'; // whitelisted — no injection
  let sql = `
    SELECT
      COALESCE(${col}, '(none)') AS bucket,
      COUNT(*)::int                         AS events,
      COALESCE(SUM(input_tokens), 0)::bigint  AS input_tokens,
      COALESCE(SUM(output_tokens), 0)::bigint AS output_tokens,
      COALESCE(SUM(cost_micros), 0)::bigint   AS cost_micros
    FROM usage_events
    WHERE 1 = 1
  `;
  const params: unknown[] = [];
  let i = 1;
  if (since) { sql += ` AND created_at >= $${i++}`; params.push(since.toISOString()); }
  if (until) { sql += ` AND created_at <= $${i++}`; params.push(until.toISOString()); }
  sql += ` GROUP BY 1 ORDER BY cost_micros DESC, events DESC`;

  try {
    const r = await query(sql, params);
    return r.rows.map((row: Record<string, unknown>) => ({
      bucket: String(row.bucket ?? '(none)'),
      events: Number(row.events ?? 0),
      inputTokens: Number(row.input_tokens ?? 0),
      outputTokens: Number(row.output_tokens ?? 0),
      costMicros: Number(row.cost_micros ?? 0),
    }));
  } catch {
    return [];
  }
}
