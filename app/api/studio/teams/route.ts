/**
 * STUDIO TEAMS API
 *
 * GET: List user's teams (includes isAdmin flag for the caller)
 * POST: Create new team — admin-only (roles contains 'admin' or 'team_admin')
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { getMemberTeams } from '@/lib/auth/teamPermissions';
import crypto from 'crypto';

/** Reusable admin check — mirrors app/api/team/admin/channels/route.ts */
async function requireAdmin(memberId: string): Promise<boolean> {
  const r = await query(
    `SELECT id FROM members WHERE id = $1 AND ('team_admin' = ANY(roles) OR 'admin' = ANY(roles))`,
    [memberId]
  );
  return r.rows.length > 0;
}

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [teams, isAdmin] = await Promise.all([
      getMemberTeams(memberId),
      requireAdmin(memberId),
    ]);

    return NextResponse.json({ teams, isAdmin });
  } catch (error) {
    console.error('[Teams API] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin gate — only team_admin or admin can create teams
    const admin = await requireAdmin(memberId);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: admin role required to create a team' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const teamId = crypto.randomUUID();

    // Create the team
    await query(
      `INSERT INTO studio_teams (id, name, description, owner_id)
       VALUES ($1, $2, $3, $4)`,
      [teamId, name.trim(), description || null, memberId]
    );

    // Add creator as owner
    await query(
      `INSERT INTO studio_team_members (team_id, member_id, role)
       VALUES ($1, $2, 'owner')`,
      [teamId, memberId]
    );

    // Seed a #general starter channel for the new team (idempotent)
    const generalId = crypto.randomUUID();
    await query(
      `INSERT INTO team_channels (id, slug, name, description, channel_type, is_private, created_by, team_id)
       VALUES ($1, 'general', 'general', 'General conversation', 'text', FALSE, $2, $3)
       ON CONFLICT (team_id, slug) DO NOTHING`,
      [generalId, memberId, teamId]
    );

    // Fetch the created team
    const result = await query(
      `SELECT id, name, description, owner_id, settings, created_at, updated_at
       FROM studio_teams WHERE id = $1`,
      [teamId]
    );

    return NextResponse.json({
      success: true,
      team: {
        ...result.rows[0],
        role: 'owner',
        member_count: 1,
      },
    });
  } catch (error) {
    console.error('[Teams API] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
