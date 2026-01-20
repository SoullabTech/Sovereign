export const dynamic = 'force-static';

/**
 * Single Session API
 * GET   - Get session details with notes
 * PATCH - Update session
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

async function getMemberFromRequest(request: NextRequest): Promise<{ id: string } | null> {
  const memberId = request.headers.get('x-member-id');
  if (!memberId) return null;
  const result = await query('SELECT id FROM members WHERE id = $1', [memberId]);
  return result.rows.length > 0 ? { id: memberId } : null;
}

async function verifySessionAccess(sessionId: string, memberId: string): Promise<boolean> {
  const result = await query(
    `SELECT s.id FROM rl_sessions s
     JOIN rl_containers c ON c.id = s.container_id
     JOIN rl_practices p ON p.id = c.practice_id
     WHERE s.id = $1 AND p.owner_user_id = $2`,
    [sessionId, memberId]
  );
  return result.rows.length > 0;
}

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { sessionId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifySessionAccess(sessionId, member.id)) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionResult = await query(
      `SELECT s.*, c.scope as container_scope, c.type as container_type
       FROM rl_sessions s
       JOIN rl_containers c ON c.id = s.container_id
       WHERE s.id = $1`,
      [sessionId]
    );

    const session = sessionResult.rows[0];

    // Get notes for this session
    const notesResult = await query(
      `SELECT id, visibility, content, created_at, updated_at
       FROM rl_notes
       WHERE session_id = $1
       ORDER BY created_at DESC`,
      [sessionId]
    );

    return NextResponse.json({
      session: {
        id: session.id,
        containerId: session.container_id,
        containerScope: session.container_scope,
        containerType: session.container_type,
        sessionType: session.session_type,
        scheduledStartAt: session.scheduled_start_at,
        scheduledEndAt: session.scheduled_end_at,
        status: session.status,
        location: session.location,
        createdAt: session.created_at,
        updatedAt: session.updated_at
      },
      notes: notesResult.rows.map(n => ({
        id: n.id,
        visibility: n.visibility,
        content: n.content,
        createdAt: n.created_at,
        updatedAt: n.updated_at
      }))
    });
  } catch (error) {
    console.error('[SESSION] Get error:', error);
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { sessionId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifySessionAccess(sessionId, member.id)) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (body.sessionType !== undefined) {
      updates.push(`session_type = $${paramIndex++}::rl_session_type`);
      values.push(body.sessionType);
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
      updates.push(`location = $${paramIndex++}::session_location`);
      values.push(body.location);
    }
    if (body.status !== undefined) {
      updates.push(`status = $${paramIndex++}::rl_session_status`);
      values.push(body.status);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    values.push(sessionId);
    const result = await query(
      `UPDATE rl_sessions SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return NextResponse.json({ success: true, session: result.rows[0] });
  } catch (error) {
    console.error('[SESSION] Update error:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
