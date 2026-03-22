/**
 * POST /api/members/set-password
 *
 * Beta-only inline password reset — no email token needed.
 * Email is the identity proof (acceptable for closed beta).
 * Replace with token-verified flow before public launch.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { hashPassword } from '@/lib/auth/passwordUtils';

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required.' }, { status: 400 });
    }
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const exists = await query(
      `SELECT id FROM members WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (exists.rows.length === 0) {
      // Don't reveal whether email exists
      return NextResponse.json({ success: true });
    }

    const hash = await hashPassword(newPassword);
    await query(
      `UPDATE members SET password_hash = $1 WHERE LOWER(email) = LOWER($2)`,
      [hash, email.trim()]
    );

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[set-password]', err);
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
