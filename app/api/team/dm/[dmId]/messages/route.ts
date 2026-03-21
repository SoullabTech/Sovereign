import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getDMMessages, sendDMMessage, markDMRead } from '@/lib/team/DMService';
import { sendPartnerNotification } from '@/lib/masters/partnerNotifications';
import { logFieldActivity } from '@/lib/masters/fieldActivityLog';

// Slugs corresponding to the Kelly/Nathan partner relationship
const PARTNER_FIELD_SLUG = 'kelly';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dmId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { dmId } = await params;
  const url = new URL(request.url);
  const before = url.searchParams.get('before') ?? undefined;
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 100);

  try {
    const messages = await getDMMessages(dmId, memberId, { limit, before });
    await markDMRead(dmId, memberId);
    return NextResponse.json({ messages });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dmId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { dmId } = await params;
  const body = await request.json();
  const { body: msgBody } = body;

  if (!msgBody || typeof msgBody !== 'string') {
    return NextResponse.json({ error: 'body is required' }, { status: 400 });
  }

  try {
    const message = await sendDMMessage(dmId, memberId, msgBody);

    // Fire-and-forget: partner notification + activity log
    void sendPartnerNotification({
      event: 'dm_sent',
      actorId: memberId,
      fieldSlug: PARTNER_FIELD_SLUG,
      messagePreview: msgBody.slice(0, 120),
    });
    void logFieldActivity({
      fieldSlug: PARTNER_FIELD_SLUG,
      actorId: memberId,
      eventType: 'dm_sent',
      payload: { dmId },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}
