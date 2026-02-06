export const dynamic = 'force-dynamic';

/**
 * Contact Detail API
 * Get and update a specific contact
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getAuthenticatedMember, verifyPracticeOwnership } from '@/lib/practitioner/auth';

type RouteContext = { params: Promise<{ practiceId: string; personId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, personId } = await context.params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const result = await query(`
      SELECT p.*,
        (SELECT json_agg(json_build_object(
          'id', m.id,
          'title', m.title,
          'scheduledStartAt', m.scheduled_start_at,
          'meetingType', m.meeting_type,
          'status', m.status
        ) ORDER BY m.scheduled_start_at DESC) FROM rl_meetings m
        JOIN rl_meeting_attendees ma ON ma.meeting_id = m.id
        WHERE ma.person_id = p.id
        LIMIT 10) as recent_meetings,
        (SELECT json_agg(json_build_object(
          'id', o.id,
          'title', o.title,
          'stage', o.stage,
          'estimatedValueCents', o.estimated_value_cents
        ) ORDER BY o.updated_at DESC) FROM rl_opportunities o
        WHERE o.person_id = p.id
        LIMIT 5) as opportunities
      FROM rl_people p
      WHERE p.id = $1 AND p.practice_id = $2
    `, [personId, practiceId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const row = result.rows[0];

    return NextResponse.json({
      contact: {
        id: row.id,
        displayName: row.display_name,
        email: row.email,
        phone: row.phone,
        personType: row.person_type,
        company: row.company,
        roleTitle: row.role_title,
        linkedinUrl: row.linkedin_url,
        websiteUrl: row.website_url,
        source: row.source,
        tags: row.tags,
        notesPrivate: row.notes_private,
        recentMeetings: row.recent_meetings || [],
        opportunities: row.opportunities || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[CONTACT] Get error:', error);
    return NextResponse.json({ error: 'Failed to get contact' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, personId } = await context.params;
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
      displayName: 'display_name',
      email: 'email',
      phone: 'phone',
      personType: 'person_type',
      company: 'company',
      roleTitle: 'role_title',
      linkedinUrl: 'linkedin_url',
      websiteUrl: 'website_url',
      source: 'source',
      tags: 'tags',
      notesPrivate: 'notes_private',
    };

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (body[key] !== undefined) {
        if (dbField === 'person_type') {
          updates.push(`${dbField} = $${paramIndex++}::person_type`);
        } else {
          updates.push(`${dbField} = $${paramIndex++}`);
        }
        values.push(body[key]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    values.push(personId, practiceId);

    const result = await query(`
      UPDATE rl_people
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex++} AND practice_id = $${paramIndex}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const row = result.rows[0];

    return NextResponse.json({
      contact: {
        id: row.id,
        displayName: row.display_name,
        email: row.email,
        personType: row.person_type,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[CONTACT] Update error:', error);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}
