export const dynamic = 'force-dynamic';

/**
 * People API
 * GET  - List people in practice
 * POST - Create a new person
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

    const { searchParams } = new URL(request.url);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let sql = `
      SELECT
        p.id, p.display_name, p.email, p.phone, p.tags, p.created_at,
        COUNT(DISTINCT cp.container_id) as container_count
      FROM rl_people p
      LEFT JOIN rl_participants cp ON cp.person_id = p.id
      WHERE p.practice_id = $1
    `;
    const values: unknown[] = [practiceId];
    let paramIndex = 2;

    if (tags && tags.length > 0) {
      sql += ` AND p.tags && $${paramIndex++}`;
      values.push(tags);
    }

    if (search) {
      sql += ` AND (p.display_name ILIKE $${paramIndex} OR p.email ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM rl_people WHERE practice_id = $1`,
      [practiceId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    values.push(limit, offset);

    const result = await query(sql, values);

    return NextResponse.json({
      people: result.rows.map(row => ({
        id: row.id,
        displayName: row.display_name,
        email: row.email,
        phone: row.phone,
        tags: row.tags,
        containerCount: parseInt(row.container_count, 10),
        createdAt: row.created_at
      })),
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('[PEOPLE] List error:', error);
    return NextResponse.json({ error: 'Failed to list people' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const body = await request.json();
    const { displayName, email, phone, notesPrivate, tags = [] } = body;

    if (!displayName?.trim()) {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO rl_people (practice_id, display_name, email, phone, notes_private, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, display_name, email, phone, tags, created_at`,
      [practiceId, displayName.trim(), email || null, phone || null, notesPrivate || null, tags]
    );

    const person = result.rows[0];
    return NextResponse.json({
      success: true,
      person: {
        id: person.id,
        displayName: person.display_name,
        email: person.email,
        phone: person.phone,
        tags: person.tags,
        createdAt: person.created_at
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[PEOPLE] Create error:', error);
    return NextResponse.json({ error: 'Failed to create person' }, { status: 500 });
  }
}
