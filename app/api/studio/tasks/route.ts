export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO TASKS API
 *
 * CRUD operations for practitioner tasks
 * Supports team context and filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { randomUUID } from 'crypto';

// DB supports more statuses, but UI uses these
const VALID_STATUSES = ['todo', 'pending', 'in_progress', 'delegated', 'blocked', 'completed', 'cancelled'] as const;
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

type TaskStatus = typeof VALID_STATUSES[number];
type TaskPriority = typeof VALID_PRIORITIES[number];

// Map DB status to UI status
function mapDbStatusToUi(dbStatus: string): string {
  if (dbStatus === 'pending') return 'todo';
  if (dbStatus === 'blocked') return 'in_progress'; // Show blocked as in_progress for now
  if (dbStatus === 'cancelled') return 'completed'; // Show cancelled as completed
  return dbStatus;
}

// Map UI status to DB status
function mapUiStatusToDb(uiStatus: string): string {
  if (uiStatus === 'todo') return 'pending';
  return uiStatus;
}

function isValidStatus(s: string): s is TaskStatus {
  return VALID_STATUSES.includes(s as TaskStatus);
}

function isValidPriority(p: string): p is TaskPriority {
  return VALID_PRIORITIES.includes(p as TaskPriority);
}

export async function GET(request: NextRequest) {
  try {
    let memberId = await getMemberIdFromRequest(request);
    // Fallback for local development
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const teamId = searchParams.get('teamId');
    const includePersonal = searchParams.get('includePersonal') === 'true';
    const project = searchParams.get('project');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);

    let sql = `
      SELECT
        id, member_id, team_id, title, description,
        status, priority, due_date, due_time, project,
        tags, assignee, subtasks, completed_at, created_at, updated_at
      FROM studio_tasks
      WHERE (member_id = $1 OR member_id IS NULL)
    `;
    const params: (string | number | null)[] = [memberId];

    // Team filtering
    if (teamId) {
      if (includePersonal) {
        sql += ` AND (team_id = $${params.length + 1} OR team_id IS NULL)`;
      } else {
        sql += ` AND team_id = $${params.length + 1}`;
      }
      params.push(teamId);
    }

    // Status filter
    if (status && isValidStatus(status)) {
      sql += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    // Project filter
    if (project) {
      sql += ` AND project = $${params.length + 1}`;
      params.push(project);
    }

    sql += ` ORDER BY
      CASE priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
      due_date ASC,
      created_at DESC
      LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(sql, params);

    const tasks = result.rows.map(row => ({
      id: row.id,
      memberId: row.member_id,
      teamId: row.team_id,
      title: row.title,
      description: row.description,
      status: mapDbStatusToUi(row.status),
      priority: row.priority,
      dueDate: row.due_date,
      dueTime: row.due_time,
      project: row.project,
      tags: row.tags || [],
      assignee: row.assignee,
      subtasks: row.subtasks || [],
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('[Studio Tasks] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let memberId = await getMemberIdFromRequest(request);
    // Fallback for local development
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      status = 'todo',
      priority = 'medium',
      dueDate,
      dueTime,
      project,
      tags = [],
      assignee,
      subtasks = [],
      teamId,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!isValidStatus(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!isValidPriority(priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` },
        { status: 400 }
      );
    }

    // Ensure subtasks have IDs
    const processedSubtasks = subtasks.map((st: { id?: string; title: string; done?: boolean }) => ({
      id: st.id || randomUUID(),
      title: st.title,
      done: st.done || false,
    }));

    const dbStatus = mapUiStatusToDb(status);
    const result = await db.query(
      `INSERT INTO studio_tasks
        (member_id, team_id, title, description, status, priority, due_date, due_time, project, tags, assignee, subtasks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        memberId,
        teamId || null,
        title.trim(),
        description?.trim() || null,
        dbStatus,
        priority,
        dueDate || null,
        dueTime || null,
        project?.trim() || null,
        tags,
        assignee?.trim() || null,
        JSON.stringify(processedSubtasks),
      ]
    );

    const task = result.rows[0];
    return NextResponse.json({
      task: {
        id: task.id,
        memberId: task.member_id,
        teamId: task.team_id,
        title: task.title,
        description: task.description,
        status: mapDbStatusToUi(task.status),
        priority: task.priority,
        dueDate: task.due_date,
        dueTime: task.due_time,
        project: task.project,
        tags: task.tags || [],
        assignee: task.assignee,
        subtasks: task.subtasks || [],
        completedAt: task.completed_at,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Tasks] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    let memberId = await getMemberIdFromRequest(request);
    // Fallback for local development
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Build dynamic update
    const updateFields: string[] = [];
    const params: (string | null | string[])[] = [id, memberId];

    if (updates.title !== undefined) {
      updateFields.push(`title = $${params.length + 1}`);
      params.push(updates.title.trim());
    }

    if (updates.description !== undefined) {
      updateFields.push(`description = $${params.length + 1}`);
      params.push(updates.description?.trim() || null);
    }

    if (updates.status !== undefined) {
      if (!isValidStatus(updates.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      const dbStatus = mapUiStatusToDb(updates.status);
      updateFields.push(`status = $${params.length + 1}`);
      params.push(dbStatus);

      // Auto-set completed_at
      if (updates.status === 'completed') {
        updateFields.push(`completed_at = NOW()`);
      } else {
        updateFields.push(`completed_at = NULL`);
      }
    }

    if (updates.priority !== undefined) {
      if (!isValidPriority(updates.priority)) {
        return NextResponse.json(
          { error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` },
          { status: 400 }
        );
      }
      updateFields.push(`priority = $${params.length + 1}`);
      params.push(updates.priority);
    }

    if (updates.dueDate !== undefined) {
      updateFields.push(`due_date = $${params.length + 1}`);
      params.push(updates.dueDate || null);
    }

    if (updates.dueTime !== undefined) {
      updateFields.push(`due_time = $${params.length + 1}`);
      params.push(updates.dueTime || null);
    }

    if (updates.project !== undefined) {
      updateFields.push(`project = $${params.length + 1}`);
      params.push(updates.project?.trim() || null);
    }

    if (updates.tags !== undefined) {
      updateFields.push(`tags = $${params.length + 1}`);
      params.push(updates.tags);
    }

    if (updates.assignee !== undefined) {
      updateFields.push(`assignee = $${params.length + 1}`);
      params.push(updates.assignee?.trim() || null);
    }

    if (updates.subtasks !== undefined) {
      const processedSubtasks = updates.subtasks.map((st: { id?: string; title: string; done?: boolean }) => ({
        id: st.id || randomUUID(),
        title: st.title,
        done: st.done || false,
      }));
      updateFields.push(`subtasks = $${params.length + 1}`);
      params.push(JSON.stringify(processedSubtasks));
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updateFields.push(`updated_at = NOW()`);

    const result = await db.query(
      `UPDATE studio_tasks
       SET ${updateFields.join(', ')}
       WHERE id = $1 AND (member_id = $2 OR member_id IS NULL)
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = result.rows[0];
    return NextResponse.json({
      task: {
        id: task.id,
        memberId: task.member_id,
        teamId: task.team_id,
        title: task.title,
        description: task.description,
        status: mapDbStatusToUi(task.status),
        priority: task.priority,
        dueDate: task.due_date,
        dueTime: task.due_time,
        project: task.project,
        tags: task.tags || [],
        assignee: task.assignee,
        subtasks: task.subtasks || [],
        completedAt: task.completed_at,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Tasks] PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let memberId = await getMemberIdFromRequest(request);
    // Fallback for local development
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const result = await db.query(
      `DELETE FROM studio_tasks WHERE id = $1 AND (member_id = $2 OR member_id IS NULL) RETURNING id`,
      [id, memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Tasks] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
