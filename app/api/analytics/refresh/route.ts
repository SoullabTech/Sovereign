import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

/**
 * ANALYTICS REFRESH API
 *
 * Manually refreshes all materialized views and returns timing data.
 * Used for on-demand analytics updates or scheduled refresh jobs.
 *
 * Route: POST /api/analytics/refresh
 */

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Execute refresh function which returns timing per view
    const result = await query(`
      SELECT * FROM refresh_analytics_views()
    `);

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      ok: true,
      message: 'Analytics views refreshed successfully',
      timing: {
        per_view: result.rows,
        total_ms: totalTime
      },
      refreshed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Refresh analytics error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to refresh analytics views',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Method not allowed. Use POST to refresh analytics views.'
    },
    { status: 405 }
  );
}
