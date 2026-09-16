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
import { resolveAdmission } from '@/lib/auth/passkeyAdmission';
import { checkRateLimit, getClientIP, buildRateLimitHeaders } from '@/lib/auth/rateLimiter';

// =============================================================================
// CORS HELPERS - Required for Capacitor/mobile app cross-origin requests
// =============================================================================

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  Pragma: 'no-cache',
} as const;

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

export async function POST(request: NextRequest) {
  const corsHeaders = { ...getCorsHeaders(request), ...NO_STORE };

  const limit = await checkRateLimit(getClientIP(request), 'ip', 'members/check');
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Unable to check passkey. Please try again.' },
      { status: 429, headers: { ...corsHeaders, ...buildRateLimitHeaders(limit) } },
    );
  }

  try {
    const { passkey } = await request.json();

    if (!passkey) {
      return NextResponse.json(
        { error: 'Passkey required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const normalizedPasskey = passkey.toUpperCase().trim();

    /* ONE admission predicate, shared with /api/members/register. This route
       must never answer "valid invite" for something register would refuse:
       that divergence is exactly what let a format-only match through. */
    const admission = await resolveAdmission(normalizedPasskey);

    if (admission.kind === 'existing_member') {
      const member = admission.member as Record<string, unknown>;
      console.log('[MEMBERS] Existing member matched');
      return NextResponse.json({
        exists: true,
        isInvite: false,
        onboarded: Boolean(member.onboarded),
      }, { headers: corsHeaders });
    }

    if (admission.kind === 'admit') {
      console.log('[MEMBERS] Valid invite matched');
      return NextResponse.json({
        exists: false,
        isInvite: true,
        inviteStatus: 'valid',
      }, { headers: corsHeaders });
    }

    /* A refusal is deliberately uniform. These legacy credentials have lost
       secret standing, so possession is not authority to learn invite state. */
    console.log(`[MEMBERS] Passkey refused (${admission.reason})`);
    return NextResponse.json({
      exists: false,
      isInvite: false,
      error: 'Passkey not recognized',
    }, { headers: corsHeaders });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MEMBERS] Check passkey error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to check passkey. Please try again.' },
      { status: 500, headers: { ...getCorsHeaders(request), ...NO_STORE } }
    );
  }
}
