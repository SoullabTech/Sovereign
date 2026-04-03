/**
 * NOSTR PUBLISH RECORD
 *
 * POST: Record that a member published a Nostr event.
 * Called fire-and-forget by the client after successful publish.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { recordPublish } from '@/lib/nostr/publishRecord';

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ ok: true });
  }

  const session = await getCurrentSession();
  const memberId = session?.memberId ?? null;

  if (!memberId) {
    return NextResponse.json({ error: 'Session required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { eventId, contentType, signatureMode, relayUrl, publishedAt, anonymous } = body;

    if (!eventId || !contentType) {
      return NextResponse.json({ error: 'eventId and contentType required' }, { status: 400 });
    }

    await recordPublish({
      eventId,
      memberId,
      contentType: contentType ?? 'reflection',
      signatureMode: signatureMode ?? 'member',
      relayUrl: relayUrl ?? 'wss://nostr.soullab.life',
      publishedAt: publishedAt ?? new Date().toISOString(),
      anonymous: anonymous ?? false,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[Nostr Publish Record]', err.message);
    return NextResponse.json({ error: 'Failed to record' }, { status: 500 });
  }
}
