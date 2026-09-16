import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { writeReviewed } from '@/lib/workbench/storage';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const rows = await query<{
    id: string; original_name: string; mime_type: string; size_bytes: string | number;
    source_kind: string; transcription_status: string; transcription_draft: string | null;
    transcription_reviewed: string | null; created_at: string; updated_at: string;
  }>(
    `SELECT id, original_name, mime_type, size_bytes, source_kind, transcription_status,
            transcription_draft, transcription_reviewed, created_at, updated_at
       FROM workbench_uploads
      WHERE id = $1 AND arranger_id = $2 AND sanctuary = FALSE`,
    [id, memberId],
  );
  const r = rows.rows[0];
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({
    source: {
      id: r.id, originalName: r.original_name, mimeType: r.mime_type, sizeBytes: Number(r.size_bytes),
      sourceKind: r.source_kind, transcriptionStatus: r.transcription_status,
      transcriptionDraft: r.transcription_draft, transcriptionReviewed: r.transcription_reviewed,
      createdAt: r.created_at, updatedAt: r.updated_at,
    },
  });
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { transcription?: unknown };
  if (typeof body.transcription !== 'string') {
    return NextResponse.json({ error: 'transcription must be text' }, { status: 400 });
  }
  const owned = await query<{ id: string }>(
    `SELECT id FROM workbench_uploads WHERE id = $1 AND arranger_id = $2 AND sanctuary = FALSE`,
    [id, memberId],
  );
  if (!owned.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await writeReviewed(memberId, id, body.transcription);
  const updated = await query<{ id: string; updated_at: string }>(
    `UPDATE workbench_uploads
        SET transcription_reviewed = $1, transcription_status = 'reviewed', updated_at = NOW()
      WHERE id = $2 AND arranger_id = $3
      RETURNING id, updated_at`,
    [body.transcription, id, memberId],
  );
  return NextResponse.json({ source: { id: updated.rows[0].id, transcriptionStatus: 'reviewed', updatedAt: updated.rows[0].updated_at } });
}
