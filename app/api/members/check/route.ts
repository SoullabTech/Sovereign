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

// Check if passkey is an admin passkey (always allowed even without invites table)
function isAdminPasskey(passkey: string): boolean {
  const adminPrefixes = ['SOULLAB-', 'MAIA-', 'PIONEER-', 'FOUNDING-'];
  return adminPrefixes.some(prefix => passkey.toUpperCase().startsWith(prefix));
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

    // Check if passkey exists in members table (returning user)
    const memberResult = await safeQuery(
      'SELECT id, username, name, onboarded, onboarding_step FROM members WHERE passkey = $1',
      [normalizedPasskey]
    );

    if (memberResult.rows.length > 0) {
      const member = memberResult.rows[0];
      console.log(`[MEMBERS] Found existing member: ${member.username}`);
      return NextResponse.json({
        exists: true,
        isInvite: false,
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step,
        username: member.username,
        name: member.name
      }, { headers: corsHeaders });
    }

    // Check if this is a valid invite passkey (new user with invite)
    // This query is optional - might fail if invites table doesn't exist
    const inviteResult = await safeQuery(
      `SELECT i.id, i.status, i.expires_at, m.username as inviter_username, m.name as inviter_name
       FROM invites i
       LEFT JOIN members m ON i.created_by = m.id
       WHERE i.passkey = $1`,
      [normalizedPasskey]
    );

    if (!inviteResult.error && inviteResult.rows.length > 0) {
      const invite = inviteResult.rows[0];

      // Check if invite is valid
      if (invite.status !== 'pending') {
        return NextResponse.json({
          exists: false,
          isInvite: true,
          inviteStatus: invite.status,
          error: `This invite has already been ${invite.status}`
        }, { headers: corsHeaders });
      }

      // Check if expired
      if (invite.expires_at && new Date(invite.expires_at as string) < new Date()) {
        return NextResponse.json({
          exists: false,
          isInvite: true,
          inviteStatus: 'expired',
          error: 'This invite has expired'
        }, { headers: corsHeaders });
      }

      // Valid invite - user can register with this passkey
      console.log(`[MEMBERS] Valid invite found for: ${normalizedPasskey}`);
      return NextResponse.json({
        exists: false,
        isInvite: true,
        inviteStatus: 'valid',
        inviterName: invite.inviter_name,
        inviterUsername: invite.inviter_username,
      }, { headers: corsHeaders });
    }

    // If invites table is missing OR no invite found, check if it's an admin passkey
    // Admin passkeys are always allowed for registration
    if (isAdminPasskey(normalizedPasskey)) {
      console.log(`[MEMBERS] Admin passkey allowed: ${normalizedPasskey}`);
      return NextResponse.json({
        exists: false,
        isInvite: true,  // Treat as valid invite
        inviteStatus: 'valid',
        isAdminPasskey: true,
      }, { headers: corsHeaders });
    }

    // Unknown passkey
    console.log(`[MEMBERS] Unknown passkey: ${normalizedPasskey}`);
    return NextResponse.json({
      exists: false,
      isInvite: false,
      error: 'Invalid passkey. Contact support for a valid passkey.'
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
