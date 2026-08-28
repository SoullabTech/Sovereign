/**
 * POST /api/members/lookup-email
 *
 * Returns existence + auth capabilities for a given email.
 * Used by /begin to branch: new user / biometric / password.
 * Never returns sensitive data (no hashes, no IDs in response).
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { checkRateLimit, getClientIP, buildRateLimitHeaders } from '@/lib/auth/rateLimiter';

const ENDPOINT = '/api/members/lookup-email';

export async function POST(request: NextRequest) {
  try {
    // This route answers "does this address exist, and can it use a passkey" to
    // an unauthenticated caller — an account-existence oracle by design, needed
    // to branch the sign-in surface. It was unmetered. AUTH-BIOMETRIC-01B makes
    // the sign-in page call it on every email entry, so the volume it invites
    // goes up; a limit is part of that change rather than a later cleanup.
    const rate = await checkRateLimit(getClientIP(request), 'ip', ENDPOINT);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many lookups. Please try again shortly.' },
        { status: 429, headers: buildRateLimitHeaders(rate) }
      );
    }

    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const result = await query(
      `SELECT username, name, preferred_name, has_webauthn
       FROM members WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ exists: false });
    }

    const m = result.rows[0];
    return NextResponse.json({
      exists: true,
      hasWebauthn: m.has_webauthn || false,
      name: m.preferred_name || m.name || '',
      username: m.username,
    });

  } catch (err) {
    console.error('[lookup-email]', err);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
