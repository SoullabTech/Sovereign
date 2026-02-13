export const dynamic = 'force-dynamic';

/**
 * MEMBER CHANGE COUNCIL CONSULTATION API
 *
 * POST - Invoke AIN consultation for a member's change.
 * Optional — members can track changes without ever consulting MAIA.
 * When invoked, stores iteration history and returns council result.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { consultChangeCouncil } from '@/lib/studio/changes/changeCouncil';
import type { ChangeContext, ChangeIterationContext } from '@/lib/studio/changes/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    let sessionNotes: string | undefined;
    let updatedEmotionalState: string | undefined;
    try {
      const body = await request.json();
      sessionNotes = body.sessionNotes?.trim() || undefined;
      updatedEmotionalState = body.emotionalState?.trim() || undefined;
    } catch {
      // No body is fine for first consultation
    }

    // Fetch the change
    const changeResult = await db.query(
      `SELECT * FROM studio_changes WHERE id = $1 AND member_id = $2`,
      [id, memberId]
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

    // Snapshot prior iteration if exists
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
          null,
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

    // Build iteration context for subsequent rounds
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

    const emotionalState = updatedEmotionalState || row.emotional_state;

    const context: ChangeContext = {
      title: row.title,
      description: row.description,
      changeType: row.change_type,
      urgency: row.urgency || undefined,
      emotionalState: emotionalState || undefined,
      hexagramNumber: row.hexagram_number || undefined,
      relatingHexagramNumber: row.relating_hexagram_number || undefined,
      changingLines: row.changing_lines || undefined,
    };

    const councilResult = await consultChangeCouncil(context, iterationContext);

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

    // Update parent change
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
        memberId: updated.member_id,
        title: updated.title,
        description: updated.description,
        changeType: updated.change_type,
        emotionalState: updated.emotional_state,
        urgency: updated.urgency,
        hexagramNumber: updated.hexagram_number,
        hexagramName: updated.hexagram_name,
        relatingHexagramNumber: updated.relating_hexagram_number,
        changingLines: updated.changing_lines || [],
        councilResult: updated.council_result,
        hexagramInterpretation: updated.hexagram_interpretation,
        notes: updated.notes,
        questions: updated.questions || [],
        status: updated.status,
        iterationCount: updated.iteration_count,
        consultedAt: updated.consulted_at,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
    });
  } catch (error) {
    console.error('[Member Change Council] Consultation error:', error);

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
