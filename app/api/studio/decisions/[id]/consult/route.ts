export const dynamic = 'force-dynamic';

/**
 * DECISION COUNCIL CONSULTATION API
 *
 * POST - Invoke AIN consultation for a decision.
 * Stores the result in the decision record and preserves iteration history.
 *
 * When a decision already has a council result, the prior result is
 * snapshotted into decision_iterations before the new consultation runs.
 * The council receives the full arc: prior tensions, recommendation,
 * insights, and the practitioner's session notes.
 *
 * This is the core integration point between
 * Studio's leadership layer and the AIN engine.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { consultDecisionCouncil } from '@/lib/studio/leadership/decisionCouncil';
import type { DecisionContext, IterationContext } from '@/lib/studio/leadership/types';

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

    // Accept optional session notes from request body
    let sessionNotes: string | undefined;
    let updatedEmotionalState: string | undefined;
    try {
      const body = await request.json();
      sessionNotes = body.sessionNotes?.trim() || undefined;
      updatedEmotionalState = body.emotionalState?.trim() || undefined;
    } catch {
      // No body or invalid JSON — that's fine for first consultation
    }

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

    const currentIterationCount: number = row.iteration_count || 0;
    const priorCouncilResult = row.council_result;

    // Mark as consulting
    await db.query(
      `UPDATE studio_decisions SET status = 'consulting', updated_at = NOW() WHERE id = $1`,
      [id]
    );

    // If there's an existing council result, snapshot it into iterations
    if (priorCouncilResult && currentIterationCount > 0) {
      await db.query(
        `INSERT INTO decision_iterations
          (decision_id, iteration_number, session_notes, emotional_state, council_result, consultant_notes, questions, consulted_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, NOW()))
        ON CONFLICT (decision_id, iteration_number) DO NOTHING`,
        [
          id,
          currentIterationCount,
          null,  // session_notes for the prior round (was not captured at that time)
          row.emotional_state,
          JSON.stringify(priorCouncilResult),
          row.consultant_notes,
          row.questions_for_leader || [],
          row.consulted_at,
        ]
      );
    }

    const newIterationNumber = currentIterationCount + 1;

    // Build iteration context if this is a subsequent round
    let iterationContext: IterationContext | undefined;
    if (priorCouncilResult && currentIterationCount > 0) {
      iterationContext = {
        iterationNumber: newIterationNumber,
        priorTensions: priorCouncilResult.tensions || [],
        priorRecommendation: priorCouncilResult.recommendation || '',
        priorInsights: priorCouncilResult.insights || [],
        sessionNotes,
      };
    }

    // Use updated emotional state if provided, otherwise keep existing
    const emotionalState = updatedEmotionalState || row.emotional_state;

    // Build decision context for the council
    const context: DecisionContext = {
      title: row.title,
      context: row.context,
      stakes: row.stakes || undefined,
      timePressure: row.time_pressure || undefined,
      emotionalState: emotionalState || undefined,
      clientId: row.client_id || undefined,
      clientName: row.client_name || undefined,
      leadershipProfile: row.leadership_profile || undefined,
      situationType: row.situation_type || undefined,
    };

    // Run AIN consultation (with iteration context if available)
    const councilResult = await consultDecisionCouncil(context, iterationContext);

    // Store new iteration
    await db.query(
      `INSERT INTO decision_iterations
        (decision_id, iteration_number, session_notes, emotional_state, council_result, consulted_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (decision_id, iteration_number) DO UPDATE SET
        council_result = EXCLUDED.council_result,
        session_notes = EXCLUDED.session_notes,
        emotional_state = EXCLUDED.emotional_state,
        consulted_at = EXCLUDED.consulted_at`,
      [
        id,
        newIterationNumber,
        sessionNotes || null,
        emotionalState || null,
        JSON.stringify(councilResult),
      ]
    );

    // Update parent decision with latest result
    const updateResult = await db.query(
      `UPDATE studio_decisions
       SET council_result = $1,
           status = 'active',
           iteration_count = $2,
           emotional_state = COALESCE($3, emotional_state),
           consulted_at = NOW(),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [JSON.stringify(councilResult), newIterationNumber, updatedEmotionalState || null, id]
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
        iterationCount: updated.iteration_count,
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
      `UPDATE studio_decisions
       SET status = CASE WHEN iteration_count > 0 THEN 'active' ELSE 'draft' END,
           updated_at = NOW()
       WHERE id = $1`,
      [id]
    ).catch(() => {});

    return NextResponse.json(
      { error: 'Council consultation failed' },
      { status: 500 }
    );
  }
}
