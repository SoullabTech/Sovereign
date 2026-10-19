export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

/**
 * C0 Class A containment: this historical beta password-setup endpoint
 * accepted a valid session without fresh account-owner reauthentication.
 * The only safe behavior until a separately approved flow exists is refusal.
 * Leave a guarded route for existing desktop and iOS clients.
 */
export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'NO_SESSION' },
        { status: 401 }
      );
    }

    // No password input, member-id claim, device identifier or authenticated
    // session alone authorizes a credential change. No password is read or
    // hashed, and no account or session is changed by this route.
    return NextResponse.json(
      {
        error: 'Password setup from this beta screen is temporarily unavailable. If you know your current password, use Account Settings. Otherwise, contact Soullab support for account assistance.',
        code: 'PASSWORD_SETUP_REQUIRES_REVERIFICATION',
      },
      { status: 403 }
    );
  } catch {
    // Fail closed without logging tokens, passwords, or member identifiers.
    return NextResponse.json(
      { error: 'Password setup unavailable', code: 'PASSWORD_SETUP_UNAVAILABLE' },
      { status: 503 }
    );
  }
}
