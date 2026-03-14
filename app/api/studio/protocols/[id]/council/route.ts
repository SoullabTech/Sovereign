export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * PROTOCOL COUNCIL API — /api/studio/protocols/[id]/council
 *
 * Phase 1 STUB — council outputs exist in the DB schema but AI generation
 * is not implemented yet. This route returns stored outputs (if any) and
 * allows practitioners to annotate/save JSONB fields manually.
 *
 * Phase 2 will add: POST to trigger AI council generation, streaming support,
 * guide-level accept/discard/edit flows.
 *
 * GET — return stored council outputs or empty structure
 * PUT — update practitioner annotations on stored JSONB fields
 *
 * Ownership invariant: protocol.practitioner_id must equal currentPractitioner.id.
 * Returns 404 when protocol not found or not owned.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

async function verifyProtocolOwnership(
  protocolId: string,
  practitionerId: string
): Promise<boolean> {
  const result = await db.query(
    `SELECT id FROM studio_pattern_protocols WHERE id = $1 AND practitioner_id = $2`,
    [protocolId, practitionerId]
  );
  return result.rows.length > 0;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json(
        { error: 'Unauthorized or not a practitioner' },
        { status: 401 }
      );
    }

    const owned = await verifyProtocolOwnership(params.id, identity.practitionerId);
    if (!owned) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const weekFilter = searchParams.get('week');

    let sql = `
      SELECT
        id,
        protocol_id,
        week_number,
        generated_at,
        generated_from_observation_count,
        strategist_output,
        body_listener_output,
        pattern_seer_output,
        symbolist_output,
        working_hypothesis,
        intervention_strategy,
        confidence_level,
        created_at,
        updated_at
      FROM protocol_council_outputs
      WHERE protocol_id = $1
    `;
    const queryParams: (string | number)[] = [params.id];

    if (weekFilter) {
      const weekNum = parseInt(weekFilter, 10);
      if (!isNaN(weekNum)) {
        queryParams.push(weekNum);
        sql += ` AND week_number = $${queryParams.length}`;
      }
    }

    sql += ` ORDER BY week_number ASC NULLS LAST`;

    const result = await db.query(sql, queryParams);

    if (result.rows.length === 0) {
      return NextResponse.json({
        councilOutputs: null,
        message: 'No council outputs yet. Council generation is available in Phase 2.',
      });
    }

    const councilOutputs = result.rows.map((row) => ({
      id: row.id,
      protocolId: row.protocol_id,
      weekNumber: row.week_number,
      generatedAt: row.generated_at,
      generatedFromObservationCount: row.generated_from_observation_count,
      strategistOutput: row.strategist_output,
      bodyListenerOutput: row.body_listener_output,
      patternSeerOutput: row.pattern_seer_output,
      symbolistOutput: row.symbolist_output,
      workingHypothesis: row.working_hypothesis,
      interventionStrategy: row.intervention_strategy,
      confidenceLevel: row.confidence_level,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ councilOutputs });
  } catch (error) {
    console.error('[Protocol Council] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch council outputs' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json(
        { error: 'Unauthorized or not a practitioner' },
        { status: 401 }
      );
    }

    const owned = await verifyProtocolOwnership(params.id, identity.practitionerId);
    if (!owned) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      weekNumber,
      strategistOutput,
      bodyListenerOutput,
      patternSeerOutput,
      symbolistOutput,
      workingHypothesis,
      interventionStrategy,
      confidenceLevel,
    } = body;

    if (weekNumber === undefined || weekNumber === null) {
      return NextResponse.json({ error: 'weekNumber is required' }, { status: 400 });
    }

    const setClauses: string[] = [];
    const values: unknown[] = [params.id, weekNumber];
    let idx = 3;

    if (strategistOutput !== undefined) {
      setClauses.push(`strategist_output = $${idx++}`);
      values.push(strategistOutput ? JSON.stringify(strategistOutput) : null);
    }
    if (bodyListenerOutput !== undefined) {
      setClauses.push(`body_listener_output = $${idx++}`);
      values.push(bodyListenerOutput ? JSON.stringify(bodyListenerOutput) : null);
    }
    if (patternSeerOutput !== undefined) {
      setClauses.push(`pattern_seer_output = $${idx++}`);
      values.push(patternSeerOutput ? JSON.stringify(patternSeerOutput) : null);
    }
    if (symbolistOutput !== undefined) {
      setClauses.push(`symbolist_output = $${idx++}`);
      values.push(symbolistOutput ? JSON.stringify(symbolistOutput) : null);
    }
    if (workingHypothesis !== undefined) {
      setClauses.push(`working_hypothesis = $${idx++}`);
      values.push(workingHypothesis?.trim() || null);
    }
    if (interventionStrategy !== undefined) {
      setClauses.push(`intervention_strategy = $${idx++}`);
      values.push(interventionStrategy?.trim() || null);
    }
    if (confidenceLevel !== undefined) {
      const validLevels = ['low', 'moderate', 'high'];
      if (confidenceLevel && !validLevels.includes(confidenceLevel)) {
        return NextResponse.json(
          { error: 'confidenceLevel must be low, moderate, or high' },
          { status: 400 }
        );
      }
      setClauses.push(`confidence_level = $${idx++}`);
      values.push(confidenceLevel || null);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Upsert: insert if no row for this protocol+week, otherwise update
    const upsertResult = await db.query(
      `INSERT INTO protocol_council_outputs (protocol_id, week_number)
       VALUES ($1, $2)
       ON CONFLICT (protocol_id, week_number) DO NOTHING
       RETURNING id`,
      [params.id, weekNumber]
    );

    if (upsertResult.rows.length > 0) {
      // Freshly inserted — now apply the update fields
    }

    const result = await db.query(
      `UPDATE protocol_council_outputs
       SET ${setClauses.join(', ')}
       WHERE protocol_id = $1 AND week_number = $2
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Council output not found' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      councilOutput: {
        id: row.id,
        protocolId: row.protocol_id,
        weekNumber: row.week_number,
        strategistOutput: row.strategist_output,
        bodyListenerOutput: row.body_listener_output,
        patternSeerOutput: row.pattern_seer_output,
        symbolistOutput: row.symbolist_output,
        workingHypothesis: row.working_hypothesis,
        interventionStrategy: row.intervention_strategy,
        confidenceLevel: row.confidence_level,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[Protocol Council] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update council output' }, { status: 500 });
  }
}
