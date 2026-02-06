export const dynamic = 'force-dynamic';

/**
 * Ventures API
 * List and create business ventures
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
    const ventureType = searchParams.get('type');
    const statusParam = searchParams.get('status');
    const statuses = statusParam?.split(',').filter(Boolean);

    let sql = `
      SELECT v.*,
        (SELECT COUNT(*) FROM rl_tasks t WHERE t.venture_id = v.id AND t.status = 'open') as open_tasks,
        (SELECT COUNT(*) FROM rl_venture_collaborators vc WHERE vc.venture_id = v.id) as collaborator_count,
        (SELECT COUNT(*) FROM rl_meetings m WHERE m.venture_id = v.id AND m.status = 'scheduled' AND m.scheduled_start_at > NOW()) as upcoming_meetings
      FROM rl_ventures v
      WHERE v.practice_id = $1
    `;
    const values: unknown[] = [practiceId];
    let paramIndex = 2;

    if (ventureType) {
      sql += ` AND v.venture_type = $${paramIndex++}::venture_type`;
      values.push(ventureType);
    }

    if (statuses && statuses.length > 0) {
      sql += ` AND v.status = ANY($${paramIndex++}::venture_status[])`;
      values.push(statuses);
    }

    sql += ` ORDER BY v.priority ASC, v.updated_at DESC`;

    const result = await query(sql, values);

    return NextResponse.json({
      ventures: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        ventureType: row.venture_type,
        status: row.status,
        priority: row.priority,
        targetStartDate: row.target_start_date,
        targetEndDate: row.target_end_date,
        estimatedHours: row.estimated_hours,
        actualHours: row.actual_hours,
        budgetCents: row.budget_cents,
        spentCents: row.spent_cents,
        tags: row.tags,
        notes: row.notes,
        openTasks: parseInt(row.open_tasks || '0'),
        collaboratorCount: parseInt(row.collaborator_count || '0'),
        upcomingMeetings: parseInt(row.upcoming_meetings || '0'),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  } catch (error) {
    console.error('[VENTURES] List error:', error);
    return NextResponse.json({ error: 'Failed to list ventures' }, { status: 500 });
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
      name,
      description,
      ventureType,
      status = 'idea',
      priority = 3,
      targetStartDate,
      targetEndDate,
      estimatedHours,
      budgetCents,
      tags = [],
      notes,
    } = body;

    if (!name || !ventureType) {
      return NextResponse.json({ error: 'Name and venture type are required' }, { status: 400 });
    }

    const result = await query(`
      INSERT INTO rl_ventures (
        practice_id, name, description, venture_type, status, priority,
        target_start_date, target_end_date, estimated_hours, budget_cents, tags, notes
      ) VALUES ($1, $2, $3, $4::venture_type, $5::venture_status, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      practiceId,
      name,
      description || null,
      ventureType,
      status,
      priority,
      targetStartDate || null,
      targetEndDate || null,
      estimatedHours || null,
      budgetCents || null,
      tags,
      notes || null,
    ]);

    const row = result.rows[0];

    return NextResponse.json({
      venture: {
        id: row.id,
        name: row.name,
        description: row.description,
        ventureType: row.venture_type,
        status: row.status,
        priority: row.priority,
        targetStartDate: row.target_start_date,
        targetEndDate: row.target_end_date,
        estimatedHours: row.estimated_hours,
        budgetCents: row.budget_cents,
        tags: row.tags,
        notes: row.notes,
        createdAt: row.created_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[VENTURES] Create error:', error);
    return NextResponse.json({ error: 'Failed to create venture' }, { status: 500 });
  }
}
