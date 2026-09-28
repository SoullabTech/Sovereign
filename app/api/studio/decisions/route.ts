export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { randomUUID } from 'crypto';
import { getTeamRole } from '@/lib/auth/teamPermissions';
import { chooseDecisionScope, resolveDecisionActor } from '@/lib/studio/decisions/access';
import {
  recordFacetCrossing,
  validateFacetCrossingSource,
  type FacetCrossingRef,
} from '@/lib/house/facetCrossing.server';

const VALID_STATUSES = ['draft', 'consulting', 'active', 'complete', 'archived'] as const;
const VALID_TIME_PRESSURES = ['none', 'low', 'medium', 'high', 'urgent'] as const;
const VALID_SITUATION_TYPES = ['individual', 'relational', 'group', 'leadership', 'self'] as const;

export async function GET(request: NextRequest) {
  try {
    const actor = await resolveDecisionActor(request);
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const requestedScope = searchParams.get('scope');
    const scope = chooseDecisionScope(requestedScope, actor);
    if (!scope) return NextResponse.json({ error: 'Practice Studio is not available to this account.' }, { status: 403 });

    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const parsedLimit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 50;

    if (scope === 'personal' && clientId) {
      return NextResponse.json({ error: 'Client filters are not part of personal Decisions.' }, { status: 400 });
    }

    const ownerId = scope === 'personal' ? actor.memberId : actor.practitionerId!;
    let sql = `
      SELECT d.id, d.decision_scope, d.practitioner_id, d.personal_member_id,
        d.client_id, d.team_id, d.title, d.context, d.stakes, d.time_pressure,
        d.emotional_state, d.council_result, d.consultant_notes, d.questions_for_leader,
        d.situation_type, d.iteration_count, d.status, d.consulted_at, d.created_at,
        d.updated_at, d.parent_decision_id, d.root_decision_id, c.name as client_name,
        (SELECT COUNT(*)::int FROM studio_decisions child WHERE child.parent_decision_id = d.id) as child_count,
        (SELECT COUNT(*)::int FROM decision_experiences e WHERE e.decision_id = d.id) as experience_count
      FROM studio_decisions d
      LEFT JOIN practitioner_clients c ON c.id = d.client_id
      WHERE d.decision_scope = $1
        AND ${scope === 'personal' ? 'd.personal_member_id' : 'd.practitioner_id'} = $2
    `;
    const params: (string | number)[] = [scope, ownerId];

    if (clientId) {
      sql += ` AND d.client_id = $${params.length + 1}`;
      params.push(clientId);
    }
    if (status && (VALID_STATUSES as readonly string[]).includes(status)) {
      sql += ` AND d.status = $${params.length + 1}`;
      params.push(status);
    } else {
      sql += ` AND d.status != 'archived'`;
    }
    sql += ` ORDER BY d.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(sql, params);
    const decisions = result.rows.map(row => ({
      id: row.id,
      scope: row.decision_scope,
      practitionerId: row.practitioner_id,
      personalMemberId: row.personal_member_id,
      clientId: row.client_id,
      clientName: row.client_name,
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
      parentDecisionId: row.parent_decision_id,
      rootDecisionId: row.root_decision_id,
      childCount: row.child_count || 0,
      experienceCount: row.experience_count || 0,
    }));
    return NextResponse.json({ scope, decisions });
  } catch (error) {
    console.error('[Studio Decisions] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch decisions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await resolveDecisionActor(request);
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const scope = chooseDecisionScope(body.scope, actor);
    if (!scope) return NextResponse.json({ error: 'Practice Studio is not available to this account.' }, { status: 403 });

    const {
      title, context, clientId, teamId, stakes, timePressure = 'none',
      emotionalState, situationType = scope === 'personal' ? 'self' : 'individual',
      parentDecisionId, sourceRef,
    } = body as {
      title?: string;
      context?: string;
      clientId?: string;
      teamId?: string;
      stakes?: string;
      timePressure?: string;
      emotionalState?: string;
      situationType?: string;
      parentDecisionId?: string;
      sourceRef?: FacetCrossingRef;
      scope?: string;
    };

    if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    if (!context?.trim()) return NextResponse.json({ error: 'Context is required' }, { status: 400 });
    if (!(VALID_TIME_PRESSURES as readonly string[]).includes(timePressure)) {
      return NextResponse.json({ error: 'Invalid time pressure value' }, { status: 400 });
    }
    if (!(VALID_SITUATION_TYPES as readonly string[]).includes(situationType)) {
      return NextResponse.json({ error: 'Invalid situation type' }, { status: 400 });
    }
    if (scope === 'personal' && situationType !== 'self') {
      return NextResponse.json(
        { error: 'Personal Decisions currently use the Personal reflection council.' },
        { status: 400 },
      );
    }

    if (scope === 'personal' && (clientId || teamId)) {
      return NextResponse.json(
        { error: 'Personal Decisions cannot carry client or team context.' },
        { status: 400 },
      );
    }

    if (scope === 'practice' && clientId) {
      const client = await db.query(
        'SELECT 1 FROM practitioner_clients WHERE id = $1 AND practitioner_id = $2',
        [clientId, actor.practitionerId],
      );
      if (!client.rows.length) return NextResponse.json({ error: 'Client not available in this practice.' }, { status: 403 });
    }

    if (scope === 'practice' && teamId) {
      const role = await getTeamRole(actor.memberId, teamId);
      if (!role || role === 'viewer') return NextResponse.json({ error: 'Team not available for decision capture.' }, { status: 403 });
    }

    let rootDecisionId: string | null = null;
    if (parentDecisionId) {
      const ownerColumn = scope === 'personal' ? 'personal_member_id' : 'practitioner_id';
      const ownerId = scope === 'personal' ? actor.memberId : actor.practitionerId;
      const parentResult = await db.query(
        `SELECT id, root_decision_id FROM studio_decisions
          WHERE id = $1 AND decision_scope = $2 AND ${ownerColumn} = $3`,
        [parentDecisionId, scope, ownerId],
      );
      if (!parentResult.rows.length) return NextResponse.json({ error: 'Parent decision not found in this context.' }, { status: 404 });
      rootDecisionId = parentResult.rows[0].root_decision_id || parentDecisionId;
    }

    if (sourceRef) {
      if (scope !== 'personal') {
        return NextResponse.json(
          { error: 'Facet carry currently enters personal Decisions only.' },
          { status: 400 },
        );
      }
      const source = await validateFacetCrossingSource({
        memberId: actor.memberId,
        targetFacet: 'decisions',
        sourceRef,
      });
      if (!source) {
        return NextResponse.json({ error: 'Source not available for this crossing' }, { status: 400 });
      }
    }

    const id = randomUUID();
    const insertSql = `INSERT INTO studio_decisions
      (id, decision_scope, personal_member_id, practitioner_id, captured_by_member_id,
       client_id, team_id, title, context, stakes, time_pressure, emotional_state,
       situation_type, parent_decision_id, root_decision_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`;
    const insertParams = [
      id, scope,
      scope === 'personal' ? actor.memberId : null,
      scope === 'practice' ? actor.practitionerId : null,
      actor.memberId,
      scope === 'practice' ? clientId || null : null,
      scope === 'practice' ? teamId || null : null,
      title.trim(), context.trim(), stakes?.trim() || null, timePressure,
      emotionalState?.trim() || null, situationType, parentDecisionId || null, rootDecisionId,
    ];

    // Preserve the established create path when there is no crossing. The
    // transaction is introduced only when the member is binding provenance to
    // a newly authored Personal Decision.
    const row = sourceRef
      ? await db.transaction(async (client) => {
          const result = await client.query(insertSql, insertParams);
          await recordFacetCrossing(client, {
            memberId: actor.memberId,
            crossingId: sourceRef.crossingId,
            sourceFacet: sourceRef.sourceFacet,
            sourceRefId: sourceRef.sourceRefId,
            targetFacet: 'decisions',
            targetRefId: id,
          });
          return result.rows[0];
        })
      : (await db.query(insertSql, insertParams)).rows[0];
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
        iterationCount: row.iteration_count || 0,
        status: row.status,
        consultedAt: row.consulted_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        parentDecisionId: row.parent_decision_id,
        rootDecisionId: row.root_decision_id,
        mentorReflection: row.mentor_reflection,
        followUpIntention: row.follow_up_intention,
      },
    });
  } catch (error) {
    console.error('[Studio Decisions] POST error:', error);
    return NextResponse.json({ error: 'Failed to create decision' }, { status: 500 });
  }
}
