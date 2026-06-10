import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { isSmsConfigured } from '@/lib/sms/config';
import { maskPhone } from '@/lib/sms/phoneNumber';
import {
  getResolvedPreferences,
  setNotificationPreference,
  NOTIFICATION_EVENT_TYPES,
  NOTIFICATION_CHANNELS,
  type NotificationEventType,
  type NotificationChannel,
} from '@/lib/team/notificationPreferences';

export const dynamic = 'force-dynamic';

// Phone verification status for the SMS column. Fails safe to "unverified".
async function getPhoneStatus(memberId: string): Promise<{ verified: boolean; masked: string | null }> {
  try {
    const res = await query<{ phone: string | null; phone_verified: boolean | null }>(
      `SELECT phone, phone_verified FROM members WHERE id = $1`,
      [memberId]
    );
    const row = res.rows[0];
    const verified = row?.phone_verified === true;
    return { verified, masked: verified ? maskPhone(row?.phone ?? null) : null };
  } catch {
    return { verified: false, masked: null };
  }
}

// GET — the authenticated member's full resolved preference matrix (defaults
// merged with their explicit overrides), plus SMS availability + phone status.
// Powers the Co-lab Notifications panel.
export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const preferences = await getResolvedPreferences(memberId);
  const available = isSmsConfigured();
  const phone = available ? await getPhoneStatus(memberId) : { verified: false, masked: null };

  return NextResponse.json({
    preferences,
    sms: { available, phoneVerified: phone.verified, phoneMasked: phone.masked },
  });
}

// PUT — set one explicit override { event_type, channel, enabled }.
export async function PUT(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const event_type = body?.event_type as NotificationEventType;
  const channel = body?.channel as NotificationChannel;
  const enabled = body?.enabled;

  if (
    !NOTIFICATION_EVENT_TYPES.includes(event_type) ||
    !NOTIFICATION_CHANNELS.includes(channel) ||
    typeof enabled !== 'boolean'
  ) {
    return NextResponse.json(
      { error: 'event_type, channel and boolean enabled are required' },
      { status: 400 }
    );
  }

  // SMS stays dormant until the flag + Twilio creds are present, and can only be
  // enabled once the member has a VERIFIED number to send to — no dead toggles.
  if (channel === 'sms') {
    if (!isSmsConfigured()) {
      return NextResponse.json({ error: 'SMS notifications are not available yet' }, { status: 400 });
    }
    if (enabled) {
      const phone = await getPhoneStatus(memberId);
      if (!phone.verified) {
        return NextResponse.json(
          { error: 'Verify a phone number before enabling SMS notifications', code: 'phone_unverified' },
          { status: 400 }
        );
      }
    }
  }

  try {
    await setNotificationPreference(memberId, event_type, channel, enabled);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
