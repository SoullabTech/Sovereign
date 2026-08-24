// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic'

/**
 * Passkey Recovery via Email
 * Sends member their passkey if email matches
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { sendEmail, SENDERS } from '@/lib/email/sendEmail';

export const revalidate = false;

// Skip during static export (Capacitor builds)

export async function POST(request: NextRequest) {
  // During static export, return placeholder response
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in app' }, { status: 503 });
  }
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }

    // Find member by email
    const result = await query(
      'SELECT passkey, name, username FROM members WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    // Always return success to prevent email enumeration
    if (result.rows.length === 0) {
      // No member found, but don't reveal this
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, recovery instructions have been sent.'
      });
    }

    const member = result.rows[0];

    // Send recovery email
    const delivery = await sendEmail({
      purpose: 'auth:passkey-recovery',
      from: SENDERS.noreply,
        to: email,
        subject: 'Your Soullab Passkey',
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://soullab.life/Soullablogo.png" alt="Soullab" width="150" style="max-width: 150px;" />
            </div>

            <h1 style="color: #1A2F24; font-size: 24px; text-align: center; margin-bottom: 24px;">
              Your Passkey Recovery
            </h1>

            <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hello ${member.name || 'Beautiful Soul'},
            </p>

            <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              You requested your Soullab passkey. Here it is:
            </p>

            <div style="background: linear-gradient(135deg, #1A2F24, #2C5530); border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
              <p style="color: #a0d5a6; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                Your Passkey
              </p>
              <p style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: 4px;">
                ${member.passkey}
              </p>
            </div>

            <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Your username is: <strong>${member.username}</strong>
            </p>

            <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
              Return to <a href="https://soullab.life/signin" style="color: #2C5530; font-weight: 600;">soullab.life/signin</a> to continue your journey.
            </p>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 32px; text-align: center;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                With presence,<br>
                <strong style="color: #1A2F24;">The Soullab Team</strong>
              </p>
            </div>
          </div>
        `,
        text: `
Your Soullab Passkey Recovery

Hello ${member.name || 'Beautiful Soul'},

You requested your Soullab passkey. Here it is:

PASSKEY: ${member.passkey}
USERNAME: ${member.username}

Return to https://soullab.life/signin to continue your journey.

With presence,
The Soullab Team
        `.trim()
      });

    if (!delivery.success) {
      // Resend RESOLVES on API rejections (429 quota, bad key, invalid
      // recipient) — it does not throw. Reading `delivery.success` is what
      // stops a failed send from being reported as a sent one.
      console.error(
        `[MEMBERS] Delivery FAILED (${delivery.failureKind}) — nothing reached ${email}: ${delivery.error}`
      );
      return NextResponse.json(
        {
          error: delivery.ourFault
            ? "We couldn't send that email — that's on our side, not yours. Please try again in a few minutes."
            : "Failed to send recovery email",
          reason: delivery.failureKind,
          retryable: delivery.retryable === true,
        },
        { status: delivery.ourFault ? 503 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, recovery instructions have been sent.'
    });
  } catch (error) {
    console.error('[MEMBERS] Recovery error:', error);
    return NextResponse.json(
      { error: 'Failed to process recovery request' },
      { status: 500 }
    );
  }
}
