// GET /api/admin/monitor/bugs/[id]/attachments/[attachmentId]
//
// Stream one screenshot attached to a bug report. Admin-gated by the same
// LABTOOLS_ADMIN_PASSWORD contract as the rest of /admin/monitor: a screenshot
// can show whatever was on the reporter's screen, so the bytes are NEVER public.
// Only an authenticated admin can retrieve them, and the vault storagePath is
// never exposed to any client (the bug's JSONB resolves it server-side here).

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin/adminAuth';
import { getBugAttachmentStored } from '@/lib/bugs/bugReports';
import { readVaultBytes } from '@/lib/storage/fileVault';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> },
) {
  // Session+role (founder/cto/…) OR shared password.
  if (!(await checkAdminAuth(request)).authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, attachmentId } = await params;

  const attachment = await getBugAttachmentStored(id, attachmentId).catch(() => null);
  if (!attachment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const bytes = await readVaultBytes(attachment.storagePath);
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        'Content-Type': attachment.mimeType,
        'Content-Length': String(bytes.length),
        // Evidence, not a public asset — keep it out of shared caches.
        'Cache-Control': 'private, no-store',
        'Content-Disposition': `inline; filename="${attachment.filename.replace(/"/g, '')}"`,
      },
    });
  } catch (err) {
    console.error('[admin/monitor/bugs/attachments] read failed:', err);
    return NextResponse.json({ error: 'Failed to read attachment' }, { status: 500 });
  }
}
