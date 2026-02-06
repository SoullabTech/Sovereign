export const dynamic = 'force-dynamic';

/**
 * Venture Detail API
 * Get, update, delete a specific venture
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getAuthenticatedMember, verifyPracticeOwnership } from '@/lib/practitioner/auth';

type RouteContext = { params: Promise<{ practiceId: string; ventureId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, ventureId } = await context.params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const result = await query(`
      SELECT v.*,
        (SELECT COUNT(*) FROM rl_tasks t WHERE t.venture_id = v.id AND t.status = 'open') as open_tasks,
        (SELECT COUNT(*) FROM rl_venture_collaborators vc WHERE vc.venture_id = v.id) as collaborator_count,
        (SELECT json_agg(json_build_object(
          'id', vc.id,
          'personId', vc.person_id,
          'role', vc.role,
          'allocatedHours', vc.allocated_hours_per_week,
          'personName', p.display_name
        )) FROM rl_venture_collaborators vc
        JOIN rl_people p ON p.id = vc.person_id
        WHERE vc.venture_id = v.id) as collaborators
      FROM rl_ventures v
      WHERE v.id = $1 AND v.practice_id = $2
    `, [ventureId, practiceId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Venture not found' }, { status: 404 });
    }

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
        actualStartDate: row.actual_start_date,
        actualEndDate: row.actual_end_date,
        estimatedHours: row.estimated_hours,
        actualHours: row.actual_hours,
        budgetCents: row.budget_cents,
        spentCents: row.spent_cents,
        tags: row.tags,
        notes: row.notes,
        openTasks: parseInt(row.open_tasks || '0'),
        collaboratorCount: parseInt(row.collaborator_count || '0'),
        collaborators: row.collaborators || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[VENTURE] Get error:', error);
    return NextResponse.json({ error: 'Failed to get venture' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, ventureId } = await context.params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fields = [
      'name', 'description', 'status', 'priority',
      'target_start_date', 'target_end_date', 'actual_start_date', 'actual_end_date',
      'estimated_hours', 'actual_hours', 'budget_cents', 'spent_cents', 'tags', 'notes'
    ];

    const fieldMap: Record<string, string> = {
      name: 'name',
      description: 'description',
      status: 'status',
      priority: 'priority',
      targetStartDate: 'target_start_date',
      targetEndDate: 'target_end_date',
      actualStartDate: 'actual_start_date',
      actualEndDate: 'actual_end_date',
      estimatedHours: 'estimated_hours',
      actualHours: 'actual_hours',
      budgetCents: 'budget_cents',
      spentCents: 'spent_cents',
      tags: 'tags',
      notes: 'notes',
    };

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (body[key] !== undefined) {
        if (dbField === 'status') {
          updates.push(`${dbField} = $${paramIndex++}::venture_status`);
        } else {
          updates.push(`${dbField} = $${paramIndex++}`);
        }
        values.push(body[key]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    values.push(ventureId, practiceId);

    const result = await query(`
      UPDATE rl_ventures
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex++} AND practice_id = $${paramIndex}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Venture not found' }, { status: 404 });
    }

    const row = result.rows[0];

    return NextResponse.json({
      venture: {
        id: row.id,
        name: row.name,
        description: row.description,
        ventureType: row.venture_type,
        status: row.status,
        priority: row.priority,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[VENTURE] Update error:', error);
    return NextResponse.json({ error: 'Failed to update venture' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, ventureId } = await context.params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const result = await query(`
      DELETE FROM rl_ventures
      WHERE id = $1 AND practice_id = $2
      RETURNING id
    `, [ventureId, practiceId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Venture not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[VENTURE] Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete venture' }, { status: 500 });
  }
}
