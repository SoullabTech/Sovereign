/**
 * FACET ANALYTICS API ENDPOINT
 * Phase 4.4-B: Analytics Dashboard
 *
 * Returns aggregated facet analytics for dashboard visualization.
 * GET /api/analytics/facets
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

/**
 * GET /api/analytics/facets
 *
 * Returns all facet analytics with trace counts, confidence, latency.
 * Sorted by trace count (descending).
 *
 * Query Parameters:
 * - limit: Max facets to return (default: 50)
 * - minTraces: Filter facets with at least N traces (default: 1)
 *
 * Response: { ok, data, meta }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const minTraces = parseInt(searchParams.get('minTraces') || '1');

    const result = await query(`
      SELECT
        facet,
        total_traces,
        unique_users,
        avg_confidence,
        avg_latency_ms,
        first_seen,
        last_seen
      FROM analytics_facet_distribution
      WHERE total_traces >= $1
      ORDER BY total_traces DESC
      LIMIT $2
    `, [minTraces, limit]);

    return NextResponse.json({
      ok: true,
      data: result.rows,
      meta: {
        count: result.rows.length,
        filters: { minTraces, limit }
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Facet analytics error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch facet analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
