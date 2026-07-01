/**
 * GET /api/member/portal
 *
 * Returns the authenticated member's Relationship Spaces where they are participant.
 * Used by the Personal Portal to show the client's shared spaces.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { getSnapshotForSpace } from '@/lib/practiceField/practiceFieldService';

export async function GET(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const result = await query(
    `SELECT
       rs.id, rs.relationship_type, rs.practitioner_display_name,
       rs.practice_display_name, rs.status, rs.consent_status,
       rs.created_at
     FROM relationship_spaces rs
     WHERE rs.participant_member_id = $1
       AND rs.status IN ('active', 'invited')
     ORDER BY rs.created_at DESC`,
    [memberId]
  );

  const spaces = await Promise.all(
    result.rows.map(async (space: any) => {
      const snapshot = await getSnapshotForSpace(space.id);
      return {
        ...space,
        snapshot: snapshot ? {
          welcome_message: snapshot.welcome_message,
          about_practice: snapshot.about_practice,
          how_we_work_together: snapshot.how_we_work_together,
          orientation_style: snapshot.orientation_style,
        } : null,
      };
    })
  );

  return NextResponse.json({ spaces });
}
