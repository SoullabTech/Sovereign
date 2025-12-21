import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

/**
 * AGENT METRICS ANALYTICS API
 *
 * Returns agent routing frequency and latency percentiles.
 * Shows which agents (MainOracleAgent, ShadowAgent, etc.) are handling
 * traffic and their performance characteristics.
 *
 * Route: GET /api/analytics/agents
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const minRoutes = parseInt(searchParams.get('minRoutes') || '1');

    // Query agent metrics materialized view
    const result = await query(`
      SELECT
        agent,
        total_routes,
        unique_users,
        avg_latency_ms,
        p50_latency,
        p95_latency,
        p99_latency,
        first_route,
        last_route
      FROM analytics_agent_metrics
      WHERE total_routes >= $1
      ORDER BY total_routes DESC
      LIMIT $2
    `, [minRoutes, limit]);

    return NextResponse.json({
      ok: true,
      data: result.rows,
      meta: {
        count: result.rows.length,
        filters: { minRoutes, limit }
      }
    });

  } catch (error) {
    console.error('Agent analytics error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to retrieve agent analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
