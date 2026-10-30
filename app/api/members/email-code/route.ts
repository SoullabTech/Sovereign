export const dynamic = 'force-dynamic';

/** AUTH-RETURN-01 — request one email authentication code. */

import { NextRequest, NextResponse } from 'next/server';
import { transaction } from '@/lib/db/postgres';
import { sendEmail, SENDERS } from '@/lib/email/sendEmail';
import {
  beginEmailChallenge,
  EmailCodeError,
  settleEmailChallengeAccepted,
  settleEmailChallengeFailure,
} from '@/lib/auth/emailCodeService';
import { requireSameOriginAuthMutation, AuthOriginError } from '@/lib/auth/returnDestination';
import { checkRateLimit, getClientIP, buildRateLimitHeaders } from '@/lib/auth/rateLimiter';
import { memberRef } from '@/lib/privacy/memberRef';
import { redactEmails } from '@/lib/privacy/redactEmails';

const ENDPOINT = '/api/members/email-code';
// Shared networks (homes, schools, clinics, offices) must not make one person's
// successful sign-ins consume another person's entire allowance. Keep a
// durable IP abuse ceiling while enforcing the tighter limit per email.
const IP_MAX_ATTEMPTS = 20;
const NO_STORE = { 'Cache-Control': 'private, no-store' };

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

function validEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return json({ error: 'Not available in app build' }, 503);
  }

  try {
    requireSameOriginAuthMutation(request);
  } catch (error) {
    if (error instanceof AuthOriginError) {
      return json({ error: 'Request origin refused', reason: error.code }, 403);
    }
    throw error;
  }

  const clientIP = getClientIP(request);
  const ipLimit = await checkRateLimit(clientIP, 'ip', ENDPOINT, { maxAttempts: IP_MAX_ATTEMPTS });
  if (!ipLimit.allowed) {
    return json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      429,
      buildRateLimitHeaders(ipLimit),
    );
  }

  try {
    const body = await request.json();
    if (!validEmail(body?.email)) {
      return json({ error: 'A valid email is required.' }, 400);
    }

    const normalizedEmail = body.email.trim().toLowerCase();
    const emailLimit = await checkRateLimit(normalizedEmail, 'email', ENDPOINT, { maxAttempts: 5 });
    if (!emailLimit.allowed) {
      return json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        429,
        buildRateLimitHeaders(emailLimit),
      );
    }

    const requestKey = request.headers.get('x-soullab-auth-request') ?? '';
    const started = await transaction((client) =>
      beginEmailChallenge(client, { email: body.email, requestKey }),
    );

    if (!started.created) {
      switch (started.challenge.status) {
        case 'accepted':
          return json({ success: true, reused: true });
        case 'pending':
        case 'ambiguous':
          return json(
            {
              error: 'The delivery state of this request is unknown. Start a new request before sending again.',
              reason: 'delivery_state_unknown',
              retryable: false,
            },
            409,
          );
        default:
          return json(
            {
              error: 'This authentication request is no longer active. Start a new request.',
              reason: 'request_key_consumed',
              retryable: false,
            },
            409,
          );
      }
    }

    const { challenge, code } = started;
    const greeting = challenge.memberName || 'Beautiful Soul';
    const sendResult = await sendEmail({
      purpose: 'auth:email-code',
      triggerType: 'route',
      triggerRef: ENDPOINT,
      correlationId: challenge.id,
      idempotencyKey: `AUTH_CODE:${challenge.id}`,
      from: SENDERS.noreply,
      to: challenge.email,
      subject: `Your Soullab code: ${code}`,
      text:
        `Hello ${greeting},\n\nYour Soullab code is: ${code}\n\n` +
        'It expires in 10 minutes. If you did not request it, you can ignore this message.\n\n' +
        'With presence,\nThe Soullab Team',
      html: `
        <div style="font-family: Inter,-apple-system,BlinkMacSystemFont,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
          <p style="font-size:16px;line-height:1.6">Hello ${greeting},</p>
          <p style="font-size:16px;line-height:1.6">Enter this code to continue:</p>
          <div style="text-align:center;font-size:38px;font-weight:700;letter-spacing:10px;padding:22px">${code}</div>
          <p style="font-size:14px;line-height:1.6">It expires in 10 minutes. If you did not request it, you can ignore this message.</p>
        </div>`,
    });

    if (!sendResult.success) {
      await transaction((client) =>
        settleEmailChallengeFailure(client, {
          challengeId: challenge.id,
          ambiguous: sendResult.failureKind === 'exception',
          provider: sendResult.provider,
        }),
      );
      console.error(
        `[EMAIL-CODE] SMTP refused challenge=${challenge.id} member=${memberRef(challenge.memberId)} ` +
        `kind=${sendResult.failureKind ?? 'unclassified'} retryable=${sendResult.retryable === true} ` +
        `error=${redactEmails(sendResult.error) ?? 'none'}`,
      );
      if (!sendResult.ourFault) {
        return json(
          {
            error: "We couldn't send a code to that address. Please check it and try again.",
            reason: 'email_address_rejected',
            retryable: false,
          },
          400,
        );
      }
      return json(
        {
          error: sendResult.retryable
            ? "We couldn't send your code. Please try again in a few minutes."
            : "We can't send codes right now. Please contact support@soullab.life.",
          reason: sendResult.failureKind === 'exception'
            ? 'delivery_state_unknown'
            : 'email_provider_refused',
          retryable: sendResult.retryable === true && sendResult.failureKind !== 'exception',
        },
        502,
      );
    }

    if (!sendResult.id || !sendResult.provider) {
      await transaction((client) =>
        settleEmailChallengeFailure(client, {
          challengeId: challenge.id, ambiguous: true, provider: sendResult.provider,
        }),
      );
      return json(
        { error: 'Delivery could not be verified. Start a new request.', reason: 'delivery_state_unknown' },
        503,
      );
    }

    try {
      await transaction((client) =>
        settleEmailChallengeAccepted(client, {
          challengeId: challenge.id,
          provider: sendResult.provider!,
          providerMessageId: sendResult.id!,
        }),
      );
    } catch (error) {
      // SMTP may have accepted the message while durable settlement failed. Do
      // not resend this request key and do not invalidate the older accepted code.
      console.error(`[EMAIL-CODE] Delivery settlement unavailable challenge=${challenge.id}`);
      return json(
        { error: 'Delivery could not be confirmed. Start a new request.', reason: 'delivery_state_unknown' },
        503,
      );
    }

    console.log(
      `[EMAIL-CODE] SMTP accepted challenge=${challenge.id} member=${memberRef(challenge.memberId)} ` +
      `provider=${sendResult.provider} message=${sendResult.id}`,
    );
    return json({ success: true });
  } catch (error) {
    if (error instanceof EmailCodeError) {
      const status = error.code === 'AUTH_CODE_REQUEST_KEY_REQUIRED' ? 400 : 503;
      return json({ error: error.message, reason: error.code }, status);
    }
    console.error('[EMAIL-CODE] Request failed without exposing recipient data');
    return json({ error: 'Could not send the code. Please try again.' }, 500);
  }
}
