export const dynamic = 'force-dynamic';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function GET() {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({
      period: { start: '', end: '', days: 30 },
      oracle: {},
      latencyByPath: {},
      recentErrors: [],
    });
  }

  try {
    const days = 30;

    // Oracle usage stats
    const oracleResult = await query(`
      SELECT
        COUNT(*)::int as total,
        COALESCE(AVG(duration_ms), 0)::int as avg_ms,
        COALESCE(AVG(input_tokens), 0)::int as avg_input,
        COALESCE(AVG(output_tokens), 0)::int as avg_output,
        COALESCE(SUM(input_tokens + output_tokens), 0)::bigint as total_tokens
      FROM oracle_usage_events
      WHERE created_at >= now() - ($1::int || ' days')::interval
    `, [days]);

    const oracleRow = oracleResult.rows[0] || {
      total: 0,
      avg_ms: 0,
      avg_input: 0,
      avg_output: 0,
      total_tokens: 0,
    };

    // Model distribution
    const modelResult = await query(`
      SELECT model, COUNT(*)::int as count
      FROM oracle_usage_events
      WHERE created_at >= now() - ($1::int || ' days')::interval
      GROUP BY model
      ORDER BY count DESC
    `, [days]);

    const byModel: Record<string, number> = {};
    modelResult.rows.forEach((row) => {
      byModel[row.model] = row.count;
    });

    // Status distribution
    const statusResult = await query(`
      SELECT status, COUNT(*)::int as count
      FROM oracle_usage_events
      WHERE created_at >= now() - ($1::int || ' days')::interval
      GROUP BY status
      ORDER BY count DESC
    `, [days]);

    const byStatus: Record<string, number> = {};
    statusResult.rows.forEach((row) => {
      byStatus[row.status] = row.count;
    });

    // Recent errors (last 20)
    const errorsResult = await query(`
      SELECT request_id, status, model, created_at
      FROM oracle_usage_events
      WHERE status != 'success' AND created_at >= now() - ($1::int || ' days')::interval
      ORDER BY created_at DESC
      LIMIT 20
    `, [days]);

    const recentErrors = errorsResult.rows.map((row) => ({
      request_id: row.request_id,
      status: row.status,
      created_at: row.created_at,
      model: row.model,
    }));

    // Latency by processing path (from field_monitor_turns)
    const latencyResult = await query(`
      SELECT processing_path, COALESCE(AVG(response_quality), 0)::float as avg_quality
      FROM field_monitor_turns
      WHERE created_at >= now() - ($1::int || ' days')::interval AND processing_path IS NOT NULL
      GROUP BY processing_path
    `, [days]);

    const latencyByPath: Record<string, number> = {};
    latencyResult.rows.forEach((row) => {
      latencyByPath[row.processing_path] = Math.round(row.avg_quality * 100) / 100;
    });

    return NextResponse.json({
      period: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        days,
      },
      oracle: {
        total: oracleRow.total,
        byModel,
        byStatus,
        avgDurationMs: oracleRow.avg_ms,
        avgInputTokens: oracleRow.avg_input,
        avgOutputTokens: oracleRow.avg_output,
        totalTokens: Number(oracleRow.total_tokens),
      },
      latencyByPath,
      recentErrors,
    });
  } catch (error) {
    console.error('System API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system metrics' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({
      period: { start: '', end: '', days: 30 },
      oracle: {},
      latencyByPath: {},
      recentErrors: [],
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const days = Math.max(1, Math.min(365, body.days || 30));

    // Oracle usage stats
    const oracleResult = await query(`
      SELECT
        COUNT(*)::int as total,
        COALESCE(AVG(duration_ms), 0)::int as avg_ms,
        COALESCE(AVG(input_tokens), 0)::int as avg_input,
        COALESCE(AVG(output_tokens), 0)::int as avg_output,
        COALESCE(SUM(input_tokens + output_tokens), 0)::bigint as total_tokens
      FROM oracle_usage_events
      WHERE created_at >= now() - ($1::int || ' days')::interval
    `, [days]);

    const oracleRow = oracleResult.rows[0] || {
      total: 0,
      avg_ms: 0,
      avg_input: 0,
      avg_output: 0,
      total_tokens: 0,
    };

    // Model distribution
    const modelResult = await query(`
      SELECT model, COUNT(*)::int as count
      FROM oracle_usage_events
      WHERE created_at >= now() - ($1::int || ' days')::interval
      GROUP BY model
      ORDER BY count DESC
    `, [days]);

    const byModel: Record<string, number> = {};
    modelResult.rows.forEach((row) => {
      byModel[row.model] = row.count;
    });

    // Status distribution
    const statusResult = await query(`
      SELECT status, COUNT(*)::int as count
      FROM oracle_usage_events
      WHERE created_at >= now() - ($1::int || ' days')::interval
      GROUP BY status
      ORDER BY count DESC
    `, [days]);

    const byStatus: Record<string, number> = {};
    statusResult.rows.forEach((row) => {
      byStatus[row.status] = row.count;
    });

    // Recent errors (last 20)
    const errorsResult = await query(`
      SELECT request_id, status, model, created_at
      FROM oracle_usage_events
      WHERE status != 'success' AND created_at >= now() - ($1::int || ' days')::interval
      ORDER BY created_at DESC
      LIMIT 20
    `, [days]);

    const recentErrors = errorsResult.rows.map((row) => ({
      request_id: row.request_id,
      status: row.status,
      created_at: row.created_at,
      model: row.model,
    }));

    // Latency by processing path (from field_monitor_turns)
    const latencyResult = await query(`
      SELECT processing_path, COALESCE(AVG(response_quality), 0)::float as avg_quality
      FROM field_monitor_turns
      WHERE created_at >= now() - ($1::int || ' days')::interval AND processing_path IS NOT NULL
      GROUP BY processing_path
    `, [days]);

    const latencyByPath: Record<string, number> = {};
    latencyResult.rows.forEach((row) => {
      latencyByPath[row.processing_path] = Math.round(row.avg_quality * 100) / 100;
    });

    return NextResponse.json({
      period: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        days,
      },
      oracle: {
        total: oracleRow.total,
        byModel,
        byStatus,
        avgDurationMs: oracleRow.avg_ms,
        avgInputTokens: oracleRow.avg_input,
        avgOutputTokens: oracleRow.avg_output,
        totalTokens: Number(oracleRow.total_tokens),
      },
      latencyByPath,
      recentErrors,
    });
  } catch (error) {
    console.error('System API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system metrics' },
      { status: 500 }
    );
  }
}
