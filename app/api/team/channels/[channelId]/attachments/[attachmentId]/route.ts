import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { requireChannelAccess } from '@/lib/team/permissions';
import { findChannelAttachment } from '@/lib/team/ChannelService';
import { readVaultBytes } from '@/lib/storage/fileVault';

export const dynamic = 'force-dynamic';

/**
 * Serve a channel message image attachment. Gated by the SAME access rule as reading
 * the channel's messages (requireChannelAccess) — an image is exactly as protected as
 * the message it belongs to. The lookup is channel-scoped, so an attachment id from
 * another conversation cannot resolve here.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string; attachmentId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { channelId, attachmentId } = await params;

  const access = await requireChannelAccess(channelId, memberId);
  if (!access.allowed) {
    const status = access.reason === 'not_found' ? 404 : 403;
    return NextResponse.json({ error: access.reason ?? 'Forbidden' }, { status });
  }

  const att = await findChannelAttachment(channelId, attachmentId);
  if (!att) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let bytes: Buffer;
  try {
    bytes = await readVaultBytes(att.storagePath);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'Content-Type': att.mimeType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${att.filename}"`,
      'Content-Length': String(bytes.length),
      // Content is immutable (uuid-addressed); private to authorized members.
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  });
}
