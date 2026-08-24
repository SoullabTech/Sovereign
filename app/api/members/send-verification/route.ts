export const dynamic = 'force-dynamic'

/**
 * Send Email Verification API
 *
 * Sends a verification email to the member.
 * During beta (betaConfig.requireEmailVerification = false), this is available but not enforced.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { betaConfig } from '@/lib/auth/betaConfig';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, email: rawEmail } = body;
    const email = rawEmail ? rawEmail.toLowerCase().trim() : undefined;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Get member info
    const memberResult = await query(
      'SELECT id, email, username, name, email_verified FROM members WHERE id = $1',
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const member = memberResult.rows[0];
    const targetEmail = email || member.email;

    if (!targetEmail) {
      return NextResponse.json(
        { error: 'No email address available' },
        { status: 400 }
      );
    }

    // Update email if provided and different
    if (email && email !== member.email) {
      await query(
        'UPDATE members SET email = $1, email_verified = false WHERE id = $2',
        [email, memberId]
      );
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');

    // Store token
    await query(
      `UPDATE members
       SET email_verification_token = $1, email_verification_sent_at = NOW()
       WHERE id = $2`,
      [token, memberId]
    );

    // Build verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://soullab.life';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    // Send verification email
    const delivery = await sendEmail({
      purpose: 'auth:email-verification',
      from: 'Kelly Nezat <kelly@soullab.life>',
      to: targetEmail,
      subject: 'Verify your Soullab email',
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <img src="https://soullab.life/Soullablogo.png" alt="Soullab" width="150" style="width: 150px; height: auto;" />
          </div>

          <h1 style="color: #1A2F24; font-size: 24px; margin-bottom: 16px; text-align: center;">
            Verify your email
          </h1>

          <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Hi ${member.name || member.username},
          </p>

          <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            Please click the button below to verify your email address and complete your Soullab account setup.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #1A2F24, #2C5530); color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
              Verify Email
            </a>
          </div>

          <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin-top: 32px;">
            If you didn't create a Soullab account, you can safely ignore this email.
          </p>

          <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin-top: 16px;">
            This link will expire in 24 hours.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

          <p style="color: #718096; font-size: 12px; text-align: center;">
            Soullab — Building technology that serves consciousness
          </p>
        </div>
      `,
    });

    if (!delivery.success) {
      console.error(
        `[SendVerification] Provider REFUSED the send for ${targetEmail} — status=${delivery.status} failureKind=${delivery.failureKind ?? 'unclassified'} providerCode=${delivery.providerCode ?? 'unnamed'} retryable=${delivery.retryable === true} error=${delivery.error ?? 'none'}`
      );
      if (!delivery.ourFault) {
        return NextResponse.json(
          {
            error: "We couldn't send to that address. Please check it and try again.",
            reason: 'email_address_rejected',
            retryable: false,
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          error: delivery.retryable
            ? "Failed to send verification email. That's a problem on our side, not yours. Please try again in a few minutes."
            : "Failed to send verification email. That's a problem on our side, not yours, and retrying won't help. Please contact hello@soullab.life and we'll get you in.",
          reason: 'email_provider_refused',
          retryable: delivery.retryable === true,
        },
        { status: 502 }
      );
    }

    console.log(`[SendVerification] Email sent to ${targetEmail} for ${member.username} (resendId: ${delivery.id ?? 'none'})`);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
    });

  } catch (error) {
    console.error('[SendVerification] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
