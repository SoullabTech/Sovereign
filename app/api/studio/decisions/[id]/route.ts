export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { decisionOwnerWhere, decisionScopeMatchesRequest, resolveDecisionActor } from '@/lib/studio/decisions/access';

const VALID_STATUSES = ['draft', 'consulting', 'active', 'complete', 'archived'] as const;
const VALID_TIME_PRESSURES = ['none', 'low', 'medium', 'high', 'urgent'] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await resolveDecisionActor(request);
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const result = await db.query(
      `SELECT d.*, c.name as client_name, c.leadership_profile
         FROM studio_decisions d
         LEFT JOIN practitioner_clients c ON c.id = d.client_id
        WHERE d.id = $1 AND ${decisionOwnerWhere('d', '$2', '$3')}`,
      [id, actor.memberId, actor.practitionerId],
    );
    if (!result.rows.length) return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    const row = result.rows[0];
    if (!decisionScopeMatchesRequest(request, row.decision_scope)) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }

    const ownerColumn = row.decision_scope === 'personal' ? 'personal_member_id' : 'practitioner_id';
    const ownerId = row.decision_scope === 'personal' ? actor.memberId : actor.practitionerId;

    const [iterationsResult, parentResult, childrenResult, experiencesResult] = await Promise.all([
      db.query(
        `SELECT id, iteration_number, session_notes, updated_context, emotional_state,
                council_result, consultant_notes, questions, consulted_at
           FROM decision_iterations
          WHERE decision_id = $1
          ORDER BY iteration_number ASC`,
        [id],
      ),
      row.parent_decision_id
        ? db.query(
            `SELECT id, title, status, iteration_count, created_at
               FROM studio_decisions
              WHERE id = $1 AND decision_scope = $2 AND ${ownerColumn} = $3`,
            [row.parent_decision_id, row.decision_scope, ownerId],
          )
        : Promise.resolve({ rows: [] }),
      db.query(
        `SELECT id, title, status, iteration_count, created_at
           FROM studio_decisions
          WHERE parent_decision_id = $1 AND decision_scope = $2 AND ${ownerColumn} = $3
          ORDER BY created_at ASC`,
        [id, row.decision_scope, ownerId],
      ),
      db.query(
        `SELECT id, decision_id, occurred_at, experience_type, content, element, tags, created_at
           FROM decision_experiences
          WHERE decision_id = $1
          ORDER BY occurred_at DESC`,
        [id],
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
    const parentDecision = parentResult.rows[0] ? {
      id: parentResult.rows[0].id,
      title: parentResult.rows[0].title,
      status: parentResult.rows[0].status,
      iterationCount: parentResult.rows[0].iteration_count || 0,
      createdAt: parentResult.rows[0].created_at?.toISOString(),
    } : null;
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

    const choiceHistory = row.decision_scope === 'personal'
      ? (await db.query(
          `SELECT id::text AS id, event_type, choice_text, recorded_at
             FROM personal_decision_choice_events
            WHERE decision_id = $1::uuid
            ORDER BY event_order ASC`,
          [id],
        )).rows.map((event) => ({
          id: event.id,
          eventType: event.event_type,
          choiceText: event.choice_text,
          recordedAt: event.recorded_at?.toISOString(),
        }))
      : [];

    const latestChoiceEvent = choiceHistory.length ? choiceHistory[choiceHistory.length - 1] : null;
    const currentChoice =
      latestChoiceEvent?.eventType === 'choice_recorded'
        ? {
            id: latestChoiceEvent.id,
            choiceText: latestChoiceEvent.choiceText,
            recordedAt: latestChoiceEvent.recordedAt,
          }
        : null;
    const resolutionStanding =
      row.decision_scope !== 'personal'
        ? undefined
        : currentChoice
          ? 'choice_recorded'
          : !choiceHistory.length && row.status === 'complete'
            ? 'legacy_complete_without_choice'
            : 'open';

    return NextResponse.json({
      decision: {
        id: row.id,
        scope: row.decision_scope,
        practitionerId: row.practitioner_id,
        personalMemberId: row.personal_member_id,
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
        parentDecisionId: row.parent_decision_id,
        rootDecisionId: row.root_decision_id,
        parentDecision,
        childDecisions,
        mentorReflection: row.mentor_reflection,
        followUpIntention: row.follow_up_intention,
        experiences,
        ...(row.decision_scope === 'personal'
          ? { choiceHistory, currentChoice, resolutionStanding }
          : {}),
      },
    });
  } catch (error) {
    console.error('[Studio Decision Detail] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch decision' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await resolveDecisionActor(request);
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const ownerCheck = await db.query(
      `SELECT decision_scope FROM studio_decisions d
        WHERE d.id = $1 AND ${decisionOwnerWhere('d', '$2', '$3')}`,
      [id, actor.memberId, actor.practitionerId],
    );
    if (!ownerCheck.rows.length || !decisionScopeMatchesRequest(request, ownerCheck.rows[0].decision_scope)) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }
    const body = await request.json();

    if (ownerCheck.rows[0].decision_scope === 'personal' && body.status !== undefined) {
      return NextResponse.json(
        {
          error: 'Personal Decision status changes must use their governed member action.',
          code: 'PERSONAL_STATUS_REQUIRES_GOVERNED_ACTION',
        },
        { status: 409 },
      );
    }

    const updateFields: string[] = [];
    const queryParams: (string | string[] | null)[] = [id, actor.memberId, actor.practitionerId];

    const addText = (column: string, value: unknown, nullable = false) => {
      if (value === undefined) return;
      const normalized = typeof value === 'string' ? value.trim() : '';
      updateFields.push(`${column} = $${queryParams.length + 1}`);
      queryParams.push(nullable ? normalized || null : normalized);
    };

    addText('title', body.title);
    addText('context', body.context);
    addText('stakes', body.stakes, true);
    addText('consultant_notes', body.consultantNotes, true);
    addText('emotional_state', body.emotionalState, true);

    if (body.questionsForLeader !== undefined) {
      if (!Array.isArray(body.questionsForLeader) || body.questionsForLeader.some((q: unknown) => typeof q !== 'string')) {
        return NextResponse.json({ error: 'Questions must be text.' }, { status: 400 });
      }
      updateFields.push(`questions_for_leader = $${queryParams.length + 1}`);
      queryParams.push(body.questionsForLeader);
    }

    if (body.status !== undefined) {
      if (!(VALID_STATUSES as readonly string[]).includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateFields.push(`status = $${queryParams.length + 1}`);
      queryParams.push(body.status);
    }

    if (body.timePressure !== undefined) {
      if (!(VALID_TIME_PRESSURES as readonly string[]).includes(body.timePressure)) {
        return NextResponse.json({ error: 'Invalid time pressure' }, { status: 400 });
      }
      updateFields.push(`time_pressure = $${queryParams.length + 1}`);
      queryParams.push(body.timePressure);
    }

    if (body.followUpIntention !== undefined) {
      const intention = typeof body.followUpIntention === 'string' ? body.followUpIntention.trim() : '';
      if (intention.length > 500) {
        return NextResponse.json({ error: 'Follow-up intention must be 500 characters or fewer' }, { status: 400 });
      }
      updateFields.push(`follow_up_intention = $${queryParams.length + 1}`);
      queryParams.push(intention || null);
    }

    if (!updateFields.length) return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    updateFields.push('updated_at = NOW()');

    const result = await db.query(
      `UPDATE studio_decisions
          SET ${updateFields.join(', ')}
        WHERE id = $1
          AND ((decision_scope = 'personal' AND personal_member_id = $2)
            OR (decision_scope = 'practice' AND practitioner_id = $3))
        RETURNING *`,
      queryParams,
    );
    if (!result.rows.length) return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    const row = result.rows[0];

    return NextResponse.json({
      decision: {
        id: row.id,
        scope: row.decision_scope,
        practitionerId: row.practitioner_id,
        personalMemberId: row.personal_member_id,
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await resolveDecisionActor(request);
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const ownerCheck = await db.query(
      `SELECT decision_scope FROM studio_decisions d
        WHERE d.id = $1 AND ${decisionOwnerWhere('d', '$2', '$3')}`,
      [id, actor.memberId, actor.practitionerId],
    );
    if (!ownerCheck.rows.length || !decisionScopeMatchesRequest(request, ownerCheck.rows[0].decision_scope)) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }

    const result = await db.query(
      `UPDATE studio_decisions
          SET status = 'archived', updated_at = NOW()
        WHERE id = $1
          AND ((decision_scope = 'personal' AND personal_member_id = $2)
            OR (decision_scope = 'practice' AND practitioner_id = $3))
        RETURNING id`,
      [id, actor.memberId, actor.practitionerId],
    );
    if (!result.rows.length) return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Decision Detail] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to archive decision' }, { status: 500 });
  }
}
