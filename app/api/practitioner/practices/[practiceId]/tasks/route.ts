export const dynamic = 'force-dynamic';

/**
 * Tasks API
 * GET  - List tasks for practice
 * POST - Create a new task
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
    const status = searchParams.get('status') || 'open';
    const containerId = searchParams.get('containerId');
    const personId = searchParams.get('personId');
    const dueBefore = searchParams.get('dueBefore');

    let sql = `
      SELECT t.id, t.title, t.due_at, t.status, t.container_id, t.person_id,
             t.created_at, t.updated_at,
             c.scope as container_scope,
             p.display_name as person_name
      FROM rl_tasks t
      LEFT JOIN rl_containers c ON c.id = t.container_id
      LEFT JOIN rl_people p ON p.id = t.person_id
      WHERE t.practice_id = $1
    `;
    const values: unknown[] = [practiceId];
    let paramIndex = 2;

    if (status) {
      sql += ` AND t.status = $${paramIndex++}::rl_task_status`;
      values.push(status);
    }
    if (containerId) {
      sql += ` AND t.container_id = $${paramIndex++}`;
      values.push(containerId);
    }
    if (personId) {
      sql += ` AND t.person_id = $${paramIndex++}`;
      values.push(personId);
    }
    if (dueBefore) {
      sql += ` AND t.due_at <= $${paramIndex++}`;
      values.push(dueBefore);
    }

    sql += ` ORDER BY t.due_at ASC NULLS LAST, t.created_at DESC`;

    const result = await query(sql, values);

    return NextResponse.json({
      tasks: result.rows.map(r => ({
        id: r.id,
        title: r.title,
        dueAt: r.due_at,
        status: r.status,
        containerId: r.container_id,
        containerScope: r.container_scope,
        personId: r.person_id,
        personName: r.person_name,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }))
    });
  } catch (error) {
    console.error('[TASKS] List error:', error);
    return NextResponse.json({ error: 'Failed to list tasks' }, { status: 500 });
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
    const { title, containerId, personId, dueAt } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO rl_tasks (practice_id, title, container_id, person_id, due_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, due_at, status, container_id, person_id, created_at`,
      [practiceId, title.trim(), containerId || null, personId || null, dueAt || null]
    );

    const task = result.rows[0];
    return NextResponse.json({
      success: true,
      task: {
        id: task.id,
        title: task.title,
        dueAt: task.due_at,
        status: task.status,
        containerId: task.container_id,
        personId: task.person_id,
        createdAt: task.created_at
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[TASKS] Create error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
