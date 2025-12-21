import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

/**
 * HOURLY ACTIVITY ANALYTICS API
 *
 * Returns temporal patterns in consciousness trace activity.
 * Shows hourly breakdowns of trace counts, safety events, and facet distribution.
 *
 * Route: GET /api/analytics/activity
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '168'); // Default: 7 days
    const hoursAgo = parseInt(searchParams.get('hoursAgo') || '168');

    // Query hourly activity materialized view
    const result = await query(`
      SELECT
        hour,
        trace_count,
        unique_users,
        avg_latency_ms,
        critical_events,
        elevated_events,
        facet_breakdown
      FROM analytics_hourly_activity
      WHERE hour >= NOW() - INTERVAL '${hoursAgo} hours'
      ORDER BY hour DESC
      LIMIT $1
    `, [limit]);

    return NextResponse.json({
      ok: true,
      data: result.rows,
      meta: {
        count: result.rows.length,
        filters: { hoursAgo, limit }
      }
    });

  } catch (error) {
    console.error('Activity analytics error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to retrieve activity analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
