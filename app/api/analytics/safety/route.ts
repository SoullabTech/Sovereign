import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

/**
 * SAFETY EVENTS ANALYTICS API
 *
 * Returns critical and elevated safety events for monitoring.
 * Shows when the consciousness router detected physiological stress
 * (HRV drops, high arousal) and escalated to safety protocols.
 *
 * Route: GET /api/analytics/safety
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const level = searchParams.get('level'); // 'critical' or 'elevated'
    const daysAgo = parseInt(searchParams.get('daysAgo') || '30');

    // Build query with optional level filter
    let sql = `
      SELECT
        id,
        created_at,
        user_id,
        safety_level,
        facet,
        mode,
        agent,
        latency_ms,
        practices,
        rationale
      FROM analytics_safety_events
    `;

    const params: any[] = [];
    const whereClauses: string[] = [];

    if (level && (level === 'critical' || level === 'elevated')) {
      whereClauses.push(`safety_level = $${params.length + 1}`);
      params.push(level);
    }

    whereClauses.push(`created_at >= NOW() - INTERVAL '${daysAgo} days'`);

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    sql += `
      ORDER BY created_at DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limit);

    const result = await query(sql, params);

    // Also get summary stats
    const statsResult = await query(`
      SELECT
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE safety_level = 'critical') as critical_count,
        COUNT(*) FILTER (WHERE safety_level = 'elevated') as elevated_count,
        COUNT(DISTINCT user_id) as affected_users
      FROM analytics_safety_events
      WHERE created_at >= NOW() - INTERVAL '${daysAgo} days'
    `);

    return NextResponse.json({
      ok: true,
      data: result.rows,
      stats: statsResult.rows[0],
      meta: {
        count: result.rows.length,
        filters: { level, daysAgo, limit }
      }
    });

  } catch (error) {
    console.error('Safety analytics error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to retrieve safety analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
