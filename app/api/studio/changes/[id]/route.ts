export const dynamic = 'force-dynamic';

/**
 * STUDIO CHANGE DETAIL API
 *
 * GET  - Fetch single change with full council result and hexagram data
 * PUT  - Update change (notes, questions, status)
 * DELETE - Archive change
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
        c.*,
        cl.name as client_name
      FROM studio_changes c
      LEFT JOIN practitioner_clients cl ON cl.id = c.client_id
      WHERE c.id = $1 AND c.practitioner_id = $2`,
      [id, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Change not found' }, { status: 404 });
    }

    const row = result.rows[0];

    // Fetch iteration history, chain data, and experiences in parallel
    const [iterationsResult, parentResult, childrenResult, experiencesResult] = await Promise.all([
      db.query(
        `SELECT id, iteration_number, session_notes, updated_description, emotional_state,
                hexagram_number, relating_hexagram_number, changing_lines,
                council_result, notes, questions, consulted_at
         FROM change_iterations
         WHERE change_id = $1
         ORDER BY iteration_number ASC`,
        [id]
      ),
      // Parent change (if part of a chain)
      row.parent_change_id
        ? db.query(
            `SELECT id, title, change_type, status, hexagram_number, iteration_count, created_at
             FROM studio_changes WHERE id = $1`,
            [row.parent_change_id]
          )
        : Promise.resolve({ rows: [] }),
      // Child changes
      db.query(
        `SELECT id, title, change_type, status, hexagram_number, iteration_count, created_at
         FROM studio_changes
         WHERE parent_change_id = $1
         ORDER BY created_at ASC`,
        [id]
      ),
      // Experiences
      db.query(
        `SELECT id, change_id, occurred_at, experience_type, content, element, hexagram_resonance, tags, created_at
         FROM change_experiences
         WHERE change_id = $1
         ORDER BY occurred_at DESC`,
        [id]
      ),
    ]);

    const iterations = iterationsResult.rows.map(r => ({
      id: r.id,
      iterationNumber: r.iteration_number,
      sessionNotes: r.session_notes,
      updatedDescription: r.updated_description,
      emotionalState: r.emotional_state,
      hexagramNumber: r.hexagram_number,
      relatingHexagramNumber: r.relating_hexagram_number,
      changingLines: r.changing_lines || [],
      councilResult: r.council_result,
      notes: r.notes,
      questions: r.questions || [],
      consultedAt: r.consulted_at?.toISOString(),
    }));

    const parentChange = parentResult.rows[0]
      ? {
          id: parentResult.rows[0].id,
          title: parentResult.rows[0].title,
          changeType: parentResult.rows[0].change_type,
          status: parentResult.rows[0].status,
          hexagramNumber: parentResult.rows[0].hexagram_number,
          iterationCount: parentResult.rows[0].iteration_count || 0,
          createdAt: parentResult.rows[0].created_at?.toISOString(),
        }
      : null;

    const childChanges = childrenResult.rows.map(r => ({
      id: r.id,
      title: r.title,
      changeType: r.change_type,
      status: r.status,
      hexagramNumber: r.hexagram_number,
      iterationCount: r.iteration_count || 0,
      createdAt: r.created_at?.toISOString(),
    }));

    const experiences = experiencesResult.rows.map(r => ({
      id: r.id,
      changeId: r.change_id,
      occurredAt: r.occurred_at?.toISOString(),
      experienceType: r.experience_type,
      content: r.content,
      element: r.element,
      hexagramResonance: r.hexagram_resonance,
      tags: r.tags || [],
      createdAt: r.created_at?.toISOString(),
    }));

    return NextResponse.json({
      change: {
        id: row.id,
        practitionerId: row.practitioner_id,
        memberId: row.member_id,
        clientId: row.client_id,
        clientName: row.client_name,
        teamId: row.team_id,
        title: row.title,
        description: row.description,
        changeType: row.change_type,
        emotionalState: row.emotional_state,
        urgency: row.urgency,
        hexagramNumber: row.hexagram_number,
        hexagramName: row.hexagram_name,
        relatingHexagramNumber: row.relating_hexagram_number,
        changingLines: row.changing_lines || [],
        castingMethod: row.casting_method,
        castAt: row.cast_at,
        councilResult: row.council_result,
        hexagramInterpretation: row.hexagram_interpretation,
        notes: row.notes,
        questions: row.questions || [],
        mentorReflection: row.mentor_reflection,
        followUpIntention: row.follow_up_intention,
        status: row.status,
        iterationCount: row.iteration_count || 0,
        consultedAt: row.consulted_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        iterations,
        // Spiral path
        parentChangeId: row.parent_change_id,
        rootChangeId: row.root_change_id,
        parentChange,
        childChanges,
        // Experiences
        experiences,
      },
    });
  } catch (error) {
    console.error('[Studio Change Detail] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch change' }, { status: 500 });
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

    if (body.description !== undefined) {
      updateFields.push(`description = $${queryParams.length + 1}`);
      queryParams.push(body.description.trim());
    }

    if (body.notes !== undefined) {
      updateFields.push(`notes = $${queryParams.length + 1}`);
      queryParams.push(body.notes?.trim() || null);
    }

    if (body.questions !== undefined) {
      updateFields.push(`questions = $${queryParams.length + 1}`);
      queryParams.push(body.questions);
    }

    if (body.status !== undefined) {
      const valid = ['naming', 'casting', 'consulting', 'active', 'integrating', 'complete', 'archived'];
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

    if (body.urgency !== undefined) {
      updateFields.push(`urgency = $${queryParams.length + 1}`);
      queryParams.push(body.urgency);
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
      `UPDATE studio_changes
       SET ${updateFields.join(', ')}
       WHERE id = $1 AND practitioner_id = $2
       RETURNING *`,
      queryParams
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Change not found' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      change: {
        id: row.id,
        practitionerId: row.practitioner_id,
        memberId: row.member_id,
        clientId: row.client_id,
        teamId: row.team_id,
        title: row.title,
        description: row.description,
        changeType: row.change_type,
        emotionalState: row.emotional_state,
        urgency: row.urgency,
        hexagramNumber: row.hexagram_number,
        hexagramName: row.hexagram_name,
        relatingHexagramNumber: row.relating_hexagram_number,
        changingLines: row.changing_lines || [],
        castingMethod: row.casting_method,
        castAt: row.cast_at,
        councilResult: row.council_result,
        hexagramInterpretation: row.hexagram_interpretation,
        notes: row.notes,
        questions: row.questions || [],
        status: row.status,
        consultedAt: row.consulted_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Change Detail] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update change' }, { status: 500 });
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
      `UPDATE studio_changes
       SET status = 'archived', updated_at = NOW()
       WHERE id = $1 AND practitioner_id = $2
       RETURNING id`,
      [id, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Change not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Change Detail] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to archive change' }, { status: 500 });
  }
}
