export const dynamic = 'force-dynamic';

/**
 * DECISION COUNCIL CONSULTATION API
 *
 * POST - Invoke AIN consultation for a decision.
 * Stores the result in the decision record.
 *
 * This is the core integration point between
 * Studio's leadership layer and the AIN engine.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { consultDecisionCouncil } from '@/lib/studio/leadership/decisionCouncil';
import type { DecisionContext } from '@/lib/studio/leadership/types';

export async function POST(
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

    // Fetch the decision
    const decisionResult = await db.query(
      `SELECT
        d.*,
        c.name as client_name,
        c.leadership_profile
      FROM studio_decisions d
      LEFT JOIN practitioner_clients c ON c.id = d.client_id
      WHERE d.id = $1 AND d.practitioner_id = $2`,
      [id, practitionerId]
    );

    if (decisionResult.rows.length === 0) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }

    const row = decisionResult.rows[0];

    if (row.status === 'archived') {
      return NextResponse.json({ error: 'Cannot consult on archived decision' }, { status: 400 });
    }

    // Mark as consulting
    await db.query(
      `UPDATE studio_decisions SET status = 'consulting', updated_at = NOW() WHERE id = $1`,
      [id]
    );

    // Build decision context for the council
    const context: DecisionContext = {
      title: row.title,
      context: row.context,
      stakes: row.stakes || undefined,
      timePressure: row.time_pressure || undefined,
      emotionalState: row.emotional_state || undefined,
      clientId: row.client_id || undefined,
      clientName: row.client_name || undefined,
      leadershipProfile: row.leadership_profile || undefined,
      situationType: row.situation_type || undefined,
    };

    // Run AIN consultation
    const councilResult = await consultDecisionCouncil(context);

    // Store result
    const updateResult = await db.query(
      `UPDATE studio_decisions
       SET council_result = $1,
           status = 'complete',
           consulted_at = NOW(),
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(councilResult), id]
    );

    const updated = updateResult.rows[0];

    return NextResponse.json({
      decision: {
        id: updated.id,
        practitionerId: updated.practitioner_id,
        clientId: updated.client_id,
        clientName: row.client_name,
        teamId: updated.team_id,
        title: updated.title,
        context: updated.context,
        stakes: updated.stakes,
        timePressure: updated.time_pressure,
        emotionalState: updated.emotional_state,
        councilResult: updated.council_result,
        consultantNotes: updated.consultant_notes,
        questionsForLeader: updated.questions_for_leader || [],
        situationType: updated.situation_type,
        status: updated.status,
        consultedAt: updated.consulted_at,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
    });
  } catch (error) {
    console.error('[Decision Council] Consultation error:', error);

    // Revert status on failure
    const { id } = await params;
    await db.query(
      `UPDATE studio_decisions SET status = 'draft', updated_at = NOW() WHERE id = $1`,
      [id]
    ).catch(() => {});

    return NextResponse.json(
      { error: 'Council consultation failed' },
      { status: 500 }
    );
  }
}
