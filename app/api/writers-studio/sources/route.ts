import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

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

export async function POST() {
  // SOURCE-LAUNCH-HOLD: a verified member is not authorization to admit
  // original private files before Source custody, recovery and Class A.
  // This refusal occurs before multipart parsing, storage or SQL.
  return NextResponse.json(
    { error: 'Source uploads are temporarily unavailable pending independent security and recovery acceptance.' },
    { status: 423, headers: { 'Cache-Control': 'no-store' } },
  );
}
