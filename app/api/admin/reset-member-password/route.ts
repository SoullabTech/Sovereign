export const dynamic = 'force-dynamic';

/**
 * TEMPORARY Admin Password Reset
 * Allows resetting a member's password without email
 * Protected by admin secret
 *
 * DELETE THIS FILE after Resend is fixed
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { hashPassword } from '@/lib/auth/passwordUtils';

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword, adminSecret } = await request.json();

    // Protect with admin secret — fail closed, NO hardcoded fallback.
    // (Previously fell back to a hardcoded constant when the env was unset,
    //  which made this an unauthenticated account-takeover path in prod.)
    const expectedSecret = process.env.ADMIN_RESET_SECRET;
    if (!expectedSecret) {
      return NextResponse.json({ error: 'Admin reset not configured' }, { status: 503 });
    }
    if (adminSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and newPassword required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find member by email
    const result = await query(
      'SELECT id, username, name FROM members WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'No member found with this email' },
        { status: 404 }
      );
    }

    const member = result.rows[0];

    // Update password with bcrypt
    const passwordHash = await hashPassword(newPassword);
    await query(
      'UPDATE members SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, member.id]
    );

    console.log('[ADMIN] Password reset for:', member.username);

    return NextResponse.json({
      success: true,
      message: `Password reset for ${member.name} (${member.username})`,
      username: member.username
    });
  } catch (error) {
    console.error('[ADMIN] Reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
