export const dynamic = 'force-dynamic';

/**
 * Meeting Action Items API
 * POST - Create action items (tasks) from meeting
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

type RouteContext = { params: Promise<{ practiceId: string; meetingId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, meetingId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    // Verify meeting exists and get its venture_id and opportunity_id
    const meetingResult = await query(
      'SELECT id, venture_id, opportunity_id FROM rl_meetings WHERE id = $1 AND practice_id = $2',
      [meetingId, practiceId]
    );
    if (meetingResult.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetingResult.rows[0];
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    const createdTasks = [];

    for (const item of items) {
      if (!item.title?.trim()) continue;

      const result = await query(
        `INSERT INTO rl_tasks (
          practice_id, title, due_at, meeting_id, venture_id, opportunity_id, person_id
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, title, due_at, status, meeting_id, venture_id, opportunity_id, person_id, created_at`,
        [
          practiceId,
          item.title.trim(),
          item.dueAt || null,
          meetingId,
          meeting.venture_id,
          meeting.opportunity_id,
          item.personId || null
        ]
      );

      createdTasks.push({
        id: result.rows[0].id,
        title: result.rows[0].title,
        dueAt: result.rows[0].due_at,
        status: result.rows[0].status,
        meetingId: result.rows[0].meeting_id,
        ventureId: result.rows[0].venture_id,
        opportunityId: result.rows[0].opportunity_id,
        personId: result.rows[0].person_id,
        createdAt: result.rows[0].created_at
      });
    }

    return NextResponse.json({
      success: true,
      tasks: createdTasks,
      count: createdTasks.length
    }, { status: 201 });
  } catch (error) {
    console.error('[ACTION_ITEMS] Create error:', error);
    return NextResponse.json({ error: 'Failed to create action items' }, { status: 500 });
  }
}
