export const dynamic = 'force-dynamic';

/**
 * Container Sessions API
 * GET  - List sessions for a container
 * POST - Create a new session
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getAuthenticatedMember, verifyContainerAccess } from '@/lib/practitioner/auth';

type RouteContext = { params: Promise<{ containerId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { containerId } = await context.params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyContainerAccess(containerId, member.id)) {
      return NextResponse.json({ error: 'Container not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let sql = `
      SELECT id, session_type, scheduled_start_at, scheduled_end_at,
             status, location, created_at, updated_at
      FROM rl_sessions
      WHERE container_id = $1
    `;
    const values: unknown[] = [containerId];
    let paramIndex = 2;

    if (status) {
      sql += ` AND status = $${paramIndex++}::rl_session_status`;
      values.push(status);
    }

    sql += ` ORDER BY scheduled_start_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    values.push(limit, offset);

    const result = await query(sql, values);

    return NextResponse.json({
      sessions: result.rows.map(r => ({
        id: r.id,
        sessionType: r.session_type,
        scheduledStartAt: r.scheduled_start_at,
        scheduledEndAt: r.scheduled_end_at,
        status: r.status,
        location: r.location,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }))
    });
  } catch (error) {
    console.error('[SESSIONS] List error:', error);
    return NextResponse.json({ error: 'Failed to list sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { containerId } = await context.params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyContainerAccess(containerId, member.id)) {
      return NextResponse.json({ error: 'Container not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      sessionType = 'session',
      scheduledStartAt,
      scheduledEndAt,
      location = 'video'
    } = body;

    if (!scheduledStartAt || !scheduledEndAt) {
      return NextResponse.json({
        error: 'scheduledStartAt and scheduledEndAt are required'
      }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO rl_sessions (container_id, session_type, scheduled_start_at, scheduled_end_at, location)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, session_type, scheduled_start_at, scheduled_end_at, status, location, created_at`,
      [containerId, sessionType, scheduledStartAt, scheduledEndAt, location]
    );

    const session = result.rows[0];
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        sessionType: session.session_type,
        scheduledStartAt: session.scheduled_start_at,
        scheduledEndAt: session.scheduled_end_at,
        status: session.status,
        location: session.location,
        createdAt: session.created_at
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[SESSIONS] Create error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
