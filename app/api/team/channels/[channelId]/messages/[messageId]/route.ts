import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { deleteMessage, editMessage } from '@/lib/team/ChannelService';
import { requireChannelAccess } from '@/lib/team/permissions';

export const dynamic = 'force-dynamic';

// Soft-delete a single channel message.
// Permission is enforced in deleteMessage(): sender, or channel owner/admin,
// or global team admin. Channel access is required to even attempt it.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string; messageId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { channelId, messageId } = await params;

  const access = await requireChannelAccess(channelId, memberId);
  if (!access.allowed) {
    const status = access.reason === 'not_found' ? 404 : 403;
    return NextResponse.json({ error: access.reason ?? 'Forbidden' }, { status });
  }

  const result = await deleteMessage(channelId, messageId, memberId);
  if (!result.ok) {
    const status = result.reason === 'not_found' ? 404 : 403;
    return NextResponse.json({ error: result.reason }, { status });
  }

  return NextResponse.json({ ok: true });
}

// Edit a single channel message's text. Sender-only (enforced in editMessage).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string; messageId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { channelId, messageId } = await params;

  const access = await requireChannelAccess(channelId, memberId);
  if (!access.allowed) {
    const status = access.reason === 'not_found' ? 404 : 403;
    return NextResponse.json({ error: access.reason ?? 'Forbidden' }, { status });
  }

  const body = await request.json().catch(() => ({}));
  const newBody = typeof body.body === 'string' ? body.body : '';

  const result = await editMessage(channelId, messageId, memberId, newBody);
  if (!result.ok) {
    const status =
      result.reason === 'not_found' ? 404
      : result.reason === 'forbidden' ? 403
      : 400; // empty | too_long
    return NextResponse.json({ error: result.reason }, { status });
  }

  return NextResponse.json({ ok: true, editedAt: result.editedAt });
}
