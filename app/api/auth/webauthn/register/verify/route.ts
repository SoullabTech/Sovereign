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

      // Map known errors to diagnostic codes
      let code = 'VERIFICATION_FAILED';
      const err = result.error || '';
      if (err.includes('Challenge expired')) code = 'CHALLENGE_EXPIRED';
      else if (err.includes('not found')) code = 'NOT_FOUND';
      else if (err.includes('save')) code = 'SAVE_FAILED';

      return NextResponse.json(
        { ok: false, code, error: result.error || 'Verification failed' },
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

    // Extract diagnostic code from error
    const errMsg = error instanceof Error ? error.message : String(error);
    let code = 'UNKNOWN';

    if (errMsg.includes('origin')) code = 'ORIGIN_MISMATCH';
    else if (errMsg.includes('RP ID') || errMsg.includes('rpId')) code = 'RPID_MISMATCH';
    else if (errMsg.includes('challenge')) code = 'CHALLENGE_INVALID';
    else if (errMsg.includes('attestation')) code = 'ATTESTATION_FAILED';

    return NextResponse.json(
      {
        ok: false,
        code,
        error: 'Failed to verify registration',
        detail: process.env.NODE_ENV === 'development' ? errMsg : undefined
      },
      { status: 500 }
    );
  }
}
