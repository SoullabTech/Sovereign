import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { ingestWorkbenchUpload, IntakeError } from '@/lib/workbench/intake';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await query<{
    id: string; original_name: string; mime_type: string; size_bytes: string | number;
    source_kind: string; transcription_status: string; created_at: string; updated_at: string;
  }>(
    `SELECT id, original_name, mime_type, size_bytes, source_kind,
            transcription_status, created_at, updated_at
       FROM workbench_uploads
      WHERE arranger_id = $1 AND sanctuary = FALSE
      ORDER BY created_at DESC`,
    [memberId],
  );
  return NextResponse.json({
    sources: rows.rows.map((r) => ({
      id: r.id,
      originalName: r.original_name,
      mimeType: r.mime_type,
      sizeBytes: Number(r.size_bytes),
      sourceKind: r.source_kind,
      transcriptionStatus: r.transcription_status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
  });
}

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    const source = await ingestWorkbenchUpload(memberId, file);
    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    if (error instanceof IntakeError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[writers-studio/sources] intake failed', error);
    return NextResponse.json({ error: 'Could not bring that source in' }, { status: 500 });
  }
}
