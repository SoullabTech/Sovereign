// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic'

/**
 * Check if passkey exists in database
 * Used to determine if user is new or returning
 *
 * ROBUST DESIGN:
 * - Works even if invites table doesn't exist
 * - SOULLAB-* passkeys always allowed (admin passkeys)
 * - Falls back gracefully on missing columns
 * - Detailed error logging for debugging
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { resolveAdmission, admissionRefusalMessage } from '@/lib/auth/passkeyAdmission';

// =============================================================================
// CORS HELPERS - Required for Capacitor/mobile app cross-origin requests
// =============================================================================

const ALLOWED_ORIGINS = new Set([
  'https://soullab.life',
  'http://localhost:5173',
  'http://localhost:3000',
  'capacitor://localhost',
  'ionic://localhost',
  'null', // WebKit sometimes reports this for file-like/Capacitor contexts
]);

function getCorsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin');

  let allowedOrigin: string;
  if (origin === 'null') {
    allowedOrigin = 'null';
  } else if (origin && ALLOWED_ORIGINS.has(origin)) {
    allowedOrigin = origin;
  } else {
    allowedOrigin = 'https://soullab.life';
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, X-Member-Id',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

/**
 * CORS Preflight Handler
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

// Safe query that returns empty result on table/column errors
async function safeQuery(sql: string, params: unknown[] = []): Promise<{ rows: Record<string, unknown>[]; error?: string }> {
  try {
    const result = await query(sql, params);
    return { rows: result.rows };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Log but don't throw - return empty result
    if (message.includes('does not exist') || message.includes('column')) {
      console.warn(`[MEMBERS] Query skipped (missing table/column): ${message}`);
      return { rows: [], error: message };
    }
    throw error; // Re-throw unexpected errors
  }
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const { passkey } = await request.json();

    if (!passkey) {
      return NextResponse.json(
        { error: 'Passkey required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const normalizedPasskey = passkey.toUpperCase().trim();
    console.log(`[MEMBERS] Check passkey: ${normalizedPasskey}`);

    /* ONE admission predicate, shared with /api/members/register. This route
       must never answer "valid invite" for something register would refuse:
       that divergence is exactly what let a format-only match through. */
    const admission = await resolveAdmission(normalizedPasskey);

    if (admission.kind === 'existing_member') {
      const member = admission.member as Record<string, unknown>;
      console.log(`[MEMBERS] Found existing member: ${member.username}`);
      return NextResponse.json({
        exists: true,
        isInvite: false,
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step,
        username: member.username,
        name: member.name,
      }, { headers: corsHeaders });
    }

    if (admission.kind === 'admit') {
      console.log(`[MEMBERS] Valid invite found for: ${normalizedPasskey}`);
      return NextResponse.json({
        exists: false,
        isInvite: true,
        inviteStatus: 'valid',
        inviterName: admission.inviterName,
        inviterUsername: admission.inviterUsername,
      }, { headers: corsHeaders });
    }

    /* Refused. `isInvite` reports whether an invite record was FOUND, so a
       used or expired invite can still be explained to the person holding it —
       but nothing here reports `inviteStatus: 'valid'`. */
    const foundAnInvite =
      admission.reason === 'invite_not_pending' || admission.reason === 'invite_expired';
    console.log(`[MEMBERS] Passkey refused (${admission.reason}): ${normalizedPasskey}`);
    return NextResponse.json({
      exists: false,
      isInvite: foundAnInvite,
      ...(admission.reason === 'invite_not_pending' ? { inviteStatus: admission.status } : {}),
      ...(admission.reason === 'invite_expired' ? { inviteStatus: 'expired' } : {}),
      error: admissionRefusalMessage(admission.reason),
    }, { headers: corsHeaders });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MEMBERS] Check passkey error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to check passkey. Please try again.' },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
