export const dynamic = 'force-dynamic';

/**
 * CHANGE COUNCIL CONSULTATION API
 *
 * POST - Invoke AIN consultation for a change.
 * Stores the result in the change record and preserves iteration history.
 *
 * When a change already has a council result, the prior result is
 * snapshotted into change_iterations before the new consultation runs.
 * The council receives the full arc: prior tensions, recommendation,
 * insights, hexagram context, and the practitioner's session notes.
 *
 * This is the core integration point between
 * Studio's change navigation layer and the AIN engine.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { consultChangeCouncil } from '@/lib/studio/changes/changeCouncil';
import type { ChangeContext, ChangeIterationContext } from '@/lib/studio/changes/types';
import type { DecisionInputBundle } from '@/lib/studio/practitioner/types';
import { admitFieldSignalsForConsult } from '@/lib/studio/containment/inferenceContainment';
import { getProtocol } from '@/lib/studio/practitioner/protocols';

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

    // Accept optional session notes and protocol id from request body
    let sessionNotes: string | undefined;
    let updatedEmotionalState: string | undefined;
    let councilBias: string | undefined;
    try {
      const body = await request.json();
      sessionNotes = body.sessionNotes?.trim() || undefined;
      updatedEmotionalState = body.emotionalState?.trim() || undefined;
      if (body.protocolId) {
        const protocol = getProtocol(body.protocolId);
        councilBias = protocol?.councilBias;
      }
    } catch {
      // No body or invalid JSON — that's fine for first consultation
    }

    // Fetch the change
    const changeResult = await db.query(
      `SELECT
        c.*,
        cl.name as client_name
      FROM studio_changes c
      LEFT JOIN practitioner_clients cl ON cl.id = c.client_id
      WHERE c.id = $1 AND c.practitioner_id = $2`,
      [id, practitionerId]
    );

    if (changeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Change not found' }, { status: 404 });
    }

    const row = changeResult.rows[0];

    if (row.status === 'archived') {
      return NextResponse.json({ error: 'Cannot consult on archived change' }, { status: 400 });
    }

    const currentIterationCount: number = row.iteration_count || 0;
    const priorCouncilResult = row.council_result;

    // Mark as consulting
    await db.query(
      `UPDATE studio_changes SET status = 'consulting', updated_at = NOW() WHERE id = $1`,
      [id]
    );

    // If there's an existing council result, snapshot it into iterations
    if (priorCouncilResult && currentIterationCount > 0) {
      await db.query(
        `INSERT INTO change_iterations
          (change_id, iteration_number, session_notes, emotional_state, hexagram_number,
           relating_hexagram_number, changing_lines, council_result, notes, questions, consulted_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, NOW()))
        ON CONFLICT (change_id, iteration_number) DO NOTHING`,
        [
          id,
          currentIterationCount,
          null,  // session_notes for the prior round (was not captured at that time)
          row.emotional_state,
          row.hexagram_number,
          row.relating_hexagram_number,
          row.changing_lines || [],
          JSON.stringify(priorCouncilResult),
          row.notes,
          row.questions || [],
          row.consulted_at,
        ]
      );
    }

    const newIterationNumber = currentIterationCount + 1;

    // Build iteration context if this is a subsequent round
    let iterationContext: ChangeIterationContext | undefined;
    if (priorCouncilResult && currentIterationCount > 0) {
      iterationContext = {
        iterationNumber: newIterationNumber,
        priorTensions: priorCouncilResult.tensions || [],
        priorRecommendation: priorCouncilResult.recommendation || '',
        priorInsights: priorCouncilResult.insights || [],
        priorHexagramNumber: row.hexagram_number || undefined,
        sessionNotes,
      };
    }

    // Use updated emotional state if provided, otherwise keep existing
    const emotionalState = updatedEmotionalState || row.emotional_state;

    // Build change context for the council
    const context: ChangeContext = {
      title: row.title,
      description: row.description,
      changeType: row.change_type,
      urgency: row.urgency || undefined,
      emotionalState: emotionalState || undefined,
      hexagramNumber: row.hexagram_number || undefined,
      relatingHexagramNumber: row.relating_hexagram_number || undefined,
      changingLines: row.changing_lines || undefined,
      clientId: row.client_id || undefined,
      clientName: row.client_name || undefined,
    };

    // Load evidence bundle — client inquiry, field signals, practitioner observations
    let inputBundle: DecisionInputBundle | undefined;
    try {
      const [inquiryResult, signalsResult, observationsResult] = await Promise.all([
        db.query(
          `SELECT * FROM studio_inquiry_responses WHERE change_id = $1 ORDER BY completed_at DESC LIMIT 1`,
          [id]
        ),
        db.query(
          `SELECT * FROM studio_field_signals WHERE change_id = $1 ORDER BY signal_timestamp DESC`,
          [id]
        ),
        db.query(
          `SELECT * FROM studio_practitioner_observations WHERE change_id = $1 ORDER BY created_at DESC`,
          [id]
        ),
      ]);

      inputBundle = {
        clientInquiry: inquiryResult.rows[0]
          ? {
              id: inquiryResult.rows[0].id,
              changeId: inquiryResult.rows[0].change_id,
              clientId: inquiryResult.rows[0].client_id,
              promptSetId: inquiryResult.rows[0].prompt_set_id,
              promptSetTitle: inquiryResult.rows[0].prompt_set_title,
              responses: inquiryResult.rows[0].responses || [],
              summaryText: inquiryResult.rows[0].summary_text,
              tags: inquiryResult.rows[0].tags || [],
              completedAt: inquiryResult.rows[0].completed_at,
              createdAt: inquiryResult.rows[0].created_at,
            }
          : null,
        // ── CONTAINED (Practitioner Inference Containment, 2026-08-06) ──────
        // studio_field_signals mixes source ∈ ('client','practitioner','maia')
        // with a numeric intensity and no consent gate. 'client' and 'maia' are
        // categorically refused; 'practitioner' is refused too, because `source`
        // is a category and not a provenance — no column establishes that such a
        // row was authored BY the practitioner rather than attributed to them.
        // ⛔ Ambiguous existing rows must not be reinterpreted as safe.
        // Practitioner observations (below) are unaffected: those are authored.
        fieldSignals: admitFieldSignalsForConsult(
          signalsResult.rows.map((r) => ({
            id: r.id,
            changeId: r.change_id,
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
          }))
        ),
        practitionerObservations: observationsResult.rows.map((r) => ({
          id: r.id,
          changeId: r.change_id,
          practitionerId: r.practitioner_id,
          clientId: r.client_id,
          observationType: r.observation_type,
          content: r.content,
          tags: r.tags || [],
          createdAt: r.created_at,
        })),
        existingNotes: row.notes || null,
      };
    } catch (bundleError) {
      console.warn('[Change Council] Evidence bundle load failed, proceeding without:', bundleError);
    }

    // Run AIN consultation (with iteration context, evidence bundle, and optional protocol bias)
    const councilResult = await consultChangeCouncil(context, iterationContext, inputBundle, councilBias);

    // Store new iteration
    await db.query(
      `INSERT INTO change_iterations
        (change_id, iteration_number, session_notes, emotional_state, hexagram_number,
         relating_hexagram_number, changing_lines, council_result, consulted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (change_id, iteration_number) DO UPDATE SET
        council_result = EXCLUDED.council_result,
        session_notes = EXCLUDED.session_notes,
        emotional_state = EXCLUDED.emotional_state,
        hexagram_number = EXCLUDED.hexagram_number,
        relating_hexagram_number = EXCLUDED.relating_hexagram_number,
        changing_lines = EXCLUDED.changing_lines,
        consulted_at = EXCLUDED.consulted_at`,
      [
        id,
        newIterationNumber,
        sessionNotes || null,
        emotionalState || null,
        row.hexagram_number,
        row.relating_hexagram_number,
        row.changing_lines || [],
        JSON.stringify(councilResult),
      ]
    );

    // Update parent change with latest result
    const updateResult = await db.query(
      `UPDATE studio_changes
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
      change: {
        id: updated.id,
        practitionerId: updated.practitioner_id,
        memberId: updated.member_id,
        clientId: updated.client_id,
        clientName: row.client_name,
        teamId: updated.team_id,
        title: updated.title,
        description: updated.description,
        changeType: updated.change_type,
        emotionalState: updated.emotional_state,
        urgency: updated.urgency,
        hexagramNumber: updated.hexagram_number,
        hexagramName: updated.hexagram_name,
        relatingHexagramNumber: updated.relating_hexagram_number,
        changingLines: updated.changing_lines || [],
        castingMethod: updated.casting_method,
        castAt: updated.cast_at,
        councilResult: updated.council_result,
        hexagramInterpretation: updated.hexagram_interpretation,
        notes: updated.notes,
        questions: updated.questions || [],
        mentorReflection: updated.mentor_reflection,
        followUpIntention: updated.follow_up_intention,
        status: updated.status,
        iterationCount: updated.iteration_count,
        consultedAt: updated.consulted_at,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
    });
  } catch (error) {
    console.error('[Change Council] Consultation error:', error);

    // Revert status on failure
    const { id } = await params;
    await db.query(
      `UPDATE studio_changes
       SET status = CASE WHEN iteration_count > 0 THEN 'active' ELSE 'naming' END,
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
