import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { isDMThreadMember, findDMAttachment } from '@/lib/team/DMService';
import { readVaultBytes } from '@/lib/storage/fileVault';

export const dynamic = 'force-dynamic';

/**
 * Serve a DM image attachment. Gated by the SAME access rule as reading the thread's
 * messages (thread membership) — an image is exactly as protected as the message it
 * belongs to. The lookup is thread-scoped, so an attachment id from another
 * conversation cannot resolve here.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dmId: string; attachmentId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { dmId, attachmentId } = await params;

  const isMember = await isDMThreadMember(dmId, memberId);
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const att = await findDMAttachment(dmId, attachmentId);
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
