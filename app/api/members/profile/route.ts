// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest, getMemberIdFromSessionToken } from '@/lib/auth/getMemberFromRequest';
import { normalizeBirthCoordinates } from '@/lib/astrology/birthCoordinates';
import { checkYouthAdmission } from '@/lib/youth/youthAdmissionGate';
import { AuthOriginError, requireSameOriginAuthMutation } from '@/lib/auth/returnDestination';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

function isInvalidMemberId(id: string): { invalid: true; reason: string } | false {
  if (id.startsWith('local_')) {
    return { invalid: true, reason: 'Local fallback ID detected - user needs to re-authenticate' };
  }
  if (!isValidUUID(id)) {
    return { invalid: true, reason: 'Invalid UUID format' };
  }
  return false;
}

// Generate correlation ID for request tracking
function generateCorrelationId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

// Check if error is a database connection error
function isDbConnectionError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('connection') ||
      msg.includes('econnrefused') ||
      msg.includes('timeout') ||
      msg.includes('socket') ||
      msg.includes('pg_hba.conf')
    );
  }
  return false;
}

// Check if error is a schema mismatch (missing column/table = unapplied migration)
function isSchemaError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    // PostgreSQL error codes: 42703 = undefined_column, 42P01 = undefined_table
    const code = (error as { code?: string }).code;
    if (code === '42703' || code === '42P01') return true;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes('column') && msg.includes('does not exist') ||
           msg.includes('relation') && msg.includes('does not exist');
  }
  return false;
}

/**
 * Determine the requested public web origin for the member-profile endpoint.
 *
 * Host is only a route-target constraint. It is NOT evidence that traffic
 * actually arrived through Caddy: other containers may reach Next directly
 * and can supply Host / X-Forwarded-Proto / X-Forwarded-Host themselves.
 *
 * The separate session SQL resolver establishes member authority; a matching
 * browser Origin (or narrowly allowed Origin-less requests) is a CSRF check,
 * not an alternative identity proof. The edge must still be hardened.
 *
 * Production allows only the two fixed HTTPS origins. Localhost is available
 * exclusively in the explicit development runtime for fictional tests.
 */
const APPROVED_PROFILE_WEB_ORIGINS = new Set([
  'https://soullab.life',
  'https://maia.soullab.life',
]);

function expectedProfileWebOrigin(request: NextRequest): string | null {
  try {
    const incomingUrl = new URL(request.url);
    const host = request.headers.get('host');
    const forwardedProto = request.headers.get('x-forwarded-proto');

    // Forwarded fields have NO positive authority: mismatches may veto a
    // request, but their presence cannot authenticate its network source.
    const localDevelopmentTarget =
      process.env.NODE_ENV === 'development' &&
      incomingUrl.protocol === 'http:' &&
      (incomingUrl.hostname === 'localhost' ||
       incomingUrl.hostname === '127.0.0.1') &&
      (!host || host === incomingUrl.host);
    if (forwardedProto !== null &&
        forwardedProto !== 'https' &&
        !(localDevelopmentTarget &&
          forwardedProto === 'http')) return null;

    if (host) {
      const expected = 'https://' + host;
      if (APPROVED_PROFILE_WEB_ORIGINS.has(expected)) {
        // An explicit *different* public URL and Host must never be silently
        // reconciled through an attacker-supplied forwarding assertion.
        if (APPROVED_PROFILE_WEB_ORIGINS.has(incomingUrl.origin) &&
            incomingUrl.origin !== expected) return null;
        return expected;
      }
    } else if (APPROVED_PROFILE_WEB_ORIGINS.has(incomingUrl.origin)) {
      // Native NextRequest constructions without a Host header can still
      // carry the exact public URL; internal URL + absent Host cannot pass.
      return incomingUrl.origin;
    }

    if (process.env.NODE_ENV === 'development' &&
        incomingUrl.protocol === 'http:' &&
        (incomingUrl.hostname === 'localhost' ||
         incomingUrl.hostname === '127.0.0.1') &&
        (!host || host === incomingUrl.host) &&
        (forwardedProto === null || forwardedProto === 'http')) {
      return incomingUrl.origin;
    }
  } catch {
    // Invalid target URL/Host does not establish authority.
  }
  return null;
}

/**
 * Enforce exact Origin for cookie-authenticated mutation, separately from
 * member identity validation. No wildcard CORS, trust of arbitrary
 * x-forwarded-host, body memberId, or custom native WebView origin is created.
 */
async function profileWriteOriginAllowed(request: NextRequest, authenticatedMemberId: string): Promise<boolean> {
  const site = request.headers.get('sec-fetch-site');
  if (site === 'cross-site') return false;
  const expected = expectedProfileWebOrigin(request);
  if (!expected) return false;

  const origin = request.headers.get('origin');
  if (origin !== null) {
    try {
      // Origin is serialized as scheme://host[:port], with no path/query.
      const parsed = new URL(origin);
      return parsed.origin === expected && origin === expected;
    } catch {
      return false;
    }
  }

  // Some legitimate same-origin browsers omit Origin on state-changing
  // requests. Fetch Metadata is generated by the browser; a cookie still
  // requires the server's verified auth session and the approved target host.
  if (site === 'same-origin') return true;

  // An Origin-less native request needs a server-verified header bearer.
  // The installed Capacitor networking layer may also attach a cookie to the
  // same request. Cookie presence does not make an independently VALID bearer
  // less trustworthy, but a mere header string is never proof of that bearer.
  //
  // If a session cookie accompanies the request, resolve the header token
  // independently and require it to name the SAME member as the authenticated
  // cookie/header session. Reject forged, expired, revoked and cross-member
  // tokens. Otherwise the main verified session resolver already authenticated
  // the only eligible header token (cookie-less branch).
  const cookie = request.headers.get('cookie') || '';
  const hasSessionCookie = /(?:^|;)\s*maia_session\s*=/.test(cookie);
  const sessionToken = request.headers.get('x-session-token');
  if (typeof sessionToken !== 'string' || sessionToken.trim().length === 0) {
    return false;
  }
  if (!hasSessionCookie) return true;

  // SQL auth_sessions is the authority, not Host, X-Forwarded-Proto or the
  // presence of a Cookie header. Never record either credential in logs.
  // A transient second-lookup failure must refuse the write before its body
  // is read. Do not expose a token or database error in the response.
  try {
    const independentlyVerifiedHeaderMemberId =
      await getMemberIdFromSessionToken(sessionToken);
    return independentlyVerifiedHeaderMemberId !== null &&
      independentlyVerifiedHeaderMemberId === authenticatedMemberId;
  } catch {
    return false;
  }
}

/**
 * Reject contradictory session credentials before either profile read or write.
 * Header-only native callers remain supported. A stale Cookie accompanying a
 * valid header is a conflicted request, not permission to switch identities.
 */
async function profileCredentialPairAllowed(request: NextRequest, memberId: string): Promise<boolean> {
  const cookieToken = request.cookies.get('maia_session')?.value;
  const headerToken = request.headers.get('x-session-token');
  if (cookieToken === undefined || headerToken === null) return true;
  try {
    const [cookieMember, headerMember] = await Promise.all([
      getMemberIdFromSessionToken(cookieToken),
      getMemberIdFromSessionToken(headerToken),
    ]);
    return cookieMember !== null && cookieMember === headerMember && cookieMember === memberId;
  } catch {
    return false;
  }
}

/**
 * GET /api/members/profile
 * Get member profile from session
 *
 * Authentication:
 *   - Verified session credential only: maia_session cookie (web) or
 *     x-session-token header (Safari/iOS where cookies are blocked)
 *   - Server decides who you are - no bare client-provided identity
 *
 * Never returns 500 for expected failures:
 * - 401: Auth required
 * - 404: Member not found
 * - 503: Database unavailable (with retry hint)
 */
export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const headers = {
    'X-Correlation-ID': correlationId,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  };

  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true }, { headers });
  }

  try {
    // Get identity from a verified session credential (cookie or x-session-token
    // header) — server decides who you are
    const memberId = await getMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json(
        { error: 'Session required', code: 'NO_SESSION', action: 'signin', correlationId },
        { status: 401, headers }
      );
    }

    if (!(await profileCredentialPairAllowed(request, memberId))) {
      return NextResponse.json(
        { error: 'Profile session credentials disagreed', code: 'PROFILE_SESSION_CONFLICT', correlationId },
        { status: 403, headers },
      );
    }

    // Query database with explicit error handling
    let result;
    try {
      result = await query(
        `SELECT
          m.id, m.username, m.name, m.preferred_name, m.email, m.passkey,
          m.avatar_url, m.bio, m.timezone, m.pronouns,
          m.onboarded, m.onboarding_step, m.created_at, m.last_sign_in,
          m.birth_date, m.birth_time, m.birth_location_lat, m.birth_location_lng,
          m.birth_location_name, m.birth_timezone,
          m.astrology_consent,
          m.nostr_pubkey, m.nostr_registered_at,
          m.cm_environment_enabled, m.cm_active_layer, m.cm_layer_weights,
          ms.circle_tier, ms.circle_amount, ms.circle_joined_at
        FROM members m
        LEFT JOIN member_settings ms ON m.id = ms.member_id
        WHERE m.id = $1`,
        [memberId]
      );
    } catch (dbError) {
      if (isSchemaError(dbError)) {
        console.error(`[Profile API] ${correlationId} PROFILE_GET_SCHEMA_MISMATCH`);
      } else {
        console.error(`[Profile API] ${correlationId} PROFILE_GET_DATABASE_FAILED`);
      }
      const retryAfter = isDbConnectionError(dbError) ? '5' : '10';
      return NextResponse.json(
        {
          error: 'Database temporarily unavailable',
          correlationId,
          retryAfter: parseInt(retryAfter) * 1000,
        },
        { status: 503, headers: { ...headers, 'Retry-After': retryAfter } }
      );
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found', correlationId },
        { status: 404, headers }
      );
    }

    const member = result.rows[0];

    // Mask passkey for security (show first 8 chars)
    const maskedPasskey = member.passkey
      ? `${member.passkey.substring(0, 8)}${'*'.repeat(Math.max(0, member.passkey.length - 8))}`
      : null;

    // Normalize empty strings to null — prevents '' from poisoning downstream fallback chains
    const preferredName =
      typeof member.preferred_name === 'string' && member.preferred_name.trim().length > 0
        ? member.preferred_name.trim()
        : null;
    const pronouns =
      typeof member.pronouns === 'string' && member.pronouns.trim().length > 0
        ? member.pronouns.trim()
        : null;

    // Database numeric values may arrive as numbers or decimal strings.
    // Validate both coordinates together; missing values are not zero.
    const birthCoordinates = normalizeBirthCoordinates(
      member.birth_location_lat,
      member.birth_location_lng,
    );

    return NextResponse.json({
      id: member.id,
      username: member.username,
      name: member.name,
      preferredName,
      pronouns,
      email: member.email,
      passkey: maskedPasskey,
      avatarUrl: member.avatar_url,
      bio: member.bio,
      timezone: member.timezone,
      onboarded: member.onboarded,
      onboardingStep: member.onboarding_step,
      createdAt: member.created_at,
      lastSignIn: member.last_sign_in,
      membership: {
        tier: member.circle_tier || 'explorer',
        amount: member.circle_amount || 0,
        joinedAt: member.circle_joined_at,
      },
      // Birth data for astrology
      // Format date as YYYY-MM-DD for HTML date input compatibility
      birthData: member.birth_date ? {
        date: typeof member.birth_date === 'string'
          ? member.birth_date.split('T')[0]
          : new Date(member.birth_date).toISOString().split('T')[0],
        time: member.birth_time,
        location: birthCoordinates ? {
          lat: birthCoordinates.lat,
          lng: birthCoordinates.lng,
          name: member.birth_location_name,
          timezone: member.birth_timezone,
        } : null,
      } : null,
      // Astrology consent — cross-device persistence for the BirthDataStep skip gate
      astrologyConsent: (member.astrology_consent ?? 'unknown') as 'unknown' | 'opted_in' | 'declined',
      // Nostr sovereign messaging identity (public key only — private key never stored)
      nostrPubkey: member.nostr_pubkey ?? null,
      nostrRegisteredAt: member.nostr_registered_at ?? null,
      // CM Practitioner Environment
      cmEnvironmentEnabled: member.cm_environment_enabled ?? false,
      cmActiveLayer: member.cm_active_layer ?? 'weave',
      cmLayerWeights: member.cm_layer_weights ?? null,
      correlationId,
    }, { headers });

  } catch (error) {
    // This is a real unexpected error (code bug) - still include correlation ID
    console.error(`[Profile API] ${correlationId} PROFILE_GET_UNEXPECTED_FAILURE`);
    return NextResponse.json(
      { error: 'Internal server error', correlationId },
      { status: 500, headers }
    );
  }
}

/**
 * PUT /api/members/profile
 * Update member profile
 *
 * Authentication:
 *   - Verified session credential only: maia_session cookie (web) or
 *     x-session-token header (Safari/iOS where cookies are blocked)
 *   - Server decides who you are - no bare client-provided identity
 *
 * Never returns 500 for expected failures:
 * - 400: Bad request (missing/invalid params, malformed JSON)
 * - 401: Auth required (no valid session)
 * - 404: Member not found
 * - 503: Database unavailable
 */
export async function PUT(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const headers = {
    'X-Correlation-ID': correlationId,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  };

  try {
    requireSameOriginAuthMutation(request);
  } catch (error) {
    if (error instanceof AuthOriginError) {
      return NextResponse.json(
        { error: 'Request origin refused', code: error.code, correlationId },
        { status: 403, headers },
      );
    }
    return NextResponse.json(
      { error: 'Request validation unavailable', correlationId },
      { status: 503, headers },
    );
  }

  // Cookie/header credentials remain the sole authority. A profile update
  // cannot use browser storage or a body member ID to choose another member.
  let memberId: string | null;
  try {
    memberId = await getMemberIdFromRequest(request);
  } catch {
    return NextResponse.json(
      { error: 'Session verification unavailable', correlationId },
      { status: 503, headers },
    );
  }

  if (!memberId) {
    return NextResponse.json(
      { error: 'Session required', code: 'NO_SESSION', action: 'signin', correlationId },
      { status: 401, headers }
    );
  }

  if (!(await profileCredentialPairAllowed(request, memberId))) {
    return NextResponse.json(
      { error: 'Profile session credentials disagreed', code: 'PROFILE_SESSION_CONFLICT', correlationId },
      { status: 403, headers },
    );
  }

  // Refuse cross-origin or unproven cookie-based writes BEFORE reading or
  // applying member-controlled profile fields. Do not echo sensitive inputs.
  if (!(await profileWriteOriginAllowed(request, memberId))) {
    return NextResponse.json(
      { error: 'Profile update origin was not verified',
        code: 'PROFILE_WRITE_ORIGIN_REFUSED', correlationId },
      { status: 403, headers },
    );
  }

  // Parse body with error handling
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body', correlationId },
      { status: 400, headers }
    );
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { error: 'Object body required', correlationId },
      { status: 400, headers },
    );
  }
  const input = body as Record<string, unknown>;
  for (const claim of [input.memberId, input.id]) {
    if (claim !== undefined && typeof claim !== 'string') {
      return NextResponse.json(
        { error: 'Invalid member claim', correlationId },
        { status: 400, headers },
      );
    }
    if (typeof claim === 'string' && claim !== memberId) {
      return NextResponse.json(
        { error: 'Member claim does not match authenticated session', correlationId },
        { status: 403, headers },
      );
    }
  }
  // Email is an authentication identity. This general profile route must not
  // bypass the verified email proof/session contract by accepting a new one.
  if (input.email !== undefined) {
    return NextResponse.json(
      { error: 'Email changes require a verified email-change flow', code: 'EMAIL_CHANGE_REQUIRES_VERIFICATION', correlationId },
      { status: 400, headers },
    );
  }
  if (input.birthData !== undefined && input.birthData !== null &&
      (typeof input.birthData !== 'object' || Array.isArray(input.birthData))) {
    return NextResponse.json({ error: 'Invalid birth data', correlationId }, { status: 400, headers });
  }
  const birthData = input.birthData as Record<string, unknown> | null | undefined;
  if (birthData?.location !== undefined && birthData.location !== null &&
      (typeof birthData.location !== 'object' || Array.isArray(birthData.location))) {
    return NextResponse.json({ error: 'Invalid birth location', correlationId }, { status: 400, headers });
  }
  const birthLocation = birthData?.location as Record<string, unknown> | null | undefined;

  try {
    const { name, preferredName, pronouns, bio, timezone, astrologyConsent } = input;

    // TEEN-CLOSED-01: a birth date that computes to under 18 is refused here too,
    // or a later edit would recompute an adult account into a youth tier.
    if (birthData && typeof birthData === 'object' && birthData.date !== undefined) {
      const youthGate = checkYouthAdmission(birthData.date);
      if (!youthGate.ok) {
        return NextResponse.json(
          { error: youthGate.error, code: youthGate.code, correlationId },
          { status: youthGate.status, headers }
        );
      }
    }

    // Build SET clauses dynamically
    const setClauses: string[] = [];
    const values: unknown[] = [memberId];
    let paramIndex = 2;

    if (name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (preferredName !== undefined) {
      setClauses.push(`preferred_name = $${paramIndex++}`);
      values.push(preferredName);
    }
    if (pronouns !== undefined) {
      // Normalize empty/whitespace to NULL so the prompt-layer doesn't get '' as pronouns
      const trimmed = typeof pronouns === 'string' ? pronouns.trim() : '';
      setClauses.push(`pronouns = $${paramIndex++}`);
      values.push(trimmed.length > 0 ? trimmed : null);
    }
    if (bio !== undefined) {
      setClauses.push(`bio = $${paramIndex++}`);
      values.push(bio);
    }
    if (timezone !== undefined) {
      setClauses.push(`timezone = $${paramIndex++}`);
      values.push(timezone);
    }

    // Birth data fields
    if (birthData !== undefined) {
      if (birthData === null) {
        // Clear birth data
        setClauses.push(`birth_date = NULL, birth_time = NULL, birth_location_lat = NULL, birth_location_lng = NULL, birth_location_name = NULL, birth_timezone = NULL`);
      } else {
        if (birthData.date !== undefined) {
          setClauses.push(`birth_date = $${paramIndex++}`);
          values.push(birthData.date);
        }
        if (birthData.time !== undefined) {
          setClauses.push(`birth_time = $${paramIndex++}`);
          values.push(birthData.time);
        }
        if (birthData.location !== undefined) {
          if (birthData.location === null) {
            setClauses.push(`birth_location_lat = NULL, birth_location_lng = NULL, birth_location_name = NULL, birth_timezone = NULL`);
          } else {
            if (birthLocation?.lat !== undefined) {
              setClauses.push(`birth_location_lat = $${paramIndex++}`);
              values.push(birthLocation?.lat);
            }
            if (birthLocation?.lng !== undefined) {
              setClauses.push(`birth_location_lng = $${paramIndex++}`);
              values.push(birthLocation?.lng);
            }
            if (birthLocation?.name !== undefined) {
              setClauses.push(`birth_location_name = $${paramIndex++}`);
              values.push(birthLocation?.name);
            }
            if (birthLocation?.timezone !== undefined) {
              setClauses.push(`birth_timezone = $${paramIndex++}`);
              values.push(birthLocation?.timezone);
            }
          }
        }
      }
    }

    // Astrology consent (cross-device persistence for onboarding skip gate)
    if (astrologyConsent !== undefined) {
      const validConsent = ['unknown', 'opted_in', 'declined'];
      if (typeof astrologyConsent !== 'string' || !validConsent.includes(astrologyConsent)) {
        return NextResponse.json(
          { error: `Invalid astrologyConsent value — must be one of: ${validConsent.join(', ')}`, correlationId },
          { status: 400, headers }
        );
      }
      setClauses.push(`astrology_consent = $${paramIndex++}`);
      values.push(astrologyConsent);
    }

    if (setClauses.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update', correlationId },
        { status: 400, headers }
      );
    }

    // Update members table with explicit error handling
    let result;
    try {
      result = await query(
        `UPDATE members
         SET ${setClauses.join(', ')}
         WHERE id = $1
         RETURNING id, username, name, preferred_name, pronouns, email, bio, timezone,
                   birth_date, birth_time, birth_location_lat, birth_location_lng,
                   birth_location_name, birth_timezone, astrology_consent`,
        values
      );
    } catch (dbError) {
      if (isSchemaError(dbError)) {
        console.error(`[Profile API] ${correlationId} PROFILE_PUT_SCHEMA_MISMATCH`);
      } else {
        console.error(`[Profile API] ${correlationId} PROFILE_PUT_DATABASE_FAILED`);
      }
      const retryAfter = isDbConnectionError(dbError) ? '5' : '10';
      return NextResponse.json(
        {
          error: 'Database temporarily unavailable',
          correlationId,
          retryAfter: parseInt(retryAfter) * 1000,
        },
        { status: 503, headers: { ...headers, 'Retry-After': retryAfter } }
      );
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found', correlationId },
        { status: 404, headers }
      );
    }

    return NextResponse.json({
      success: true,
      profile: result.rows[0],
      correlationId,
    }, { headers });

  } catch (error) {
    console.error(`[Profile API] ${correlationId} PROFILE_PUT_UNEXPECTED_FAILURE`);
    return NextResponse.json(
      { error: 'Internal server error', correlationId },
      { status: 500, headers }
    );
  }
}
