/**
 * WebAuthn Authentication Options
 *
 * POST /api/auth/webauthn/authenticate/options
 *
 * Generates authentication options for signing in with a passkey.
 * Can be called without authentication (for signin flow).
 */

export const dynamic = 'force-static'

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticationOptions } from '@/lib/auth/webauthnServer';
import { query } from '@/lib/db/postgres';
import { checkRateLimit, getClientIP, buildRateLimitHeaders } from '@/lib/auth/rateLimiter';

const ENDPOINT = '/api/auth/webauthn/authenticate/options';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  try {
    // Rate limit
    const rateLimitResult = await checkRateLimit(clientIP, 'ip', ENDPOINT);
    if (!rateLimitResult.allowed) {
      const headers = buildRateLimitHeaders(rateLimitResult);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { username } = body as { username?: string };

    let memberId: string | undefined;

    // If username provided, look up member
    if (username) {
      const memberResult = await query(
        `SELECT id FROM members WHERE LOWER(username) = LOWER($1) AND has_webauthn = TRUE`,
        [username]
      );

      if (memberResult.rows.length > 0) {
        memberId = memberResult.rows[0].id;
      }
    }

    // Generate authentication options
    // If no memberId, will generate options for discoverable credentials (resident keys)
    const { options, challengeKey } = await createAuthenticationOptions(memberId);

    return NextResponse.json({
      ...options,
      challengeKey,
      // Include a hint for the client about which flow to use
      discoverable: !memberId
    });

  } catch (error) {
    console.error('[WebAuthn] Authentication options error:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication options' },
      { status: 500 }
    );
  }
}
