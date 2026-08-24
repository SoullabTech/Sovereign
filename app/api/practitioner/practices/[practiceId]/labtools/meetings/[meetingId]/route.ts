export const dynamic = 'force-dynamic';

/**
 * Single Meeting API
 * GET    - Get meeting details with attendees
 * PATCH  - Update meeting
 * DELETE - Delete meeting
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

type RouteContext = { params: Promise<{ practiceId: string; meetingId: string }> };

const VALID_MEETING_TYPES = ['internal', 'partner', 'prospect', 'vendor', 'advisory', 'presentation', 'workshop', 'other'];
const VALID_MEETING_STATUSES = ['scheduled', 'completed', 'canceled', 'no_show'];

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, meetingId } = await context.params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyPracticeOwnership(practiceId, memberId)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const result = await query(
      `SELECT
        m.id, m.title, m.meeting_type, m.status,
        m.scheduled_start_at, m.scheduled_end_at,
        m.location, m.agenda, m.notes, m.action_items,
        m.venture_id, m.opportunity_id,
        m.created_at, m.updated_at,
        v.name as venture_name,
        o.title as opportunity_title
      FROM rl_meetings m
      LEFT JOIN rl_ventures v ON v.id = m.venture_id
      LEFT JOIN rl_opportunities o ON o.id = m.opportunity_id
      WHERE m.id = $1 AND m.practice_id = $2`,
      [meetingId, practiceId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const m = result.rows[0];

    // Get attendees
    const attendeesResult = await query(
      `SELECT
        ma.id, ma.is_organizer, ma.attendance_status,
        p.id as person_id, p.display_name, p.email, p.company, p.role
      FROM rl_meeting_attendees ma
      JOIN rl_people p ON p.id = ma.person_id
      WHERE ma.meeting_id = $1
      ORDER BY ma.is_organizer DESC, p.display_name ASC`,
      [meetingId]
    );

    // Get related action items (tasks linked to this meeting)
    const actionItemsResult = await query(
      `SELECT id, title, due_at, status, created_at
       FROM rl_tasks
       WHERE meeting_id = $1
       ORDER BY due_at ASC NULLS LAST, created_at DESC`,
      [meetingId]
    );

    return NextResponse.json({
      meeting: {
        id: m.id,
        title: m.title,
        meetingType: m.meeting_type,
        status: m.status,
        scheduledStartAt: m.scheduled_start_at,
        scheduledEndAt: m.scheduled_end_at,
        location: m.location,
        agenda: m.agenda,
        notes: m.notes,
        actionItems: m.action_items,
        ventureId: m.venture_id,
        ventureName: m.venture_name,
        opportunityId: m.opportunity_id,
        opportunityTitle: m.opportunity_title,
        createdAt: m.created_at,
        updatedAt: m.updated_at
      },
      attendees: attendeesResult.rows.map(a => ({
        id: a.id,
        personId: a.person_id,
        displayName: a.display_name,
        email: a.email,
        company: a.company,
        role: a.role,
        isOrganizer: a.is_organizer,
        attendanceStatus: a.attendance_status
      })),
      actionItems: actionItemsResult.rows.map(t => ({
        id: t.id,
        title: t.title,
        dueAt: t.due_at,
        status: t.status,
        createdAt: t.created_at
      }))
    });
  } catch (error) {
    console.error('[MEETINGS] Get error:', error);
    return NextResponse.json({ error: 'Failed to get meeting' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, meetingId } = await context.params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyPracticeOwnership(practiceId, memberId)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    // Verify meeting exists
    const existing = await query(
      'SELECT id FROM rl_meetings WHERE id = $1 AND practice_id = $2',
      [meetingId, practiceId]
    );
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (body.title !== undefined) {
      if (!body.title?.trim()) {
        return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
      }
      updates.push(`title = $${paramIndex++}`);
      values.push(body.title.trim());
    }

    if (body.meetingType !== undefined) {
      if (!VALID_MEETING_TYPES.includes(body.meetingType)) {
        return NextResponse.json({
          error: `Meeting type must be one of: ${VALID_MEETING_TYPES.join(', ')}`
        }, { status: 400 });
      }
      updates.push(`meeting_type = $${paramIndex++}::meeting_type`);
      values.push(body.meetingType);
    }

    if (body.status !== undefined) {
      if (!VALID_MEETING_STATUSES.includes(body.status)) {
        return NextResponse.json({
          error: `Status must be one of: ${VALID_MEETING_STATUSES.join(', ')}`
        }, { status: 400 });
      }
      updates.push(`status = $${paramIndex++}::meeting_status`);
      values.push(body.status);
    }

    if (body.scheduledStartAt !== undefined) {
      updates.push(`scheduled_start_at = $${paramIndex++}`);
      values.push(body.scheduledStartAt);
    }

    if (body.scheduledEndAt !== undefined) {
      updates.push(`scheduled_end_at = $${paramIndex++}`);
      values.push(body.scheduledEndAt);
    }

    if (body.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(body.location?.trim() || null);
    }

    if (body.agenda !== undefined) {
      updates.push(`agenda = $${paramIndex++}`);
      values.push(body.agenda?.trim() || null);
    }

    if (body.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(body.notes?.trim() || null);
    }

    if (body.actionItems !== undefined) {
      updates.push(`action_items = $${paramIndex++}`);
      values.push(body.actionItems?.trim() || null);
    }

    if (body.ventureId !== undefined) {
      updates.push(`venture_id = $${paramIndex++}`);
      values.push(body.ventureId || null);
    }

    if (body.opportunityId !== undefined) {
      updates.push(`opportunity_id = $${paramIndex++}`);
      values.push(body.opportunityId || null);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(meetingId);
    const result = await query(
      `UPDATE rl_meetings SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, title, meeting_type, status, scheduled_start_at, scheduled_end_at,
                 location, agenda, notes, action_items, venture_id, opportunity_id,
                 created_at, updated_at`,
      values
    );

    const m = result.rows[0];
    return NextResponse.json({
      success: true,
      meeting: {
        id: m.id,
        title: m.title,
        meetingType: m.meeting_type,
        status: m.status,
        scheduledStartAt: m.scheduled_start_at,
        scheduledEndAt: m.scheduled_end_at,
        location: m.location,
        agenda: m.agenda,
        notes: m.notes,
        actionItems: m.action_items,
        ventureId: m.venture_id,
        opportunityId: m.opportunity_id,
        createdAt: m.created_at,
        updatedAt: m.updated_at
      }
    });
  } catch (error) {
    console.error('[MEETINGS] Update error:', error);
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, meetingId } = await context.params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyPracticeOwnership(practiceId, memberId)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const result = await query(
      'DELETE FROM rl_meetings WHERE id = $1 AND practice_id = $2 RETURNING id',
      [meetingId, practiceId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[MEETINGS] Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
  }
}
