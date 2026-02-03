/**
 * STUDIO TEAMS API
 *
 * GET: List user's teams
 * POST: Create new team
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { getMemberTeams } from '@/lib/auth/teamPermissions';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teams = await getMemberTeams(memberId);

    return NextResponse.json({ teams });
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
