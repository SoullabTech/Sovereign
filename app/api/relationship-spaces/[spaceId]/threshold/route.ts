/**
 * GET /api/relationship-spaces/[spaceId]/threshold
 *
 * Returns the threshold data shown to a client before they enter a Relationship Space.
 * Called from the threshold page — no auth required (invite-gated by token in URL context).
 *
 * Returns: Practice Field snapshot + AIN commitments summary + practitioner name
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getSnapshotForSpace } from '@/lib/practiceField/practiceFieldService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  const { spaceId } = await params;

  const spaceResult = await query(
    `SELECT id, relationship_type, practitioner_display_name,
            status, consent_status, participant_member_id
     FROM relationship_spaces WHERE id = $1`,
    [spaceId]
  );

  if (!spaceResult.rows.length) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 });
  }

  const space = spaceResult.rows[0];
  if (space.consent_status === 'accepted') {
    return NextResponse.json({ already_accepted: true, space_id: spaceId });
  }

  const snapshot = await getSnapshotForSpace(spaceId);

  return NextResponse.json({
    space_id: spaceId,
    relationship_type: space.relationship_type,
    practitioner_name: space.practitioner_display_name,
    snapshot: snapshot ? {
      welcome_message: snapshot.welcome_message,
      about_practice: snapshot.about_practice,
      how_we_work_together: snapshot.how_we_work_together,
      how_maia_supports: snapshot.how_maia_supports,
      professional_practice: snapshot.professional_practice,
      orientation_style: snapshot.orientation_style,
    } : null,
  });
}
