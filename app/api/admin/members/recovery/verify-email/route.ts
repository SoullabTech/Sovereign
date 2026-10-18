/**
 * CLASS A / SOURCE-ONLY / DEFAULT-OFF — founder-initiated re-verification.
 *
 * Sends only to the current, server-read member email, by approved managed
 * SMTP. Never accepts an operator-supplied destination or returns the token.
 * This endpoint is separate from the public registration verifier; it cannot
 * be reached by shared-admin-password login or an unverified member-ID claim.
 */
import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin/adminAuth';
import { transaction, query } from '@/lib/db/postgres';
import { checkRateLimit, getClientIP } from '@/lib/auth/rateLimiter';
import { sendEmail, SENDERS } from '@/lib/email/sendEmail';
import { approvedVerificationSmtp, acceptedVerificationSmtp } from '@/lib/email/approvedVerificationSmtp';
import { secureRecoveryOrigin } from '@/lib/admin/memberRecovery';

export const dynamic = 'force-dynamic';

const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const ENDPOINT = 'admin/members/recovery/verify-email';

function reply(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  });
}

type Target = {
  id: string;
  email: string | null;
  email_verified: boolean;
  recovery_email_verification_id: string | null;
  email_verification_sent_at: Date | null;
};
type Result =
  | { kind: 'issued'; email: string }
  | { kind: 'not_found' | 'no_email' | 'already_verified' | 'cooldown' | 'founder_revoked' };

export async function POST(req: NextRequest) {
  if (process.env.MEMBER_ACCESS_RECOVERY_ENABLED !== '1') {
    return reply({ error: 'Member Access recovery has not been enabled' }, 503);
  }
  if (!secureRecoveryOrigin(req.headers.get('origin'))) {
    return reply({ error: 'Origin not authorized' }, 403);
  }

  const founder = await checkAdminAuth(req, ['founder'], 'POST /api/admin/members/recovery/verify-email');
  if (!founder.authed) return reply({ error: 'Founder authorization required' }, 401);
  if (founder.via !== 'member' || !founder.memberId) {
    return reply({ error: 'A verified founder member session is required' }, 403);
  }
  const verifiedToken = req.headers.get('x-session-token') ?? req.cookies.get('maia_session')?.value ?? null;
  if (!verifiedToken) return reply({ error: 'A verified founder member session is required' }, 403);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return reply({ error: 'Invalid request' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return reply({ error: 'Invalid request' }, 400);
  }
  const fields = body as Record<string, unknown>;
  if (typeof fields.memberId !== 'string' || !UUID.test(fields.memberId)
      || fields.confirmed !== true
      || Object.keys(fields).some(key => key !== 'memberId' && key !== 'confirmed')) {
    return reply({ error: 'Confirm the member and an on-file email verification request' }, 400);
  }
  const memberId = fields.memberId;

  // Explicit SMTP ONLY before token generation, DB mutation or mail work.
  // Never pass the public send-verification endpoint an administrator-supplied
  // member ID to evade founder authority.
  const smtp = approvedVerificationSmtp();
  if (!smtp) return reply({ error: 'SMTP verification transport is unavailable' }, 503);

  try {
    // Multiple independent limits: issuer, member, and apparent client IP.
    // The database row also enforces a durable ten-minute resend cooldown.
    for (const [identifier, kind, scope] of [
      [getClientIP(req), 'ip', ENDPOINT],
      [founder.memberId, 'member_id', ENDPOINT + ':issuer'],
      [memberId, 'member_id', ENDPOINT + ':target'],
    ] as const) {
      const limit = await checkRateLimit(identifier, kind, scope);
      if (!limit.allowed) return reply({ error: 'Verification requests are temporarily limited' }, 429);
    }
  } catch {
    return reply({ error: 'Verification rate limit unavailable' }, 503);
  }

  // This is an ORDINARY email-verification bearer: the pre-existing
  // members.email_verification_token column stores it temporarily in plaintext
  // until one-time confirmation. Admin recovery capabilities are separate,
  // digest-only records. The bearer is never returned to the founder or logged.
  const token = randomBytes(32).toString('hex');
  let result: Result;
  try {
    result = await transaction<Result>(async tx => {
      const issuer = await tx.query<{ id: string }>(
        `SELECT m.id FROM members m
         JOIN auth_sessions s ON s.member_id = m.id
         WHERE m.id = $1 AND m.admin_role = 'founder'
           AND s.session_token = $2
           AND s.expires_at > clock_timestamp()
           AND s.revoked = FALSE
         FOR UPDATE OF m, s`,
        [founder.memberId, verifiedToken],
      );
      if (!issuer.rows.length) return { kind: 'founder_revoked' };

      const target = await tx.query<Target>(
        `SELECT id, email, email_verified, recovery_email_verification_id,
                email_verification_sent_at
           FROM members WHERE id = $1 FOR UPDATE`,
        [memberId],
      );
      const member = target.rows[0];
      if (!member) return { kind: 'not_found' };
      if (!member.email || !member.email.trim()) return { kind: 'no_email' };
      if (member.email_verified === true && member.recovery_email_verification_id) {
        return { kind: 'already_verified' };
      }
      // PostgreSQL clock, not transaction-start "now()", matters after a
      // concurrent request waits for the same target row lock.
      const update = await tx.query<{ id: string }>(
        `UPDATE members
            SET email_verification_token = $1,
                email_verification_sent_at = clock_timestamp()
          WHERE id = $2
            AND (
              email_verification_sent_at IS NULL OR
              email_verification_sent_at <= clock_timestamp() - interval '10 minutes'
            )
          RETURNING id`,
        [token, memberId],
      );
      if (update.rows.length !== 1) return { kind: 'cooldown' };
      return { kind: 'issued', email: member.email };
    });
  } catch {
    console.error('[member-access] Verification token transaction failed');
    return reply({ error: 'Verification currently unavailable' }, 503);
  }

  if (result.kind !== 'issued') {
    if (result.kind === 'founder_revoked') return reply({ error: 'Founder session no longer authorized' }, 403);
    if (result.kind === 'cooldown') return reply({ error: 'Please wait before requesting another verification email' }, 429);
    if (result.kind === 'already_verified') return reply({ error: 'Current email already verified for recovery' }, 409);
    if (result.kind === 'no_email') return reply({ error: 'This member has no email on file' }, 409);
    return reply({ error: 'Member not found' }, 404);
  }

  const url = `https://soullab.life/verify-email#token=${token}`;
  let accepted = false;
  try {
    const delivered = await sendEmail({
      purpose: 'auth:verification',
      provider: smtp,
      from: SENDERS.noreply,
      to: result.email,
      subject: 'Verify your Soullab email',
      text: `A Soullab administrator received a request to verify the email already on your account.

Use this one-time link within 24 hours to confirm your address:
${url}

If you did not request verification, you can ignore this message.`,
      html: `<p>Confirm the email address already on your Soullab account.</p>
<p><a href="${url}">Verify your email</a></p>
<p>The one-time link expires in 24 hours. If you did not request this, ignore it.</p>`,
      memberId,
      triggerType: 'route',
      triggerRef: '/api/admin/members/recovery/verify-email',
    });
    accepted = acceptedVerificationSmtp(delivered);
  } catch {
    accepted = false;
  }

  if (!accepted) {
    // Retire ONLY our token. Another request may have replaced it already.
    try {
      await query(
        `UPDATE members
          SET email_verification_token = NULL,
              email_verification_sent_at = NULL
          WHERE id = $1 AND email_verification_token = $2`,
        [memberId, token],
      );
    } catch {
      // Do not claim cleanup succeeded if the database cannot confirm it.
      console.error('[member-access] Verification token retirement failed');
      return reply({ error: 'Verification delivery and cleanup unavailable' }, 503);
    }
    return reply({ error: 'SMTP provider did not accept verification; link retired' }, 502);
  }
  return reply({ success: true, method: 'email', delivery: 'provider_accepted', verificationRequired: true });
}
