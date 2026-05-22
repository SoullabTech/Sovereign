/**
 * GET /api/book-studio/workbench/uploads/[id]/file
 *
 * Stream the original uploaded file back to the arranger. Used by the
 * TranscriptionReview UI to show the source-of-truth alongside the
 * editable draft (Slice 2), and by any future round-trip surface.
 *
 * Sanctuary uploads still stream — the arranger may need to view their
 * own sanctuary material. Sanctuary only restricts Shelf visibility and
 * graduation, not direct access.
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { requireFounder } from '@/lib/founder/founderAuth';
import { query } from '@/lib/db/postgres';
import { originalPath, extFromName } from '@/lib/workbench/storage';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireFounder();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await params;

  const result = await query<{ original_name: string; mime_type: string }>(
    `SELECT original_name, mime_type
     FROM workbench_uploads
     WHERE id = $1 AND arranger_id = $2`,
    [id, auth.memberId],
  );
  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const { original_name, mime_type } = result.rows[0];
  const ext = extFromName(original_name);

  try {
    const buf = await fs.readFile(originalPath(auth.memberId, id, ext));
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': mime_type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${encodeURIComponent(original_name)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'File missing on disk' }, { status: 500 });
  }
}
