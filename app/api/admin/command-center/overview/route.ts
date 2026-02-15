export const dynamic = 'force-dynamic';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

interface Alert {
  severity: 'critical' | 'warn' | 'info';
  message: string;
  metric: string;
}

export async function GET() {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({
      period: { start: '', end: '', days: 30 },
      vitals: {},
      alerts: [],
      sparklines: {},
    });
  }

  try {
    const days = 30;

    // Main aggregation query using CTEs
    const overviewResult = await query(`
      WITH period_filter AS (
        SELECT now() - ($1::int || ' days')::interval AS start_ts
      ),
      conversations AS (
        SELECT COUNT(*)::int as total,
               COUNT(DISTINCT user_id)::int as active_members,
               COALESCE(AVG(duration_ms), 0)::int as avg_ms,
               COUNT(*) FILTER (WHERE status != 'success')::int as errors
        FROM oracle_usage_events, period_filter
        WHERE created_at >= start_ts
      ),
      ain AS (
        SELECT COUNT(*)::int as total,
               COUNT(*) FILTER (WHERE pass = true)::int as gold
        FROM ain_shape_telemetry, period_filter
        WHERE created_at >= start_ts
      ),
      field AS (
        SELECT COUNT(*)::int as total,
               COUNT(*) FILTER (WHERE frameworks_active IS NOT NULL AND array_length(frameworks_active, 1) > 0)::int as with_frameworks
        FROM field_monitor_turns, period_filter
        WHERE created_at >= start_ts
      )
      SELECT * FROM conversations, ain, field
    `, [days]);

    const row = overviewResult.rows[0] || {
      total: 0,
      active_members: 0,
      avg_ms: 0,
      errors: 0,
    };

    // Sparklines query (last 7 days)
    const sparklineResult = await query(`
      SELECT date_trunc('day', created_at)::date as day,
             COUNT(*)::int as total,
             COUNT(*) FILTER (WHERE status != 'success')::int as errors,
             COALESCE(AVG(duration_ms), 0)::int as avg_ms
      FROM oracle_usage_events
      WHERE created_at >= now() - interval '7 days'
      GROUP BY 1 ORDER BY 1
    `);

    // Build sparkline arrays (ensure 7 days)
    const sparklineMap = new Map<string, { total: number; errors: number; avg_ms: number }>();
    sparklineResult.rows.forEach((r) => {
      sparklineMap.set(r.day, { total: r.total, errors: r.errors, avg_ms: r.avg_ms });
    });

    const conversations: number[] = [];
    const errors: number[] = [];
    const avgLatency: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const data = sparklineMap.get(key) || { total: 0, errors: 0, avg_ms: 0 };
      conversations.push(data.total);
      errors.push(data.errors);
      avgLatency.push(data.avg_ms);
    }

    // Calculate rates
    const errorRate = row.total > 0 ? (row.errors / row.total) * 100 : 0;
    const fieldEngineHitRate = row.total > 0 ? (row.with_frameworks / row.total) * 100 : 0;
    const ainGoldRate = row.total > 0 ? (row.gold / row.total) * 100 : 0;

    // Compute alerts
    const alerts: Alert[] = [];
    if (errorRate > 5) {
      alerts.push({
        severity: 'critical',
        message: `Error rate at ${errorRate.toFixed(1)}% (threshold: 5%)`,
        metric: 'errorRate',
      });
    } else if (errorRate > 2) {
      alerts.push({
        severity: 'warn',
        message: `Error rate at ${errorRate.toFixed(1)}% (threshold: 2%)`,
        metric: 'errorRate',
      });
    }

    if (row.avg_ms > 5000) {
      alerts.push({
        severity: 'warn',
        message: `Avg response time ${row.avg_ms}ms (threshold: 5000ms)`,
        metric: 'avgResponseMs',
      });
    }

    if (ainGoldRate < 50 && row.total > 10) {
      alerts.push({
        severity: 'warn',
        message: `AIN gold rate at ${ainGoldRate.toFixed(1)}% (threshold: 50%)`,
        metric: 'ainGoldRate',
      });
    }

    return NextResponse.json({
      period: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        days,
      },
      vitals: {
        totalConversations: row.total || 0,
        activeMembers: row.active_members || 0,
        avgResponseMs: row.avg_ms || 0,
        fieldEngineHitRate: Math.round(fieldEngineHitRate * 10) / 10,
        ainGoldRate: Math.round(ainGoldRate * 10) / 10,
        errorRate: Math.round(errorRate * 10) / 10,
      },
      alerts,
      sparklines: {
        conversations,
        errors,
        avgLatency,
      },
    });
  } catch (error) {
    console.error('Command Center Overview API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({
      period: { start: '', end: '', days: 30 },
      vitals: {},
      alerts: [],
      sparklines: {},
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const days = Math.max(1, Math.min(365, body.days || 30));

    // Main aggregation query using CTEs
    const overviewResult = await query(`
      WITH period_filter AS (
        SELECT now() - ($1::int || ' days')::interval AS start_ts
      ),
      conversations AS (
        SELECT COUNT(*)::int as total,
               COUNT(DISTINCT user_id)::int as active_members,
               COALESCE(AVG(duration_ms), 0)::int as avg_ms,
               COUNT(*) FILTER (WHERE status != 'success')::int as errors
        FROM oracle_usage_events, period_filter
        WHERE created_at >= start_ts
      ),
      ain AS (
        SELECT COUNT(*)::int as total,
               COUNT(*) FILTER (WHERE pass = true)::int as gold
        FROM ain_shape_telemetry, period_filter
        WHERE created_at >= start_ts
      ),
      field AS (
        SELECT COUNT(*)::int as total,
               COUNT(*) FILTER (WHERE frameworks_active IS NOT NULL AND array_length(frameworks_active, 1) > 0)::int as with_frameworks
        FROM field_monitor_turns, period_filter
        WHERE created_at >= start_ts
      )
      SELECT * FROM conversations, ain, field
    `, [days]);

    const row = overviewResult.rows[0] || {
      total: 0,
      active_members: 0,
      avg_ms: 0,
      errors: 0,
    };

    // Sparklines query (last 7 days)
    const sparklineResult = await query(`
      SELECT date_trunc('day', created_at)::date as day,
             COUNT(*)::int as total,
             COUNT(*) FILTER (WHERE status != 'success')::int as errors,
             COALESCE(AVG(duration_ms), 0)::int as avg_ms
      FROM oracle_usage_events
      WHERE created_at >= now() - interval '7 days'
      GROUP BY 1 ORDER BY 1
    `);

    // Build sparkline arrays (ensure 7 days)
    const sparklineMap = new Map<string, { total: number; errors: number; avg_ms: number }>();
    sparklineResult.rows.forEach((r) => {
      sparklineMap.set(r.day, { total: r.total, errors: r.errors, avg_ms: r.avg_ms });
    });

    const conversations: number[] = [];
    const errors: number[] = [];
    const avgLatency: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const data = sparklineMap.get(key) || { total: 0, errors: 0, avg_ms: 0 };
      conversations.push(data.total);
      errors.push(data.errors);
      avgLatency.push(data.avg_ms);
    }

    // Calculate rates
    const errorRate = row.total > 0 ? (row.errors / row.total) * 100 : 0;
    const fieldEngineHitRate = row.total > 0 ? (row.with_frameworks / row.total) * 100 : 0;
    const ainGoldRate = row.total > 0 ? (row.gold / row.total) * 100 : 0;

    // Compute alerts
    const alerts: Alert[] = [];
    if (errorRate > 5) {
      alerts.push({
        severity: 'critical',
        message: `Error rate at ${errorRate.toFixed(1)}% (threshold: 5%)`,
        metric: 'errorRate',
      });
    } else if (errorRate > 2) {
      alerts.push({
        severity: 'warn',
        message: `Error rate at ${errorRate.toFixed(1)}% (threshold: 2%)`,
        metric: 'errorRate',
      });
    }

    if (row.avg_ms > 5000) {
      alerts.push({
        severity: 'warn',
        message: `Avg response time ${row.avg_ms}ms (threshold: 5000ms)`,
        metric: 'avgResponseMs',
      });
    }

    if (ainGoldRate < 50 && row.total > 10) {
      alerts.push({
        severity: 'warn',
        message: `AIN gold rate at ${ainGoldRate.toFixed(1)}% (threshold: 50%)`,
        metric: 'ainGoldRate',
      });
    }

    return NextResponse.json({
      period: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        days,
      },
      vitals: {
        totalConversations: row.total || 0,
        activeMembers: row.active_members || 0,
        avgResponseMs: row.avg_ms || 0,
        fieldEngineHitRate: Math.round(fieldEngineHitRate * 10) / 10,
        ainGoldRate: Math.round(ainGoldRate * 10) / 10,
        errorRate: Math.round(errorRate * 10) / 10,
      },
      alerts,
      sparklines: {
        conversations,
        errors,
        avgLatency,
      },
    });
  } catch (error) {
    console.error('Command Center Overview API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}
