export const dynamic = 'force-dynamic';

/**
 * STUDIO DECISION DETAIL API
 *
 * GET  - Fetch single decision with full council result
 * PUT  - Update decision (notes, questions, status)
 * DELETE - Archive decision
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { id } = await params;

    const result = await db.query(
      `SELECT
        d.*,
        c.name as client_name,
        c.leadership_profile
      FROM studio_decisions d
      LEFT JOIN practitioner_clients c ON c.id = d.client_id
      WHERE d.id = $1 AND d.practitioner_id = $2`,
      [id, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      decision: {
        id: row.id,
        practitionerId: row.practitioner_id,
        clientId: row.client_id,
        clientName: row.client_name,
        leadershipProfile: row.leadership_profile,
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
    console.error('[Studio Decision Detail] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch decision' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { id } = await params;
    const body = await request.json();

    const updateFields: string[] = [];
    const queryParams: (string | string[] | null)[] = [id, practitionerId];

    if (body.title !== undefined) {
      updateFields.push(`title = $${queryParams.length + 1}`);
      queryParams.push(body.title.trim());
    }

    if (body.context !== undefined) {
      updateFields.push(`context = $${queryParams.length + 1}`);
      queryParams.push(body.context.trim());
    }

    if (body.stakes !== undefined) {
      updateFields.push(`stakes = $${queryParams.length + 1}`);
      queryParams.push(body.stakes?.trim() || null);
    }

    if (body.consultantNotes !== undefined) {
      updateFields.push(`consultant_notes = $${queryParams.length + 1}`);
      queryParams.push(body.consultantNotes?.trim() || null);
    }

    if (body.questionsForLeader !== undefined) {
      updateFields.push(`questions_for_leader = $${queryParams.length + 1}`);
      queryParams.push(body.questionsForLeader);
    }

    if (body.status !== undefined) {
      const valid = ['draft', 'consulting', 'complete', 'archived'];
      if (!valid.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateFields.push(`status = $${queryParams.length + 1}`);
      queryParams.push(body.status);
    }

    if (body.emotionalState !== undefined) {
      updateFields.push(`emotional_state = $${queryParams.length + 1}`);
      queryParams.push(body.emotionalState?.trim() || null);
    }

    if (body.timePressure !== undefined) {
      updateFields.push(`time_pressure = $${queryParams.length + 1}`);
      queryParams.push(body.timePressure);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updateFields.push('updated_at = NOW()');

    const result = await db.query(
      `UPDATE studio_decisions
       SET ${updateFields.join(', ')}
       WHERE id = $1 AND practitioner_id = $2
       RETURNING *`,
      queryParams
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }

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
    console.error('[Studio Decision Detail] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update decision' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { id } = await params;

    // Soft delete by archiving
    const result = await db.query(
      `UPDATE studio_decisions
       SET status = 'archived', updated_at = NOW()
       WHERE id = $1 AND practitioner_id = $2
       RETURNING id`,
      [id, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Decision Detail] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to archive decision' }, { status: 500 });
  }
}
