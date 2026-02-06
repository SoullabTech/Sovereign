export const dynamic = 'force-dynamic';

/**
 * Meetings API
 * List and create business meetings
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

    const { searchParams } = new URL(request.url);
    const meetingType = searchParams.get('type');
    const status = searchParams.get('status') || 'scheduled';
    const upcoming = searchParams.get('upcoming') === 'true';

    let sql = `
      SELECT m.*,
        v.name as venture_name,
        o.title as opportunity_title,
        (SELECT COUNT(*) FROM rl_meeting_attendees ma WHERE ma.meeting_id = m.id) as attendee_count,
        (SELECT json_agg(json_build_object(
          'id', ma.id,
          'personId', ma.person_id,
          'externalName', ma.external_name,
          'isOrganizer', ma.is_organizer,
          'personName', p.display_name
        )) FROM rl_meeting_attendees ma
        LEFT JOIN rl_people p ON p.id = ma.person_id
        WHERE ma.meeting_id = m.id) as attendees
      FROM rl_meetings m
      LEFT JOIN rl_ventures v ON v.id = m.venture_id
      LEFT JOIN rl_opportunities o ON o.id = m.opportunity_id
      WHERE m.practice_id = $1
    `;
    const values: unknown[] = [practiceId];
    let paramIndex = 2;

    if (meetingType) {
      sql += ` AND m.meeting_type = $${paramIndex++}::meeting_type`;
      values.push(meetingType);
    }

    if (status) {
      sql += ` AND m.status = $${paramIndex++}::meeting_status`;
      values.push(status);
    }

    if (upcoming) {
      sql += ` AND m.scheduled_start_at > NOW()`;
    }

    sql += ` ORDER BY m.scheduled_start_at ${upcoming ? 'ASC' : 'DESC'}`;

    const result = await query(sql, values);

    return NextResponse.json({
      meetings: result.rows.map(row => ({
        id: row.id,
        title: row.title,
        meetingType: row.meeting_type,
        status: row.status,
        scheduledStartAt: row.scheduled_start_at,
        scheduledEndAt: row.scheduled_end_at,
        location: row.location,
        locationDetails: row.location_details,
        ventureId: row.venture_id,
        ventureName: row.venture_name,
        opportunityId: row.opportunity_id,
        opportunityTitle: row.opportunity_title,
        agenda: row.agenda,
        notes: row.notes,
        actionItems: row.action_items,
        attendeeCount: parseInt(row.attendee_count || '0'),
        attendees: row.attendees || [],
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error('[MEETINGS] List error:', error);
    return NextResponse.json({ error: 'Failed to list meetings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId } = await context.params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      meetingType = 'other',
      scheduledStartAt,
      scheduledEndAt,
      location = 'video',
      locationDetails,
      ventureId,
      opportunityId,
      agenda,
      attendeeIds = [],
    } = body;

    if (!title || !scheduledStartAt || !scheduledEndAt) {
      return NextResponse.json({ error: 'Title, start time, and end time are required' }, { status: 400 });
    }

    // Create meeting
    const meetingResult = await query(`
      INSERT INTO rl_meetings (
        practice_id, title, meeting_type, scheduled_start_at, scheduled_end_at,
        location, location_details, venture_id, opportunity_id, agenda
      ) VALUES ($1, $2, $3::meeting_type, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      practiceId,
      title,
      meetingType,
      scheduledStartAt,
      scheduledEndAt,
      location,
      locationDetails || null,
      ventureId || null,
      opportunityId || null,
      agenda || null,
    ]);

    const meeting = meetingResult.rows[0];

    // Add attendees
    if (attendeeIds.length > 0) {
      const attendeeValues = attendeeIds.map((personId: string, i: number) =>
        `($1, $${i + 2}, ${i === 0 ? 'true' : 'false'})`
      ).join(', ');
      await query(
        `INSERT INTO rl_meeting_attendees (meeting_id, person_id, is_organizer) VALUES ${attendeeValues}`,
        [meeting.id, ...attendeeIds]
      );
    }

    return NextResponse.json({
      meeting: {
        id: meeting.id,
        title: meeting.title,
        meetingType: meeting.meeting_type,
        scheduledStartAt: meeting.scheduled_start_at,
        scheduledEndAt: meeting.scheduled_end_at,
        createdAt: meeting.created_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[MEETINGS] Create error:', error);
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}
