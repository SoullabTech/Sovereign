export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { decisionOwnerWhere, decisionScopeMatchesRequest, resolveDecisionActor, type DecisionActor } from '@/lib/studio/decisions/access';
import { consultDecisionCouncil } from '@/lib/studio/leadership/decisionCouncil';
import type { DecisionContext, IterationContext } from '@/lib/studio/leadership/types';
import type { DecisionInputBundle } from '@/lib/studio/practitioner/types';
import { getProtocol } from '@/lib/studio/practitioner/protocols';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let actor: DecisionActor | null = null;
  try {
    actor = await resolveDecisionActor(request);
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let sessionNotes: string | undefined;
    let updatedEmotionalState: string | undefined;
    let protocolId: string | undefined;
    try {
      const body = await request.json();
      sessionNotes = body.sessionNotes?.trim() || undefined;
      updatedEmotionalState = body.emotionalState?.trim() || undefined;
      protocolId = body.protocolId || undefined;
    } catch {
      // Body is optional.
    }

    const decisionResult = await db.query(
      `SELECT d.*, c.name as client_name, c.leadership_profile
         FROM studio_decisions d
         LEFT JOIN practitioner_clients c ON c.id = d.client_id
        WHERE d.id = $1 AND ${decisionOwnerWhere('d', '$2', '$3')}`,
      [id, actor.memberId, actor.practitionerId],
    );
    if (!decisionResult.rows.length) return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    const row = decisionResult.rows[0];
    if (!decisionScopeMatchesRequest(request, row.decision_scope)) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }
    const personal = row.decision_scope === 'personal';

    if (row.status === 'archived') {
      return NextResponse.json({ error: 'Cannot consult on archived decision' }, { status: 400 });
    }
    if (personal && protocolId) {
      return NextResponse.json(
        { error: 'Practice protocols are not applied to personal Decisions.' },
        { status: 400 },
      );
    }

    let councilBias: string | undefined;
    if (!personal && protocolId) {
      councilBias = getProtocol(protocolId)?.councilBias;
    }

    const currentIterationCount: number = row.iteration_count || 0;
    const priorCouncilResult = row.council_result;

    await db.query(
      `UPDATE studio_decisions SET status = 'consulting', updated_at = NOW()
        WHERE id = $1 AND ${decisionOwnerWhere('studio_decisions', '$2', '$3')}`,
      [id, actor.memberId, actor.practitionerId],
    );

    if (priorCouncilResult && currentIterationCount > 0) {
      await db.query(
        `INSERT INTO decision_iterations
          (decision_id, iteration_number, session_notes, emotional_state, council_result, consultant_notes, questions, consulted_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8,NOW()))
         ON CONFLICT (decision_id, iteration_number) DO NOTHING`,
        [
          id, currentIterationCount, null, row.emotional_state,
          JSON.stringify(priorCouncilResult), row.consultant_notes,
          row.questions_for_leader || [], row.consulted_at,
        ],
      );
    }

    const newIterationNumber = currentIterationCount + 1;
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

    const emotionalState = updatedEmotionalState || row.emotional_state;
    const context: DecisionContext = {
      title: row.title,
      context: row.context,
      stakes: row.stakes || undefined,
      timePressure: row.time_pressure || undefined,
      emotionalState: emotionalState || undefined,
      clientId: personal ? undefined : row.client_id || undefined,
      clientName: personal ? undefined : row.client_name || undefined,
      leadershipProfile: personal ? undefined : row.leadership_profile || undefined,
      situationType: row.situation_type || undefined,
    };

    let inputBundle: DecisionInputBundle | undefined;
    if (!personal) {
      try {
        const [inquiryResult, signalsResult, observationsResult] = await Promise.all([
          db.query(
            `SELECT * FROM studio_inquiry_responses
              WHERE decision_id = $1 ORDER BY completed_at DESC LIMIT 1`,
            [id],
          ),
          db.query(
            `SELECT * FROM studio_field_signals
              WHERE decision_id = $1 ORDER BY signal_timestamp DESC`,
            [id],
          ),
          db.query(
            `SELECT * FROM studio_practitioner_observations
              WHERE decision_id = $1 ORDER BY created_at DESC`,
            [id],
          ),
        ]);

        inputBundle = {
          clientInquiry: inquiryResult.rows[0] ? {
            id: inquiryResult.rows[0].id,
            decisionId: inquiryResult.rows[0].decision_id,
            clientId: inquiryResult.rows[0].client_id,
            promptSetId: inquiryResult.rows[0].prompt_set_id,
            promptSetTitle: inquiryResult.rows[0].prompt_set_title,
            responses: inquiryResult.rows[0].responses || [],
            summaryText: inquiryResult.rows[0].summary_text,
            tags: inquiryResult.rows[0].tags || [],
            completedAt: inquiryResult.rows[0].completed_at,
            createdAt: inquiryResult.rows[0].created_at,
          } : null,
          fieldSignals: signalsResult.rows.map(r => ({
            id: r.id,
            decisionId: r.decision_id,
            clientId: r.client_id,
            practitionerId: r.practitioner_id,
            source: r.source,
            type: r.signal_type,
            title: r.title,
            content: r.content,
            intensity: r.intensity != null ? Number(r.intensity) : null,
            tags: r.tags || [],
            timestamp: r.signal_timestamp,
            createdAt: r.created_at,
          })),
          practitionerObservations: observationsResult.rows.map(r => ({
            id: r.id,
            decisionId: r.decision_id,
            practitionerId: r.practitioner_id,
            clientId: r.client_id,
            observationType: r.observation_type,
            content: r.content,
            tags: r.tags || [],
            createdAt: r.created_at,
          })),
          existingNotes: row.consultant_notes || null,
        };
      } catch (bundleError) {
        console.warn('[Decision Council] Practice evidence bundle unavailable; consulting without it:', bundleError);
      }
    }

    const councilResult = await consultDecisionCouncil(context, iterationContext, inputBundle, councilBias);

    await db.query(
      `INSERT INTO decision_iterations
        (decision_id, iteration_number, session_notes, emotional_state, council_result, consulted_at)
       VALUES ($1,$2,$3,$4,$5,NOW())
       ON CONFLICT (decision_id, iteration_number) DO UPDATE SET
         council_result = EXCLUDED.council_result,
         session_notes = EXCLUDED.session_notes,
         emotional_state = EXCLUDED.emotional_state,
         consulted_at = EXCLUDED.consulted_at`,
      [id, newIterationNumber, sessionNotes || null, emotionalState || null, JSON.stringify(councilResult)],
    );

    const updateResult = await db.query(
      `UPDATE studio_decisions
          SET council_result = $1, status = 'active', iteration_count = $2,
              emotional_state = COALESCE($3, emotional_state),
              consulted_at = NOW(), updated_at = NOW()
        WHERE id = $4 AND ${decisionOwnerWhere('studio_decisions', '$5', '$6')}
        RETURNING *`,
      [
        JSON.stringify(councilResult), newIterationNumber,
        updatedEmotionalState || null, id, actor.memberId, actor.practitionerId,
      ],
    );
    if (!updateResult.rows.length) {
      return NextResponse.json({ error: 'Decision ownership changed before consultation completed.' }, { status: 409 });
    }

    const updated = updateResult.rows[0];
    return NextResponse.json({
      decision: {
        id: updated.id,
        scope: updated.decision_scope,
        practitionerId: updated.practitioner_id,
        personalMemberId: updated.personal_member_id,
        clientId: updated.client_id,
        clientName: personal ? null : row.client_name,
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
    if (actor) {
      await db.query(
        `UPDATE studio_decisions
            SET status = CASE WHEN iteration_count > 0 THEN 'active' ELSE 'draft' END,
                updated_at = NOW()
          WHERE id = $1 AND ${decisionOwnerWhere('studio_decisions', '$2', '$3')}`,
        [id, actor.memberId, actor.practitionerId],
      ).catch(() => {});
    }
    return NextResponse.json({ error: 'Council consultation failed' }, { status: 500 });
  }
}
