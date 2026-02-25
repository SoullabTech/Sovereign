export const dynamic = 'force-dynamic';

/**
 * RELATIONSHIP CHECKINS LIST API
 *
 * GET — List check-in entries for a relationship (timeline stream).
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
    const { id: relationshipId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verify ownership
    const rel = await db.query(
      'SELECT id FROM studio_relationships WHERE id = $1 AND practitioner_id = $2',
      [relationshipId, practitionerId]
    );
    if (rel.rows.length === 0) {
      return NextResponse.json({ error: 'Relationship not found' }, { status: 404 });
    }

    const result = await db.query(
      `SELECT *
       FROM relationship_checkins
       WHERE relationship_id = $1 AND practitioner_id = $2
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [relationshipId, practitionerId, limit, offset]
    );

    const checkins = result.rows.map(row => ({
      id: row.id,
      relationshipId: row.relationship_id,
      practitionerId: row.practitioner_id,
      whatHappened: row.what_happened,
      childState: row.child_state,
      parentNeed: row.parent_need,
      maiaResponse: row.maia_response,
      mentorReflection: row.mentor_reflection,
      contextTag: row.context_tag,
      elementState: row.element_state,
      outcome: row.outcome,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ checkins });
  } catch (error) {
    console.error('[Relationship Checkins] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch checkins' }, { status: 500 });
  }
}
