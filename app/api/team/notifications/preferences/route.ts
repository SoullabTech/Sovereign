import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  getResolvedPreferences,
  setNotificationPreference,
  NOTIFICATION_EVENT_TYPES,
  NOTIFICATION_CHANNELS,
  type NotificationEventType,
  type NotificationChannel,
} from '@/lib/team/notificationPreferences';

export const dynamic = 'force-dynamic';

// GET — the authenticated member's full resolved preference matrix (defaults
// merged with their explicit overrides). Powers the Co-lab Notifications panel.
export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const preferences = await getResolvedPreferences(memberId);
  return NextResponse.json({ preferences });
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

  // v1 delivers in-app (the always-on badge) + email. SMS is defined in the schema
  // but not delivered until phase 3 — reject writes so there are no dead toggles.
  if (channel === 'sms') {
    return NextResponse.json(
      { error: 'SMS notifications are not available yet' },
      { status: 400 }
    );
  }

  try {
    await setNotificationPreference(memberId, event_type, channel, enabled);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
