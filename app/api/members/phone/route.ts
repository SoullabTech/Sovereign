import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { isSmsConfigured } from '@/lib/sms/config';
import { maskPhone } from '@/lib/sms/phoneNumber';

export const dynamic = 'force-dynamic';

// GET — this member's phone verification status (for the Notifications panel).
export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const res = await query<{ phone: string | null; phone_verified: boolean | null }>(
      `SELECT phone, phone_verified FROM members WHERE id = $1`,
      [memberId]
    );
    const row = res.rows[0];
    const verified = row?.phone_verified === true;
    return NextResponse.json({
      available: isSmsConfigured(),
      verified,
      masked: verified ? maskPhone(row?.phone ?? null) : null,
    });
  } catch {
    return NextResponse.json({ available: isSmsConfigured(), verified: false, masked: null });
  }
}

// DELETE — remove the phone and opt out of ALL SMS (consent symmetry: a member
// can always withdraw). Clears the number, verification, and every sms override.
export async function DELETE(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await query(
      `UPDATE members
         SET phone = NULL, phone_verified = FALSE, phone_verified_at = NULL, sms_consent_at = NULL
       WHERE id = $1`,
      [memberId]
    );
    await query(
      `DELETE FROM member_notification_preferences WHERE member_id = $1 AND channel = 'sms'`,
      [memberId]
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not remove phone' }, { status: 500 });
  }
}
