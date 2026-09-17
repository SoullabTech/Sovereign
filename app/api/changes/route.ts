export const dynamic = 'force-dynamic';

/**
 * MEMBER CHANGES API
 *
 * List and create change records for members.
 * The member owns the chain — they can keep iterating
 * with or without MAIA's support.
 *
 * Auth: getMemberIdFromRequest (cookie or x-member-id header)
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { randomUUID } from 'crypto';
import { readMemberChanges } from '@/lib/changes/readMemberChanges';

const VALID_CHANGE_TYPES = ['dissolution', 'emergence', 'threshold', 'integration', 'upheaval', 'ripening'] as const;
const VALID_URGENCIES = ['none', 'low', 'medium', 'high', 'acute'] as const;

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // MAIA-NODE-05 §1 — the query and its row mapping moved verbatim to
    // lib/changes/readMemberChanges so the conversational capability can invoke
    // the SAME read instead of duplicating it. Authorization is unchanged and
    // still happens above, in this route.
    const changes = await readMemberChanges(memberId, { status, limit });

    return NextResponse.json({ changes });
  } catch (error) {
    console.error('[Member Changes] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch changes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
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
    if (!(VALID_CHANGE_TYPES as readonly string[]).includes(changeType)) {
      return NextResponse.json({ error: 'Invalid change type' }, { status: 400 });
    }
    if (!(VALID_URGENCIES as readonly string[]).includes(urgency)) {
      return NextResponse.json({ error: 'Invalid urgency value' }, { status: 400 });
    }

    // Compute root_change_id for change chain
    let rootChangeId: string | null = null;
    if (parentChangeId) {
      const parentResult = await db.query(
        `SELECT id, root_change_id, member_id FROM studio_changes WHERE id = $1`,
        [parentChangeId]
      );
      if (parentResult.rows.length === 0) {
        return NextResponse.json({ error: 'Parent change not found' }, { status: 400 });
      }
      if (parentResult.rows[0].member_id !== memberId) {
        return NextResponse.json({ error: 'Parent change not yours' }, { status: 403 });
      }
      rootChangeId = parentResult.rows[0].root_change_id || parentChangeId;
    }

    const id = randomUUID();
    const result = await db.query(
      `INSERT INTO studio_changes
        (id, member_id, title, description, change_type, urgency, emotional_state, parent_change_id, root_change_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'naming')
       RETURNING *`,
      [
        id,
        memberId,
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
        memberId: row.member_id,
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
    console.error('[Member Changes] POST error:', error);
    return NextResponse.json({ error: 'Failed to create change' }, { status: 500 });
  }
}
