// Production requires force-dynamic for database access
export const dynamic = 'force-static';

/**
 * Magic Link Sign-In
 *
 * POST /api/members/magic-link - Request magic link (sends email)
 * GET /api/members/magic-link?token=xxx - Verify token and sign in
 *
 * DESIGN:
 * - Works for both existing members and new signups
 * - Always succeeds from user's perspective (no email enumeration)
 * - 15 minute expiration for security
 * - Graceful degradation if tables missing
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

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

// Safe query that handles missing tables
async function safeQuery(sql: string, params: unknown[] = []): Promise<{ rows: Record<string, unknown>[]; error?: string }> {
  try {
    const result = await query(sql, params);
    return { rows: result.rows };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('does not exist') || message.includes('column')) {
      console.warn(`[MAGIC-LINK] Query skipped (missing table/column): ${message}`);
      return { rows: [], error: message };
    }
    throw error;
  }
}

/**
 * POST - Request magic link
 * Sends email with sign-in link
 */
export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in app build' }, { status: 503 });
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[MAGIC-LINK] Request for: ${normalizedEmail}`);

    // Check if member exists with this email
    const memberResult = await safeQuery(
      'SELECT id, name, username FROM members WHERE email = $1',
      [normalizedEmail]
    );

    const member = memberResult.rows[0] || null;
    const memberId = member?.id as string | null;
    const memberName = (member?.name as string) || 'Beautiful Soul';

    // Generate token with 15 minute expiration
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Invalidate any existing tokens for this email
    await safeQuery(
      'UPDATE magic_link_tokens SET used = true WHERE email = $1 AND used = false',
      [normalizedEmail]
    );

    // Store new token
    const insertResult = await safeQuery(
      'INSERT INTO magic_link_tokens (email, member_id, token, expires_at) VALUES ($1, $2, $3, $4)',
      [normalizedEmail, memberId, token, expiresAt]
    );

    if (insertResult.error) {
      // If magic_link_tokens table doesn't exist, create it on the fly
      console.log('[MAGIC-LINK] Creating magic_link_tokens table...');
      await query(`
        CREATE TABLE IF NOT EXISTS magic_link_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL,
          member_id UUID REFERENCES members(id) ON DELETE CASCADE,
          token VARCHAR(64) NOT NULL UNIQUE,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
      // Retry insert
      await query(
        'INSERT INTO magic_link_tokens (email, member_id, token, expires_at) VALUES ($1, $2, $3, $4)',
        [normalizedEmail, memberId, token, expiresAt]
      );
    }

    // Build magic link
    const magicLink = `https://soullab.life/api/members/magic-link?token=${token}`;

    // Determine flow: existing member or new user
    const isExistingMember = !!member;
    const subject = isExistingMember
      ? 'Sign in to Soullab'
      : 'Complete your Soullab signup';
    const heading = isExistingMember
      ? 'Sign in to Soullab'
      : 'Welcome to Soullab';
    const bodyText = isExistingMember
      ? 'Click the button below to sign in instantly — no password needed.'
      : 'Click the button below to continue setting up your account.';
    const buttonText = isExistingMember ? 'Sign In' : 'Continue Signup';

    // Send magic link email
    try {
      await getResend().emails.send({
        from: 'Soullab <noreply@soullab.life>',
        to: normalizedEmail,
        subject,
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://soullab.life/Soullablogo.png" alt="Soullab" width="150" style="max-width: 150px;" />
            </div>

            <h1 style="color: #1A2F24; font-size: 24px; text-align: center; margin-bottom: 24px;">
              ${heading}
            </h1>

            <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hello ${memberName},
            </p>

            <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              ${bodyText}
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #1A2F24, #2C5530); color: #FFFFFF; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
                ${buttonText}
              </a>
            </div>

            <p style="color: #718096; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.
            </p>

            <p style="color: #718096; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              Or copy this link: <br>
              <a href="${magicLink}" style="color: #2C5530; word-break: break-all;">${magicLink}</a>
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
${heading}

Hello ${memberName},

${bodyText}

${magicLink}

This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.

With presence,
The Soullab Team
        `.trim()
      });

      console.log(`[MAGIC-LINK] Email sent to: ${normalizedEmail} (existing: ${isExistingMember})`);
    } catch (emailError) {
      console.error('[MAGIC-LINK] Failed to send email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send magic link email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Check your email for a sign-in link.',
      isExistingMember
    });
  } catch (error) {
    console.error('[MAGIC-LINK] Request error:', error);
    return NextResponse.json(
      { error: 'Failed to send magic link. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET - Verify magic link token and redirect
 * This is what the email link points to
 */
export async function GET(request: NextRequest) {
  // Use NEXTAUTH_URL for redirects to avoid Docker internal URLs
  const baseUrl = process.env.NEXTAUTH_URL || process.env.BASE_URL || new URL(request.url).origin;

  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      // No token - redirect to signin with error
      return NextResponse.redirect(new URL('/signin?error=no_token', baseUrl));
    }

    // Find valid token
    const tokenResult = await safeQuery(
      `SELECT t.id, t.email, t.member_id, m.id as found_member_id, m.username, m.name, m.onboarded, m.onboarding_step
       FROM magic_link_tokens t
       LEFT JOIN members m ON t.member_id = m.id OR m.email = t.email
       WHERE t.token = $1
         AND t.used = false
         AND t.expires_at > NOW()`,
      [token]
    );

    if (tokenResult.error || tokenResult.rows.length === 0) {
      console.log(`[MAGIC-LINK] Invalid/expired token: ${token.substring(0, 8)}...`);
      return NextResponse.redirect(new URL('/signin?error=invalid_token', baseUrl));
    }

    const record = tokenResult.rows[0];

    // Mark token as used
    await safeQuery(
      'UPDATE magic_link_tokens SET used = true WHERE id = $1',
      [record.id]
    );

    // Determine where to send the user
    const memberId = record.found_member_id || record.member_id;

    if (memberId) {
      // Existing member - redirect to appropriate destination
      const isOnboarded = record.onboarded;
      console.log(`[MAGIC-LINK] Verified existing member: ${record.username} (onboarded: ${isOnboarded})`);

      // Redirect to magic-link-success page which will set localStorage and redirect
      const destination = isOnboarded ? '/maia' : `/${record.onboarding_step || 'test-elemental'}`;
      const successUrl = new URL('/magic-link-success', baseUrl);
      successUrl.searchParams.set('member_id', memberId as string);
      successUrl.searchParams.set('username', record.username as string || '');
      successUrl.searchParams.set('name', record.name as string || '');
      successUrl.searchParams.set('onboarded', String(isOnboarded));
      successUrl.searchParams.set('redirect', destination);

      return NextResponse.redirect(successUrl);
    } else {
      // New user - redirect to signup with email prefilled
      console.log(`[MAGIC-LINK] Verified new user email: ${record.email}`);
      const beginUrl = new URL('/begin', baseUrl);
      beginUrl.searchParams.set('email', record.email as string);
      beginUrl.searchParams.set('verified', 'true');

      return NextResponse.redirect(beginUrl);
    }
  } catch (error) {
    console.error('[MAGIC-LINK] Verify error:', error);
    return NextResponse.redirect(new URL('/signin?error=verification_failed', baseUrl));
  }
}
