/**
 * CLAIM INVITE API
 *
 * Client redeems their invite code and creates portal credentials.
 * One-time operation - code becomes invalid after claim.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { hashInviteCode, hashPassword, isValidInviteCodeFormat } from '@/lib/portal/invites';
import { createClientSession } from '@/lib/auth/clientSession';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json().catch(() => ({}));

    const code = (body?.code || '').trim().toUpperCase();
    const email = (body?.email || '').trim().toLowerCase();
    const password = body?.password || '';

    // Validate inputs
    if (!code || !password) {
      return NextResponse.json(
        { error: 'Invite code and password are required' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required for account recovery' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!isValidInviteCodeFormat(code)) {
      return NextResponse.json(
        { error: 'Invalid invite code format' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const codeHash = hashInviteCode(code);

    // Find the invite
    const inviteResult = await query(
      `SELECT i.id, i.client_id, i.practitioner_id, i.status, i.expires_at,
              p.slug as practitioner_slug
       FROM client_invites i
       LEFT JOIN practitioners p ON i.practitioner_id = p.id OR i.practitioner_id = p.member_id
       WHERE i.code_hash = $1
       LIMIT 1`,
      [codeHash]
    );

    const invite = inviteResult.rows[0];

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 401 });
    }

    // Check status
    if (invite.status === 'claimed') {
      return NextResponse.json(
        { error: 'This invite code has already been used' },
        { status: 409 }
      );
    }

    if (invite.status === 'revoked') {
      return NextResponse.json(
        { error: 'This invite code has been revoked' },
        { status: 410 }
      );
    }

    if (invite.status !== 'unused') {
      return NextResponse.json(
        { error: 'This invite code is no longer valid' },
        { status: 410 }
      );
    }

    // Check expiration
    if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
      // Update status to expired
      await query(
        `UPDATE client_invites SET status = 'expired' WHERE id = $1`,
        [invite.id]
      );
      return NextResponse.json(
        { error: 'This invite code has expired' },
        { status: 410 }
      );
    }

    // Check if email is already used by another client of this practitioner
    const existingResult = await query(
      `SELECT id FROM practitioner_clients
       WHERE practitioner_id = $1 AND portal_email = $2 AND id != $3`,
      [invite.practitioner_id, email, invite.client_id]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'This email is already associated with another account' },
        { status: 409 }
      );
    }

    // Hash password and update in transaction
    const pwHash = hashPassword(password);

    try {
      await transaction(async (client) => {
        // Set portal credentials on client record
        await client.query(
          `UPDATE practitioner_clients
           SET portal_email = $1,
               portal_password_hash = $2,
               portal_claimed_at = NOW()
           WHERE id = $3`,
          [email, pwHash, invite.client_id]
        );

        // Mark invite as claimed
        await client.query(
          `UPDATE client_invites
           SET status = 'claimed',
               claimed_at = NOW()
           WHERE id = $1`,
          [invite.id]
        );
      });
    } catch (txError: any) {
      // Handle unique constraint violation (race condition)
      if (txError?.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already associated with another account' },
          { status: 409 }
        );
      }
      throw txError;
    }

    // Create session for the client
    const res = NextResponse.json({
      ok: true,
      message: 'Portal access claimed successfully',
    });

    await createClientSession(res, {
      portalSlug: slug,
      clientId: invite.client_id,
      practitionerId: invite.practitioner_id,
    });

    return res;
  } catch (error) {
    console.error('[Claim] Error:', error);
    return NextResponse.json({ error: 'Failed to claim invite' }, { status: 500 });
  }
}
