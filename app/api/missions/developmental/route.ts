import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import type { DevelopmentalMission, DescentSeed } from '@/lib/consciousness/developmentalMission';
import { generateMissionFromDescent } from '@/lib/consciousness/developmentalMission';

export const dynamic = 'force-dynamic';

/**
 * GET /api/missions/developmental — List developmental missions for current member
 *
 * Returns available + accepted missions (not released/completed unless ?all=true)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    const memberId = session?.memberId;
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const showAll = request.nextUrl.searchParams.get('all') === 'true';

    const statusFilter = showAll
      ? ''
      : `AND status IN ('available', 'accepted')`;

    const result = await query(
      `SELECT * FROM developmental_missions
       WHERE member_id = $1 ${statusFilter}
       ORDER BY created_at DESC
       LIMIT 20`,
      [memberId]
    );

    const missions: DevelopmentalMission[] = result.rows.map(rowToMission);

    return NextResponse.json({ missions });
  } catch (error) {
    console.error('[DevMissions] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 });
  }
}

/**
 * POST /api/missions/developmental — Generate a mission from descent seed
 *
 * Body: { seed: DescentSeed }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    const memberId = session?.memberId;
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const seed: DescentSeed = body.seed;

    if (!seed) {
      return NextResponse.json({ error: 'seed is required' }, { status: 400 });
    }

    const missionData = generateMissionFromDescent(memberId, seed);

    const result = await query(
      `INSERT INTO developmental_missions
        (member_id, type, title, invitation, duration, origin, status, origin_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        missionData.member_id,
        missionData.type,
        missionData.title,
        missionData.invitation,
        missionData.duration,
        missionData.origin,
        missionData.status,
        JSON.stringify(missionData.origin_data || null),
      ]
    );

    const mission = rowToMission(result.rows[0]);

    console.log(`[DevMissions] created ${mission.type} mission for ${memberId}`);

    return NextResponse.json({ mission }, { status: 201 });
  } catch (error) {
    console.error('[DevMissions] POST error:', error);
    return NextResponse.json({ error: 'Failed to create mission' }, { status: 500 });
  }
}

/**
 * PATCH /api/missions/developmental — Update mission status
 *
 * Body: { id: string, action: 'accept' | 'complete' | 'release' }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    const memberId = session?.memberId;
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action } = body as { id: string; action: string };

    if (!id || !action) {
      return NextResponse.json({ error: 'id and action required' }, { status: 400 });
    }

    let statusUpdate: string;
    let timestampField: string;

    switch (action) {
      case 'accept':
        statusUpdate = 'accepted';
        timestampField = 'accepted_at';
        break;
      case 'complete':
        statusUpdate = 'completed';
        timestampField = 'completed_at';
        break;
      case 'release':
        statusUpdate = 'released';
        timestampField = 'released_at';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await query(
      `UPDATE developmental_missions
       SET status = $1, ${timestampField} = NOW()
       WHERE id = $2 AND member_id = $3
       RETURNING *`,
      [statusUpdate, id, memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    const mission = rowToMission(result.rows[0]);

    console.log(`[DevMissions] ${action} mission ${id} for ${memberId}`);

    return NextResponse.json({ mission });
  } catch (error) {
    console.error('[DevMissions] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update mission' }, { status: 500 });
  }
}

// ─── Row mapper ────────────────────────────────────────────────────────────

function rowToMission(row: Record<string, unknown>): DevelopmentalMission {
  return {
    id: row.id as string,
    member_id: row.member_id as string,
    type: row.type as DevelopmentalMission['type'],
    title: row.title as string,
    invitation: row.invitation as string,
    duration: row.duration as DevelopmentalMission['duration'],
    origin: row.origin as DevelopmentalMission['origin'],
    status: row.status as DevelopmentalMission['status'],
    origin_data: row.origin_data as DescentSeed | undefined,
    created_at: new Date(row.created_at as string),
    accepted_at: row.accepted_at ? new Date(row.accepted_at as string) : undefined,
    completed_at: row.completed_at ? new Date(row.completed_at as string) : undefined,
    released_at: row.released_at ? new Date(row.released_at as string) : undefined,
  };
}
