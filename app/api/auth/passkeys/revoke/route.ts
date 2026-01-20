/**
 * Revoke Passkey
 *
 * POST /api/auth/passkeys/revoke
 *
 * Removes a passkey from the member's account.
 */

export const dynamic = 'force-static'

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { revokeCredential } from '@/lib/auth/webauthnServer';
import { logAuthEvent } from '@/lib/security/authAudit';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { credentialId } = body;

    if (!credentialId) {
      return NextResponse.json(
        { error: 'Credential ID required' },
        { status: 400 }
      );
    }

    const success = await revokeCredential(credentialId, session.memberId);

    if (!success) {
      return NextResponse.json(
        { error: 'Passkey not found or already revoked' },
        { status: 404 }
      );
    }

    await logAuthEvent({
      action: 'webauthn_register',
      memberId: session.memberId,
      result: 'success',
      metadata: { step: 'credential_revoked', credentialId }
    }, request);

    return NextResponse.json({
      success: true,
      message: 'Passkey removed'
    });

  } catch (error) {
    console.error('[Passkeys] Revoke error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke passkey' },
      { status: 500 }
    );
  }
}
