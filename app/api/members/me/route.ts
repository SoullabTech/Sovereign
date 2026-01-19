// Server-Truth Identity Endpoint
// Returns canonical member data from the database
// Client caches are expendable; this is the source of truth
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

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
 * Server-truth identity endpoint. Client sends whatever ID it has,
 * server returns canonical member data or signals what to do.
 *
 * Query params:
 *   - id: The member ID from client storage (explorerId, beta_user.id, etc.)
 *   - username: Alternative lookup by username
 *
 * Response codes:
 *   - 200: Member found, returns canonical data (client should sync)
 *   - 400: Invalid request (malformed ID, missing params)
 *   - 401: Auth required (no valid identity provided)
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
    const searchParams = request.nextUrl.searchParams;
    const memberId = searchParams.get('id');
    const username = searchParams.get('username');

    // Need at least one identifier
    if (!memberId && !username) {
      return NextResponse.json(
        {
          error: 'Identity parameter required',
          code: 'MISSING_IDENTITY',
          correlationId,
          action: 'reauth' // Client should prompt for sign-in
        },
        { status: 401, headers }
      );
    }

    // Validate memberId if provided
    if (memberId) {
      // Reject local_* fallback IDs - these should never hit the server
      if (memberId.startsWith('local_')) {
        console.warn(`[/api/members/me] ${correlationId} - Local fallback ID rejected:`, memberId);
        return NextResponse.json(
          {
            error: 'Local fallback ID detected',
            code: 'LOCAL_ID_REJECTED',
            correlationId,
            action: 'reauth',
            reason: 'Client has a local fallback ID. Server-side identity required.'
          },
          { status: 400, headers }
        );
      }

      // Reject malformed UUIDs
      if (!isValidUUID(memberId)) {
        console.warn(`[/api/members/me] ${correlationId} - Invalid UUID rejected:`, memberId);
        return NextResponse.json(
          {
            error: 'Invalid member ID format',
            code: 'INVALID_UUID',
            correlationId,
            action: 'reauth',
            reason: 'Member ID must be a valid UUID.'
          },
          { status: 400, headers }
        );
      }
    }

    // Query database for member
    let result;
    try {
      result = await query(
        `SELECT
          m.id, m.username, m.name, m.preferred_name, m.email,
          m.onboarded, m.onboarding_step, m.created_at, m.last_sign_in,
          ms.circle_tier
        FROM members m
        LEFT JOIN member_settings ms ON m.id = ms.member_id
        WHERE ${memberId ? 'm.id = $1' : 'm.username = $1'}`,
        [memberId || username]
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
      console.info(`[/api/members/me] ${correlationId} - Member not found:`, memberId || username);
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
      action: 'sync', // Client should update local cache with this data
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
