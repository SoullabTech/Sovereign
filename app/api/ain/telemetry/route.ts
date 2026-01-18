export const dynamic = "force-static";

/**
 * AIN Shape Telemetry API
 *
 * Fetches telemetry data for the labtools dashboard.
 * Returns aggregated stats and recent entries.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Return stub data during static export (Capacitor builds)
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({
      success: true,
      entries: [],
      stats: {},
      hourly: [],
      byRoute: [],
      pagination: { limit: 100, offset: 0, hours: 24 },
      message: 'Static export - use runtime API'
    });
  }

  // Dynamic import to avoid build-time DB connection
  const { query } = await import('@/lib/db/postgres');

  const searchParams = req.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
  const offset = parseInt(searchParams.get('offset') || '0');
  const hours = parseInt(searchParams.get('hours') || '24');

  try {
    // Get recent entries
    const entriesResult = await query(
      `
      SELECT
        id, formed_at, pass, score, mirror, bridge, permission, next_step,
        menu_mode, menu_signals, route, processing_profile, model, explorer_id, session_id
      FROM ain_shape_telemetry
      WHERE formed_at > NOW() - INTERVAL '${hours} hours'
      ORDER BY formed_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    // Get aggregated stats
    const statsResult = await query(
      `
      SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE pass = true)::int as passes,
        COUNT(*) FILTER (WHERE pass = false)::int as fails,
        ROUND(AVG(score)::numeric, 2) as avg_score,
        COUNT(*) FILTER (WHERE mirror = true)::int as mirror_count,
        COUNT(*) FILTER (WHERE bridge = true)::int as bridge_count,
        COUNT(*) FILTER (WHERE permission = true)::int as permission_count,
        COUNT(*) FILTER (WHERE next_step = true)::int as next_step_count,
        COUNT(*) FILTER (WHERE menu_mode = true)::int as menu_mode_count,
        COUNT(DISTINCT session_id)::int as unique_sessions,
        COUNT(DISTINCT explorer_id)::int as unique_explorers
      FROM ain_shape_telemetry
      WHERE formed_at > NOW() - INTERVAL '${hours} hours'
      `
    );

    // Get hourly breakdown
    const hourlyResult = await query(
      `
      SELECT
        date_trunc('hour', formed_at) as hour,
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE pass = true)::int as passes,
        ROUND(AVG(score)::numeric, 2) as avg_score
      FROM ain_shape_telemetry
      WHERE formed_at > NOW() - INTERVAL '${hours} hours'
      GROUP BY date_trunc('hour', formed_at)
      ORDER BY hour DESC
      `
    );

    // Get route breakdown
    const routeResult = await query(
      `
      SELECT
        route,
        COUNT(*)::int as count,
        ROUND(AVG(score)::numeric, 2) as avg_score,
        COUNT(*) FILTER (WHERE pass = true)::int as passes
      FROM ain_shape_telemetry
      WHERE formed_at > NOW() - INTERVAL '${hours} hours'
      GROUP BY route
      ORDER BY count DESC
      `
    );

    return NextResponse.json({
      success: true,
      entries: entriesResult.rows,
      stats: statsResult.rows[0] || {},
      hourly: hourlyResult.rows,
      byRoute: routeResult.rows,
      pagination: { limit, offset, hours },
    });
  } catch (error) {
    console.error('[AIN Telemetry API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch telemetry data' },
      { status: 500 }
    );
  }
}
