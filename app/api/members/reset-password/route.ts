// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic'


/**
 * Password Reset Flow
 * POST /api/members/reset-password - Request reset (sends email)
 * PUT /api/members/reset-password - Confirm reset (changes password)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';
import { hashPassword } from '@/lib/auth/passwordUtils';
import {
  checkRateLimit,
  getClientIP,
  buildRateLimitHeaders
} from '@/lib/auth/rateLimiter';

const ENDPOINT = '/api/members/reset-password';

// Lazy init Resend
let resend: Resend | null = null;
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// Generate secure token
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * POST - Request password reset
 * Sends email with reset link
 */
export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in app build' }, { status: 503 });
  }

  const clientIP = getClientIP(request);

  // Rate limit: 3 reset requests per 15 minutes per IP
  const rateLimitResult = await checkRateLimit(clientIP, 'ip', ENDPOINT);
  if (!rateLimitResult.allowed) {
    const headers = buildRateLimitHeaders(rateLimitResult);
    return NextResponse.json(
      { error: 'Too many reset requests. Please try again later.' },
      { status: 429, headers }
    );
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Find member by email (case-insensitive)
    const result = await query(
      'SELECT id, name, username FROM members WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    // Always return success to prevent email enumeration
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    const member = result.rows[0];

    // Generate token with 1 hour expiration
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any existing tokens for this member
    await query(
      'UPDATE password_reset_tokens SET used = true WHERE member_id = $1 AND used = false',
      [member.id]
    );

    // Store new token
    await query(
      'INSERT INTO password_reset_tokens (member_id, token, expires_at) VALUES ($1, $2, $3)',
      [member.id, token, expiresAt]
    );

    // Build reset link - works for both web and app
    const resetLink = `https://soullab.life/reset-password?token=${token}`;

    // Send reset email
    try {
      const { data: sendData, error: sendError } = await getResend().emails.send({
        from: 'Soullab <noreply@soullab.life>',
        to: email,
        subject: 'Reset Your Soullab Password',
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://soullab.life/Soullablogo.png" alt="Soullab" width="150" style="max-width: 150px;" />
            </div>

            <h1 style="color: #1A2F24; font-size: 24px; text-align: center; margin-bottom: 24px;">
              Reset Your Password
            </h1>

            <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hello ${member.name || 'Beautiful Soul'},
            </p>

            <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              You requested to reset your password. Click the button below to set a new password:
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #1A2F24, #2C5530); color: #FFFFFF; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
                Reset Password
              </a>
            </div>

            <p style="color: #718096; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
            </p>

            <p style="color: #718096; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              Or copy this link: <br>
              <a href="${resetLink}" style="color: #2C5530; word-break: break-all;">${resetLink}</a>
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
Reset Your Soullab Password

Hello ${member.name || 'Beautiful Soul'},

You requested to reset your password. Visit this link to set a new password:

${resetLink}

This link expires in 1 hour. If you didn't request this, you can safely ignore this email.

With presence,
The Soullab Team
        `.trim()
      });

      // Resend RESOLVES with { data, error } when the provider rejects a send —
      // it does not throw, so the catch below never saw a refusal. Discarding
      // this result is what let this route report success for mail Resend
      // never accepted (2026-08-24 quota incident; same defect proven and
      // fixed on /api/members/email-code).
      //
      // The provider's `name` is logged as its own field: "quota exhausted"
      // and "domain not verified" are indistinguishable once flattened into a
      // sentence, and they need opposite responses from an operator.
      if (sendError) {
        console.error('[MEMBERS] Resend REFUSED the reset email:', { providerCode: sendError.name ?? 'unnamed', message: sendError.message });
        return NextResponse.json(
          { error: 'Failed to send reset email' },
          { status: 500 }
        );
      }

      console.log('[MEMBERS] Password reset email sent to:', email, 'resendId:', sendData?.id ?? 'none');
    } catch (emailError) {
      console.error('[MEMBERS] Failed to send reset email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('[MEMBERS] Reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process reset request' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Confirm password reset
 * Validates token and updates password
 */
export async function PUT(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find valid token
    const tokenResult = await query(
      `SELECT t.id, t.member_id, m.username, m.name
       FROM password_reset_tokens t
       JOIN members m ON t.member_id = m.id
       WHERE t.token = $1
         AND t.used = false
         AND t.expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    const tokenRecord = tokenResult.rows[0];

    // Update password with bcrypt
    const passwordHash = await hashPassword(password);
    await query(
      'UPDATE members SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, tokenRecord.member_id]
    );

    // Mark token as used
    await query(
      'UPDATE password_reset_tokens SET used = true WHERE id = $1',
      [tokenRecord.id]
    );

    console.log('[MEMBERS] Password reset completed for:', tokenRecord.username);

    return NextResponse.json({
      success: true,
      message: 'Password reset successful. You can now sign in with your new password.',
      username: tokenRecord.username
    });
  } catch (error) {
    console.error('[MEMBERS] Reset confirm error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

/**
 * GET - Validate token (for UI to check before showing form)
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'No token provided' });
    }

    const result = await query(
      `SELECT t.id, m.name
       FROM password_reset_tokens t
       JOIN members m ON t.member_id = m.id
       WHERE t.token = $1
         AND t.used = false
         AND t.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired token' });
    }

    return NextResponse.json({
      valid: true,
      name: result.rows[0].name
    });
  } catch (error) {
    console.error('[MEMBERS] Token validation error:', error);
    return NextResponse.json({ valid: false, error: 'Validation failed' });
  }
}
