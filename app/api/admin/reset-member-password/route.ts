export const dynamic = 'force-dynamic';

/**
 * TEMPORARY Admin Password Reset
 * Allows resetting a member's password without email
 * REQUIRES founder-level admin proof AND a separately configured reset secret.
 * Emergency-only. No member-password recovery through this route.
 *
 * Retire this surface when the approved recovery path is fully operational.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { hashPassword } from '@/lib/auth/passwordUtils';
import { checkAdminAuth } from '@/lib/admin/adminAuth';

export async function POST(request: NextRequest) {
  // A reset secret in the body is NOT proof of administrator identity.
  // Gate access before reading/parsing any caller-controlled member fields.
  // This accepts an authenticated founder member session or the existing
  // founder-equivalent x-admin-password; the independent reset secret remains
  // required in both cases. A forged x-member-id never grants admin access.
  const founder = await checkAdminAuth(request, ['founder'], 'POST /api/admin/reset-member-password');
  if (!founder.authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fail closed if the separate secret is absent OR was configured to be
    // the shared admin password. Two equal static values are not two gates.
    const expectedSecret = process.env.ADMIN_RESET_SECRET;
    if (!expectedSecret || expectedSecret === process.env.LABTOOLS_ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Admin reset not configured' }, { status: 503 });
    }
    const body = await request.json();
    const { email, newPassword, adminSecret } = body || {};

    if (typeof adminSecret !== 'string' || adminSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (typeof email !== 'string' || !email.trim()
        || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'Email and newPassword required' },
        { status: 400 }
      );
    }

    // bcrypt accepts at most 72 UTF-8 bytes. Reject longer passwords rather
    // than silently truncating two different proposed passwords to one hash.
    if (Array.from(newPassword).length < 12 || Buffer.byteLength(newPassword, 'utf8') > 72) {
      return NextResponse.json(
        { error: 'Password must be at least 12 characters and at most 72 UTF-8 bytes' },
        { status: 400 }
      );
    }

    // Find member by email
    const result = await query(
      'SELECT id, username, name FROM members WHERE email = $1',
      [email.trim().toLowerCase()]
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

    // Avoid putting member identifiers or credentials in application logs.
    console.info('[admin/password-reset] Authorized reset completed');

    return NextResponse.json({
      success: true,
      message: `Password reset for ${member.name} (${member.username})`,
      username: member.username
    });
  } catch {
    console.error('[admin/password-reset] Reset request failed');
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
