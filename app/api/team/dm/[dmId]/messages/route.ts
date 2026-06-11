import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getDMMessages, sendDMMessage, markDMRead } from '@/lib/team/DMService';
import { sendPartnerNotification } from '@/lib/masters/partnerNotifications';
import { logFieldActivity } from '@/lib/masters/fieldActivityLog';
import { processUploadedImages, AttachmentValidationError } from '@/lib/team/attachments';
import type { StoredMessageAttachment } from '@/lib/team/types';

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

  // Body arrives as JSON (text-only — unchanged) or multipart/form-data (with images).
  let msgBody = '';
  let message_type: unknown;
  let attachments: StoredMessageAttachment[] = [];

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const rawBody = form.get('body');
    msgBody = typeof rawBody === 'string' ? rawBody : '';
    message_type = form.get('message_type') ?? undefined;
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
    message_type = body.message_type;
  }

  // Require text OR at least one image.
  if (!msgBody.trim() && attachments.length === 0) {
    return NextResponse.json({ error: 'body or image is required' }, { status: 400 });
  }

  const validTypes = ['build', 'decision', 'insight', 'question'] as const;
  type MsgType = typeof validTypes[number];
  const safeType: MsgType = validTypes.includes(message_type as MsgType) ? (message_type as MsgType) : 'build';

  try {
    const message = await sendDMMessage(dmId, memberId, msgBody, safeType, attachments);

    // Fire-and-forget: partner notification + activity log
    void sendPartnerNotification({
      event: 'dm_sent',
      actorId: memberId,
      fieldSlug: PARTNER_FIELD_SLUG,
      messagePreview: msgBody.slice(0, 120) || '📷 Image',
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
