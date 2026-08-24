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

type RouteContext = { params: Promise<{ practiceId: string; ventureId: string }> };

const VALID_VENTURE_TYPES = [
  'maia_rd', 'soullab_rd', 'marketing', 'sales',
  'partnerships', 'operations', 'content', 'events'
];

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, ventureId } = await context.params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyPracticeOwnership(practiceId, memberId)) {
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
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyPracticeOwnership(practiceId, memberId)) {
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
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyPracticeOwnership(practiceId, memberId)) {
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
