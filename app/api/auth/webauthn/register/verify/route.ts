/**
 * WebAuthn Registration Verification
 *
 * POST /api/auth/webauthn/register/verify
 *
 * Verifies the registration response and saves the new credential.
 * Requires authenticated session.
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { verifyRegistration } from '@/lib/auth/webauthnServer';
import { logAuthEvent } from '@/lib/security/authAudit';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';

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

    const body = await request.json();
    const { response, deviceName } = body as {
      response: RegistrationResponseJSON;
      deviceName?: string;
    };

    if (!response) {
      return NextResponse.json(
        { error: 'Registration response required' },
        { status: 400 }
      );
    }

    // Verify registration
    const result = await verifyRegistration(
      session.memberId,
      response,
      deviceName
    );

    if (!result.verified) {
      await logAuthEvent({
        action: 'webauthn_register',
        memberId: session.memberId,
        result: 'failure',
        errorMessage: result.error,
        metadata: { step: 'verification_failed' }
      }, request);

      return NextResponse.json(
        { error: result.error || 'Verification failed' },
        { status: 400 }
      );
    }

    await logAuthEvent({
      action: 'webauthn_register',
      memberId: session.memberId,
      result: 'success',
      metadata: { step: 'credential_saved', credentialId: result.credentialId }
    }, request);

    return NextResponse.json({
      success: true,
      credentialId: result.credentialId,
      message: 'Passkey registered successfully'
    });

  } catch (error) {
    console.error('[WebAuthn] Registration verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify registration' },
      { status: 500 }
    );
  }
}
