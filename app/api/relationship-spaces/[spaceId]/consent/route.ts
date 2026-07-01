/**
 * POST /api/relationship-spaces/[spaceId]/consent
 *
 * Records participant consent and activates the Relationship Space.
 * Called from the threshold screen after the participant reads and acknowledges.
 *
 * Requires: authenticated member who is the participant of this space.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  const { spaceId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Verify this member is the participant of this space
  const spaceResult = await query(
    `SELECT id, participant_member_id, consent_status
     FROM relationship_spaces WHERE id = $1`,
    [spaceId]
  );

  if (!spaceResult.rows.length) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 });
  }

  const space = spaceResult.rows[0];
  if (space.participant_member_id !== memberId) {
    return NextResponse.json({ error: 'Not authorized for this space' }, { status: 403 });
  }

  if (space.consent_status === 'accepted') {
    return NextResponse.json({ already_accepted: true, space_id: spaceId });
  }

  const body = await req.json().catch(() => ({}));
  const consentItems = body.consent_items ?? [
    'platform_constitutional_commitments',
    'practice_field_terms',
    'maia_support_role',
  ];

  await query(
    `UPDATE relationship_spaces SET
      consent_status = 'accepted',
      consent_accepted_at = NOW(),
      consent_items = $2,
      status = 'active'
     WHERE id = $1`,
    [spaceId, JSON.stringify(consentItems)]
  );

  console.log(`[RelationshipSpace] Consent accepted: member ${memberId.slice(0, 8)}… space ${spaceId}`);

  return NextResponse.json({ accepted: true, space_id: spaceId });
}
