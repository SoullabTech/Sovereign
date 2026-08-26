/**
 * GATHER-02 — the original, exactly as it arrived.
 *
 * A writer who brought in a recording must be able to play it, and one who
 * brought in a PDF must be able to open it. Otherwise "your materials" means
 * "text we managed to extract", which is not the same thing and would quietly
 * make the Studio a worse home for the file than the writer's own disk.
 *
 * The bytes are re-hashed on the way out and the digest is returned as an
 * ETag. If the vault has drifted from what the row claims, the mismatch is
 * visible rather than silent — the same discipline verifyCustody applies to
 * manuscript sources.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { readVaultBytes } from '@/lib/storage/fileVault';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const res = await query<{
      artifact_ref: string | null;
      artifact_hash: string | null;
      original_filename: string | null;
      mime_type: string | null;
    }>(
      `SELECT artifact_ref, artifact_hash, original_filename, mime_type
         FROM studio_materials
        WHERE id = $1 AND member_id = $2`,
      [id, memberId],
    );
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const m = res.rows[0];
    if (!m.artifact_ref) {
      return NextResponse.json(
        { error: 'no_file', message: 'This material did not arrive as a file.' },
        { status: 404 },
      );
    }

    let bytes: Buffer;
    try {
      bytes = await readVaultBytes(m.artifact_ref);
    } catch {
      // The row says the bytes exist and they do not. Say so; do not 404 as if
      // the material had never been brought in.
      console.error('[studio/materials] artifact missing', { id });
      return NextResponse.json(
        { error: 'artifact_missing', message: 'The original could not be found in the vault.' },
        { status: 410 },
      );
    }

    const digest = createHash('sha256').update(bytes).digest('hex');
    if (m.artifact_hash && digest !== m.artifact_hash) {
      console.error('[studio/materials] artifact hash mismatch', { id });
      return NextResponse.json(
        {
          error: 'artifact_hash_mismatch',
          message: 'The stored file no longer matches what arrived.',
        },
        { status: 409 },
      );
    }

    const filename = (m.original_filename ?? 'material').replace(/["\\]/g, '');
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': m.mime_type || 'application/octet-stream',
        'Content-Length': String(bytes.byteLength),
        'Content-Disposition': `inline; filename="${filename}"`,
        ETag: `"${digest}"`,
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[studio/materials] file read failed', error);
    return NextResponse.json({ error: 'Could not open that file just now' }, { status: 500 });
  }
}
