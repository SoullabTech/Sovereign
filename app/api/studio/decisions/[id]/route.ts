export const dynamic = 'force-dynamic';

/**
 * STUDIO DECISION DETAIL API
 *
 * GET  - Fetch single decision with full council result
 * PUT  - Update decision (notes, questions, status)
 * DELETE - Archive decision
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

export async function GET(
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

    const result = await db.query(
      `SELECT
        d.*,
        c.name as client_name,
        c.leadership_profile
      FROM studio_decisions d
      LEFT JOIN practitioner_clients c ON c.id = d.client_id
      WHERE d.id = $1 AND d.practitioner_id = $2`,
      [id, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }

    const row = result.rows[0];

    // Fetch iteration history, chain data, and experiences in parallel
    const [iterationsResult, parentResult, childrenResult, experiencesResult] = await Promise.all([
      db.query(
        `SELECT id, iteration_number, session_notes, updated_context, emotional_state,
                council_result, consultant_notes, questions, consulted_at
         FROM decision_iterations
         WHERE decision_id = $1
         ORDER BY iteration_number ASC`,
        [id]
      ),
      // Parent decision (if part of a chain)
      row.parent_decision_id
        ? db.query(
            `SELECT id, title, status, iteration_count, created_at
             FROM studio_decisions WHERE id = $1`,
            [row.parent_decision_id]
          )
        : Promise.resolve({ rows: [] }),
      // Child decisions
      db.query(
        `SELECT id, title, status, iteration_count, created_at
         FROM studio_decisions
         WHERE parent_decision_id = $1
         ORDER BY created_at ASC`,
        [id]
      ),
      // Experiences
      db.query(
        `SELECT id, decision_id, occurred_at, experience_type, content, element, tags, created_at
         FROM decision_experiences
         WHERE decision_id = $1
         ORDER BY occurred_at DESC`,
        [id]
      ),
    ]);

    const iterations = iterationsResult.rows.map(r => ({
      id: r.id,
      iterationNumber: r.iteration_number,
      sessionNotes: r.session_notes,
      updatedContext: r.updated_context,
      emotionalState: r.emotional_state,
      councilResult: r.council_result,
      consultantNotes: r.consultant_notes,
      questions: r.questions || [],
      consultedAt: r.consulted_at?.toISOString(),
    }));

    const parentDecision = parentResult.rows[0]
      ? {
          id: parentResult.rows[0].id,
          title: parentResult.rows[0].title,
          status: parentResult.rows[0].status,
          iterationCount: parentResult.rows[0].iteration_count || 0,
          createdAt: parentResult.rows[0].created_at?.toISOString(),
        }
      : null;

    const childDecisions = childrenResult.rows.map(r => ({
      id: r.id,
      title: r.title,
      status: r.status,
      iterationCount: r.iteration_count || 0,
      createdAt: r.created_at?.toISOString(),
    }));

    const experiences = experiencesResult.rows.map(r => ({
      id: r.id,
      decisionId: r.decision_id,
      occurredAt: r.occurred_at?.toISOString(),
      experienceType: r.experience_type,
      content: r.content,
      element: r.element,
      tags: r.tags || [],
      createdAt: r.created_at?.toISOString(),
    }));

    return NextResponse.json({
      decision: {
        id: row.id,
        practitionerId: row.practitioner_id,
        clientId: row.client_id,
        clientName: row.client_name,
        leadershipProfile: row.leadership_profile,
        teamId: row.team_id,
        title: row.title,
        context: row.context,
        stakes: row.stakes,
        timePressure: row.time_pressure,
        emotionalState: row.emotional_state,
        councilResult: row.council_result,
        consultantNotes: row.consultant_notes,
        questionsForLeader: row.questions_for_leader || [],
        situationType: row.situation_type,
        iterationCount: row.iteration_count || 0,
        status: row.status,
        consultedAt: row.consulted_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        iterations,
        // Spiral path
        parentDecisionId: row.parent_decision_id,
        rootDecisionId: row.root_decision_id,
        parentDecision,
        childDecisions,
        // Mentor
        mentorReflection: row.mentor_reflection,
        followUpIntention: row.follow_up_intention,
        // Experiences
        experiences,
      },
    });
  } catch (error) {
    console.error('[Studio Decision Detail] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch decision' }, { status: 500 });
  }
}

export async function PUT(
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
    const body = await request.json();

    const updateFields: string[] = [];
    const queryParams: (string | string[] | null)[] = [id, practitionerId];

    if (body.title !== undefined) {
      updateFields.push(`title = $${queryParams.length + 1}`);
      queryParams.push(body.title.trim());
    }

    if (body.context !== undefined) {
      updateFields.push(`context = $${queryParams.length + 1}`);
      queryParams.push(body.context.trim());
    }

    if (body.stakes !== undefined) {
      updateFields.push(`stakes = $${queryParams.length + 1}`);
      queryParams.push(body.stakes?.trim() || null);
    }

    if (body.consultantNotes !== undefined) {
      updateFields.push(`consultant_notes = $${queryParams.length + 1}`);
      queryParams.push(body.consultantNotes?.trim() || null);
    }

    if (body.questionsForLeader !== undefined) {
      updateFields.push(`questions_for_leader = $${queryParams.length + 1}`);
      queryParams.push(body.questionsForLeader);
    }

    if (body.status !== undefined) {
      const valid = ['draft', 'consulting', 'active', 'complete', 'archived'];
      if (!valid.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateFields.push(`status = $${queryParams.length + 1}`);
      queryParams.push(body.status);
    }

    if (body.emotionalState !== undefined) {
      updateFields.push(`emotional_state = $${queryParams.length + 1}`);
      queryParams.push(body.emotionalState?.trim() || null);
    }

    if (body.timePressure !== undefined) {
      updateFields.push(`time_pressure = $${queryParams.length + 1}`);
      queryParams.push(body.timePressure);
    }

    if (body.followUpIntention !== undefined) {
      const intention = body.followUpIntention?.trim() || null;
      if (intention && intention.length > 500) {
        return NextResponse.json({ error: 'Follow-up intention must be 500 characters or fewer' }, { status: 400 });
      }
      updateFields.push(`follow_up_intention = $${queryParams.length + 1}`);
      queryParams.push(intention);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updateFields.push('updated_at = NOW()');

    const result = await db.query(
      `UPDATE studio_decisions
       SET ${updateFields.join(', ')}
       WHERE id = $1 AND practitioner_id = $2
       RETURNING *`,
      queryParams
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      decision: {
        id: row.id,
        practitionerId: row.practitioner_id,
        clientId: row.client_id,
        teamId: row.team_id,
        title: row.title,
        context: row.context,
        stakes: row.stakes,
        timePressure: row.time_pressure,
        emotionalState: row.emotional_state,
        councilResult: row.council_result,
        consultantNotes: row.consultant_notes,
        questionsForLeader: row.questions_for_leader || [],
        situationType: row.situation_type,
        status: row.status,
        consultedAt: row.consulted_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Decision Detail] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update decision' }, { status: 500 });
  }
}

export async function DELETE(
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

    // Soft delete by archiving
    const result = await db.query(
      `UPDATE studio_decisions
       SET status = 'archived', updated_at = NOW()
       WHERE id = $1 AND practitioner_id = $2
       RETURNING id`,
      [id, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Decision Detail] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to archive decision' }, { status: 500 });
  }
}
