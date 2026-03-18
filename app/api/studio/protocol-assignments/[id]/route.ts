export const dynamic = 'force-dynamic';

/**
 * Protocol Assignment — Individual Record Operations
 *
 * PATCH — Update an existing assignment's stage position, status, or notes.
 *         Stage advancement is always practitioner-initiated (manual).
 *         The system tracks position but does not auto-advance.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { practitionerId } = identity;
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const {
    activeStageNumber,
    status,
    notes,
    targetOccupancy,
  } = body as {
    activeStageNumber?: number;
    status?:            string;
    notes?:             string | null;
    targetOccupancy?:   number | null;
  };

  // Validate status if provided
  const validStatuses = ['active', 'paused', 'complete', 'abandoned'];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    // Build update set dynamically — only update provided fields
    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (activeStageNumber != null) {
      setClauses.push(`active_stage_number = $${paramIdx++}`);
      values.push(activeStageNumber);
    }
    if (status != null) {
      setClauses.push(`status = $${paramIdx++}`);
      values.push(status);
    }
    if (notes !== undefined) {
      setClauses.push(`notes = $${paramIdx++}`);
      values.push(notes);
    }
    if (targetOccupancy !== undefined) {
      setClauses.push(`target_occupancy = $${paramIdx++}`);
      values.push(targetOccupancy);
    }

    if (setClauses.length === 1) {
      // Only updated_at — nothing to actually change
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);           // for WHERE id = $n
    values.push(practitionerId); // for WHERE practitioner_id = $n+1

    const result = await db.query(
      `UPDATE studio_protocol_assignments
       SET ${setClauses.join(', ')}
       WHERE id = $${paramIdx} AND practitioner_id = $${paramIdx + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      assignment: {
        id:                row.id,
        practitionerId:    row.practitioner_id,
        clientId:          row.client_id,
        decisionId:        row.decision_id,
        changeId:          row.change_id,
        protocolId:        row.protocol_id,
        activeStageNumber: row.active_stage_number,
        startedAt:         row.started_at,
        targetOccupancy:   row.target_occupancy,
        status:            row.status,
        notes:             row.notes,
        createdAt:         row.created_at,
        updatedAt:         row.updated_at,
      },
    });

  } catch (error) {
    console.error('[Protocol Assignments] PATCH error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
