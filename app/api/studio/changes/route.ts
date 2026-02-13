export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO CHANGES API
 *
 * List and create change navigation records.
 * Part of the Change Council — I Ching oracle + AIN engine
 * for navigating life transitions.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

const VALID_STATUSES = ['naming', 'casting', 'consulting', 'active', 'integrating', 'complete', 'archived'] as const;
const VALID_URGENCIES = ['none', 'low', 'medium', 'high', 'acute'] as const;
const VALID_CHANGE_TYPES = ['dissolution', 'emergence', 'threshold', 'integration', 'upheaval', 'ripening'] as const;

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    let sql = `
      SELECT
        c.id,
        c.practitioner_id,
        c.member_id,
        c.client_id,
        c.team_id,
        c.title,
        c.description,
        c.change_type,
        c.emotional_state,
        c.urgency,
        c.hexagram_number,
        c.hexagram_name,
        c.relating_hexagram_number,
        c.changing_lines,
        c.casting_method,
        c.cast_at,
        c.council_result,
        c.hexagram_interpretation,
        c.notes,
        c.questions,
        c.mentor_reflection,
        c.follow_up_intention,
        c.status,
        c.iteration_count,
        c.consulted_at,
        c.created_at,
        c.updated_at,
        c.parent_change_id,
        c.root_change_id,
        cl.name as client_name,
        (SELECT COUNT(*)::int FROM studio_changes child WHERE child.parent_change_id = c.id) as child_count,
        (SELECT COUNT(*)::int FROM change_experiences e WHERE e.change_id = c.id) as experience_count
      FROM studio_changes c
      LEFT JOIN practitioner_clients cl ON cl.id = c.client_id
      WHERE c.practitioner_id = $1
    `;
    const params: (string | number)[] = [practitionerId];

    if (clientId) {
      sql += ` AND c.client_id = $${params.length + 1}`;
      params.push(clientId);
    }

    if (status && (VALID_STATUSES as readonly string[]).includes(status)) {
      sql += ` AND c.status = $${params.length + 1}`;
      params.push(status);
    } else {
      // Default: exclude archived
      sql += ` AND c.status != 'archived'`;
    }

    sql += ` ORDER BY c.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(sql, params);

    const changes = result.rows.map(row => ({
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
      parentChangeId: row.parent_change_id,
      rootChangeId: row.root_change_id,
      childCount: row.child_count || 0,
      experienceCount: row.experience_count || 0,
    }));

    return NextResponse.json({ changes });
  } catch (error) {
    console.error('[Studio Changes] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch changes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const body = await request.json();

    const {
      title,
      description,
      clientId,
      teamId,
      changeType = 'threshold',
      urgency = 'none',
      emotionalState,
      parentChangeId,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }
    if (!(VALID_URGENCIES as readonly string[]).includes(urgency)) {
      return NextResponse.json({ error: 'Invalid urgency value' }, { status: 400 });
    }
    if (!(VALID_CHANGE_TYPES as readonly string[]).includes(changeType)) {
      return NextResponse.json({ error: 'Invalid change type' }, { status: 400 });
    }

    // Compute root_change_id for change chain
    let rootChangeId: string | null = null;
    if (parentChangeId) {
      const parentResult = await db.query(
        `SELECT id, root_change_id, practitioner_id
         FROM studio_changes WHERE id = $1`,
        [parentChangeId]
      );
      if (parentResult.rows.length === 0) {
        return NextResponse.json({ error: 'Parent change not found' }, { status: 400 });
      }
      if (parentResult.rows[0].practitioner_id !== practitionerId) {
        return NextResponse.json({ error: 'Parent change not owned by you' }, { status: 403 });
      }
      // Root is the parent's root, or the parent itself if it has no root
      rootChangeId = parentResult.rows[0].root_change_id || parentChangeId;
    }

    const id = randomUUID();
    const result = await db.query(
      `INSERT INTO studio_changes
        (id, practitioner_id, client_id, team_id, title, description, change_type, urgency, emotional_state, parent_change_id, root_change_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'naming')
       RETURNING *`,
      [
        id,
        practitionerId,
        clientId || null,
        teamId || null,
        title.trim(),
        description.trim(),
        changeType,
        urgency,
        emotionalState?.trim() || null,
        parentChangeId || null,
        rootChangeId,
      ]
    );

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
        mentorReflection: row.mentor_reflection,
        followUpIntention: row.follow_up_intention,
        status: row.status,
        iterationCount: row.iteration_count || 0,
        consultedAt: row.consulted_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        parentChangeId: row.parent_change_id,
        rootChangeId: row.root_change_id,
      },
    });
  } catch (error) {
    console.error('[Studio Changes] POST error:', error);
    return NextResponse.json({ error: 'Failed to create change' }, { status: 500 });
  }
}
