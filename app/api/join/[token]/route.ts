/**
 * GET /api/join/[token]
 *
 * Validate an invitation token.
 * Returns practitioner name, welcome message, and space_id.
 * No auth required — this is the public entry point from the invitation email.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getSnapshotForSpace } from '@/lib/practiceField/practiceFieldService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const result = await query(
    `SELECT
       rs.id as space_id,
       rs.practitioner_display_name,
       rs.client_email,
       rs.participant_member_id,
       rs.status,
       rs.invite_expires_at
     FROM relationship_spaces rs
     WHERE rs.invite_token = $1`,
    [token]
  );

  if (!result.rows.length) {
    return NextResponse.json({ error: 'Invitation not found or already used.' }, { status: 404 });
  }

  const space = result.rows[0];

  if (space.status === 'archived') {
    return NextResponse.json({ error: 'This invitation has expired.' }, { status: 410 });
  }

  if (space.invite_expires_at && new Date(space.invite_expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invitation has expired.' }, { status: 410 });
  }

  const snapshot = await getSnapshotForSpace(space.space_id);

  return NextResponse.json({
    space_id: space.space_id,
    practitioner_name: space.practitioner_display_name,
    welcome_message: snapshot?.welcome_message ?? null,
    already_member: !!space.participant_member_id,
  });
}
