export const dynamic = 'force-dynamic';

/**
 * Labtools Dashboard API
 * Aggregated business operations data
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getAuthenticatedMember, verifyPracticeOwnership } from '@/lib/practitioner/auth';

type RouteContext = { params: Promise<{ practiceId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId } = await context.params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    // Get venture counts
    const venturesResult = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'planning') as planning,
        COUNT(*) as total
      FROM rl_ventures
      WHERE practice_id = $1
    `, [practiceId]);

    // Get meeting counts
    const meetingsResult = await query(`
      SELECT
        COUNT(*) FILTER (WHERE scheduled_start_at > NOW()) as upcoming,
        COUNT(*) FILTER (WHERE scheduled_start_at BETWEEN NOW() AND NOW() + INTERVAL '7 days') as this_week
      FROM rl_meetings
      WHERE practice_id = $1 AND status = 'scheduled'
    `, [practiceId]);

    // Get pipeline stats
    const pipelineResult = await query(`
      SELECT
        COUNT(*) as active,
        COALESCE(SUM(estimated_value_cents), 0) as total_value,
        COALESCE(SUM(estimated_value_cents * probability / 100), 0) as weighted_value
      FROM rl_opportunities
      WHERE practice_id = $1 AND stage NOT IN ('won', 'lost')
    `, [practiceId]);

    // Get network counts (business contacts)
    const networkResult = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as recent
      FROM rl_people
      WHERE practice_id = $1 AND person_type != 'client'
    `, [practiceId]);

    // Get recent active ventures
    const recentVenturesResult = await query(`
      SELECT id, name, venture_type, status
      FROM rl_ventures
      WHERE practice_id = $1 AND status IN ('active', 'planning')
      ORDER BY updated_at DESC
      LIMIT 5
    `, [practiceId]);

    // Get upcoming meetings
    const upcomingMeetingsResult = await query(`
      SELECT id, title, scheduled_start_at, meeting_type
      FROM rl_meetings
      WHERE practice_id = $1 AND status = 'scheduled' AND scheduled_start_at > NOW()
      ORDER BY scheduled_start_at ASC
      LIMIT 5
    `, [practiceId]);

    return NextResponse.json({
      ventures: {
        active: parseInt(venturesResult.rows[0]?.active || '0'),
        planning: parseInt(venturesResult.rows[0]?.planning || '0'),
        total: parseInt(venturesResult.rows[0]?.total || '0'),
      },
      meetings: {
        upcoming: parseInt(meetingsResult.rows[0]?.upcoming || '0'),
        thisWeek: parseInt(meetingsResult.rows[0]?.this_week || '0'),
      },
      pipeline: {
        active: parseInt(pipelineResult.rows[0]?.active || '0'),
        totalValue: parseInt(pipelineResult.rows[0]?.total_value || '0'),
        weightedValue: parseInt(pipelineResult.rows[0]?.weighted_value || '0'),
      },
      network: {
        total: parseInt(networkResult.rows[0]?.total || '0'),
        recent: parseInt(networkResult.rows[0]?.recent || '0'),
      },
      recentVentures: recentVenturesResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        ventureType: row.venture_type,
        status: row.status,
      })),
      upcomingMeetings: upcomingMeetingsResult.rows.map(row => ({
        id: row.id,
        title: row.title,
        scheduledStartAt: row.scheduled_start_at,
        meetingType: row.meeting_type,
      })),
    });
  } catch (error) {
    console.error('[LABTOOLS_DASHBOARD] Error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
