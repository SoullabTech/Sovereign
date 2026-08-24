export const dynamic = 'force-dynamic';

/**
 * Meetings API
 * GET  - List meetings for practice
 * POST - Create a new meeting
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

const VALID_MEETING_TYPES = ['internal', 'partner', 'prospect', 'vendor', 'advisory', 'presentation', 'workshop', 'other'];
const VALID_MEETING_STATUSES = ['scheduled', 'completed', 'canceled', 'no_show'];

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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const meetingType = searchParams.get('meetingType');
    const ventureId = searchParams.get('ventureId');
    const opportunityId = searchParams.get('opportunityId');
    const upcoming = searchParams.get('upcoming');
    const filter = searchParams.get('filter');

    let sql = `
      SELECT
        m.id, m.title, m.meeting_type, m.status,
        m.scheduled_start_at, m.scheduled_end_at,
        m.location, m.agenda, m.notes, m.action_items,
        m.venture_id, m.opportunity_id,
        m.created_at, m.updated_at,
        v.name as venture_name,
        o.title as opportunity_title,
        (
          SELECT COUNT(*)::int FROM rl_meeting_attendees ma WHERE ma.meeting_id = m.id
        ) as attendee_count
      FROM rl_meetings m
      LEFT JOIN rl_ventures v ON v.id = m.venture_id
      LEFT JOIN rl_opportunities o ON o.id = m.opportunity_id
      WHERE m.practice_id = $1
    `;
    const values: unknown[] = [practiceId];
    let paramIndex = 2;

    if (status && VALID_MEETING_STATUSES.includes(status)) {
      sql += ` AND m.status = $${paramIndex++}::meeting_status`;
      values.push(status);
    }
    if (meetingType && VALID_MEETING_TYPES.includes(meetingType)) {
      sql += ` AND m.meeting_type = $${paramIndex++}::meeting_type`;
      values.push(meetingType);
    }
    if (ventureId) {
      sql += ` AND m.venture_id = $${paramIndex++}`;
      values.push(ventureId);
    }
    if (opportunityId) {
      sql += ` AND m.opportunity_id = $${paramIndex++}`;
      values.push(opportunityId);
    }
    if (upcoming === 'true') {
      sql += ` AND m.scheduled_start_at >= NOW() AND m.status = 'scheduled'`;
    }
    if (filter === 'missing_notes') {
      sql += ` AND m.status = 'completed' AND (m.notes IS NULL OR m.notes = '')`;
    }

    sql += ` ORDER BY m.scheduled_start_at ${upcoming === 'true' ? 'ASC' : 'DESC'}`;

    const result = await query(sql, values);

    return NextResponse.json({
      meetings: result.rows.map(r => ({
        id: r.id,
        title: r.title,
        meetingType: r.meeting_type,
        status: r.status,
        scheduledStartAt: r.scheduled_start_at,
        scheduledEndAt: r.scheduled_end_at,
        location: r.location,
        agenda: r.agenda,
        notes: r.notes,
        actionItems: r.action_items,
        ventureId: r.venture_id,
        ventureName: r.venture_name,
        opportunityId: r.opportunity_id,
        opportunityTitle: r.opportunity_title,
        attendeeCount: r.attendee_count,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }))
    });
  } catch (error) {
    console.error('[MEETINGS] List error:', error);
    return NextResponse.json({ error: 'Failed to list meetings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId } = await context.params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyPracticeOwnership(practiceId, memberId)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      meetingType,
      scheduledStartAt,
      scheduledEndAt,
      location,
      agenda,
      ventureId,
      opportunityId,
      attendeeIds
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!meetingType || !VALID_MEETING_TYPES.includes(meetingType)) {
      return NextResponse.json({
        error: `Meeting type must be one of: ${VALID_MEETING_TYPES.join(', ')}`
      }, { status: 400 });
    }

    if (!scheduledStartAt || !scheduledEndAt) {
      return NextResponse.json({ error: 'Start and end times are required' }, { status: 400 });
    }

    const startTime = new Date(scheduledStartAt);
    const endTime = new Date(scheduledEndAt);
    if (endTime <= startTime) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO rl_meetings (
        practice_id, title, meeting_type, scheduled_start_at, scheduled_end_at,
        location, agenda, venture_id, opportunity_id
      )
       VALUES ($1, $2, $3::meeting_type, $4, $5, $6, $7, $8, $9)
       RETURNING id, title, meeting_type, status, scheduled_start_at, scheduled_end_at,
                 location, agenda, venture_id, opportunity_id, created_at`,
      [
        practiceId,
        title.trim(),
        meetingType,
        scheduledStartAt,
        scheduledEndAt,
        location?.trim() || null,
        agenda?.trim() || null,
        ventureId || null,
        opportunityId || null
      ]
    );

    const meeting = result.rows[0];

    // Add attendees if provided
    if (attendeeIds && Array.isArray(attendeeIds) && attendeeIds.length > 0) {
      for (const personId of attendeeIds) {
        await query(
          `INSERT INTO rl_meeting_attendees (meeting_id, person_id)
           VALUES ($1, $2)
           ON CONFLICT (meeting_id, person_id) DO NOTHING`,
          [meeting.id, personId]
        );
      }
    }

    return NextResponse.json({
      success: true,
      meeting: {
        id: meeting.id,
        title: meeting.title,
        meetingType: meeting.meeting_type,
        status: meeting.status,
        scheduledStartAt: meeting.scheduled_start_at,
        scheduledEndAt: meeting.scheduled_end_at,
        location: meeting.location,
        agenda: meeting.agenda,
        ventureId: meeting.venture_id,
        opportunityId: meeting.opportunity_id,
        createdAt: meeting.created_at
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[MEETINGS] Create error:', error);
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}
