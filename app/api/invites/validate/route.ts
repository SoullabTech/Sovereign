export const dynamic = 'force-dynamic';

/**
 * Validate Invite API
 *
 * POST /api/invites/validate
 *
 * Checks if an invite code (passkey) is valid and not yet redeemed.
 * Used by the landing page to verify invite codes before allowing entry.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Invite code is required' },
        { status: 400 }
      );
    }

    // Normalize the code (uppercase, trim)
    const normalizedCode = code.toUpperCase().trim();

    // Check if this is a valid invite passkey
    const inviteResult = await query(
      `SELECT i.id, i.passkey, i.status, i.expires_at, i.intended_name,
              i.blessing_text, m.name as inviter_name
       FROM invites i
       LEFT JOIN members m ON i.created_by = m.id
       WHERE i.passkey = $1`,
      [normalizedCode]
    );

    if (inviteResult.rows.length === 0) {
      // Also check if it's an admin passkey (SOULLAB-*, MAIA-*, etc.)
      const adminPrefixes = ['SOULLAB-', 'MAIA-', 'PIONEER-', 'FOUNDING-'];
      const isAdminPasskey = adminPrefixes.some(prefix =>
        normalizedCode.startsWith(prefix)
      );

      if (isAdminPasskey) {
        // Check if this admin passkey has already been used
        const existingMember = await query(
          'SELECT id FROM members WHERE passkey = $1',
          [normalizedCode]
        );

        if (existingMember.rows.length > 0) {
          return NextResponse.json({
            valid: false,
            error: 'This passkey has already been used. Try signing in instead.',
            alreadyRedeemed: true,
          });
        }

        // Valid admin passkey
        return NextResponse.json({
          valid: true,
          passkey: normalizedCode,
          type: 'admin',
          message: 'Welcome, pioneer.',
        });
      }

      return NextResponse.json({
        valid: false,
        error: 'Invite code not found',
      });
    }

    const invite = inviteResult.rows[0];

    // Check if already redeemed
    if (invite.status === 'redeemed') {
      return NextResponse.json({
        valid: false,
        error: 'This invite has already been used',
        alreadyRedeemed: true,
      });
    }

    // Check if expired
    if (invite.status === 'expired' ||
        (invite.expires_at && new Date(invite.expires_at) < new Date())) {
      return NextResponse.json({
        valid: false,
        error: 'This invite has expired',
        expired: true,
      });
    }

    // Check if revoked
    if (invite.status === 'revoked') {
      return NextResponse.json({
        valid: false,
        error: 'This invite is no longer valid',
      });
    }

    // Valid invite - include the blessing
    return NextResponse.json({
      valid: true,
      passkey: invite.passkey,
      type: 'invite',
      intendedFor: invite.intended_name || undefined,
      invitedBy: invite.inviter_name || undefined,
      blessing: invite.blessing_text || undefined,
      message: invite.inviter_name
        ? `${invite.inviter_name} invited you to MAIA.`
        : 'You have been invited to MAIA.',
    });

  } catch (error) {
    console.error('[Invites] Validate error:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate invite' },
      { status: 500 }
    );
  }
}
