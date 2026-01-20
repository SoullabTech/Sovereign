// Server-Truth Identity Endpoint
// Returns canonical member data from the database
// Client caches are expendable; this is the source of truth
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getSessionFromRequest } from '@/lib/auth/serverSessions';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

// Generate correlation ID for request tracking
function generateCorrelationId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
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
  const headers = {
    'X-Request-ID': correlationId,
    'X-Correlation-ID': correlationId,
  };

  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true }, { headers });
  }

  try {
    // Get identity from session cookie only - server decides who you are
    const session = await getSessionFromRequest(request);
    const memberId = session?.memberId ?? null;

    if (!memberId) {
      return NextResponse.json(
        {
          error: 'Session required',
          code: 'NO_SESSION',
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
