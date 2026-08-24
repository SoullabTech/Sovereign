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
 * - Works for both existing members and new signups. The RESPONSE is identical
 *   either way: `isExistingMember` is computed for the email body and for
 *   server-side telemetry, and never crosses the wire to a caller who has not
 *   yet proved they own the address.
 * - Reuses the magic_link_tokens table (adds a `code` column, self-healing) so
 *   /api/members/register-email's "recently verified email" check keeps working.
 * - 10-minute expiry, attempt-capped on verify, rate-limited on request.
 * - Graceful degradation if the table/columns are missing.
 *
 * Verify lives at POST /api/members/email-code/verify.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { randomBytes, randomInt } from 'crypto';
import { sendEmail, SENDERS } from '@/lib/email/sendEmail';
import { memberRef } from '@/lib/privacy/memberRef';
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
        // Same boundary as the send logs below: the address is already recorded
        // in `beta_waitlist` (inserted immediately above), so the log line does
        // not need to carry it. Preference order 1 in lib/privacy/memberRef.ts —
        // emit no identifier when correlation is not actually needed.
        console.log('[EMAIL-CODE] Not admitted → waitlist');
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

    // Send the code by email.
    //
    // Through the CENTRAL helper, not a local Resend client. `emails.send()`
    // RESOLVES on a provider rejection — it does not throw — so the previous
    // `await`-inside-try/catch could never observe a refusal, and the catch
    // below fired only on transport faults. On 2026-08-24 that turned a
    // Resend `429 monthly_quota_exceeded` into six consecutive
    // "[EMAIL-CODE] Code sent" log lines for a real person who received
    // nothing and could not create an account. lib/email/sendEmail.ts was
    // written to close exactly this bug class; this route simply was not
    // using it.
    const sendResult = await sendEmail({
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

    // The provider REFUSED. Nothing below this point may describe the code as
    // sent: no magic_link_sent, no "Code sent" line, no 200. The stored code is
    // invalidated immediately rather than left live until the next request —
    // see the UPDATE below for why it is marked used and not deleted.
    if (!sendResult.success) {
      trackOnboarding({
        event: 'magic_link_send_failed',
        email: normalizedEmail,
        path: 'POST /api/members/email-code',
        metadata: {
          isExistingMember,
          channel: 'code',
          status: sendResult.status,
          providerCode: sendResult.providerCode ?? null,
          failureKind: sendResult.failureKind ?? 'unclassified',
          retryable: sendResult.retryable === true,
        },
      });

      // The code exists in the database but is in nobody's inbox. INVALIDATE it
      // (used = true) rather than delete it: a credential nobody received must
      // not remain a usable outstanding credential, and the row is also the
      // only record that this person tried — which is how the 2026-08-24
      // incident was reconstructed at all. Marking, not deleting, keeps both.
      if (codeRowId) {
        await safeQuery('UPDATE magic_link_tokens SET used = true WHERE id = $1', [codeRowId]);
      }
      console.error(
        `[EMAIL-CODE] Provider REFUSED the send for member=${memberRef(memberId)} — status=${sendResult.status} failureKind=${sendResult.failureKind ?? 'unclassified'} providerCode=${sendResult.providerCode ?? 'unnamed'} retryable=${sendResult.retryable === true} error=${sendResult.error ?? 'none'}`
      );

      // WHAT WE TELL THE PERSON IS GOVERNED BY `retryable`, NOT BY TONE.
      //
      // On 2026-08-24 a quota refusal was reported as a retryable error and one
      // person made six attempts across two days, none of which could ever have
      // worked. Softening the wording while still saying "try again in a few
      // minutes" would rebuild that loop in kinder language. So a refusal we
      // cannot retry our way out of routes the person to a human instead.
      //
      // `ourFault` decides whose problem it is; `retryable` decides whether a
      // retry is honest advice. Everything unattributable is ours and is not
      // retryable (see FAILURE_POLICY in lib/email/sendEmail.ts).
      //
      // `reason` is a stable machine-readable field for the signup UI and
      // telemetry. Neither the provider's wording nor our internal failure
      // taxonomy is leaked to the member.
      if (!sendResult.ourFault) {
        return NextResponse.json(
          {
            error: "We couldn't send a code to that address. Please check it and try again.",
            reason: 'email_address_rejected',
            retryable: false,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: sendResult.retryable
            ? "We couldn't send your code — that's a problem on our side, not yours. Please try again in a few minutes."
            : "We can't send codes right now. That's a problem on our side, not yours, and retrying won't help. Please contact support@soullab.life and we'll get you in.",
          reason: 'email_provider_refused',
          retryable: sendResult.retryable === true,
        },
        { status: 502 }
      );
    }

    trackOnboarding({ event: 'magic_link_sent', email: normalizedEmail, path: 'POST /api/members/email-code', metadata: { isExistingMember, channel: 'code' } });
    // NO RAW ADDRESS ON THE SUCCESS PATH.
    //
    // The refusal path at the top of this block was redacted in #1074; the
    // success path — which is the path almost every send actually takes — was
    // still interpolating the member's real email address into container
    // stdout, where `docker logs` makes it readable to anyone with host access.
    // A redacted failure log beside a raw success log is not a privacy boundary.
    //
    // `memberRef()` is pseudonymous and correlatable, NOT anonymous (see
    // lib/privacy/memberRef.ts): it gives operators one stable token to follow a
    // member through a log window, and it is still member-linked data. For an
    // address with no member row yet it renders `anonymous`; the address itself
    // remains recorded in `magic_link_tokens` and `onboarding_events`, which is
    // where an identified record belongs.
    //
    // `sendResult.id` is deliberately KEPT. It is provider-issued, not
    // member-derived, and it is the only way to distinguish "provider accepted
    // and issued a message ID" from "provider accepted but returned nothing".
    console.log(
      `[EMAIL-CODE] Code sent for member=${memberRef(memberId)} (existing: ${isExistingMember}, id: ${sendResult.id ?? 'none'})`
    );

    // NO `isExistingMember` IN THE RESPONSE. Returning it told any anonymous
    // caller whether an address has a Soullab account BEFORE that caller had
    // proved they own the address — account enumeration, in the route whose own
    // header promised there was none. Existing-vs-new is resolved after the
    // code is verified, at POST /api/members/email-code/verify, where ownership
    // has been proved.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[EMAIL-CODE] Request error:', error);
    return NextResponse.json({ error: 'Could not send the code. Please try again.' }, { status: 500 });
  }
}
