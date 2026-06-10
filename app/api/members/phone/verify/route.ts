import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { isSmsVerifyConfigured } from '@/lib/sms/config';
import { normalizePhone, maskPhone } from '@/lib/sms/phoneNumber';
import { startPhoneVerification, checkPhoneVerification } from '@/lib/sms/verifyPhone';

export const dynamic = 'force-dynamic';

// POST — phone verification via Twilio Verify.
//   { action: 'start', phone }          → send an OTP code
//   { action: 'check', phone, code }    → confirm the code, mark verified + consent
export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Dormant until Twilio Verify is configured.
  if (!isSmsVerifyConfigured()) {
    return NextResponse.json({ error: 'SMS verification is not available yet' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action;
  const phone = normalizePhone(body?.phone);
  if (!phone) return NextResponse.json({ error: 'A valid phone number is required' }, { status: 400 });

  if (action === 'start') {
    const r = await startPhoneVerification(phone);
    if (!r.success) {
      const status = r.status === 'invalid_number' ? 400 : 502;
      return NextResponse.json({ error: 'Could not send verification code', reason: r.status }, { status });
    }
    // Persist the (still-unverified) number so the confirm step has it on record.
    try {
      await query(`UPDATE members SET phone = $2, phone_verified = FALSE WHERE id = $1`, [memberId, phone]);
    } catch {
      // Non-fatal: the code is already sent; the confirm step re-supplies phone.
    }
    return NextResponse.json({ ok: true, status: 'pending', masked: maskPhone(phone) });
  }

  if (action === 'check') {
    const code = typeof body?.code === 'string' ? body.code : '';
    const r = await checkPhoneVerification(phone, code);
    if (r.approved) {
      try {
        await query(
          `UPDATE members
             SET phone = $2, phone_verified = TRUE, phone_verified_at = NOW(), sms_consent_at = NOW()
           WHERE id = $1`,
          [memberId, phone]
        );
      } catch {
        return NextResponse.json({ error: 'Verified, but could not save. Please try again.' }, { status: 500 });
      }
      return NextResponse.json({ ok: true, verified: true, masked: maskPhone(phone) });
    }
    const status = r.status === 'error' ? 502 : 400;
    return NextResponse.json(
      { ok: false, verified: false, error: 'That code was not valid. Please try again.' },
      { status }
    );
  }

  return NextResponse.json({ error: "action must be 'start' or 'check'" }, { status: 400 });
}
