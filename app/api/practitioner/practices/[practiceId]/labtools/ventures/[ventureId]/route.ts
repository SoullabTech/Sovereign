export const dynamic = 'force-dynamic';

/**
 * Single Venture API
 * GET    - Get venture details
 * PATCH  - Update venture
 * DELETE - Delete venture
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

type RouteContext = { params: Promise<{ practiceId: string; ventureId: string }> };

const VALID_VENTURE_TYPES = [
  'maia_rd', 'soullab_rd', 'marketing', 'sales',
  'partnerships', 'operations', 'content', 'events'
];

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, ventureId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const result = await query(
      `SELECT
        v.id, v.name, v.venture_type, v.description, v.status,
        v.created_at, v.updated_at
      FROM rl_ventures v
      WHERE v.id = $1 AND v.practice_id = $2`,
      [ventureId, practiceId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Venture not found' }, { status: 404 });
    }

    const v = result.rows[0];

    // Get related data
    const [tasksResult, meetingsResult, opportunitiesResult] = await Promise.all([
      query(
        `SELECT id, title, due_at, status, created_at
         FROM rl_tasks
         WHERE venture_id = $1 AND status = 'open'
         ORDER BY due_at ASC NULLS LAST, created_at DESC
         LIMIT 10`,
        [ventureId]
      ),
      query(
        `SELECT id, title, meeting_type, scheduled_start_at, scheduled_end_at, status
         FROM rl_meetings
         WHERE venture_id = $1 AND status = 'scheduled' AND scheduled_start_at >= NOW()
         ORDER BY scheduled_start_at ASC
         LIMIT 10`,
        [ventureId]
      ),
      query(
        `SELECT id, title, stage, estimated_value_cents, expected_close_date
         FROM rl_opportunities
         WHERE venture_id = $1 AND stage NOT IN ('won', 'lost')
         ORDER BY expected_close_date ASC NULLS LAST, created_at DESC`,
        [ventureId]
      )
    ]);

    return NextResponse.json({
      venture: {
        id: v.id,
        name: v.name,
        type: v.venture_type,
        description: v.description,
        isActive: v.status === 'active' || v.status === 'planning',
        status: v.status,
        createdAt: v.created_at,
        updatedAt: v.updated_at
      },
      tasks: tasksResult.rows.map(t => ({
        id: t.id,
        title: t.title,
        dueAt: t.due_at,
        status: t.status,
        createdAt: t.created_at
      })),
      meetings: meetingsResult.rows.map(m => ({
        id: m.id,
        title: m.title,
        meetingType: m.meeting_type,
        scheduledStartAt: m.scheduled_start_at,
        scheduledEndAt: m.scheduled_end_at,
        status: m.status
      })),
      opportunities: opportunitiesResult.rows.map(o => ({
        id: o.id,
        title: o.title,
        stage: o.stage,
        valueCents: o.estimated_value_cents,
        expectedCloseAt: o.expected_close_date
      }))
    });
  } catch (error) {
    console.error('[VENTURES] Get error:', error);
    return NextResponse.json({ error: 'Failed to get venture' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, ventureId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    // Verify venture exists
    const existing = await query(
      'SELECT id FROM rl_ventures WHERE id = $1 AND practice_id = $2',
      [ventureId, practiceId]
    );
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Venture not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (body.name !== undefined) {
      if (!body.name?.trim()) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
      }
      updates.push(`name = $${paramIndex++}`);
      values.push(body.name.trim());
    }

    if (body.type !== undefined) {
      if (!VALID_VENTURE_TYPES.includes(body.type)) {
        return NextResponse.json({
          error: `Type must be one of: ${VALID_VENTURE_TYPES.join(', ')}`
        }, { status: 400 });
      }
      updates.push(`venture_type = $${paramIndex++}::venture_type`);
      values.push(body.type);
    }

    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(body.description?.trim() || null);
    }

    if (body.status !== undefined) {
      const VALID_STATUSES = ['idea', 'planning', 'active', 'on_hold', 'completed', 'archived'];
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({
          error: `Status must be one of: ${VALID_STATUSES.join(', ')}`
        }, { status: 400 });
      }
      updates.push(`status = $${paramIndex++}::venture_status`);
      values.push(body.status);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(ventureId);
    const result = await query(
      `UPDATE rl_ventures SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, name, venture_type, description, status, created_at, updated_at`,
      values
    );

    const v = result.rows[0];
    return NextResponse.json({
      success: true,
      venture: {
        id: v.id,
        name: v.name,
        type: v.venture_type,
        description: v.description,
        isActive: v.status === 'active' || v.status === 'planning',
        status: v.status,
        createdAt: v.created_at,
        updatedAt: v.updated_at
      }
    });
  } catch (error) {
    console.error('[VENTURES] Update error:', error);
    return NextResponse.json({ error: 'Failed to update venture' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, ventureId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const result = await query(
      'DELETE FROM rl_ventures WHERE id = $1 AND practice_id = $2 RETURNING id',
      [ventureId, practiceId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Venture not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[VENTURES] Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete venture' }, { status: 500 });
  }
}
