/**
 * Founder-member-session-only Member Access issuance. Never accepts a
 * body-supplied actor ID or a caller-authored password. No shared-password
 * fallback: such credentials are not individually attributable.
 */
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin/adminAuth';
import { transaction, query } from '@/lib/db/postgres';
import { sendEmail, SENDERS } from '@/lib/email/sendEmail';
import { getEmailProvider } from '@/lib/email/providers';
import type { EmailProvider } from '@/lib/email/providers/types';
import {
  buildRecoveryLink, digestRecoveryToken, generateRecoveryToken,
  secureRecoveryOrigin, type RecoveryMode, type RecoveryReason,
  ADMIN_RECOVERY_EMAIL_LIFETIME_MINUTES,
} from '@/lib/admin/memberRecovery';

export const dynamic = 'force-dynamic';

function reply(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

const MEMBER_UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
type Member = { id: string; email: string | null; email_verified: boolean | null; recovery_email_verification_id: string | null };
type Decision =
  | { kind: 'ok'; email: string | null }
  | { kind: 'not_found' | 'limit' | 'no_email' | 'unverified_email' | 'actor_not_found' };

export async function POST(req: NextRequest) {
  if (process.env.MEMBER_ACCESS_RECOVERY_ENABLED !== '1') {
    return reply({ error: 'Member Access recovery has not been enabled' }, 503);
  }
  // Cookie-based initiation must refuse absent, foreign and Origin:null
  // before any member lookups or writes.
  if (!secureRecoveryOrigin(req.headers.get('origin'))) {
    return reply({ error: 'Origin not authorized' }, 403);
  }

  const founder = await checkAdminAuth(req, ['founder'], 'POST /api/admin/members/recovery');
  if (!founder.authed) return reply({ error: 'Founder authorization required' }, 401);
  if (founder.via !== 'member' || !founder.memberId) {
    return reply({ error: 'A verified founder member session is required' }, 403);
  }
  const verifiedSessionToken =
    req.headers.get('x-session-token') ?? req.cookies.get('maia_session')?.value ?? null;
  if (!verifiedSessionToken) {
    return reply({ error: 'A verified founder member session is required' }, 403);
  }

  let fields: Record<string, unknown>;
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return reply({ error: 'Invalid request' }, 400);
    fields = parsed as Record<string, unknown>;
  } catch {
    return reply({ error: 'Invalid JSON' }, 400);
  }

  const memberId = fields.memberId;
  const method = fields.method;
  const reason = fields.reason;
  if (typeof memberId !== 'string' || !MEMBER_UUID.test(memberId)) {
    return reply({ error: 'Select a valid member' }, 400);
  }
  // CLASS A beta decision: no out-of-band capabilities may be created,
  // even with identityVerified=true or a forged/modified client. This refusal
  // occurs before any token creation, database mutation, or email send.
  if (method === 'private_handoff') {
    return reply({ error: 'Private handoff is unavailable during the initial beta' }, 403);
  }
  if (method !== 'email') {
    return reply({ error: 'Unsupported recovery method' }, 400);
  }
  if (reason !== 'member_requested' || fields.identityVerified !== undefined) {
    return reply({ error: 'Only member-requested email recovery is available' }, 400);
  }
  const deliveryMethod: RecoveryMode = 'email';
  const reasonCode: RecoveryReason = 'member_requested';
  // Recovery email is a P0 identity operation. Do NOT inherit managed mail's
  // historical "resend" default when EMAIL_PROVIDER is missing. Freeze the
  // approved, configured SMTP provider object across selection and sending:
  // there is no provider fallback, including test-only capture transports.
  let approvedProvider: EmailProvider;
  try {
    if (process.env.EMAIL_PROVIDER?.trim().toLowerCase() !== 'smtp') {
      return reply({ error: 'Recovery SMTP transport is not configured' }, 503);
    }
    approvedProvider = getEmailProvider();
    if (approvedProvider.name !== 'smtp' || !approvedProvider.isConfigured()) {
      return reply({ error: 'Recovery SMTP transport is unavailable' }, 503);
    }
  } catch {
    return reply({ error: 'Recovery SMTP transport is unavailable' }, 503);
  }


  // The raw capability is ephemeral server memory sent only to the member's
  // verified-on-file email via the transactional email provider. It is NEVER
  // returned to the admin or inserted into PostgreSQL.
  const rawToken = generateRecoveryToken();
  const tokenHash = digestRecoveryToken(rawToken);
  const lifespan = ADMIN_RECOVERY_EMAIL_LIFETIME_MINUTES;
  const expiresAt = new Date(Date.now() + lifespan * 60_000);
  let outcome: Decision;
  try {
    outcome = await transaction<Decision>(async tx => {
      // Bind the sensitive issuance to a STILL-LIVE founder session under
      // the same transaction lock as the quota and target access. A revoked or
      // expired session between the first auth check and this transaction must
      // not continue into token issuance. FOR UPDATE serializes with revocation.
      const actor = await tx.query<{ id: string }>(
        `SELECT m.id FROM members m
         JOIN auth_sessions s ON s.member_id = m.id
         WHERE m.id = $1 AND m.admin_role = 'founder'
           AND s.session_token = $2
           AND s.expires_at > clock_timestamp() AND s.revoked = FALSE
         FOR UPDATE OF m, s`,
        [founder.memberId, verifiedSessionToken],
      );
      if (!actor.rows.length) return { kind: 'actor_not_found' };

      const count = await tx.query<{ n: number }>(
        `SELECT COUNT(*)::int AS n FROM admin_member_recovery_tokens
          WHERE issued_by = $1 AND created_at > now() - interval '1 hour'`,
        [founder.memberId],
      );
      if (Number(count.rows[0]?.n ?? 0) >= 5) return { kind: 'limit' };

      const member = await tx.query<Member>(
        'SELECT id, email, email_verified, recovery_email_verification_id FROM members WHERE id = $1 FOR UPDATE',
        [memberId],
      );
      if (!member.rows.length) return { kind: 'not_found' };
      const email = member.rows[0].email;
      if (!email || !email.trim()) return { kind: 'no_email' };
      // Legacy email_verified=true is NOT current-address proof. Only the
      // migration's verification-token trigger can mint this recovery nonce;
      // it is retired atomically whenever ANY writer changes the member email.
      if (member.rows[0].email_verified !== true || !member.rows[0].recovery_email_verification_id) {
        return { kind: 'unverified_email' };
      }

      // At most one usable administrator-issued token per member.
      await tx.query(
        `UPDATE admin_member_recovery_tokens SET revoked_at = now()
          WHERE member_id = $1 AND redeemed_at IS NULL AND revoked_at IS NULL`,
        [memberId],
      );
      await tx.query(
        `INSERT INTO admin_member_recovery_tokens
          (member_id, issued_by, email_verification_id, token_hash,
           delivery_method, reason_code, delivery_status, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          memberId, founder.memberId, member.rows[0].recovery_email_verification_id, tokenHash,
          deliveryMethod, reasonCode, 'pending', expiresAt,
        ],
      );
      return { kind: 'ok', email };
    });
  } catch {
    console.error('[member-access] Recovery issuance transaction failed');
    return reply({ error: 'Recovery currently unavailable' }, 503);
  }

  if (outcome.kind !== 'ok') {
    if (outcome.kind === 'limit') return reply({ error: 'Recovery issuance limit reached' }, 429);
    if (outcome.kind === 'actor_not_found') return reply({ error: 'Founder session no longer authorized' }, 403);
    if (outcome.kind === 'no_email') return reply({ error: 'This member has no delivery email' }, 409);
    if (outcome.kind === 'unverified_email') {
      return reply({ error: 'The current member email must be verified again before recovery' }, 409);
    }
    return reply({ error: 'Member not found' }, 404);
  }

  const link = buildRecoveryLink(rawToken);

  // Email provider success means ACCEPTED FOR DELIVERY, not confirmed receipt.
  // A pending token cannot be redeemed. Do not report success without a
  // durable delivery acceptance receipt.
  let accepted = false;
  try {
    const delivered = await sendEmail({
      purpose: 'auth:password-reset',
      provider: approvedProvider,
      from: SENDERS.noreply,
      to: outcome.email!,
      subject: 'Your Soullab account recovery link',
      text: `A Soullab administrator initiated password recovery for your account.\n\nUse this single-use link within ${lifespan} minutes to choose your own password:\n${link}\n\nIf you did not request this, contact Soullab support.\n`,
      html: `<p>A Soullab administrator initiated account recovery.</p><p><a href="${link}">Choose your new password</a></p><p>This single-use link expires in ${lifespan} minutes. If you did not request this, contact Soullab support.</p>`,
      memberId,
      triggerType: 'route',
      triggerRef: '/api/admin/members/recovery',
    });
    // Vendor accepted must include SMTP identity and provider-issued receipt.
    // A success reported by another provider is never a successful recovery
    // message, even if the upstream email helper is misconfigured.
    accepted = delivered.success === true
      && delivered.provider === 'smtp'
      && typeof delivered.id === 'string' && delivered.id.length > 0;
  } catch {
    accepted = false;
  }

  try {
    if (!accepted) {
      await query(
        `UPDATE admin_member_recovery_tokens SET delivery_status = 'failed', revoked_at = now()
          WHERE token_hash = $1 AND redeemed_at IS NULL`,
        [tokenHash],
      );
      return reply({ error: 'Delivery was not accepted; recovery link disabled' }, 502);
    }
    const receipt = await query<{ id: string }>(
      `UPDATE admin_member_recovery_tokens SET delivery_status = 'provider_accepted'
        WHERE token_hash = $1 AND delivery_status = 'pending'
          AND revoked_at IS NULL RETURNING id`,
      [tokenHash],
    );
    if (!receipt.rows.length) return reply({ error: 'Recovery issuance could not be confirmed' }, 503);
    return reply({ success: true, method: 'email', delivery: 'provider_accepted', expiresInMinutes: lifespan });
  } catch {
    // A token left in "pending" is not redeemable even if its email arrived.
    console.error('[member-access] Delivery receipt persistence failed');
    return reply({ error: 'Recovery issuance could not be confirmed' }, 503);
  }
}
