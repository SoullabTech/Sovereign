import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { extFromName, originalPath } from '@/lib/workbench/storage';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const rows = await query<{ original_name: string; mime_type: string }>(
    `SELECT original_name, mime_type FROM workbench_uploads
      WHERE id = $1 AND arranger_id = $2 AND sanctuary = FALSE`,
    [id, memberId],
  );
  const row = rows.rows[0];
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  try {
    const buf = await fs.readFile(originalPath(memberId, id, extFromName(row.original_name)));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': row.mime_type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${encodeURIComponent(row.original_name)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Source file is missing' }, { status: 500 });
  }
}
