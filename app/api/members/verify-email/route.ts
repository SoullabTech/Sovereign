export const dynamic = 'force-dynamic';

/**
 * Email verification — atomic, one-time consumption of the CURRENT token.
 *
 * The previous SELECT(token) → UPDATE(id) could verify the wrong email if
 * another verification token was issued or the member changed their address
 * between those independent statements. The update MUST predicate on the
 * still-live token and its issuance timestamp. The new recovery proof trigger
 * observes precisely this token-consumption transition in the SAME row lock.
 *
 * This is a Class A source-only candidate. It must not ship independently
 * from its reviewed migration and backward-compatibility checks.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

const EMAIL_PROOF_TOKEN = /^[0-9a-f]{64}$/i;

async function consumeEmailVerification(token: string): Promise<{ username: string | null } | null> {
  if (!EMAIL_PROOF_TOKEN.test(token)) return null;
  const result = await query<{ username: string | null }>(
    `UPDATE members
       SET email_verified = TRUE,
           email_verified_at = clock_timestamp(),
           email_verification_token = NULL
     WHERE email_verification_token = $1
       AND email IS NOT NULL AND btrim(email) <> ''
       AND email_verification_sent_at IS NOT NULL
       AND email_verification_sent_at <= clock_timestamp()
       AND email_verification_sent_at > clock_timestamp() - interval '24 hours'
     RETURNING username`,
    [token],
  );
  return result.rows[0] ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const token = typeof body === 'object' && body !== null && !Array.isArray(body)
      ? (body as Record<string, unknown>).token : null;
    if (typeof token !== 'string' || !EMAIL_PROOF_TOKEN.test(token)) {
      return NextResponse.json({ error: 'Invalid or expired verification link' }, { status: 400 });
    }
    const verified = await consumeEmailVerification(token);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid or expired verification link' }, { status: 400 });
    }
    // Do not log a recipient address, raw member id or token.
    return NextResponse.json({
      success: true, message: 'Email verified successfully',
      username: verified.username,
    });
  } catch {
    console.error('[VerifyEmail] Unable to consume verification token');
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  const token = request.nextUrl.searchParams.get('token');
  if (!token || !EMAIL_PROOF_TOKEN.test(token)) {
    return NextResponse.redirect(new URL('/signin?error=invalid_token', request.url));
  }
  // Legacy links that point directly at this GET endpoint must NOT silently
  // consume a verification token. Redirect to a click-to-confirm client page.
  // The token is removed from the HTTP query and kept in the fragment.
  const landing = new URL('/verify-email', request.url);
  landing.hash = `token=${token}`;
  return NextResponse.redirect(landing, {
    headers: { 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store' },
  });
}
