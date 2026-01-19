export const dynamic = 'force-static';

/**
 * Verify Email API
 *
 * Validates the email verification token and marks email as verified.
 * During beta, this is available but not required for access.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find member with this token
    const memberResult = await query(
      `SELECT id, username, email, email_verification_sent_at
       FROM members
       WHERE email_verification_token = $1`,
      [token]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link' },
        { status: 400 }
      );
    }

    const member = memberResult.rows[0];

    // Check if token is expired (24 hours)
    const sentAt = new Date(member.email_verification_sent_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return NextResponse.json(
        { error: 'Verification link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Mark email as verified and clear token
    await query(
      `UPDATE members
       SET email_verified = true, email_verification_token = NULL
       WHERE id = $1`,
      [member.id]
    );

    console.log(`[VerifyEmail] Email verified for ${member.username} (${member.email})`);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      username: member.username,
    });

  } catch (error) {
    console.error('[VerifyEmail] Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}

// Also support GET for direct link clicks
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/signin?error=invalid_token', request.url));
  }

  // Find member with this token
  const memberResult = await query(
    `SELECT id, username, email, email_verification_sent_at
     FROM members
     WHERE email_verification_token = $1`,
    [token]
  );

  if (memberResult.rows.length === 0) {
    return NextResponse.redirect(new URL('/signin?error=invalid_token', request.url));
  }

  const member = memberResult.rows[0];

  // Check if token is expired (24 hours)
  const sentAt = new Date(member.email_verification_sent_at);
  const now = new Date();
  const hoursDiff = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);

  if (hoursDiff > 24) {
    return NextResponse.redirect(new URL('/signin?error=token_expired', request.url));
  }

  // Mark email as verified
  await query(
    `UPDATE members
     SET email_verified = true, email_verification_token = NULL
     WHERE id = $1`,
    [member.id]
  );

  console.log(`[VerifyEmail] Email verified via link for ${member.username}`);

  // Redirect to success page
  return NextResponse.redirect(new URL('/signin?verified=true', request.url));
}
