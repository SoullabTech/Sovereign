export const dynamic = 'force-dynamic';

/**
 * Labtools Dashboard API
 * GET - Get summary data for labtools hub
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

/**
 * AUTH-BOUNDARY-02 — caller identity comes from a verified credential.
 *
 * This used to read `x-member-id`, confirm the id EXISTED in `members`, and
 * return it as the caller. Existence is not authentication: member UUIDs are
 * handed to clients routinely, so any caller could name a member and become
 * them. The ownership check below was then asked the wrong question — not
 * "does the caller own this practice" but "does the named member own it".
 *
 * `getMemberIdFromRequest` validates a session against `auth_sessions` and
 * rejects an `x-member-id` that disagrees with it. The shape of this function is
 * unchanged so every call site and every ownership check below is untouched:
 * this repairs caller provenance only, not authorization.
 */
async function getMemberFromRequest(request: NextRequest): Promise<{ id: string } | null> {
  const memberId = await getMemberIdFromRequest(request);
  return memberId ? { id: memberId } : null;
}

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
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
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
