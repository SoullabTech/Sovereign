/**
 * Verify Portal Passcode API
 * POST /api/practitioners/verify-passcode
 *
 * Validates dedicated portal passcodes and grants access to Pro Portals.
 * Governed beta-tester membership is itself the beta entitlement; legacy
 * SOULLAB member/invite passkeys are not portal authority.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, describeDbError } from '@/lib/db/postgres';
import { getAuthenticatedMember } from '@/lib/practitioner/auth';

export const dynamic = 'force-dynamic';

// Valid portal passcode prefixes
const VALID_PASSCODE_PREFIXES = ['PORTAL-', 'PRO-'];

export async function POST(request: NextRequest) {
  try {
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Beta standing is a governed property of the authenticated member, not a
    // credential they possess. Preserve the historical beta entitlement while
    // retiring SOULLAB passkeys from portal authority entirely.
    const betaMembership = await query(
      `SELECT 1 FROM ops_contacts
       WHERE member_id = $1 AND contact_type = 'beta_tester' AND deleted_at IS NULL
       LIMIT 1`,
      [member.id]
    );
    if (betaMembership.rows.length > 0) {
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

    const body = await request.json();
    const { passcode } = body;
    if (!passcode || typeof passcode !== 'string') {
      return NextResponse.json({ error: 'Passcode is required' }, { status: 400 });
    }
    const cleanPasscode = passcode.trim().toUpperCase();
    const hasValidPrefix = VALID_PASSCODE_PREFIXES.some(prefix => cleanPasscode.startsWith(prefix));
    if (!hasValidPrefix) {
      return NextResponse.json({ error: 'Invalid passcode format' }, { status: 400 });
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

  } catch (error: unknown) {
    console.error('Portal passcode verification error:', describeDbError(error));
    return NextResponse.json({ error: 'Failed to verify passcode' }, { status: 500 });
  }
}
