export const dynamic = 'force-dynamic';

/**
 * Person Timeline API
 * GET - Get activity timeline for a person
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

type RouteContext = { params: Promise<{ practiceId: string; personId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, personId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    // Verify person exists
    const personResult = await query(
      `SELECT id, display_name, email, phone, company, role, relationship_type, notes_private, tags
       FROM rl_people
       WHERE id = $1 AND practice_id = $2`,
      [personId, practiceId]
    );

    if (personResult.rows.length === 0) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    const person = personResult.rows[0];

    // Get opportunities linked to this person
    const opportunitiesResult = await query(
      `SELECT id, title, stage, value_cents, created_at, closed_at
       FROM rl_opportunities
       WHERE person_id = $1
       ORDER BY created_at DESC`,
      [personId]
    );

    // Get meetings with this person
    const meetingsResult = await query(
      `SELECT m.id, m.title, m.meeting_type, m.status, m.scheduled_start_at, m.outcomes
       FROM rl_meetings m
       JOIN rl_meeting_attendees ma ON ma.meeting_id = m.id
       WHERE ma.person_id = $1
       ORDER BY m.scheduled_start_at DESC`,
      [personId]
    );

    // Get tasks related to this person
    const tasksResult = await query(
      `SELECT id, title, due_at, status, created_at
       FROM rl_tasks
       WHERE person_id = $1
       ORDER BY created_at DESC`,
      [personId]
    );

    // Get containers where this person is a participant
    const containersResult = await query(
      `SELECT c.id, c.scope, c.status, c.type, c.created_at
       FROM rl_containers c
       JOIN rl_participants p ON p.container_id = c.id
       WHERE p.person_id = $1
       ORDER BY c.created_at DESC`,
      [personId]
    );

    // Build timeline
    const timeline: Array<{
      type: string;
      id: string;
      title: string;
      description?: string;
      date: string;
      status?: string;
    }> = [];

    // Add opportunities
    for (const opp of opportunitiesResult.rows) {
      timeline.push({
        type: 'opportunity',
        id: opp.id,
        title: opp.title,
        description: `Stage: ${opp.stage}${opp.value_cents ? ` • $${(opp.value_cents / 100).toLocaleString()}` : ''}`,
        date: opp.created_at,
        status: opp.stage
      });
    }

    // Add meetings
    for (const m of meetingsResult.rows) {
      timeline.push({
        type: 'meeting',
        id: m.id,
        title: m.title,
        description: m.outcomes || m.meeting_type,
        date: m.scheduled_start_at,
        status: m.status
      });
    }

    // Add tasks
    for (const t of tasksResult.rows) {
      timeline.push({
        type: 'task',
        id: t.id,
        title: t.title,
        date: t.due_at || t.created_at,
        status: t.status
      });
    }

    // Add containers
    for (const c of containersResult.rows) {
      timeline.push({
        type: 'container',
        id: c.id,
        title: c.scope || `${c.type} relationship`,
        date: c.created_at,
        status: c.status
      });
    }

    // Sort timeline by date descending
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      person: {
        id: person.id,
        displayName: person.display_name,
        email: person.email,
        phone: person.phone,
        company: person.company,
        role: person.role,
        relationshipType: person.relationship_type,
        notesPrivate: person.notes_private,
        tags: person.tags || []
      },
      timeline,
      summary: {
        opportunitiesCount: opportunitiesResult.rows.length,
        meetingsCount: meetingsResult.rows.length,
        tasksCount: tasksResult.rows.length,
        containersCount: containersResult.rows.length
      }
    });
  } catch (error) {
    console.error('[PERSON_TIMELINE] Error:', error);
    return NextResponse.json({ error: 'Failed to load timeline' }, { status: 500 });
  }
}
