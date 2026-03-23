/**
 * CLAIM PORTAL INVITE
 *
 * Client submits: invite code + email + password
 * On success: sets portal_email, portal_password_hash, portal_claimed_at
 *             marks invite as claimed
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { hashInviteCode, hashPassword, isValidInviteCodeFormat } from '@/lib/portal/invites';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));

    const code = (body?.code || '').trim().toUpperCase();
    const email = (body?.email || '').trim().toLowerCase();
    const password = body?.password || '';

    // Basic validation
    if (!code || !email || !password) {
      return NextResponse.json(
        { error: 'Code, email, and password are required' },
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

    // Look up the invite by hash
    const codeHash = hashInviteCode(code);

    const inviteResult = await query(
      `SELECT i.id, i.client_id, i.practitioner_id, i.status, i.expires_at,
              c.portal_claimed_at, c.email as booking_email
       FROM client_invites i
       JOIN practitioner_clients c ON c.id = i.client_id
       WHERE i.code_hash = $1
       LIMIT 1`,
      [codeHash]
    );

    if (inviteResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 404 }
      );
    }

    const invite = inviteResult.rows[0];

    // Already claimed
    if (invite.portal_claimed_at) {
      return NextResponse.json(
        { error: 'already_claimed', message: 'Portal access has already been set up. Please sign in.' },
        { status: 409 }
      );
    }

    // Expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'expired', message: 'This invite link has expired. Please contact your practitioner for a new one.' },
        { status: 410 }
      );
    }

    // Used or revoked
    if (invite.status !== 'unused') {
      return NextResponse.json(
        { error: 'invalid', message: 'This invite link is no longer valid. Please contact your practitioner.' },
        { status: 410 }
      );
    }

    // Email must match booking email (prevents claiming with wrong identity)
    if (invite.booking_email && email !== invite.booking_email.toLowerCase()) {
      return NextResponse.json(
        { error: 'email_mismatch', message: 'That email does not match our records for this invite.' },
        { status: 422 }
      );
    }

    // All checks passed — claim it
    const passwordHash = hashPassword(password);

    await query(
      `UPDATE practitioner_clients
       SET portal_email = $1,
           portal_password_hash = $2,
           portal_claimed_at = NOW()
       WHERE id = $3`,
      [email, passwordHash, invite.client_id]
    );

    await query(
      `UPDATE client_invites
       SET status = 'claimed', claimed_at = NOW()
       WHERE id = $1`,
      [invite.id]
    );

    // Wire into comms spine: create identity + thread (fire-and-forget)
    query(
      `INSERT INTO comms_identities (owner_type, owner_id, channel_type, address, verified, is_primary, status)
       VALUES ('client', $1, 'in_app', $2, true, true, 'active')
       ON CONFLICT DO NOTHING`,
      [invite.client_id, email]
    ).catch(err => console.error('[Claim Invite] Failed to create comms identity:', err));

    query(
      `INSERT INTO comms_threads (domain, thread_type, participants, practitioner_id, client_id, status)
       VALUES ('clinical', 'between_session', $1::jsonb, $2, $3, 'active')
       ON CONFLICT DO NOTHING`,
      [
        JSON.stringify({ practitioner_id: invite.practitioner_id, client_id: invite.client_id }),
        invite.practitioner_id,
        invite.client_id,
      ]
    ).catch(err => console.error('[Claim Invite] Failed to create comms thread:', err));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Claim Invite] Error:', error);
    return NextResponse.json({ error: 'Failed to claim invite' }, { status: 500 });
  }
}
