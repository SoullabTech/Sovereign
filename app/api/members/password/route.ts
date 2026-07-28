export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { hashPassword } from '@/lib/auth/passwordUtils';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

/**
 * Self-service password change for the AUTHENTICATED member.
 *
 * The member whose password changes is derived from the verified session
 * (`getMemberIdFromRequest`) and never from the request body. A `memberId` in
 * the body is treated as an unverified *claim*: it is honored only when it
 * matches the session, and a mismatch is rejected rather than silently ignored,
 * so acting on another member is a hard failure. This mirrors the hardening
 * already applied in `lib/auth/getMemberFromRequest.ts`.
 *
 * This route is self-service ONLY. Administrative reset is a separate,
 * separately-authorized surface (`/api/admin/reset-member-password`); do not
 * reintroduce a caller-chosen target member here.
 */
export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { memberId: claimedMemberId, newPassword } = body;

    // A body-supplied member id may not designate a different member.
    if (claimedMemberId && claimedMemberId !== memberId) {
      return NextResponse.json(
        { error: "Cannot change another member's password" },
        { status: 403 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Hash the new password with bcrypt
    const passwordHash = await hashPassword(newPassword);

    // Update password in database and mark as changed — scoped to the session's
    // member, so the row written is never chosen by the caller.
    const result = await query(
      'UPDATE members SET password_hash = $1, password_changed_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING id',
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
