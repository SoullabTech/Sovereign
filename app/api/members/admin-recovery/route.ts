/**
 * Redeem a founder-issued recovery capability. Bearer possession is required;
 * no member selector is accepted from the caller.
 * This route is intentionally independent of the legacy /reset-password path.
 */
import { NextRequest, NextResponse } from 'next/server';
import { transaction } from '@/lib/db/postgres';
import { hashPassword } from '@/lib/auth/passwordUtils';
import { checkRateLimit, getClientIP } from '@/lib/auth/rateLimiter';
import { digestRecoveryToken, recoveryTokenShape, secureRecoveryOrigin, validRecoveryPassword } from '@/lib/admin/memberRecovery';

export const dynamic = 'force-dynamic';

function reply(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}

export async function POST(req: NextRequest) {
  if (process.env.MEMBER_ACCESS_RECOVERY_ENABLED !== '1') {
    return reply({ error: 'Member Access recovery has not been enabled' }, 503);
  }
  if (!secureRecoveryOrigin(req.headers.get('origin'))) return reply({ error: 'Request origin not authorized' }, 403);

  // Read rate limit BEFORE bcrypt and token lookup. Durable backend is used by
  // the shared auth limiter, with its documented bounded emergency ceiling.
  const limit = await checkRateLimit(getClientIP(req), 'ip', '/api/members/admin-recovery');
  if (!limit.allowed) return reply({ error: 'Please wait before trying again' }, 429);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return reply({ error: 'Invalid request' }, 400);
    body = parsed as Record<string, unknown>;
  } catch {
    return reply({ error: 'Invalid request' }, 400);
  }

  if (!recoveryTokenShape(body.token) || !validRecoveryPassword(body.newPassword)) {
    return reply({ error: 'The recovery link or password is not valid' }, 400);
  }
  const tokenHash = digestRecoveryToken(body.token);
  let passwordHash: string;
  try {
    passwordHash = await hashPassword(body.newPassword);
  } catch {
    console.error('[member-recovery] Unable to hash replacement password');
    return reply({ error: 'Password recovery is unavailable' }, 503);
  }

  try {
    const completed = await transaction(async tx => {
      // Lock the ledger row before any member write; competing redemptions
      // serialize. Never select by email or client-provided member UUID.
      const claim = await tx.query<{ id: string; member_id: string }>(
        `SELECT id, member_id FROM admin_member_recovery_tokens
          WHERE token_hash = $1 AND redeemed_at IS NULL AND revoked_at IS NULL
            AND expires_at > clock_timestamp()
            AND delivery_method = 'email'
            AND delivery_status = 'provider_accepted'
          FOR UPDATE`,
        [tokenHash],
      );
      if (!claim.rows.length) return false;
      const row = claim.rows[0];

      const member = await tx.query<{ id: string }>(
        `UPDATE members SET password_hash = $1, password_changed_at = now(), updated_at = now()
          WHERE id = $2 RETURNING id`,
        [passwordHash, row.member_id],
      );
      if (member.rows.length !== 1) throw new Error('Member unavailable during recovery');

      // Old authenticated sessions MUST NOT survive a password reset.
      await tx.query('UPDATE auth_sessions SET revoked = TRUE WHERE member_id = $1 AND revoked = FALSE', [row.member_id]);
      const used = await tx.query<{ id: string }>(
        `UPDATE admin_member_recovery_tokens SET redeemed_at = now()
          WHERE id = $1 AND redeemed_at IS NULL AND revoked_at IS NULL RETURNING id`,
        [row.id],
      );
      if (used.rows.length !== 1) throw new Error('Recovery claim was not consumed');
      return true;
    });
    if (!completed) return reply({ error: 'This recovery link is invalid or expired' }, 400);
    return reply({ success: true, message: 'Password updated. Please sign in again.' });
  } catch {
    // transaction() rolls back the password write AND the token claim together.
    console.error('[member-recovery] Atomic recovery transaction failed');
    return reply({ error: 'Password recovery is unavailable' }, 503);
  }
}
