export const dynamic = 'force-dynamic';

/**
 * Labtools Dashboard API
 * GET - Get summary data for labtools hub
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { unauthenticatedResponse } from '@/lib/auth/authFailure';

// AUTH-01-D3: the route-local `getMemberFromRequest` that stood here is REMOVED.
// It read a bare `x-member-id` and treated `SELECT id FROM members WHERE id = $1`
// returning a row as proof of identity — the impersonation pattern
// lib/auth/getMemberFromRequest.ts:19-22 documents as fixed. Member UUIDs are exposed
// to clients, so "the row exists" was never evidence that the caller is that member.
//
// Its NAME also collided with the hardened module, which is how these routes escaped
// the first census. Identity now comes from the canonical resolver directly, under its
// own name, so a name-based search can never again hide a route from a census.
//
// ⭐ Authentication only. `verifyPracticeOwnership()` and every other practitioner
// authorization check below are UNCHANGED: authentication answers who the member is,
// ownership answers what that authenticated member may do.

async function verifyPracticeOwnership(practiceId: string, memberId: string): Promise<boolean> {
  const result = await query(
    'SELECT id FROM rl_practices WHERE id = $1 AND owner_user_id = $2',
    [practiceId, memberId]
  );
  return result.rows.length > 0;
}

type RouteContext = { params: Promise<{ practiceId: string }> };

const ACTIVE_STAGES = ['lead', 'qualified', 'proposal', 'negotiation'];

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId } = await context.params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyPracticeOwnership(practiceId, memberId)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    // Get ventures summary (uses status enum: active, planning = "active")
    const venturesResult = await query(
      `SELECT
        COUNT(*) FILTER (WHERE status IN ('active', 'planning'))::int as active,
        COUNT(*)::int as total
       FROM rl_ventures
       WHERE practice_id = $1`,
      [practiceId]
    );

    // Get pipeline summary (uses estimated_value_cents, 'won'/'lost' stages)
    const pipelineResult = await query(
      `SELECT
        COUNT(*) FILTER (WHERE stage = ANY($2::opportunity_stage[]))::int as active_count,
        COALESCE(SUM(estimated_value_cents) FILTER (WHERE stage = ANY($2::opportunity_stage[])), 0)::bigint as active_value_cents,
        COALESCE(SUM(estimated_value_cents) FILTER (WHERE stage = 'won' AND actual_close_date >= DATE_TRUNC('month', NOW())), 0)::bigint as won_this_month_cents
       FROM rl_opportunities
       WHERE practice_id = $1`,
      [practiceId, ACTIVE_STAGES]
    );

    // Get upcoming meetings
    const meetingsResult = await query(
      `SELECT id, title, scheduled_start_at
       FROM rl_meetings
       WHERE practice_id = $1
         AND status = 'scheduled'
         AND scheduled_start_at >= NOW()
       ORDER BY scheduled_start_at ASC
       LIMIT 1`,
      [practiceId]
    );

    const upcomingMeetingsCount = await query(
      `SELECT COUNT(*)::int as count
       FROM rl_meetings
       WHERE practice_id = $1
         AND status = 'scheduled'
         AND scheduled_start_at >= NOW()
         AND scheduled_start_at <= NOW() + INTERVAL '14 days'`,
      [practiceId]
    );

    // Get attention needed
    // 1. Overdue tasks linked to ventures/opportunities
    const overdueTasksResult = await query(
      `SELECT COUNT(*)::int as count
       FROM rl_tasks
       WHERE practice_id = $1
         AND status = 'open'
         AND due_at < NOW()
         AND (venture_id IS NOT NULL OR opportunity_id IS NOT NULL OR meeting_id IS NOT NULL)`,
      [practiceId]
    );

    // 2. Stalled opportunities (no update in 14 days)
    const stalledOppsResult = await query(
      `SELECT COUNT(*)::int as count
       FROM rl_opportunities
       WHERE practice_id = $1
         AND stage = ANY($2::opportunity_stage[])
         AND updated_at < NOW() - INTERVAL '14 days'`,
      [practiceId, ACTIVE_STAGES]
    );

    // 3. Meetings without notes
    const meetingsWithoutNotesResult = await query(
      `SELECT COUNT(*)::int as count
       FROM rl_meetings
       WHERE practice_id = $1
         AND status = 'completed'
         AND (notes IS NULL OR notes = '')`,
      [practiceId]
    );

    const ventures = venturesResult.rows[0];
    const pipeline = pipelineResult.rows[0];
    const nextMeeting = meetingsResult.rows[0];

    return NextResponse.json({
      ventures: {
        active: ventures.active,
        total: ventures.total
      },
      pipeline: {
        activeCount: pipeline.active_count,
        activeValueCents: parseInt(pipeline.active_value_cents, 10),
        wonThisMonthCents: parseInt(pipeline.won_this_month_cents, 10)
      },
      meetings: {
        upcoming: upcomingMeetingsCount.rows[0].count,
        nextMeeting: nextMeeting ? {
          id: nextMeeting.id,
          title: nextMeeting.title,
          scheduledStartAt: nextMeeting.scheduled_start_at
        } : null
      },
      attention: {
        overdueTasksCount: overdueTasksResult.rows[0].count,
        stalledOppsCount: stalledOppsResult.rows[0].count,
        meetingsWithoutNotesCount: meetingsWithoutNotesResult.rows[0].count
      }
    });
  } catch (error) {
    console.error('[LABTOOLS_DASHBOARD] Error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
