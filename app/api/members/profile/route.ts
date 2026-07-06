// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

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
  const headers = { 'X-Correlation-ID': correlationId };

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
        console.error(`[Profile API] ${correlationId} - SCHEMA MISMATCH (unapplied migration?):`, dbError);
      } else {
        console.error(`[Profile API] ${correlationId} - Database error:`, dbError);
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
        location: member.birth_location_lat && member.birth_location_lng ? {
          lat: parseFloat(member.birth_location_lat),
          lng: parseFloat(member.birth_location_lng),
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
    console.error(`[Profile API] ${correlationId} - Unexpected error:`, error);
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
  const headers = { 'X-Correlation-ID': correlationId };

  // Get identity from a verified session credential (cookie or x-session-token
  // header) — server decides who you are
  const memberId = await getMemberIdFromRequest(request);

  if (!memberId) {
    return NextResponse.json(
      { error: 'Session required', code: 'NO_SESSION', action: 'signin', correlationId },
      { status: 401, headers }
    );
  }

  // Parse body with error handling
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body', correlationId },
      { status: 400, headers }
    );
  }

  try {
    const { name, preferredName, pronouns, email, bio, timezone, birthData, astrologyConsent } = body;

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
    if (email !== undefined) {
      setClauses.push(`email = $${paramIndex++}`);
      values.push(email);
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
            if (birthData.location.lat !== undefined) {
              setClauses.push(`birth_location_lat = $${paramIndex++}`);
              values.push(birthData.location.lat);
            }
            if (birthData.location.lng !== undefined) {
              setClauses.push(`birth_location_lng = $${paramIndex++}`);
              values.push(birthData.location.lng);
            }
            if (birthData.location.name !== undefined) {
              setClauses.push(`birth_location_name = $${paramIndex++}`);
              values.push(birthData.location.name);
            }
            if (birthData.location.timezone !== undefined) {
              setClauses.push(`birth_timezone = $${paramIndex++}`);
              values.push(birthData.location.timezone);
            }
          }
        }
      }
    }

    // Astrology consent (cross-device persistence for onboarding skip gate)
    if (astrologyConsent !== undefined) {
      const validConsent = ['unknown', 'opted_in', 'declined'];
      if (!validConsent.includes(astrologyConsent)) {
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
        console.error(`[Profile API] ${correlationId} - SCHEMA MISMATCH on update (unapplied migration?):`, dbError);
      } else {
        console.error(`[Profile API] ${correlationId} - Database error on update:`, dbError);
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
    console.error(`[Profile API] ${correlationId} - Unexpected update error:`, error);
    return NextResponse.json(
      { error: 'Internal server error', correlationId },
      { status: 500, headers }
    );
  }
}
