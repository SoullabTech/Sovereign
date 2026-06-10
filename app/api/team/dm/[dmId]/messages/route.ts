import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getDMMessages, sendDMMessage, editDMMessage, deleteDMMessage, markDMRead } from '@/lib/team/DMService';
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
  const { body: msgBody, message_type } = body;

  if (!msgBody || typeof msgBody !== 'string') {
    return NextResponse.json({ error: 'body is required' }, { status: 400 });
  }

  const validTypes = ['build', 'decision', 'insight', 'question'] as const;
  type MsgType = typeof validTypes[number];
  const safeType: MsgType = validTypes.includes(message_type) ? (message_type as MsgType) : 'build';

  try {
    const message = await sendDMMessage(dmId, memberId, msgBody, safeType);

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
      payload: { dmId, message_type: safeType },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}

// Edit a DM message's text body. Only the original author may edit (enforced in SQL
// by editDMMessage, which also re-checks thread membership). Message id is in the body.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ dmId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { dmId } = await params;

  const body = await request.json().catch(() => ({}));
  const messageId = typeof body.messageId === 'string' ? body.messageId : '';
  const newBody = typeof body.body === 'string' ? body.body : '';
  if (!messageId) return NextResponse.json({ error: 'messageId is required' }, { status: 400 });
  if (!newBody.trim()) return NextResponse.json({ error: 'body is required' }, { status: 400 });

  try {
    const message = await editDMMessage(dmId, messageId, memberId, newBody);
    return NextResponse.json({ message });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error';
    const status = msg.includes('not found') || msg.includes('not editable') ? 404 : 403;
    return NextResponse.json({ error: msg }, { status });
  }
}

// Soft-delete a DM message. Only the original author may delete (enforced in SQL by
// deleteDMMessage). Message id is in the body.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dmId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { dmId } = await params;

  const body = await request.json().catch(() => ({}));
  const messageId = typeof body.messageId === 'string' ? body.messageId : '';
  if (!messageId) return NextResponse.json({ error: 'messageId is required' }, { status: 400 });

  try {
    const deleted = await deleteDMMessage(dmId, messageId, memberId);
    if (!deleted) return NextResponse.json({ error: 'Message not found or not deletable' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}
