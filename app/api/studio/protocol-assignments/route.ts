export const dynamic = 'force-dynamic';

/**
 * Protocol Assignments API
 *
 * GET  — Load active assignment for a scope (changeId, decisionId, or clientId).
 *         Scope priority: change > decision > client.
 *         Returns null if no assignment exists for the given scope.
 *
 * POST — Save (upsert) a protocol assignment for a scope.
 *         Replaces an existing assignment for the same scope — history is not
 *         preserved here; the occupancy ratings and experiments are the record.
 *         If protocolId is null/empty, the assignment is deleted (clear protocol).
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { getProtocol } from '@/lib/studio/practitioner/protocols';

// ─── Row → JSON ──────────────────────────────────────────────────

function rowToAssignment(row: Record<string, unknown>) {
  return {
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
  };
}

// ─── GET ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { practitionerId } = identity;
  const { searchParams } = new URL(request.url);
  const changeId   = searchParams.get('changeId')   || null;
  const decisionId = searchParams.get('decisionId') || null;
  const clientId   = searchParams.get('clientId')   || null;

  try {
    let result;

    if (changeId) {
      // Most specific: change-level scope
      result = await db.query(
        `SELECT * FROM studio_protocol_assignments
         WHERE practitioner_id = $1 AND change_id = $2
         LIMIT 1`,
        [practitionerId, changeId]
      );
    } else if (decisionId) {
      // Decision-level scope (not change-attached)
      result = await db.query(
        `SELECT * FROM studio_protocol_assignments
         WHERE practitioner_id = $1 AND decision_id = $2 AND change_id IS NULL
         LIMIT 1`,
        [practitionerId, decisionId]
      );
    } else if (clientId) {
      // Client-level scope (broadest, not decision or change attached)
      result = await db.query(
        `SELECT * FROM studio_protocol_assignments
         WHERE practitioner_id = $1 AND client_id = $2
           AND decision_id IS NULL AND change_id IS NULL
         LIMIT 1`,
        [practitionerId, clientId]
      );
    } else {
      return NextResponse.json({ assignment: null });
    }

    const assignment = result.rows[0] ? rowToAssignment(result.rows[0]) : null;
    return NextResponse.json({ assignment });

  } catch (error) {
    console.error('[Protocol Assignments] GET error:', error);
    return NextResponse.json({ error: 'Load failed' }, { status: 500 });
  }
}

// ─── POST ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { practitionerId } = identity;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const {
    protocolId,
    clientId,
    decisionId,
    changeId,
    activeStageNumber,
    targetOccupancy,
    notes,
  } = body as {
    protocolId:        string | null;
    clientId?:         string | null;
    decisionId?:       string | null;
    changeId?:         string | null;
    activeStageNumber?: number;
    targetOccupancy?:  number | null;
    notes?:            string | null;
  };

  // Require at least one scope identifier
  if (!clientId && !decisionId && !changeId) {
    return NextResponse.json(
      { error: 'At least one scope (clientId, decisionId, changeId) is required' },
      { status: 400 }
    );
  }

  // Clearing protocol — delete the assignment for this scope
  if (!protocolId) {
    try {
      if (changeId) {
        await db.query(
          `DELETE FROM studio_protocol_assignments WHERE practitioner_id = $1 AND change_id = $2`,
          [practitionerId, changeId]
        );
      } else if (decisionId) {
        await db.query(
          `DELETE FROM studio_protocol_assignments WHERE practitioner_id = $1 AND decision_id = $2 AND change_id IS NULL`,
          [practitionerId, decisionId]
        );
      } else if (clientId) {
        await db.query(
          `DELETE FROM studio_protocol_assignments WHERE practitioner_id = $1 AND client_id = $2 AND decision_id IS NULL AND change_id IS NULL`,
          [practitionerId, clientId]
        );
      }
      return NextResponse.json({ assignment: null });
    } catch (error) {
      console.error('[Protocol Assignments] DELETE error:', error);
      return NextResponse.json({ error: 'Clear failed' }, { status: 500 });
    }
  }

  // Look up protocol to get default target occupancy
  const protocol = getProtocol(protocolId);
  if (!protocol) {
    return NextResponse.json({ error: `Unknown protocol: ${protocolId}` }, { status: 400 });
  }

  const resolvedTargetOccupancy =
    targetOccupancy != null ? targetOccupancy : protocol.occupancyTarget;

  try {
    // Determine the scope column for the upsert
    let existing;
    if (changeId) {
      existing = await db.query(
        `SELECT id FROM studio_protocol_assignments WHERE practitioner_id = $1 AND change_id = $2`,
        [practitionerId, changeId]
      );
    } else if (decisionId) {
      existing = await db.query(
        `SELECT id FROM studio_protocol_assignments WHERE practitioner_id = $1 AND decision_id = $2 AND change_id IS NULL`,
        [practitionerId, decisionId]
      );
    } else {
      existing = await db.query(
        `SELECT id FROM studio_protocol_assignments WHERE practitioner_id = $1 AND client_id = $2 AND decision_id IS NULL AND change_id IS NULL`,
        [practitionerId, clientId]
      );
    }

    let result;

    if (existing.rows.length > 0) {
      // Update existing assignment
      result = await db.query(
        `UPDATE studio_protocol_assignments
         SET protocol_id         = $1,
             active_stage_number = COALESCE($2, active_stage_number),
             target_occupancy    = $3,
             notes               = COALESCE($4, notes),
             status              = 'active',
             updated_at          = NOW()
         WHERE id = $5
         RETURNING *`,
        [
          protocolId,
          activeStageNumber || null,
          resolvedTargetOccupancy,
          notes || null,
          existing.rows[0].id,
        ]
      );
    } else {
      // Insert new assignment
      result = await db.query(
        `INSERT INTO studio_protocol_assignments
           (practitioner_id, client_id, decision_id, change_id,
            protocol_id, active_stage_number, target_occupancy, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
         RETURNING *`,
        [
          practitionerId,
          clientId || null,
          decisionId || null,
          changeId || null,
          protocolId,
          activeStageNumber || 1,
          resolvedTargetOccupancy,
          notes || null,
        ]
      );
    }

    return NextResponse.json({ assignment: rowToAssignment(result.rows[0]) });

  } catch (error) {
    console.error('[Protocol Assignments] POST error:', error);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}
