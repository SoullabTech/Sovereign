// Server-Truth Identity Endpoint
// Returns canonical member data from the database
// Client caches are expendable; this is the source of truth
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

// Generate correlation ID for request tracking
function generateCorrelationId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

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
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
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

/**
 * GET /api/members/me
 *
 * Server-truth identity endpoint. Returns canonical member data from session.
 *
 * Authentication:
 *   - Session cookie only (HttpOnly, secure)
 *   - Server decides who you are - no client-provided identity
 *
 * Response codes:
 *   - 200: Member found, returns canonical data (client should sync)
 *   - 401: Auth required (no valid session)
 *   - 404: Member not found (client should clear and re-auth)
 *   - 503: Database unavailable (client should retry later)
 */
export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const corsHeaders = getCorsHeaders(request);
  const headers = {
    'X-Request-ID': correlationId,
    'X-Correlation-ID': correlationId,
    ...corsHeaders,
  };

  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true }, { headers });
  }

  try {
    // AUTH-01-D: identity comes ONLY from a verified credential.
    //
    // Two fallbacks were removed here, both of which let a caller name any member:
    //   - `x-member-id` header, accepted on nothing more than well-formed UUID shape
    //     (not even an existence check), and
    //   - `?id=<uuid>` query param, which made this route readable by URL alone.
    // Member UUIDs are exposed to clients, so neither was ever evidence of identity.
    //
    // Mobile/Capacitor is NOT losing its path: getMemberIdFromRequest accepts the
    // `x-session-token` header that apiFetch already sends from localStorage when
    // iOS blocks cross-origin cookies, and validates it against auth_sessions.
    const memberId = await getMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json(
        {
          error: 'Identity required',
          code: 'NO_IDENTITY',
          correlationId,
          action: 'signin'
        },
        { status: 401, headers }
      );
    }

    // Query database for member
    let result;
    try {
      result = await query(
        `SELECT
          m.id, m.username, m.name, m.preferred_name, m.email,
          m.onboarded, m.onboarding_step, m.created_at, m.last_sign_in,
          m.tier, m.roles,
          ms.circle_tier, m.has_webauthn, m.preferred_auth_method
        FROM members m
        LEFT JOIN member_settings ms ON m.id = ms.member_id
        WHERE m.id = $1`,
        [memberId]
      );
    } catch (dbError) {
      // Database unavailable - client should retry later
      console.error(`[/api/members/me] ${correlationId} - Database error:`, dbError);
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          code: 'DB_UNAVAILABLE',
          correlationId,
          action: 'retry',
          retryAfter: 5000 // Suggest retry in 5 seconds
        },
        { status: 503, headers: { ...headers, 'Retry-After': '5' } }
      );
    }

    // Member not found
    if (result.rows.length === 0) {
      console.info(`[/api/members/me] ${correlationId} - Member not found:`, memberId);
      return NextResponse.json(
        {
          error: 'Member not found',
          code: 'NOT_FOUND',
          correlationId,
          action: 'clear_and_reauth',
          reason: 'No member exists with this identity. Client should clear local cache and re-authenticate.'
        },
        { status: 404, headers }
      );
    }

    const member = result.rows[0];

    // Return canonical server-truth data
    // Client MUST sync local storage with this data
    return NextResponse.json({
      success: true,
      correlationId,
      action: 'sync',
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        preferredName: member.preferred_name,
        email: member.email,
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step,
        circleTier: member.circle_tier || 'explorer',
        tier: member.tier || 'free',
        roles: member.roles || ['member'],
        createdAt: member.created_at,
        lastSignIn: member.last_sign_in,
        hasWebauthn: member.has_webauthn || false,
        preferredAuthMethod: member.preferred_auth_method || 'password',
      }
    }, { headers });

  } catch (error) {
    // Unexpected error - this is a real bug, log for investigation
    const correlationId = generateCorrelationId();
    console.error(`[/api/members/me] ${correlationId} - Unexpected error:`, error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        correlationId,
        action: 'retry'
      },
      { status: 500, headers: { 'X-Correlation-ID': correlationId } }
    );
  }
}
