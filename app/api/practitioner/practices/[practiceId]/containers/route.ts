export const dynamic = 'force-static';

/**
 * Containers API
 * GET  - List containers in practice
 * POST - Create a new container
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

async function getMemberFromRequest(request: NextRequest): Promise<{ id: string } | null> {
  const memberId = request.headers.get('x-member-id');
  if (!memberId) return null;
  const result = await query('SELECT id FROM members WHERE id = $1', [memberId]);
  return result.rows.length > 0 ? { id: memberId } : null;
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
    const statusFilter = searchParams.get('status')?.split(',').filter(Boolean);
    const typeFilter = searchParams.get('type');
    const searchQuery = searchParams.get('q')?.trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let sql = `
      SELECT
        c.id, c.type, c.status, c.scope, c.start_at, c.end_at,
        c.visibility, c.risk_flags, c.created_at,
        (
          SELECT json_agg(json_build_object(
            'id', cp.id,
            'personId', cp.person_id,
            'displayName', p.display_name,
            'role', cp.role
          ))
          FROM rl_participants cp
          JOIN rl_people p ON p.id = cp.person_id
          WHERE cp.container_id = c.id
        ) as participants,
        (
          SELECT json_build_object(
            'id', s.id,
            'scheduledStartAt', s.scheduled_start_at
          )
          FROM rl_sessions s
          WHERE s.container_id = c.id
            AND s.status = 'scheduled'
            AND s.scheduled_start_at > NOW()
          ORDER BY s.scheduled_start_at ASC
          LIMIT 1
        ) as next_session
      FROM rl_containers c
      WHERE c.practice_id = $1
    `;
    const values: unknown[] = [practiceId];
    let paramIndex = 2;

    if (statusFilter && statusFilter.length > 0) {
      sql += ` AND c.status = ANY($${paramIndex++}::container_status[])`;
      values.push(statusFilter);
    }

    if (typeFilter) {
      sql += ` AND c.type = $${paramIndex++}::container_type`;
      values.push(typeFilter);
    }

    // Search by scope or participant name
    if (searchQuery) {
      sql += ` AND (
        c.scope ILIKE $${paramIndex++}
        OR EXISTS (
          SELECT 1 FROM rl_participants cp
          JOIN rl_people p ON p.id = cp.person_id
          WHERE cp.container_id = c.id AND p.display_name ILIKE $${paramIndex++}
        )
      )`;
      const searchPattern = `%${searchQuery}%`;
      values.push(searchPattern, searchPattern);
    }

    // Get total count
    const countSql = `SELECT COUNT(*) FROM rl_containers WHERE practice_id = $1`;
    const countResult = await query(countSql, [practiceId]);
    const total = parseInt(countResult.rows[0].count, 10);

    sql += ` ORDER BY c.updated_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    values.push(limit, offset);

    const result = await query(sql, values);

    return NextResponse.json({
      containers: result.rows.map(row => ({
        id: row.id,
        type: row.type,
        status: row.status,
        scope: row.scope,
        startAt: row.start_at,
        endAt: row.end_at,
        visibility: row.visibility,
        riskFlags: row.risk_flags,
        participants: row.participants || [],
        nextSession: row.next_session,
        createdAt: row.created_at
      })),
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('[CONTAINERS] List error:', error);
    return NextResponse.json({ error: 'Failed to list containers' }, { status: 500 });
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
    const { type = '1:1', scope, visibility = 'private', participants = [] } = body;

    // Create the container
    const containerResult = await query(
      `INSERT INTO rl_containers (practice_id, type, scope, visibility)
       VALUES ($1, $2, $3, $4)
       RETURNING id, type, status, scope, visibility, risk_flags, created_at`,
      [practiceId, type, scope || null, visibility]
    );

    const container = containerResult.rows[0];

    // Add participants if provided
    if (participants.length > 0) {
      for (const p of participants) {
        if (p.personId) {
          // Verify person belongs to this practice
          const personCheck = await query(
            'SELECT id FROM rl_people WHERE id = $1 AND practice_id = $2',
            [p.personId, practiceId]
          );
          if (personCheck.rows.length > 0) {
            await query(
              `INSERT INTO rl_participants (container_id, person_id, role)
               VALUES ($1, $2, $3)
               ON CONFLICT (container_id, person_id) DO NOTHING`,
              [container.id, p.personId, p.role || 'client']
            );
          }
        }
      }
    }

    // Fetch participants for response
    const participantsResult = await query(
      `SELECT cp.id, cp.person_id, cp.role, p.display_name
       FROM rl_participants cp
       JOIN rl_people p ON p.id = cp.person_id
       WHERE cp.container_id = $1`,
      [container.id]
    );

    return NextResponse.json({
      success: true,
      container: {
        id: container.id,
        type: container.type,
        status: container.status,
        scope: container.scope,
        visibility: container.visibility,
        riskFlags: container.risk_flags,
        participants: participantsResult.rows.map(r => ({
          id: r.id,
          personId: r.person_id,
          displayName: r.display_name,
          role: r.role
        })),
        createdAt: container.created_at
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[CONTAINERS] Create error:', error);
    return NextResponse.json({ error: 'Failed to create container' }, { status: 500 });
  }
}
