export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { createHash } from 'crypto';

function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT || 'maia-sovereign-salt';
  return createHash('sha256').update(password + salt).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, newPassword } = body;

    if (!memberId || !newPassword) {
      return NextResponse.json(
        { error: 'Member ID and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = hashPassword(newPassword);

    // Update password in database
    const result = await query(
      'UPDATE members SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
      [passwordHash, memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}
