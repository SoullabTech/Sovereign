export const dynamic = 'force-dynamic';

/**
 * Network API
 * List and create business contacts
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
    const personType = searchParams.get('type');
    const searchQuery = searchParams.get('q');

    let sql = `
      SELECT p.*,
        (SELECT COUNT(*) FROM rl_meeting_attendees ma
         JOIN rl_meetings m ON m.id = ma.meeting_id
         WHERE ma.person_id = p.id) as meeting_count,
        (SELECT COUNT(*) FROM rl_opportunities o WHERE o.person_id = p.id) as opportunity_count
      FROM rl_people p
      WHERE p.practice_id = $1 AND p.person_type != 'client'
    `;
    const values: unknown[] = [practiceId];
    let paramIndex = 2;

    if (personType) {
      sql += ` AND p.person_type = $${paramIndex++}::person_type`;
      values.push(personType);
    }

    if (searchQuery) {
      sql += ` AND (
        p.display_name ILIKE $${paramIndex} OR
        p.email ILIKE $${paramIndex} OR
        p.company ILIKE $${paramIndex}
      )`;
      values.push(`%${searchQuery}%`);
      paramIndex++;
    }

    sql += ` ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC`;

    const result = await query(sql, values);

    return NextResponse.json({
      contacts: result.rows.map(row => ({
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
        meetingCount: parseInt(row.meeting_count || '0'),
        opportunityCount: parseInt(row.opportunity_count || '0'),
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error('[NETWORK] List error:', error);
    return NextResponse.json({ error: 'Failed to list contacts' }, { status: 500 });
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
      displayName,
      email,
      phone,
      personType = 'contact',
      company,
      roleTitle,
      linkedinUrl,
      websiteUrl,
      source,
      tags = [],
      notesPrivate,
    } = body;

    if (!displayName) {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
    }

    const result = await query(`
      INSERT INTO rl_people (
        practice_id, display_name, email, phone, person_type,
        company, role_title, linkedin_url, website_url, source, tags, notes_private
      ) VALUES ($1, $2, $3, $4, $5::person_type, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      practiceId,
      displayName,
      email || null,
      phone || null,
      personType,
      company || null,
      roleTitle || null,
      linkedinUrl || null,
      websiteUrl || null,
      source || null,
      tags,
      notesPrivate || null,
    ]);

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
        createdAt: row.created_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[NETWORK] Create error:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
