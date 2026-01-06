export const dynamic = 'force-static';

/**
 * TEMPORARY Admin Password Reset
 * Allows resetting a member's password without email
 * Protected by admin secret
 *
 * DELETE THIS FILE after Resend is fixed
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { createHash } from 'crypto';

// Password hashing (must match register/signin)
function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT || 'maia-sovereign-salt';
  return createHash('sha256').update(password + salt).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword, adminSecret } = await request.json();

    // Protect with admin secret
    const expectedSecret = process.env.ADMIN_RESET_SECRET || 'maia-admin-reset-2026';
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

    // Update password
    const passwordHash = hashPassword(newPassword);
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
