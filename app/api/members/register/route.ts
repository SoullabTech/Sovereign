// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic';

/**
 * Register new member
 * Called after passkey validation during onboarding
 *
 * ROBUST DESIGN:
 * - Works even if invites table doesn't exist
 * - SOULLAB-* passkeys always accepted (admin passkeys)
 * - Falls back gracefully on missing columns
 * - Detailed error logging for debugging
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { resolveAdmission, admissionRefusalMessage } from '@/lib/auth/passkeyAdmission';
import { createSession } from '@/lib/auth/serverSessions';
import { hashPassword } from '@/lib/auth/passwordUtils';
import {
  checkRateLimit,
  getClientIP,
  buildRateLimitHeaders
} from '@/lib/auth/rateLimiter';

const ENDPOINT = '/api/members/register';

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
async function safeQuery(sql: string, params: unknown[] = []): Promise<{ rows: Record<string, unknown>[]; rowCount: number | null; error?: string }> {
  try {
    const result = await query(sql, params);
    return { rows: result.rows, rowCount: result.rowCount };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Log but don't throw - return empty result
    if (message.includes('does not exist') || message.includes('column')) {
      console.warn(`[MEMBERS] Query skipped (missing table/column): ${message}`);
      return { rows: [], rowCount: 0, error: message };
    }
    throw error; // Re-throw unexpected errors
  }
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  const clientIP = getClientIP(request);

  try {
    // Rate limit: 3 registrations per 10 minutes per IP
    const rateLimitResult = await checkRateLimit(clientIP, 'ip', ENDPOINT);
    if (!rateLimitResult.allowed) {
      const headers = { ...corsHeaders, ...buildRateLimitHeaders(rateLimitResult) };
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    const { passkey, username, password, name, email: rawEmail, preferredName, birthDate } = body;
    const email = rawEmail ? rawEmail.toLowerCase().trim() : null;

    console.log(`[MEMBERS] Registration attempt: passkey=${passkey}, username=${username}`);

    if (!passkey || !username || !password) {
      console.log('[MEMBERS] Missing required fields');
      return NextResponse.json(
        { error: 'Passkey, username, and password required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const normalizedPasskey = passkey.toUpperCase().trim();
    // Preserve user's chosen casing for display, trim whitespace only
    const cleanUsername = username.trim();

    /* ADMISSION. ONE predicate, shared with /api/members/check.

       Before this repair the gate here was `isAdminPasskey()` — a FORMAT check
       standing in for authorization — and the invite lookup that followed was
       advisory, with a comment saying an absent invite was "fine". Any string
       beginning SOULLAB-/MAIA-/PIONEER-/FOUNDING- therefore registered with no
       invitation at all. A real pending invite is now REQUIRED. */
    const admission = await resolveAdmission(normalizedPasskey);

    if (admission.kind === 'existing_member') {
      console.log(`[MEMBERS] Passkey already registered: ${normalizedPasskey}`);
      return NextResponse.json(
        { error: 'This passkey has already been used. If this is you, try signing in instead.' },
        { status: 409, headers: corsHeaders }
      );
    }

    if (admission.kind === 'refused') {
      console.log(`[MEMBERS] Registration refused (${admission.reason}): ${normalizedPasskey}`);
      /* An unreadable invite table is an outage on our side, not the caller's
         error — everything else is a bad or spent credential. */
      const status = admission.reason === 'invite_lookup_unavailable' ? 503 : 400;
      return NextResponse.json(
        { error: admissionRefusalMessage(admission.reason) },
        { status, headers: corsHeaders }
      );
    }

    /* The invite that admits this member; redeemed below, exactly once. */
    const inviteId: string = admission.inviteId;

    // Check if username already taken (case-insensitive)
    const existingUsername = await safeQuery(
      'SELECT id FROM members WHERE LOWER(username) = LOWER($1)',
      [cleanUsername]
    );

    if (existingUsername.rows.length > 0) {
      console.log(`[MEMBERS] Username already taken: ${cleanUsername}`);
      return NextResponse.json(
        { error: 'Username already taken. Please choose a different one.' },
        { status: 409, headers: corsHeaders }
      );
    }

    // Hash password with bcrypt
    const passwordHash = await hashPassword(password);
    const displayName = name || username;

    // Try full insert first (with all columns)
    // birth_date triggers auto-computation of developmental_tier via DB trigger
    let result = await safeQuery(
      `INSERT INTO members (
         passkey, username, password_hash, name, email, onboarding_step, birth_date
       )
       VALUES ($1, $2, $3, $4, $5, 'test-elemental', $6)
       RETURNING id, username, name, onboarded, onboarding_step, created_at, developmental_tier, guardian_required`,
      [normalizedPasskey, cleanUsername, passwordHash, displayName, email, birthDate || null]
    );

    if (result.error) {
      console.error(`[MEMBERS] Insert failed: ${result.error}`);
      return NextResponse.json(
        { error: 'Registration failed. Please try again or contact support.' },
        { status: 500, headers: corsHeaders }
      );
    }

    if (result.rows.length === 0) {
      console.error('[MEMBERS] Insert returned no rows');
      return NextResponse.json(
        { error: 'Registration failed. Please try again.' },
        { status: 500, headers: corsHeaders }
      );
    }

    const member = result.rows[0];
    console.log(`[MEMBERS] Successfully registered: ${cleanUsername} (${member.id})`);

    /* Redeem the invite that admitted this member. `inviteId` is no longer
       optional: registration cannot reach here without one. The conditional
       WHERE still prevents double redemption under a race. */
    {
      const updateResult = await safeQuery(
        `UPDATE invites
         SET status = 'redeemed', redeemed_by = $1, redeemed_at = NOW()
         WHERE id = $2 AND status = 'pending'`,
        [member.id, inviteId]
      );

      if (!updateResult.error && updateResult.rowCount === 1) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[MEMBERS] Invite redeemed: ${inviteId}`);
        }
      } else if (!updateResult.error && updateResult.rowCount === 0) {
        // Race condition: invite was already redeemed between check and update
        // Member was still created, but invite might have been used by another request
        // Always warn (even in prod) - this is a "should rarely happen" sentinel
        console.warn(`[MEMBERS] Race sentinel [redeem]: invite=${inviteId.slice(0, 8)}... state changed before update`);
      }
    }

    // Mint a real server session immediately — the member is authenticated on
    // registration, never reliant on localStorage beta_user or a forgeable
    // x-member-id (closes the sessionless-onboarding generator). Pattern mirrors
    // /api/members/register-email. Non-fatal: the member row already exists, so a
    // session failure degrades to "no session" rather than failing registration.
    const memberPayload = {
      id: member.id,
      username: member.username,
      name: member.name,
      onboarded: member.onboarded,
      onboardingStep: member.onboarding_step,
      developmentalTier: member.developmental_tier || null,
      guardianRequired: member.guardian_required || false,
    };

    try {
      const userAgent = request.headers.get('user-agent') || '';
      const session = await createSession({ memberId: String(member.id), ipAddress: clientIP, userAgent });
      const response = NextResponse.json({
        success: true,
        member: memberPayload,
        // Token in the body for the Capacitor/iOS x-session-token path: this route
        // is CORS-open to capacitor://localhost, and native clients can't read the
        // httpOnly maia_session cookie cross-origin.
        session: { token: session.sessionToken, expiresAt: session.expiresAt.toISOString() },
      }, { headers: corsHeaders });
      const cookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        expires: session.expiresAt,
      };
      response.cookies.set('maia_session', session.sessionToken, cookieOpts); // REAL token — never 'active'
      response.cookies.set('maia_member_id', String(member.id), cookieOpts);
      response.cookies.set('maia_tier', 'free', cookieOpts);
      response.cookies.set('maia_roles', JSON.stringify(['member']), cookieOpts);
      return response;
    } catch (sessionErr) {
      // Degrade gracefully: member is created; respond without a session. The
      // member can obtain one by signing in. (Rare — createSession only needs the DB.)
      console.error('[MEMBERS] Session creation failed (non-fatal):', sessionErr);
      return NextResponse.json({ success: true, member: memberPayload }, { headers: corsHeaders });
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : '';
    console.error(`[MEMBERS] Register error: ${message}`);
    console.error(`[MEMBERS] Stack: ${stack}`);

    return NextResponse.json(
      { error: 'Registration failed. Please try again or contact support.' },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
