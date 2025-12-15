// Oracle Usage Logging Service - Option A Implementation
// Tracks cost, performance, and usage patterns for "Oracle = DEEP = Opus" policy

import { query } from '../db/postgres';

export type OracleUsageEvent = {
  requestId: string;
  userId?: string;
  sessionId?: string;
  ip?: string;

  level: number;
  model?: string;
  status: 'ok' | 'error' | 'rate_limited' | 'unauthorized';
  durationMs?: number;

  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

/**
 * Log oracle usage event to database for tracking, quotas, and cost monitoring
 * Non-blocking: never fails the oracle response
 */
export async function logOracleUsage(e: OracleUsageEvent): Promise<void> {
  try {
    await query(
      `
      insert into oracle_usage_events
        (request_id, user_id, session_id, ip, level, model, status, duration_ms, prompt_tokens, completion_tokens, total_tokens)
      values
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      `,
      [
        e.requestId,
        e.userId ?? null,
        e.sessionId ?? null,
        e.ip ?? null,
        e.level,
        e.model ?? null,
        e.status,
        e.durationMs ?? null,
        e.promptTokens ?? null,
        e.completionTokens ?? null,
        e.totalTokens ?? null,
      ]
    );
  } catch (err) {
    // Never block the oracle response on telemetry - graceful degradation
    console.warn('[oracleUsage] failed to log (non-critical):', err);
  }
}

/**
 * Check if user has exceeded daily quota (for future quota implementation)
 * Returns { allowed: boolean, usageToday: number, quotaLimit: number }
 */
export async function checkUserQuota(userId: string): Promise<{
  allowed: boolean;
  usageToday: number;
  quotaLimit: number;
}> {
  try {
    const result = await query(
      `
      select count(*) as requests_today
      from oracle_usage_events
      where user_id = $1
        and status = 'ok'
        and created_at >= date_trunc('day', now())
      `,
      [userId]
    );

    const usageToday = parseInt(result.rows[0]?.requests_today || '0');

    // Default quota (can be made configurable per user)
    const quotaLimit = parseInt(process.env.ORACLE_DAILY_QUOTA || '50');

    return {
      allowed: usageToday < quotaLimit,
      usageToday,
      quotaLimit,
    };
  } catch (err) {
    console.warn('[oracleUsage] quota check failed, allowing request:', err);
    // Graceful degradation - allow on DB failure
    return { allowed: true, usageToday: 0, quotaLimit: 50 };
  }
}

/**
 * Get usage stats for monitoring dashboard
 */
export async function getUsageStats(days = 7): Promise<{
  totalRequests: number;
  successfulRequests: number;
  errorRate: number;
  avgDurationMs: number;
  totalTokensUsed: number;
  avgTokensPerRequest: number;
}> {
  try {
    const result = await query(
      `
      select
        count(*) as total_requests,
        count(*) filter (where status = 'ok') as successful_requests,
        avg(duration_ms) filter (where status = 'ok') as avg_duration_ms,
        sum(total_tokens) filter (where status = 'ok') as total_tokens_used,
        avg(total_tokens) filter (where status = 'ok') as avg_tokens_per_request
      from oracle_usage_events
      where created_at >= now() - interval '$1 days'
      `,
      [days]
    );

    const row = result.rows[0];
    const totalRequests = parseInt(row?.total_requests || '0');
    const successfulRequests = parseInt(row?.successful_requests || '0');

    return {
      totalRequests,
      successfulRequests,
      errorRate: totalRequests > 0 ? (totalRequests - successfulRequests) / totalRequests : 0,
      avgDurationMs: parseFloat(row?.avg_duration_ms || '0'),
      totalTokensUsed: parseInt(row?.total_tokens_used || '0'),
      avgTokensPerRequest: parseFloat(row?.avg_tokens_per_request || '0'),
    };
  } catch (err) {
    console.error('[oracleUsage] stats query failed:', err);
    return {
      totalRequests: 0,
      successfulRequests: 0,
      errorRate: 0,
      avgDurationMs: 0,
      totalTokensUsed: 0,
      avgTokensPerRequest: 0,
    };
  }
}