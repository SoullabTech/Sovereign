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
import { logAuthEvent, hashCredential } from '@/lib/security/authAudit';
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
        // The session established who is acting before the ceremony was
        // attempted, so the actor is known even though the attempt failed.
        actorId: session.memberId,
        memberId: session.memberId,
        result: 'failure',
        errorMessage: result.error,
        metadata: { step: 'verification_failed' }
      }, request);

      // Map known errors to diagnostic codes (case-insensitive)
      let code = 'VERIFICATION_FAILED';
      const err = (result.error || '').toLowerCase();
      if (err.includes('challenge') && err.includes('expire')) code = 'CHALLENGE_EXPIRED';
      else if (err.includes('challenge') && err.includes('not found')) code = 'CHALLENGE_NOT_FOUND';
      else if (err.includes('save') || err.includes('store')) code = 'SAVE_FAILED';

      return NextResponse.json(
        { ok: false, code, error: result.error || 'Verification failed' },
        { status: 400 }
      );
    }

    await logAuthEvent({
      action: 'webauthn_register',
      actorId: session.memberId,
      memberId: session.memberId,
      result: 'success',
      // Hashed, not raw. A credential id is credential material; the audit
      // module's own contract says hash or redact, and hashCredential exists
      // for exactly this. A hash still correlates rows for one credential
      // across register / use / revoke without storing the identifier itself.
      metadata: { step: 'credential_saved', credential_hash: hashCredential(result.credentialId ?? '') }
    }, request);

    return NextResponse.json({
      success: true,
      credentialId: result.credentialId,
      message: 'Passkey registered successfully'
    });

  } catch (error) {
    console.error('[WebAuthn] Registration verify error:', error);

    // Extract diagnostic code from error (case-insensitive)
    const errMsg = error instanceof Error ? error.message : String(error);
    const errLower = errMsg.toLowerCase();
    let code = 'UNKNOWN';
    let status = 500; // Default to server error

    // Client errors (400) - user/config issues
    if (errLower.includes('origin')) {
      code = 'ORIGIN_MISMATCH';
      status = 400;
    } else if (errLower.includes('rp id') || errLower.includes('rpid') || errLower.includes('relying party')) {
      code = 'RPID_MISMATCH';
      status = 400;
    } else if (errLower.includes('challenge')) {
      code = 'CHALLENGE_INVALID';
      status = 400;
    } else if (errLower.includes('attestation')) {
      code = 'ATTESTATION_FAILED';
      status = 400;
    }

    return NextResponse.json(
      {
        ok: false,
        code,
        error: 'Failed to verify registration',
        detail: process.env.NODE_ENV === 'development' ? errMsg : undefined
      },
      { status }
    );
  }
}
