export const dynamic = 'force-dynamic';

/**
 * Meeting Detail API
 * Get, update, delete a specific meeting
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getAuthenticatedMember, verifyPracticeOwnership } from '@/lib/practitioner/auth';

type RouteContext = { params: Promise<{ practiceId: string; meetingId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, meetingId } = await context.params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const result = await query(`
      SELECT m.*,
        v.name as venture_name,
        o.title as opportunity_title,
        (SELECT json_agg(json_build_object(
          'id', ma.id,
          'personId', ma.person_id,
          'externalName', ma.external_name,
          'externalEmail', ma.external_email,
          'isOrganizer', ma.is_organizer,
          'rsvpStatus', ma.rsvp_status,
          'attended', ma.attended,
          'personName', p.display_name,
          'personEmail', p.email
        )) FROM rl_meeting_attendees ma
        LEFT JOIN rl_people p ON p.id = ma.person_id
        WHERE ma.meeting_id = m.id) as attendees
      FROM rl_meetings m
      LEFT JOIN rl_ventures v ON v.id = m.venture_id
      LEFT JOIN rl_opportunities o ON o.id = m.opportunity_id
      WHERE m.id = $1 AND m.practice_id = $2
    `, [meetingId, practiceId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const row = result.rows[0];

    return NextResponse.json({
      meeting: {
        id: row.id,
        title: row.title,
        meetingType: row.meeting_type,
        status: row.status,
        scheduledStartAt: row.scheduled_start_at,
        scheduledEndAt: row.scheduled_end_at,
        actualStartAt: row.actual_start_at,
        actualEndAt: row.actual_end_at,
        location: row.location,
        locationDetails: row.location_details,
        ventureId: row.venture_id,
        ventureName: row.venture_name,
        opportunityId: row.opportunity_id,
        opportunityTitle: row.opportunity_title,
        agenda: row.agenda,
        notes: row.notes,
        actionItems: row.action_items,
        attendees: row.attendees || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[MEETING] Get error:', error);
    return NextResponse.json({ error: 'Failed to get meeting' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, meetingId } = await context.params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, string> = {
      title: 'title',
      status: 'status',
      scheduledStartAt: 'scheduled_start_at',
      scheduledEndAt: 'scheduled_end_at',
      actualStartAt: 'actual_start_at',
      actualEndAt: 'actual_end_at',
      location: 'location',
      locationDetails: 'location_details',
      agenda: 'agenda',
      notes: 'notes',
      actionItems: 'action_items',
    };

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (body[key] !== undefined) {
        if (dbField === 'status') {
          updates.push(`${dbField} = $${paramIndex++}::meeting_status`);
        } else {
          updates.push(`${dbField} = $${paramIndex++}`);
        }
        values.push(body[key]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    values.push(meetingId, practiceId);

    const result = await query(`
      UPDATE rl_meetings
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex++} AND practice_id = $${paramIndex}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const row = result.rows[0];

    return NextResponse.json({
      meeting: {
        id: row.id,
        title: row.title,
        status: row.status,
        notes: row.notes,
        actionItems: row.action_items,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[MEETING] Update error:', error);
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, meetingId } = await context.params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const result = await query(`
      DELETE FROM rl_meetings
      WHERE id = $1 AND practice_id = $2
      RETURNING id
    `, [meetingId, practiceId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[MEETING] Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
  }
}
