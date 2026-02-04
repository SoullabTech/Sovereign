import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { hasTeamRole } from '@/lib/auth/teamPermissions';

// GET /api/studio/agent-tasks - List all agent tasks
export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const reviewStatus = searchParams.get('review_status');
    const teamId = searchParams.get('teamId');
    const includePersonal = searchParams.get('includePersonal') === 'true';

    // Build query based on context
    let sql: string;
    const params: (string | null)[] = [];

    if (teamId) {
      // Verify team membership
      const isMember = await hasTeamRole(memberId, teamId, 'viewer');
      if (!isMember) {
        return NextResponse.json({ error: 'Not a member of this team' }, { status: 403 });
      }

      if (includePersonal) {
        // Combined view: team tasks + user's personal tasks
        sql = `
          SELECT t.*, tr.title as triage_title,
                 CASE WHEN t.team_id IS NOT NULL THEN 'team' ELSE 'personal' END as scope
          FROM studio_agent_tasks t
          LEFT JOIN studio_triage tr ON t.triage_id = tr.id
          WHERE (t.team_id = $1 OR (t.team_id IS NULL AND t.member_id = $2))
        `;
        params.push(teamId, memberId);
      } else {
        // Team-only view
        sql = `
          SELECT t.*, tr.title as triage_title, 'team' as scope
          FROM studio_agent_tasks t
          LEFT JOIN studio_triage tr ON t.triage_id = tr.id
          WHERE t.team_id = $1
        `;
        params.push(teamId);
      }
    } else {
      // Personal-only view (no team context)
      sql = `
        SELECT t.*, tr.title as triage_title, 'personal' as scope
        FROM studio_agent_tasks t
        LEFT JOIN studio_triage tr ON t.triage_id = tr.id
        WHERE t.member_id = $1 AND t.team_id IS NULL
      `;
      params.push(memberId);
    }

    if (status && status !== 'all') {
      sql += ` AND t.status = $${params.length + 1}`;
      params.push(status);
    }

    if (reviewStatus && reviewStatus !== 'all') {
      sql += ` AND t.review_status = $${params.length + 1}`;
      params.push(reviewStatus);
    }

    sql += ` ORDER BY
      CASE t.status
        WHEN 'running' THEN 1
        WHEN 'pending' THEN 2
        WHEN 'completed' THEN 3
        ELSE 4
      END,
      t.created_at DESC
    `;

    const result = await query(sql, params);
    return NextResponse.json({ tasks: result.rows });
  } catch (error) {
    console.error('Error fetching agent tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch agent tasks' }, { status: 500 });
  }
}

// POST /api/studio/agent-tasks - Create new agent task (delegate)
export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, prompt, agent_type = 'maia-dev', triage_id, team_id } = body;

    if (!title || !prompt) {
      return NextResponse.json({ error: 'Title and prompt are required' }, { status: 400 });
    }

    // If team_id provided, verify membership with create permission
    if (team_id) {
      const canCreate = await hasTeamRole(memberId, team_id, 'member');
      if (!canCreate) {
        return NextResponse.json({ error: 'Insufficient team permissions' }, { status: 403 });
      }
    }

    // Create the agent task
    const result = await query(
      `INSERT INTO studio_agent_tasks (member_id, triage_id, title, prompt, agent_type, status, team_id)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6)
       RETURNING *, CASE WHEN team_id IS NOT NULL THEN 'team' ELSE 'personal' END as scope`,
      [memberId, triage_id, title, prompt, agent_type, team_id || null]
    );

    // If from triage, update the triage item status
    if (triage_id) {
      await query(
        `UPDATE studio_triage SET status = 'delegated', updated_at = NOW() WHERE id = $1`,
        [triage_id]
      );
    }

    return NextResponse.json({ task: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent task:', error);
    return NextResponse.json({ error: 'Failed to create agent task' }, { status: 500 });
  }
}

// PATCH /api/studio/agent-tasks - Update agent task
export async function PATCH(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, output, artifacts, review_status, review_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Check if task exists and verify permissions
    const existingTask = await query(
      `SELECT member_id, team_id FROM studio_agent_tasks WHERE id = $1`,
      [id]
    );

    if (existingTask.rows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = existingTask.rows[0];

    // Permission check: personal tasks need owner match, team tasks need edit permission
    if (task.team_id) {
      // Team task - need admin role or be the creator
      const isAdmin = await hasTeamRole(memberId, task.team_id, 'admin');
      const isCreator = task.member_id === memberId;
      if (!isAdmin && !isCreator) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    } else {
      // Personal task - must be owner
      if (task.member_id !== memberId) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
    }

    const updates: string[] = [];
    const params: (string | null | object)[] = [id];

    if (status) {
      updates.push(`status = $${params.length + 1}`);
      params.push(status);

      if (status === 'running') {
        updates.push(`started_at = NOW()`);
      } else if (status === 'completed' || status === 'failed') {
        updates.push(`completed_at = NOW()`);
        // Set review_status to pending_review when task completes
        if (status === 'completed') {
          updates.push(`review_status = 'pending_review'`);
        }
      }
    }

    if (output !== undefined) {
      updates.push(`output = $${params.length + 1}`);
      params.push(output);
    }

    if (artifacts !== undefined) {
      updates.push(`artifacts = $${params.length + 1}`);
      params.push(JSON.stringify(artifacts));
    }

    if (review_status) {
      updates.push(`review_status = $${params.length + 1}`);
      params.push(review_status);
      updates.push(`reviewed_at = NOW()`);
    }

    if (review_notes !== undefined) {
      updates.push(`review_notes = $${params.length + 1}`);
      params.push(review_notes);
    }

    updates.push('updated_at = NOW()');

    const result = await query(
      `UPDATE studio_agent_tasks
       SET ${updates.join(', ')}
       WHERE id = $1
       RETURNING *, CASE WHEN team_id IS NOT NULL THEN 'team' ELSE 'personal' END as scope`,
      params
    );

    return NextResponse.json({ task: result.rows[0] });
  } catch (error) {
    console.error('Error updating agent task:', error);
    return NextResponse.json({ error: 'Failed to update agent task' }, { status: 500 });
  }
}
