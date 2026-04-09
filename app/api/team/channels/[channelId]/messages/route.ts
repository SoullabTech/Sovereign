import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getMessages, getReplies, sendMessage, markChannelRead } from '@/lib/team/ChannelService';
import { requireChannelAccess } from '@/lib/team/permissions';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { channelId } = await params;

  const access = await requireChannelAccess(channelId, memberId);
  if (!access.allowed) {
    const status = access.reason === 'not_found' ? 404 : 403;
    return NextResponse.json({ error: access.reason ?? 'Forbidden' }, { status });
  }

  const url = new URL(request.url);
  const parentId = url.searchParams.get('parentId') ?? undefined;

  // Thread replies path
  if (parentId) {
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '100', 10), 200);
    const messages = await getReplies(channelId, parentId, { limit });
    for (const msg of messages) {
      for (const r of msg.reactions) {
        r.hasMine = r.memberIds.includes(memberId);
      }
    }
    return NextResponse.json({ messages });
  }

  // Top-level messages path
  const before = url.searchParams.get('before') ?? undefined;
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 100);

  const messages = await getMessages(channelId, { limit, before });

  // Enrich hasMine on reactions
  for (const msg of messages) {
    for (const r of msg.reactions) {
      r.hasMine = r.memberIds.includes(memberId);
    }
  }

  return NextResponse.json({ messages });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { channelId } = await params;

  const access = await requireChannelAccess(channelId, memberId);
  if (!access.allowed) {
    const status = access.reason === 'not_found' ? 404 : 403;
    return NextResponse.json({ error: access.reason ?? 'Forbidden' }, { status });
  }

  const body = await request.json();
  const { body: msgBody, parentId, messageKind } = body;

  if (!msgBody || typeof msgBody !== 'string') {
    return NextResponse.json({ error: 'body is required' }, { status: 400 });
  }

  const VALID_KINDS = ['build', 'question', 'decision', 'insight'] as const;
  type MessageKind = typeof VALID_KINDS[number];
  const validatedKind: MessageKind =
    typeof messageKind === 'string' && (VALID_KINDS as readonly string[]).includes(messageKind)
      ? (messageKind as MessageKind)
      : 'build';

  const message = await sendMessage(channelId, memberId, msgBody, parentId, validatedKind);

  // Mark read on send
  await markChannelRead(channelId, memberId);

  return NextResponse.json({ message }, { status: 201 });
}
