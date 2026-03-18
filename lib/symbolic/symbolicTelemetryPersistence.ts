/**
 * Symbolic Telemetry Persistence — Phase 21
 *
 * Append-only DB writes for governed symbolic pipeline events.
 * Answers time-based calibration questions the in-memory store cannot:
 *   - Did fallback spike after a deploy?
 *   - Are blocked reasons increasing over time?
 *   - Which domains are drifting week to week?
 *   - Is memory eligibility getting too permissive?
 *
 * DESIGN:
 *   - Fire-and-forget writes — never blocks the oracle response
 *   - IDs, classifications, and surface flags only — no text content
 *   - Batch insert per oracle call (not per item)
 *   - Graceful degradation on DB failure (logs warn, continues)
 *
 * Table: symbolic_telemetry_events
 * Migration: database/migrations/20260317000001_symbolic_telemetry.sql
 */

import { query } from '@/lib/db/postgres';
import type { SymbolicTelemetryEvent } from '@/lib/symbolic/symbolicTelemetry';

// ─────────────────────────────────────────────────────────────────────────────
// WRITE
// ─────────────────────────────────────────────────────────────────────────────

export interface TelemetryPersistContext {
  /** Oracle userId — stored as member_id */
  memberId?: string;
  /** Oracle sessionId — stored as session_id */
  sessionId?: string;
  /** Oracle route identifier (e.g. 'oracle/conversation') */
  route?: string;
  /** Active element/mode during the call (fire|water|earth|air|aether) */
  mode?: string;
  /** Per-request UUID — ties all items from one oracle call together */
  requestId?: string;
}

/**
 * Persist a batch of telemetry events to the DB (fire-and-forget).
 * Returns void so callers cannot accidentally await it.
 * Errors are caught and logged — never propagated.
 */
export function persistSymbolicTelemetryBatch(
  events: SymbolicTelemetryEvent[],
  ctx: TelemetryPersistContext = {}
): void {
  if (events.length === 0) return;

  _doBatchInsert(events, ctx).catch(err => {
    console.warn('[symbolic-telemetry] Persist failed (non-critical):', {
      message: err instanceof Error ? err.message : String(err),
      eventCount: events.length,
    });
  });
}

async function _doBatchInsert(
  events: SymbolicTelemetryEvent[],
  ctx: TelemetryPersistContext
): Promise<void> {
  // 16 columns per row — build positional placeholders ($1, $2, ...)
  const colCount = 16;
  const now = new Date().toISOString();
  const placeholders = events
    .map((_, i) => {
      const base = i * colCount;
      const params = Array.from({ length: colCount }, (_, j) => `$${base + j + 1}`);
      return `(${params.join(', ')})`;
    })
    .join(', ');

  const values = events.flatMap(e => [
    e.traceId,
    e.sessionId ?? ctx.sessionId ?? null,
    ctx.memberId ?? null,
    e.domain,
    e.authority,
    e.promptRole,
    e.renderBlocked,
    e.blockReason ?? null,
    e.allowedInPrompt,
    e.allowedInPractitionerView,
    e.allowedInUserView,
    e.allowedInMemory,
    now,
    ctx.route ?? null,
    ctx.mode ?? null,
    ctx.requestId ?? null,
  ]);

  await query(
    `INSERT INTO symbolic_telemetry_events
       (trace_id, session_id, member_id,
        domain, authority, prompt_role,
        render_blocked, block_reason,
        allowed_in_prompt, allowed_in_practitioner_view,
        allowed_in_user_view, allowed_in_memory,
        created_at, route, mode, request_id)
     VALUES ${placeholders}`,
    values
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — Summary Queries
// ─────────────────────────────────────────────────────────────────────────────

export interface TelemetryWindowRow {
  domain: string;
  authority: string;
  prompt_role: string;
  render_blocked: boolean;
  block_reason: string | null;
  count: number;
  memory_eligible: number;
  prompt_eligible: number;
}

/**
 * Aggregate telemetry for a past time window.
 * Used by /api/debug/symbolic-telemetry?source=db&window=<hours>
 */
export async function queryTelemetrySummary(
  windowHours: number = 24,
  filters: { memberId?: string; sessionId?: string; route?: string; mode?: string; domain?: string } = {}
): Promise<TelemetryWindowRow[]> {
  const cutoff = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
  const params: unknown[] = [cutoff];
  const conditions: string[] = ['created_at >= $1'];
  let paramIdx = 2;

  if (filters.memberId) {
    conditions.push(`member_id = $${paramIdx++}`);
    params.push(filters.memberId);
  }
  if (filters.sessionId) {
    conditions.push(`session_id = $${paramIdx++}`);
    params.push(filters.sessionId);
  }
  if (filters.route) {
    conditions.push(`route = $${paramIdx++}`);
    params.push(filters.route);
  }
  if (filters.mode) {
    conditions.push(`mode = $${paramIdx++}`);
    params.push(filters.mode);
  }
  if (filters.domain) {
    conditions.push(`domain = $${paramIdx++}`);
    params.push(filters.domain);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const result = await query<TelemetryWindowRow>(
    `SELECT
       domain,
       authority,
       prompt_role,
       render_blocked,
       block_reason,
       COUNT(*)::int                                             AS count,
       COUNT(*) FILTER (WHERE allowed_in_memory)::int           AS memory_eligible,
       COUNT(*) FILTER (WHERE allowed_in_prompt)::int           AS prompt_eligible
     FROM symbolic_telemetry_events
     ${where}
     GROUP BY domain, authority, prompt_role, render_blocked, block_reason
     ORDER BY count DESC`,
    params
  );

  return result.rows;
}

export interface TelemetryTrendRow {
  hour_bucket: string;
  domain: string;
  authority: string;
  event_count: number;
  memory_eligible: number;
  blocked: number;
}

/**
 * Hourly trend for a time window. Used to detect drifts and spikes.
 */
export async function queryTelemetryTrend(
  windowHours: number = 72,
  filters: { memberId?: string; domain?: string; route?: string; mode?: string } = {}
): Promise<TelemetryTrendRow[]> {
  const cutoff = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
  const params: unknown[] = [cutoff];
  const conditions: string[] = ['created_at >= $1'];
  let paramIdx = 2;

  if (filters.memberId) {
    conditions.push(`member_id = $${paramIdx++}`);
    params.push(filters.memberId);
  }
  if (filters.domain) {
    conditions.push(`domain = $${paramIdx++}`);
    params.push(filters.domain);
  }
  if (filters.route) {
    conditions.push(`route = $${paramIdx++}`);
    params.push(filters.route);
  }
  if (filters.mode) {
    conditions.push(`mode = $${paramIdx++}`);
    params.push(filters.mode);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const result = await query<TelemetryTrendRow>(
    `SELECT
       DATE_TRUNC('hour', created_at)::text                     AS hour_bucket,
       domain,
       authority,
       COUNT(*)::int                                             AS event_count,
       COUNT(*) FILTER (WHERE allowed_in_memory)::int           AS memory_eligible,
       COUNT(*) FILTER (WHERE render_blocked)::int              AS blocked
     FROM symbolic_telemetry_events
     ${where}
     GROUP BY DATE_TRUNC('hour', created_at), domain, authority
     ORDER BY hour_bucket DESC, event_count DESC`,
    params
  );

  return result.rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — Mode Breakdown Query (Phase 23)
// ─────────────────────────────────────────────────────────────────────────────

export interface TelemetryModeRow {
  mode: string | null;
  domain: string;
  authority: string;
  event_count: number;
  blocked: number;
  memory_eligible: number;
  prompt_eligible: number;
  fallback_count: number;
}

/**
 * Aggregate telemetry grouped by mode (element) for a time window.
 * Answers: does fire mode produce more blocked items than water mode?
 */
export async function queryTelemetryByMode(
  windowHours: number = 72,
  filters: { route?: string; domain?: string } = {}
): Promise<TelemetryModeRow[]> {
  const cutoff = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
  const params: unknown[] = [cutoff];
  const conditions: string[] = ['created_at >= $1'];
  let paramIdx = 2;

  if (filters.route) {
    conditions.push(`route = $${paramIdx++}`);
    params.push(filters.route);
  }
  if (filters.domain) {
    conditions.push(`domain = $${paramIdx++}`);
    params.push(filters.domain);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const result = await query<TelemetryModeRow>(
    `SELECT
       mode,
       domain,
       authority,
       COUNT(*)::int                                             AS event_count,
       COUNT(*) FILTER (WHERE render_blocked)::int              AS blocked,
       COUNT(*) FILTER (WHERE allowed_in_memory)::int           AS memory_eligible,
       COUNT(*) FILTER (WHERE allowed_in_prompt)::int           AS prompt_eligible,
       COUNT(*) FILTER (WHERE authority = 'fallback')::int      AS fallback_count
     FROM symbolic_telemetry_events
     ${where}
     GROUP BY mode, domain, authority
     ORDER BY event_count DESC`,
    params
  );

  return result.rows;
}
