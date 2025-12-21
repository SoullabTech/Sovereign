import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

/**
 * ANALYTICS SUMMARY API
 *
 * Returns combined overview metrics from all analytics views.
 * Provides dashboard-ready summary of consciousness trace analytics.
 *
 * Route: GET /api/analytics/summary
 */

export async function GET(request: NextRequest) {
  try {
    // Aggregate stats from base traces table
    const overallStats = await query(`
      SELECT
        COUNT(*) as total_traces,
        COUNT(DISTINCT user_id) as total_users,
        COUNT(DISTINCT session_id) as total_sessions,
        AVG(latency_ms) as avg_latency,
        MIN(created_at) as first_trace,
        MAX(created_at) as last_trace,
        COUNT(*) FILTER (WHERE safety_level = 'critical') as critical_safety_events,
        COUNT(*) FILTER (WHERE safety_level = 'elevated') as elevated_safety_events
      FROM consciousness_traces
    `);

    // Facet summary
    const facetStats = await query(`
      SELECT
        COUNT(*) as facet_count,
        SUM(total_traces) as total_facet_traces,
        AVG(avg_confidence) as avg_facet_confidence
      FROM analytics_facet_distribution
    `);

    // Agent summary
    const agentStats = await query(`
      SELECT
        COUNT(*) as agent_count,
        SUM(total_routes) as total_routes,
        AVG(avg_latency_ms) as avg_agent_latency
      FROM analytics_agent_metrics
    `);

    // Practice summary
    const practiceStats = await query(`
      SELECT
        COUNT(*) as practice_count,
        SUM(recommendation_count) as total_recommendations,
        AVG(avg_confidence_when_recommended) as avg_practice_confidence
      FROM analytics_practice_recommendations
    `);

    // Recent activity (last 24 hours)
    const recentActivity = await query(`
      SELECT
        SUM(trace_count) as traces_24h,
        SUM(unique_users) as active_users_24h,
        SUM(critical_events) as critical_events_24h,
        SUM(elevated_events) as elevated_events_24h
      FROM analytics_hourly_activity
      WHERE hour >= NOW() - INTERVAL '24 hours'
    `);

    return NextResponse.json({
      ok: true,
      summary: {
        overall: overallStats.rows[0],
        facets: facetStats.rows[0],
        agents: agentStats.rows[0],
        practices: practiceStats.rows[0],
        recent_24h: recentActivity.rows[0]
      },
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Summary analytics error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to generate analytics summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
