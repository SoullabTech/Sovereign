/**
 * CREATE INVITE API
 *
 * Generates a one-time invite code for a client to claim portal access.
 * Called by practitioners from the admin interface.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { generateInviteCode, hashInviteCode } from '@/lib/portal/invites';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { unauthenticatedResponse } from '@/lib/auth/authFailure';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json().catch(() => ({}));
    const clientId = body?.clientId;

    if (!clientId) {
      return NextResponse.json({ error: 'clientId required' }, { status: 400 });
    }

    // AUTH-01-D: identity comes from a verified session only. The `member_id`
    // cookie and `x-member-id` header are caller-controlled; either previously let
    // any caller create portal invites in another practitioner's name.
    const memberId = await getMemberIdFromRequest(request);

    if (!memberId) {
      return unauthenticatedResponse();
    }

    // Verify practitioner owns this slug
    const practitionerResult = await query(
      `SELECT id, member_id FROM practitioners WHERE slug = $1`,
      [slug]
    );

    let practitionerId: string;

    if (practitionerResult.rows.length === 0) {
      // Fallback: use member_id directly (development mode)
      practitionerId = memberId;
    } else {
      const practitioner = practitionerResult.rows[0];
      if (practitioner.member_id !== memberId) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
      practitionerId = practitioner.id;
    }

    // Verify client belongs to this practitioner
    const clientResult = await query(
      `SELECT id, name, portal_claimed_at FROM practitioner_clients
       WHERE id = $1 AND practitioner_id = $2`,
      [clientId, practitionerId]
    );

    if (clientResult.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const client = clientResult.rows[0];

    // Check if already claimed
    if (client.portal_claimed_at) {
      return NextResponse.json(
        { error: 'Client has already claimed portal access' },
        { status: 409 }
      );
    }

    // Revoke any existing unused invites for this client
    await query(
      `UPDATE client_invites
       SET status = 'revoked'
       WHERE client_id = $1 AND status = 'unused'`,
      [clientId]
    );

    // Generate new invite
    const code = generateInviteCode();
    const codeHash = hashInviteCode(code);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90); // 90 days

    // client_invites.practitioner_id references members(id), not practitioners(id)
    await query(
      `INSERT INTO client_invites (practitioner_id, client_id, code_hash, status, expires_at)
       VALUES ($1, $2, $3, 'unused', $4)`,
      [memberId, clientId, codeHash, expiresAt]
    );

    // Return code ONCE - practitioner must copy it now
    return NextResponse.json({
      code,
      expiresAt: expiresAt.toISOString(),
      clientName: client.name,
    });
  } catch (error) {
    console.error('[Invite Create] Error:', error);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }
}
