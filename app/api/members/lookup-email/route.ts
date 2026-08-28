/**
 * POST /api/members/lookup-email
 *
 * Returns existence + web-passkey capability for a given email, to an
 * UNAUTHENTICATED caller. That is deliberate — the sign-in surface must decide
 * what to offer before anyone is identified — and it is the whole disclosure
 * budget. Two booleans, nothing else.
 *
 * It previously also returned `name` (preferred or given) and `username`, so a
 * caller who knew an address could harvest the person behind it. Nothing
 * consumed them: the only caller is the sign-in surface, and the `/begin`
 * branch named in this comment had stopped calling the route entirely. The
 * header claimed "never returns sensitive data" while returning a member's
 * name — the claim is now true rather than aspirational.
 *
 * Anything added here is disclosed to anyone who can guess an email. Rate
 * limiting below bounds volume; it does not bound what one request reveals.
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
      `SELECT has_webauthn FROM members WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      hasWebauthn: result.rows[0].has_webauthn === true,
    });

  } catch (err) {
    console.error('[lookup-email]', err);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
