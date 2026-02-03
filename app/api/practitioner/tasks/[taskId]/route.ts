export const dynamic = 'force-dynamic';

/**
 * Single Task API
 * GET   - Get task details
 * PATCH - Update task (complete, snooze, etc.)
 * DELETE - Delete task
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

async function getMemberFromRequest(request: NextRequest): Promise<{ id: string } | null> {
  const memberId = request.headers.get('x-member-id');
  if (!memberId) return null;
  const result = await query('SELECT id FROM members WHERE id = $1', [memberId]);
  return result.rows.length > 0 ? { id: memberId } : null;
}

async function verifyTaskAccess(taskId: string, memberId: string): Promise<boolean> {
  const result = await query(
    `SELECT t.id FROM rl_tasks t
     JOIN rl_practices p ON p.id = t.practice_id
     WHERE t.id = $1 AND p.owner_user_id = $2`,
    [taskId, memberId]
  );
  return result.rows.length > 0;
}

type RouteContext = { params: Promise<{ taskId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { taskId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyTaskAccess(taskId, member.id)) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const result = await query(
      `SELECT t.*, c.scope as container_scope, p.display_name as person_name
       FROM rl_tasks t
       LEFT JOIN rl_containers c ON c.id = t.container_id
       LEFT JOIN rl_people p ON p.id = t.person_id
       WHERE t.id = $1`,
      [taskId]
    );

    const task = result.rows[0];
    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        dueAt: task.due_at,
        status: task.status,
        containerId: task.container_id,
        containerScope: task.container_scope,
        personId: task.person_id,
        personName: task.person_name,
        practiceId: task.practice_id,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      },
    });
  } catch (error) {
    console.error('[TASK] Get error:', error);
    return NextResponse.json({ error: 'Failed to get task' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { taskId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyTaskAccess(taskId, member.id)) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    // Status update (open, completed, cancelled)
    if (body.status !== undefined) {
      updates.push(`status = $${paramIndex++}::rl_task_status`);
      values.push(body.status);
    }

    // Due date update (for snoozing)
    if (body.dueAt !== undefined) {
      updates.push(`due_at = $${paramIndex++}`);
      values.push(body.dueAt);
    }

    // Title update
    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(body.title);
    }

    // Container assignment
    if (body.containerId !== undefined) {
      updates.push(`container_id = $${paramIndex++}`);
      values.push(body.containerId);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    values.push(taskId);
    const result = await query(
      `UPDATE rl_tasks
       SET ${updates.join(', ')}, updated_at = now()
       WHERE id = $${paramIndex}
       RETURNING id, title, due_at, status, container_id, person_id, updated_at`,
      values
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
        updatedAt: task.updated_at,
      },
    });
  } catch (error) {
    console.error('[TASK] Update error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { taskId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyTaskAccess(taskId, member.id)) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await query('DELETE FROM rl_tasks WHERE id = $1', [taskId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TASK] Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
