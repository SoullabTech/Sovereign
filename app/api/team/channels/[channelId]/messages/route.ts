import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getMessages, getReplies, sendMessage, markChannelRead } from '@/lib/team/ChannelService';
import { getSenderAttentionStates, COLAB_MESSAGE } from '@/lib/team/attention';
import { requireChannelAccess } from '@/lib/team/permissions';
import { processUploadedImages, AttachmentValidationError } from '@/lib/team/attachments';
import type { StoredMessageAttachment } from '@/lib/team/types';

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

  // Body arrives as JSON (text-only — unchanged) or multipart/form-data (with images).
  let msgBody = '';
  let parentId: string | undefined;
  let messageKind: unknown;
  let attachments: StoredMessageAttachment[] = [];

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const rawBody = form.get('body');
    msgBody = typeof rawBody === 'string' ? rawBody : '';
    const rawParent = form.get('parentId');
    parentId = typeof rawParent === 'string' && rawParent ? rawParent : undefined;
    messageKind = form.get('messageKind') ?? undefined;
    const files = form.getAll('images').filter((f): f is File => f instanceof File);
    try {
      attachments = await processUploadedImages(files);
    } catch (err) {
      if (err instanceof AttachmentValidationError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }
  } else {
    const body = await request.json();
    msgBody = typeof body.body === 'string' ? body.body : '';
    parentId = typeof body.parentId === 'string' ? body.parentId : undefined;
    messageKind = body.messageKind;
  }

  // Require text OR at least one image.
  if (!msgBody.trim() && attachments.length === 0) {
    return NextResponse.json({ error: 'body or image is required' }, { status: 400 });
  }

  const VALID_KINDS = ['build', 'question', 'decision', 'insight', 'request'] as const;
  type MessageKind = typeof VALID_KINDS[number];
  const validatedKind: MessageKind =
    typeof messageKind === 'string' && (VALID_KINDS as readonly string[]).includes(messageKind)
      ? (messageKind as MessageKind)
      : 'build';

  const message = await sendMessage(channelId, memberId, msgBody, parentId, validatedKind, attachments);

  // Mark read on send
  await markChannelRead(channelId, memberId);

  return NextResponse.json({ message }, { status: 201 });
}
