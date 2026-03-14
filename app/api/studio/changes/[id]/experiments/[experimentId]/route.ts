export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; experimentId: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { practitionerId } = identity;
    const { id: changeId, experimentId } = await params;

    const body = await request.json();
    const allowedFields: Record<string, string> = {
      title: 'title',
      hypothesis: 'hypothesis',
      interventionType: 'intervention_type',
      instructions: 'instructions',
      observationWindow: 'observation_window',
      successSignals: 'success_signals',
      riskNotes: 'risk_notes',
      followUpIntention: 'follow_up_intention',
      status: 'status',
    };

    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let idx = 1;

    for (const [jsKey, dbCol] of Object.entries(allowedFields)) {
      if (jsKey in body) {
        setClauses.push(`${dbCol} = $${idx++}`);
        values.push(body[jsKey]);
      }
    }

    if (setClauses.length === 1) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    values.push(experimentId, practitionerId, changeId);
    const result = await db.query(
      `UPDATE studio_change_experiments SET ${setClauses.join(', ')}
       WHERE id = $${idx++} AND practitioner_id = $${idx++} AND change_id = $${idx++}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
    }

    return NextResponse.json({ experiment: result.rows[0] });
  } catch (error) {
    console.error('[Change Experiments] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update experiment' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; experimentId: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { practitionerId } = identity;
    const { id: changeId, experimentId } = await params;

    const result = await db.query(
      `DELETE FROM studio_change_experiments WHERE id = $1 AND practitioner_id = $2 AND change_id = $3 RETURNING id`,
      [experimentId, practitionerId, changeId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('[Change Experiments] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete experiment' }, { status: 500 });
  }
}
