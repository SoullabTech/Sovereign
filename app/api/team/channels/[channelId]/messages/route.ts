import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getMessages, getReplies, sendMessage, editMessage, markChannelRead } from '@/lib/team/ChannelService';
import { getSenderAttentionStates, COLAB_MESSAGE } from '@/lib/team/attention';
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

  // Enrich the sender's OWN messages with their attention-loop states, so the
  // sender sees Sent / Opened / Resolved / Declined. Only the creator sees these.
  // Non-fatal: the attention layer must NEVER break core messaging (e.g. if this
  // runs before the attention_items migration is applied — degrade, don't 500).
  try {
    const ownIds = messages.filter(m => m.senderId === memberId).map(m => m.id);
    if (ownIds.length > 0) {
      const states = await getSenderAttentionStates(COLAB_MESSAGE, ownIds, memberId);
      const byMsg = new Map<string, { recipientName: string; kind: string; status: 'open' | 'resolved' | 'declined'; opened: boolean }[]>();
      for (const s of states) {
        const arr = byMsg.get(s.sourceId) ?? [];
        arr.push({ recipientName: s.recipientName, kind: s.kind, status: s.status, opened: s.openedAt != null });
        byMsg.set(s.sourceId, arr);
      }
      for (const m of messages) {
        const st = byMsg.get(m.id);
        if (st) m.attentionStates = st;
      }
    }
  } catch (err) {
    console.error('[Co-lab/attention] sender-state enrichment skipped (non-fatal)', err);
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

  const VALID_KINDS = ['build', 'question', 'decision', 'insight', 'request'] as const;
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

// Edit a message's text body. Only the original author may edit (enforced in SQL
// by editMessage). The message id is in the body; channel access is checked first.
export async function PATCH(
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

  const body = await request.json().catch(() => ({}));
  const messageId = typeof body.messageId === 'string' ? body.messageId : '';
  const newBody = typeof body.body === 'string' ? body.body : '';
  if (!messageId) return NextResponse.json({ error: 'messageId is required' }, { status: 400 });
  if (!newBody.trim()) return NextResponse.json({ error: 'body is required' }, { status: 400 });

  try {
    const message = await editMessage(channelId, messageId, memberId, newBody);
    return NextResponse.json({ message });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error';
    const status = msg.includes('not found') || msg.includes('not editable') ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
