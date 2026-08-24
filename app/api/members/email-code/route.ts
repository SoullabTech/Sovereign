// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic';

/**
 * Email One-Time Code — request
 *
 * POST /api/members/email-code  { email }  → emails a 6-digit code
 *
 * Why codes over magic links (MAIA decision 2026-06-04): one-time codes avoid
 * link mangling, mobile deep-link breakage, wrong-browser/session handoff, and
 * email-scanner pre-opening. The member stays on the page and types 6 digits.
 *
 * DESIGN
 * - Works for both existing members and new signups (no enumeration leak).
 * - Reuses the magic_link_tokens table (adds a `code` column, self-healing) so
 *   /api/members/register-email's "recently verified email" check keeps working.
 * - 10-minute expiry, attempt-capped on verify, rate-limited on request.
 * - Graceful degradation if the table/columns are missing.
 * - No enumeration: the response is identical for a known and an unknown email.
 *
 * DELIVERY INVARIANT (2026-08-24)
 * This route reports success ONLY when the email provider accepted the send and
 * returned a message id. It sends through `lib/email/sendEmail.ts`, which reads
 * Resend's `{ data, error }` result — Resend RESOLVES rather than throws on API
 * rejections, so an `await` in a bare try/catch reports "code sent" for mail
 * that never left. That is how a 429 monthly-quota outage presented to members
 * as a working sign-in with a code that never arrived. An undelivered code is
 * burned here rather than left live, so a member who retries is never asked for
 * a code they were never sent.
 *
 * Verify lives at POST /api/members/email-code/verify.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { randomBytes, randomInt } from 'crypto';
import { sendEmail, SENDERS } from '@/lib/email/sendEmail';
import {
  checkRateLimit,
  getClientIP,
  buildRateLimitHeaders,
} from '@/lib/auth/rateLimiter';
import { trackOnboarding } from '@/lib/onboarding/telemetry';

const ENDPOINT = '/api/members/email-code';

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// 6-digit numeric code, cryptographically random, zero-padded.
function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

async function safeQuery(sql: string, params: unknown[] = []): Promise<{ rows: Record<string, unknown>[]; error?: string }> {
  try {
    const result = await query(sql, params);
    return { rows: result.rows };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('does not exist') || message.includes('column')) {
      console.warn(`[EMAIL-CODE] Query skipped (missing table/column): ${message}`);
      return { rows: [], error: message };
    }
    throw error;
  }
}

// Ensure the table and the code/attempts columns exist (self-healing, matches
// the magic-link route's on-the-fly create pattern).
async function ensureSchema(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS magic_link_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL,
      member_id UUID REFERENCES members(id) ON DELETE CASCADE,
      token VARCHAR(64) NOT NULL UNIQUE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      used_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `).catch(() => {});
  await query(`ALTER TABLE magic_link_tokens ADD COLUMN IF NOT EXISTS code VARCHAR(6)`).catch(() => {});
  await query(`ALTER TABLE magic_link_tokens ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0`).catch(() => {});
  // Older deployments may predate used_at; heal it so the magic-link route (which
  // records it) and any audit queries stay consistent. OTP burn does not rely on it.
  await query(`ALTER TABLE magic_link_tokens ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE`).catch(() => {});
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in app build' }, { status: 503 });
  }

  const clientIP = getClientIP(request);

  // Rate limit: a few code requests per window per IP.
  const rateLimitResult = await checkRateLimit(clientIP, 'ip', ENDPOINT);
  if (!rateLimitResult.allowed) {
    const headers = buildRateLimitHeaders(rateLimitResult);
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429, headers }
    );
  }

  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    await ensureSchema();

    // Look up member for personalization + new-vs-existing framing.
    const memberResult = await safeQuery(
      'SELECT id, name FROM members WHERE LOWER(email) = $1',
      [normalizedEmail]
    );
    const member = memberResult.rows[0] || null;
    const memberId = (member?.id as string) || null;
    const memberName = (member?.name as string) || 'Beautiful Soul';
    const isExistingMember = !!member;

    // ── Private-beta gate (OFF by default — signup is open) ────────────────
    // Founder decision 2026-07-28: MAIA moved from a stewarded private beta to
    // active onboarding. Signup is now open — anyone who enters an email gets a
    // code and can join. The beta_allowlist / beta_waitlist tables are KEPT for
    // history but are no longer consulted at sign-in.
    //
    // Re-gate switch: set BETA_ALLOWLIST_ENABLED=1 (env, then restart the
    // container) to restore the private beta — new emails not on beta_allowlist
    // get no code, are captured to beta_waitlist, and the client shows a warm
    // "small groups" message. Existing members are ALWAYS admitted either way.
    // Fails CLOSED (waitlist) if the allowlist read errors while gating is on.
    const betaGateOn = process.env.BETA_ALLOWLIST_ENABLED === '1';
    if (!isExistingMember && betaGateOn) {
      let admitted = false;
      try {
        const allow = await query('SELECT 1 FROM beta_allowlist WHERE LOWER(email) = $1 LIMIT 1', [normalizedEmail]);
        admitted = allow.rows.length > 0;
      } catch (gateErr) {
        console.error('[EMAIL-CODE] beta_allowlist check failed — failing closed (waitlist):', gateErr);
        admitted = false;
      }
      if (!admitted) {
        try {
          await query(
            `INSERT INTO beta_waitlist (email) VALUES ($1)
             ON CONFLICT (LOWER(email)) DO UPDATE
               SET request_count = beta_waitlist.request_count + 1, requested_at = NOW()`,
            [normalizedEmail],
          );
        } catch (wlErr) {
          console.warn('[EMAIL-CODE] waitlist capture failed (non-fatal):', wlErr);
        }
        console.log(`[EMAIL-CODE] Not admitted → waitlist: ${normalizedEmail}`);
        return NextResponse.json({ status: 'waitlist' });
      }
    }

    const code = generateCode();
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any outstanding codes for this email.
    await safeQuery(
      'UPDATE magic_link_tokens SET used = true WHERE email = $1 AND used = false',
      [normalizedEmail]
    );

    const inserted = await query(
      `INSERT INTO magic_link_tokens (email, member_id, token, code, expires_at, attempts)
       VALUES ($1, $2, $3, $4, $5, 0)
       RETURNING id`,
      [normalizedEmail, memberId, token, code, expiresAt]
    );
    const codeRowId = (inserted.rows[0]?.id as string) || null;

    // Send the code by email. `sendEmail` inspects Resend's `{ data, error }`
    // result and never throws — so this is a value we must read, not an
    // exception we may ignore.
    const delivery = await sendEmail({
      purpose: 'auth:email-code',
      from: SENDERS.noreply,
      to: normalizedEmail,
      subject: `Your Soullab code: ${code}`,
      html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 28px;">
              <img src="https://soullab.life/Soullablogo.png" alt="Soullab" width="140" style="max-width: 140px;" />
            </div>
            <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin: 0 0 12px;">Hello ${memberName},</p>
            <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              Enter this code to ${isExistingMember ? 'sign in' : 'continue'}:
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <div style="display: inline-block; font-size: 38px; font-weight: 700; letter-spacing: 10px; color: #1A2F24; background: #F2F5F3; border-radius: 12px; padding: 18px 28px;">
                ${code}
              </div>
            </div>
            <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
              This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.
            </p>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 28px; text-align: center;">
              <p style="color: #718096; font-size: 14px; margin: 0;">With presence,<br><strong style="color: #1A2F24;">The Soullab Team</strong></p>
            </div>
          </div>
        `,
      text: `Hello ${memberName},\n\nYour Soullab code is: ${code}\n\nEnter it to ${isExistingMember ? 'sign in' : 'continue'}. This code expires in 10 minutes.\n\nIf you didn't request it, you can safely ignore this email.\n\nWith presence,\nThe Soullab Team`,
    });

    if (!delivery.success) {
      // The code exists in the database but is in nobody's inbox. Burn it so a
      // retry issues a fresh one and no stale code is left live.
      if (codeRowId) {
        await safeQuery('UPDATE magic_link_tokens SET used = true WHERE id = $1', [codeRowId]);
      }
      trackOnboarding({
        event: 'magic_link_send_failed',
        email: normalizedEmail,
        path: `POST ${ENDPOINT}`,
        metadata: { channel: 'code', failureKind: delivery.failureKind ?? 'unknown', provider: 'resend' },
      });

      // Tell the member the truth, and tell them whose problem it is. A quota
      // or credential failure is ours; saying "please try again" would send
      // them in circles through a door that cannot open.
      const ours = delivery.ourFault === true;
      const status = ours ? 503 : 400;
      const message = ours
        ? "We couldn't send your code — that's on our side, not yours. Please try again in a few minutes."
        : "We couldn't send a code to that address. Please check it and try again.";

      console.error(
        `[EMAIL-CODE] Delivery FAILED (${delivery.failureKind}) — no code reached ${normalizedEmail}: ${delivery.error}`
      );
      return NextResponse.json(
        { error: message, reason: delivery.failureKind, retryable: delivery.retryable === true },
        { status }
      );
    }

    trackOnboarding({ event: 'magic_link_sent', email: normalizedEmail, path: 'POST /api/members/email-code', metadata: { isExistingMember, channel: 'code' } });
    // Only reachable with a provider-issued message id — "sent" is now a fact.
    console.log(`[EMAIL-CODE] Code sent to ${normalizedEmail} (existing: ${isExistingMember}, messageId: ${delivery.id})`);

    // NO `isExistingMember` IN THE RESPONSE (removed 2026-08-24). Returning it
    // told any anonymous caller whether an address has a Soullab account, before
    // that caller had proved they own the address — an account-enumeration leak
    // in the very route whose header claims "no enumeration leak". Existing-vs-new
    // is decided after the code is verified, at POST /api/members/email-code/verify,
    // where ownership has been proved. `isExistingMember` still shapes the email
    // body and server-side telemetry; it just never crosses the wire unproved.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[EMAIL-CODE] Request error:', error);
    return NextResponse.json({ error: 'Could not send the code. Please try again.' }, { status: 500 });
  }
}
