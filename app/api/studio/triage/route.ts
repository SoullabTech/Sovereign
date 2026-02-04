import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { hasTeamRole } from '@/lib/auth/teamPermissions';

// GET /api/studio/triage - List all triage items
export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
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
        // Combined view: team items + user's personal items
        sql = `
          SELECT *, CASE WHEN team_id IS NOT NULL THEN 'team' ELSE 'personal' END as scope
          FROM studio_triage
          WHERE (team_id = $1 OR (team_id IS NULL AND member_id = $2))
        `;
        params.push(teamId, memberId);
      } else {
        // Team-only view
        sql = `
          SELECT *, 'team' as scope FROM studio_triage
          WHERE team_id = $1
        `;
        params.push(teamId);
      }
    } else {
      // Personal-only view (no team context)
      sql = `
        SELECT *, 'personal' as scope FROM studio_triage
        WHERE member_id = $1 AND team_id IS NULL
      `;
      params.push(memberId);
    }

    if (status && status !== 'all') {
      sql += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (priority && priority !== 'all') {
      sql += ` AND priority = $${params.length + 1}`;
      params.push(priority);
    }

    sql += ` ORDER BY
      CASE priority
        WHEN 'urgent' THEN 1
        WHEN 'today' THEN 2
        WHEN 'this_week' THEN 3
        WHEN 'unset' THEN 4
        WHEN 'backlog' THEN 5
        ELSE 6
      END,
      created_at DESC
    `;

    const result = await query(sql, params);
    return NextResponse.json({ items: result.rows });
  } catch (error) {
    console.error('Error fetching triage items:', error);
    return NextResponse.json({ error: 'Failed to fetch triage items' }, { status: 500 });
  }
}

// POST /api/studio/triage - Create new triage item
export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, source = 'manual', source_ref, priority = 'unset', team_id } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // If team_id provided, verify membership with create permission
    if (team_id) {
      const canCreate = await hasTeamRole(memberId, team_id, 'member');
      if (!canCreate) {
        return NextResponse.json({ error: 'Insufficient team permissions' }, { status: 403 });
      }
    }

    const result = await query(
      `INSERT INTO studio_triage (member_id, title, description, source, source_ref, priority, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *, CASE WHEN team_id IS NOT NULL THEN 'team' ELSE 'personal' END as scope`,
      [memberId, title, description, source, source_ref, priority, team_id || null]
    );

    return NextResponse.json({ item: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating triage item:', error);
    return NextResponse.json({ error: 'Failed to create triage item' }, { status: 500 });
  }
}

// PATCH /api/studio/triage - Update triage item
export async function PATCH(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, priority, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Check if item exists and verify permissions
    const existingItem = await query(
      `SELECT member_id, team_id FROM studio_triage WHERE id = $1`,
      [id]
    );

    if (existingItem.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const item = existingItem.rows[0];

    // Permission check: personal items need owner match, team items need edit permission
    if (item.team_id) {
      // Team item - need admin role or be the creator
      const isAdmin = await hasTeamRole(memberId, item.team_id, 'admin');
      const isCreator = item.member_id === memberId;
      if (!isAdmin && !isCreator) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    } else {
      // Personal item - must be owner
      if (item.member_id !== memberId) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
    }

    const updates: string[] = [];
    const params: (string | null)[] = [id];

    if (priority) {
      updates.push(`priority = $${params.length + 1}`);
      params.push(priority);
      if (priority !== 'unset') {
        updates.push(`triaged_at = NOW()`);
      }
    }

    if (status) {
      updates.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    updates.push('updated_at = NOW()');

    const result = await query(
      `UPDATE studio_triage
       SET ${updates.join(', ')}
       WHERE id = $1
       RETURNING *, CASE WHEN team_id IS NOT NULL THEN 'team' ELSE 'personal' END as scope`,
      params
    );

    return NextResponse.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Error updating triage item:', error);
    return NextResponse.json({ error: 'Failed to update triage item' }, { status: 500 });
  }
}
