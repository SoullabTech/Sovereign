/**
 * WebAuthn Registration Options
 *
 * POST /api/auth/webauthn/register/options
 *
 * Generates registration options for enrolling a new passkey.
 * Requires authenticated session.
 */

export const dynamic = 'force-static'

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { createRegistrationOptions } from '@/lib/auth/webauthnServer';
import { query } from '@/lib/db/postgres';
import { logAuthEvent } from '@/lib/security/authAudit';

export async function POST(request: NextRequest) {
  try {
    // Require authenticated session
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get member info
    const memberResult = await query(
      'SELECT id, username, name, preferred_name FROM members WHERE id = $1',
      [session.memberId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const member = memberResult.rows[0];
    const displayName = member.preferred_name || member.name || member.username;

    // Generate registration options
    const options = await createRegistrationOptions(
      member.id,
      member.username,
      displayName
    );

    await logAuthEvent({
      action: 'webauthn_register',
      memberId: member.id,
      result: 'success',
      metadata: { step: 'options_generated' }
    }, request);

    return NextResponse.json(options);

  } catch (error) {
    console.error('[WebAuthn] Registration options error:', error);
    return NextResponse.json(
      { error: 'Failed to generate registration options' },
      { status: 500 }
    );
  }
}
