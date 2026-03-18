export const dynamic = 'force-dynamic';

/**
 * Change Experiments API
 *
 * GET  — list experiments for a change
 * POST — create an intervention hypothesis / practice design
 *
 * Experiments are the practitioner-side equivalent of the Personal Portal's
 * "follow-up intention" — but structured, typed, and designed as testable experiments.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import type { ChangeExperiment } from '@/lib/studio/practitioner/types';

function rowToExperiment(row: Record<string, unknown>): ChangeExperiment {
  return {
    id: row.id as string,
    changeId: row.change_id as string,
    practitionerId: row.practitioner_id as string,
    title: row.title as string,
    hypothesis: row.hypothesis as string,
    interventionType: row.intervention_type as ChangeExperiment['interventionType'],
    instructions: row.instructions as string,
    observationWindow: row.observation_window as string,
    successSignals: (row.success_signals as string[]) || [],
    riskNotes: row.risk_notes as string | null,
    followUpIntention: row.follow_up_intention as string | null,
    status: row.status as ChangeExperiment['status'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { practitionerId } = identity;
    const { id: changeId } = await params;

    const result = await db.query(
      `SELECT e.* FROM studio_change_experiments e
       JOIN studio_changes c ON c.id = e.change_id
       WHERE e.change_id = $1 AND e.practitioner_id = $2
       ORDER BY e.created_at DESC`,
      [changeId, practitionerId]
    );

    return NextResponse.json({ experiments: result.rows.map(rowToExperiment) });
  } catch (error) {
    console.error('[Change Experiments] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch experiments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { practitionerId } = identity;
    const { id: changeId } = await params;

    // Verify ownership
    const changeCheck = await db.query(
      `SELECT id FROM studio_changes WHERE id = $1 AND practitioner_id = $2`,
      [changeId, practitionerId]
    );
    if (changeCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Change not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      hypothesis,
      interventionType,
      instructions,
      observationWindow,
      successSignals = [],
      riskNotes = null,
      followUpIntention = null,
    } = body;

    if (!title?.trim() || !hypothesis?.trim() || !interventionType || !instructions?.trim() || !observationWindow?.trim()) {
      return NextResponse.json(
        { error: 'title, hypothesis, interventionType, instructions, and observationWindow are required' },
        { status: 400 }
      );
    }

    const VALID_MODALITIES = ['hypnosis', 'nlp', 'somatic', 'relational', 'journaling', 'maia_practice', 'mixed', 'other'];
    if (!VALID_MODALITIES.includes(interventionType)) {
      return NextResponse.json({ error: 'Invalid interventionType' }, { status: 400 });
    }

    const result = await db.query(
      `INSERT INTO studio_change_experiments
        (change_id, practitioner_id, title, hypothesis, intervention_type,
         instructions, observation_window, success_signals, risk_notes, follow_up_intention)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [changeId, practitionerId, title.trim(), hypothesis.trim(), interventionType,
       instructions.trim(), observationWindow.trim(), successSignals, riskNotes, followUpIntention]
    );

    return NextResponse.json({ experiment: rowToExperiment(result.rows[0]) }, { status: 201 });
  } catch (error) {
    console.error('[Change Experiments] POST error:', error);
    return NextResponse.json({ error: 'Failed to create experiment' }, { status: 500 });
  }
}
