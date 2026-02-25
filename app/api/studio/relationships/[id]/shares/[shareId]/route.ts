export const dynamic = 'force-dynamic';

/**
 * RELATIONSHIP SHARE DETAIL API
 *
 * DELETE — Revoke (deactivate) a share
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; shareId: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { id: relationshipId, shareId } = await params;

    // Verify ownership of relationship
    const rel = await db.query(
      'SELECT id FROM studio_relationships WHERE id = $1 AND practitioner_id = $2',
      [relationshipId, practitionerId]
    );
    if (rel.rows.length === 0) {
      return NextResponse.json({ error: 'Relationship not found' }, { status: 404 });
    }

    // Deactivate share (soft delete)
    const result = await db.query(
      `UPDATE relationship_shares
       SET active = false, updated_at = NOW()
       WHERE id = $1 AND relationship_id = $2
       RETURNING id`,
      [shareId, relationshipId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    return NextResponse.json({ revoked: true });
  } catch (error) {
    console.error('[Relationship Share] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to revoke share' }, { status: 500 });
  }
}
