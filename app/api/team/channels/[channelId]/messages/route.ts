import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getMessages, sendMessage, markChannelRead } from '@/lib/team/ChannelService';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { channelId } = await params;
  const url = new URL(request.url);
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
  const body = await request.json();
  const { body: msgBody, parentId } = body;

  if (!msgBody || typeof msgBody !== 'string') {
    return NextResponse.json({ error: 'body is required' }, { status: 400 });
  }

  const message = await sendMessage(channelId, memberId, msgBody, parentId);

  // Mark read on send
  await markChannelRead(channelId, memberId);

  return NextResponse.json({ message }, { status: 201 });
}
