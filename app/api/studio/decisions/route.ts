export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO DECISIONS API
 *
 * List and create decision analysis records.
 * Part of the Leadership Domain Layer for consultants
 * working with executives and organizational leaders.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

const VALID_STATUSES = ['draft', 'consulting', 'complete', 'archived'] as const;
const VALID_TIME_PRESSURES = ['none', 'low', 'medium', 'high', 'urgent'] as const;

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    let sql = `
      SELECT
        d.id,
        d.practitioner_id,
        d.client_id,
        d.team_id,
        d.title,
        d.context,
        d.stakes,
        d.time_pressure,
        d.emotional_state,
        d.council_result,
        d.consultant_notes,
        d.questions_for_leader,
        d.status,
        d.consulted_at,
        d.created_at,
        d.updated_at,
        c.name as client_name
      FROM studio_decisions d
      LEFT JOIN practitioner_clients c ON c.id = d.client_id
      WHERE d.practitioner_id = $1
    `;
    const params: (string | number)[] = [practitionerId];

    if (clientId) {
      sql += ` AND d.client_id = $${params.length + 1}`;
      params.push(clientId);
    }

    if (status && (VALID_STATUSES as readonly string[]).includes(status)) {
      sql += ` AND d.status = $${params.length + 1}`;
      params.push(status);
    } else {
      // Default: exclude archived
      sql += ` AND d.status != 'archived'`;
    }

    sql += ` ORDER BY d.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(sql, params);

    const decisions = result.rows.map(row => ({
      id: row.id,
      practitionerId: row.practitioner_id,
      clientId: row.client_id,
      clientName: row.client_name,
      teamId: row.team_id,
      title: row.title,
      context: row.context,
      stakes: row.stakes,
      timePressure: row.time_pressure,
      emotionalState: row.emotional_state,
      councilResult: row.council_result,
      consultantNotes: row.consultant_notes,
      questionsForLeader: row.questions_for_leader || [],
      status: row.status,
      consultedAt: row.consulted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ decisions });
  } catch (error) {
    console.error('[Studio Decisions] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch decisions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const body = await request.json();

    const {
      title,
      context,
      clientId,
      teamId,
      stakes,
      timePressure = 'none',
      emotionalState,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!context?.trim()) {
      return NextResponse.json({ error: 'Context is required' }, { status: 400 });
    }
    if (!(VALID_TIME_PRESSURES as readonly string[]).includes(timePressure)) {
      return NextResponse.json({ error: 'Invalid time pressure value' }, { status: 400 });
    }

    const id = randomUUID();
    const result = await db.query(
      `INSERT INTO studio_decisions
        (id, practitioner_id, client_id, team_id, title, context, stakes, time_pressure, emotional_state)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id,
        practitionerId,
        clientId || null,
        teamId || null,
        title.trim(),
        context.trim(),
        stakes?.trim() || null,
        timePressure,
        emotionalState?.trim() || null,
      ]
    );

    const row = result.rows[0];
    return NextResponse.json({
      decision: {
        id: row.id,
        practitionerId: row.practitioner_id,
        clientId: row.client_id,
        teamId: row.team_id,
        title: row.title,
        context: row.context,
        stakes: row.stakes,
        timePressure: row.time_pressure,
        emotionalState: row.emotional_state,
        councilResult: row.council_result,
        consultantNotes: row.consultant_notes,
        questionsForLeader: row.questions_for_leader || [],
        status: row.status,
        consultedAt: row.consulted_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Decisions] POST error:', error);
    return NextResponse.json({ error: 'Failed to create decision' }, { status: 500 });
  }
}
