export const dynamic = 'force-dynamic';

/**
 * Ventures API
 * GET  - List ventures for practice
 * POST - Create a new venture
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

type RouteContext = { params: Promise<{ practiceId: string }> };

const VALID_VENTURE_TYPES = [
  'maia_rd', 'soullab_rd', 'marketing', 'sales',
  'partnerships', 'operations', 'content', 'events'
];

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId } = await context.params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyPracticeOwnership(practiceId, memberId)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const type = searchParams.get('type');

    let sql = `
      SELECT
        v.id, v.name, v.venture_type, v.description, v.status,
        v.created_at, v.updated_at,
        COALESCE(t.open_tasks, 0) as open_tasks,
        COALESCE(m.upcoming_meetings, 0) as upcoming_meetings,
        COALESCE(o.active_opportunities, 0) as active_opportunities,
        COALESCE(o.pipeline_value_cents, 0) as pipeline_value_cents
      FROM rl_ventures v
      LEFT JOIN (
        SELECT venture_id, COUNT(*) as open_tasks
        FROM rl_tasks
        WHERE status = 'open' AND venture_id IS NOT NULL
        GROUP BY venture_id
      ) t ON t.venture_id = v.id
      LEFT JOIN (
        SELECT venture_id, COUNT(*) as upcoming_meetings
        FROM rl_meetings
        WHERE status = 'scheduled'
          AND scheduled_start_at BETWEEN NOW() AND NOW() + INTERVAL '14 days'
          AND venture_id IS NOT NULL
        GROUP BY venture_id
      ) m ON m.venture_id = v.id
      LEFT JOIN (
        SELECT venture_id,
               COUNT(*) as active_opportunities,
               SUM(estimated_value_cents) as pipeline_value_cents
        FROM rl_opportunities
        WHERE stage NOT IN ('won', 'lost')
          AND venture_id IS NOT NULL
        GROUP BY venture_id
      ) o ON o.venture_id = v.id
      WHERE v.practice_id = $1
    `;
    const values: unknown[] = [practiceId];
    let paramIndex = 2;

    if (isActive !== null) {
      const activeStatuses = isActive === 'true' ? ['active', 'planning'] : ['on_hold', 'completed', 'archived', 'idea'];
      sql += ` AND v.status = ANY($${paramIndex++}::venture_status[])`;
      values.push(activeStatuses);
    }
    if (type && VALID_VENTURE_TYPES.includes(type)) {
      sql += ` AND v.venture_type = $${paramIndex++}::venture_type`;
      values.push(type);
    }

    sql += ` ORDER BY CASE WHEN v.status IN ('active', 'planning') THEN 0 ELSE 1 END, v.created_at DESC`;

    const result = await query(sql, values);

    return NextResponse.json({
      ventures: result.rows.map(r => ({
        id: r.id,
        name: r.name,
        type: r.venture_type,
        description: r.description,
        isActive: r.status === 'active' || r.status === 'planning',
        status: r.status,
        openTasks: parseInt(r.open_tasks, 10),
        upcomingMeetings: parseInt(r.upcoming_meetings, 10),
        activeOpportunities: parseInt(r.active_opportunities, 10),
        pipelineValueCents: parseInt(r.pipeline_value_cents || '0', 10),
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }))
    });
  } catch (error) {
    console.error('[VENTURES] List error:', error);
    return NextResponse.json({ error: 'Failed to list ventures' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId } = await context.params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyPracticeOwnership(practiceId, memberId)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, type, description } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!type || !VALID_VENTURE_TYPES.includes(type)) {
      return NextResponse.json({
        error: `Type must be one of: ${VALID_VENTURE_TYPES.join(', ')}`
      }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO rl_ventures (practice_id, name, venture_type, description, status)
       VALUES ($1, $2, $3::venture_type, $4, 'active'::venture_status)
       RETURNING id, name, venture_type, description, status, created_at, updated_at`,
      [practiceId, name.trim(), type, description?.trim() || null]
    );

    const venture = result.rows[0];
    return NextResponse.json({
      success: true,
      venture: {
        id: venture.id,
        name: venture.name,
        type: venture.venture_type,
        description: venture.description,
        isActive: venture.status === 'active' || venture.status === 'planning',
        status: venture.status,
        createdAt: venture.created_at,
        updatedAt: venture.updated_at
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[VENTURES] Create error:', error);
    return NextResponse.json({ error: 'Failed to create venture' }, { status: 500 });
  }
}
