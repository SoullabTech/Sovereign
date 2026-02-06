/**
 * Verify Portal Passcode API
 * POST /api/practitioners/verify-passcode
 *
 * Validates portal access passcodes and grants access to Pro Portals.
 * Beta testers with SOULLAB-* passcodes automatically have access.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getAuthenticatedMember } from '@/lib/practitioner/auth';

export const dynamic = 'force-dynamic';

// Valid portal passcode prefixes
const VALID_PASSCODE_PREFIXES = ['PORTAL-', 'SOULLAB-', 'PRO-'];

export async function POST(request: NextRequest) {
  try {
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { passcode } = body;

    if (!passcode || typeof passcode !== 'string') {
      return NextResponse.json({ error: 'Passcode is required' }, { status: 400 });
    }

    const cleanPasscode = passcode.trim().toUpperCase();

    // Check if it's a valid passcode format
    const hasValidPrefix = VALID_PASSCODE_PREFIXES.some(prefix =>
      cleanPasscode.startsWith(prefix)
    );

    if (!hasValidPrefix) {
      return NextResponse.json({ error: 'Invalid passcode format' }, { status: 400 });
    }

    // Check if this is a beta tester passcode (SOULLAB-*)
    // Beta testers automatically get portal access
    if (cleanPasscode.startsWith('SOULLAB-')) {
      // Verify the passcode exists in members table
      const memberCheck = await query(
        'SELECT id FROM members WHERE passkey = $1',
        [cleanPasscode]
      );

      if (memberCheck.rows.length > 0) {
        // Grant portal access to the member
        await query(
          `UPDATE members
           SET portal_access = true, portal_access_granted_at = NOW()
           WHERE id = $1`,
          [member.id]
        );

        return NextResponse.json({
          success: true,
          message: 'Beta tester access granted',
          accessLevel: 'beta'
        });
      }
    }

    // Check if it's a dedicated portal passcode (PORTAL-* or PRO-*)
    const passcodeCheck = await query(
      `SELECT id, redeemed_at, expires_at
       FROM portal_passcodes
       WHERE passcode = $1`,
      [cleanPasscode]
    );

    if (passcodeCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid passcode' }, { status: 400 });
    }

    const passcodeRecord = passcodeCheck.rows[0];

    // Check if already redeemed
    if (passcodeRecord.redeemed_at) {
      return NextResponse.json({ error: 'This passcode has already been used' }, { status: 400 });
    }

    // Check if expired
    if (passcodeRecord.expires_at && new Date(passcodeRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This passcode has expired' }, { status: 400 });
    }

    // Redeem the passcode and grant access
    await query(
      `UPDATE portal_passcodes
       SET redeemed_at = NOW(), redeemed_by_member_id = $2
       WHERE id = $1`,
      [passcodeRecord.id, member.id]
    );

    await query(
      `UPDATE members
       SET portal_access = true, portal_access_granted_at = NOW()
       WHERE id = $1`,
      [member.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Portal access granted',
      accessLevel: 'pro'
    });

  } catch (error: any) {
    console.error('Portal passcode verification error:', error);

    // Handle case where portal_passcodes table doesn't exist
    if (error.message?.includes('portal_passcodes') || error.message?.includes('portal_access')) {
      // Fallback: grant access if member has SOULLAB- passcode
      try {
        const member = await getAuthenticatedMember(request);
        if (member) {
          const memberCheck = await query(
            'SELECT passkey FROM members WHERE id = $1',
            [member.id]
          );

          if (memberCheck.rows.length > 0 && memberCheck.rows[0].passkey?.startsWith('SOULLAB-')) {
            return NextResponse.json({
              success: true,
              message: 'Beta tester access granted',
              accessLevel: 'beta'
            });
          }
        }
      } catch {
        // Ignore inner error
      }
    }

    return NextResponse.json({ error: 'Failed to verify passcode' }, { status: 500 });
  }
}
