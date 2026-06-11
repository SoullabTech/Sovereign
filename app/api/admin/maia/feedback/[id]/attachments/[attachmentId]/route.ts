export const dynamic = 'force-dynamic';

// Serve a feedback screenshot to the Feedback Inbox (admin-gated).
// Mirrors the Co-Lab attachment serve route, but the gate is requireAdmin and the lookup is
// scoped to the feedback row, so an attachment id can only resolve via the report it belongs to.

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireAdminMember, isAdminGateResponse } from '@/lib/admin/requireAdminMember';
import { readVaultBytes } from '@/lib/storage/fileVault';
import { parseStoredAttachments } from '@/lib/team/attachments';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const gate = await requireAdminMember(request);
  if (isAdminGateResponse(gate)) return gate;

  const { id, attachmentId } = await params;
  const fid = Number(id);
  if (!Number.isInteger(fid)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const r = await query(`SELECT attachments FROM platform_feedback WHERE id = $1`, [fid]);
  if (!r.rows.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const att = parseStoredAttachments(r.rows[0].attachments).find((a) => a.id === attachmentId);
  if (!att) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

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
      // Immutable (uuid-addressed); private to admins.
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  });
}
