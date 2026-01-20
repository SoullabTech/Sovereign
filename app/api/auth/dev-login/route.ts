/**
 * Development-Only Login Endpoint
 *
 * GET /api/auth/dev-login?member=<id-or-username>
 *
 * Creates a session for a specified member without requiring credentials.
 * ONLY available in development mode (NODE_ENV !== 'production').
 *
 * Query params:
 * - member: Member ID (UUID) or username (optional, defaults to first member found)
 * - redirect: URL to redirect to after login (optional, defaults to /maia)
 *
 * Examples:
 * - /api/auth/dev-login                    → Login as first member, redirect to /maia
 * - /api/auth/dev-login?member=kelly       → Login as username "kelly"
 * - /api/auth/dev-login?member=<uuid>      → Login as specific member ID
 * - /api/auth/dev-login?redirect=/stellium → Login and redirect to /stellium
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { createSession, setSessionCookie } from '@/lib/auth/serverSessions';
import { cookies } from 'next/headers';

// Map database tiers to access matrix tiers
function mapTierToAccessMatrix(dbTier: string | null): 'free' | 'personal' | 'pro' {
  if (!dbTier) return 'personal'; // Default to personal for dev
  const t = dbTier.toLowerCase();
  if (t === 'pro' || t === 'premium' || t === 'vip') return 'pro';
  if (t === 'free' || t === 'guest') return 'free';
  // 'explorer', 'personal', 'member', etc. → personal
  return 'personal';
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  // CRITICAL: Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is disabled in production' },
      { status: 403 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const memberParam = searchParams.get('member');
  const redirectTo = searchParams.get('redirect') || '/maia';

  try {
    let member;

    if (memberParam) {
      // Try to find by ID or username
      const isUUID = UUID_REGEX.test(memberParam);

      if (isUUID) {
        const result = await query(
          `SELECT m.id, m.username, m.name, m.preferred_name, m.email, ms.circle_tier
           FROM members m
           LEFT JOIN member_settings ms ON m.id = ms.member_id
           WHERE m.id = $1`,
          [memberParam]
        );
        member = result.rows[0];
      } else {
        const result = await query(
          `SELECT m.id, m.username, m.name, m.preferred_name, m.email, ms.circle_tier
           FROM members m
           LEFT JOIN member_settings ms ON m.id = ms.member_id
           WHERE m.username = $1`,
          [memberParam]
        );
        member = result.rows[0];
      }

      if (!member) {
        return NextResponse.json(
          { error: `Member not found: ${memberParam}` },
          { status: 404 }
        );
      }
    } else {
      // No member specified - get the first one (usually the dev's account)
      const result = await query(
        `SELECT m.id, m.username, m.name, m.preferred_name, m.email, ms.circle_tier
         FROM members m
         LEFT JOIN member_settings ms ON m.id = ms.member_id
         ORDER BY m.created_at ASC LIMIT 1`
      );
      member = result.rows[0];

      if (!member) {
        return NextResponse.json(
          { error: 'No members found in database. Create a member first via /signin or /test-elemental.' },
          { status: 404 }
        );
      }
    }

    // Create session
    const session = await createSession({
      memberId: member.id,
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'dev-login'
    });

    // Set session cookie
    await setSessionCookie(session.sessionToken, session.expiresAt);

    // Update last sign in
    await query(
      'UPDATE members SET last_sign_in = NOW() WHERE id = $1',
      [member.id]
    );

    console.log(`[Dev Login] Created session for ${member.username || member.id}`);

    // Check if client wants JSON response (API call) or redirect (browser)
    const acceptHeader = request.headers.get('accept') || '';
    if (acceptHeader.includes('application/json')) {
      return NextResponse.json({
        success: true,
        member: {
          id: member.id,
          username: member.username,
          name: member.name,
          preferredName: member.preferred_name
        },
        session: {
          expiresAt: session.expiresAt.toISOString()
        },
        redirect: redirectTo
      });
    }

    // Browser request - redirect
    return NextResponse.redirect(new URL(redirectTo, request.url));

  } catch (error) {
    console.error('[Dev Login] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create dev session', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST variant for programmatic use (e.g., test scripts)
 */
export async function POST(request: NextRequest) {
  // CRITICAL: Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is disabled in production' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { memberId, username } = body;

    let member;

    if (memberId) {
      const result = await query(
        'SELECT id, username, name, preferred_name, email FROM members WHERE id = $1',
        [memberId]
      );
      member = result.rows[0];
    } else if (username) {
      const result = await query(
        'SELECT id, username, name, preferred_name, email FROM members WHERE username = $1',
        [username]
      );
      member = result.rows[0];
    } else {
      // Default to first member
      const result = await query(
        'SELECT id, username, name, preferred_name, email FROM members ORDER BY created_at ASC LIMIT 1'
      );
      member = result.rows[0];
    }

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Create session
    const session = await createSession({
      memberId: member.id,
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'dev-login-api'
    });

    // Set session cookie
    await setSessionCookie(session.sessionToken, session.expiresAt);

    // Update last sign in
    await query(
      'UPDATE members SET last_sign_in = NOW() WHERE id = $1',
      [member.id]
    );

    console.log(`[Dev Login] Created session for ${member.username || member.id}`);

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        preferredName: member.preferred_name
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt.toISOString()
      }
    });

  } catch (error) {
    console.error('[Dev Login] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create dev session', details: String(error) },
      { status: 500 }
    );
  }
}
