export const dynamic = 'force-dynamic';

/**
 * Ventures API
 * GET  - List ventures for practice
 * POST - Create a new venture
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

const VALID_VENTURE_TYPES = [
  'maia_rd', 'soullab_rd', 'marketing', 'sales',
  'partnerships', 'operations', 'content', 'events'
];

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
    const isActive = searchParams.get('isActive');
    const type = searchParams.get('type');

    let sql = `
      SELECT
        v.id, v.name, v.type, v.description, v.is_active,
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
               SUM(value_cents) as pipeline_value_cents
        FROM rl_opportunities
        WHERE stage NOT IN ('closed_won', 'closed_lost')
          AND venture_id IS NOT NULL
        GROUP BY venture_id
      ) o ON o.venture_id = v.id
      WHERE v.practice_id = $1
    `;
    const values: unknown[] = [practiceId];
    let paramIndex = 2;

    if (isActive !== null) {
      sql += ` AND v.is_active = $${paramIndex++}`;
      values.push(isActive === 'true');
    }
    if (type && VALID_VENTURE_TYPES.includes(type)) {
      sql += ` AND v.type = $${paramIndex++}::venture_type`;
      values.push(type);
    }

    sql += ` ORDER BY v.is_active DESC, v.created_at DESC`;

    const result = await query(sql, values);

    return NextResponse.json({
      ventures: result.rows.map(r => ({
        id: r.id,
        name: r.name,
        type: r.type,
        description: r.description,
        isActive: r.is_active,
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
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
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
      `INSERT INTO rl_ventures (practice_id, name, type, description)
       VALUES ($1, $2, $3::venture_type, $4)
       RETURNING id, name, type, description, is_active, created_at, updated_at`,
      [practiceId, name.trim(), type, description?.trim() || null]
    );

    const venture = result.rows[0];
    return NextResponse.json({
      success: true,
      venture: {
        id: venture.id,
        name: venture.name,
        type: venture.type,
        description: venture.description,
        isActive: venture.is_active,
        createdAt: venture.created_at,
        updatedAt: venture.updated_at
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[VENTURES] Create error:', error);
    return NextResponse.json({ error: 'Failed to create venture' }, { status: 500 });
  }
}
