/**
 * POST /api/join/[token]/accept
 *
 * Links the authenticated member to the Relationship Space as participant.
 * Called after sign-in/registration on the /join/[token] page.
 *
 * Requires: authenticated member session.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const result = await query(
    `SELECT id, steward_member_id, participant_member_id, invite_expires_at, status
     FROM relationship_spaces WHERE invite_token = $1`,
    [token]
  );

  if (!result.rows.length) {
    return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
  }

  const space = result.rows[0];

  if (space.steward_member_id === memberId) {
    return NextResponse.json({ error: 'Cannot accept your own invitation.' }, { status: 400 });
  }

  if (space.participant_member_id && space.participant_member_id !== memberId) {
    return NextResponse.json({ error: 'This invitation has already been claimed.' }, { status: 409 });
  }

  if (space.invite_expires_at && new Date(space.invite_expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invitation has expired.' }, { status: 410 });
  }

  // Link member as participant (status stays 'invited' until consent accepted)
  await query(
    `UPDATE relationship_spaces
     SET participant_member_id = $2, client_email = NULL
     WHERE id = $1 AND (participant_member_id IS NULL OR participant_member_id = $2)`,
    [space.id, memberId]
  );

  console.log(`[Join] Token accepted: member ${memberId.slice(0, 8)}… linked to space ${space.id}`);

  return NextResponse.json({ space_id: space.id, linked: true });
}
