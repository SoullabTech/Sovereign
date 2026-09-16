export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomUUID } from 'node:crypto';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { deleteVaultBytes, writeVaultBytes } from '@/lib/storage/fileVault';
import { sweepVaultErasureQueue } from '@/lib/manuscript/source/eraseManuscript';
import { inspectCoverPdf } from '@/lib/manuscript/coverAssets/inspectPdf';
import { isCoverEdition, type CoverAssetMetadata } from '@/lib/manuscript/coverAssets/types';

const VAULT_NAMESPACE = 'manuscript-covers';
const MAX_BYTES = 25 * 1024 * 1024;

type CoverRow = {
  edition: string;
  storage_path: string;
  original_filename: string | null;
  mime_type: string;
  byte_size: string;
  sha256: string;
  page_count: number;
  page_width_pt: string;
  page_height_pt: string;
  chosen_at: string;
  updated_at: string;
};

function metadata(row: CoverRow): CoverAssetMetadata {
  return {
    edition: row.edition as CoverAssetMetadata['edition'],
    originalFilename: row.original_filename,
    mimeType: 'application/pdf',
    byteSize: Number(row.byte_size),
    sha256: row.sha256,
    pageCount: 1,
    pageWidthPt: Number(row.page_width_pt),
    pageHeightPt: Number(row.page_height_pt),
    chosenAt: row.chosen_at,
    updatedAt: row.updated_at,
    printGeometryStatus: 'not_yet_certified',
  };
}

async function ownedManuscript(manuscriptId: string, memberId: string): Promise<boolean> {
  const owned = await query<{ id: string }>(
    `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
    [manuscriptId, memberId],
  );
  return owned.rows.length > 0;
}

async function identity(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; edition: string }> },
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } as const;
  const { id, edition } = await ctx.params;
  if (!isCoverEdition(edition)) {
    return { error: NextResponse.json({ error: 'Unknown cover edition' }, { status: 400 }) } as const;
  }
  if (!(await ownedManuscript(id, memberId))) {
    return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }) } as const;
  }
  return { memberId, manuscriptId: id, edition } as const;
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; edition: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const who = await identity(request, ctx);
    if ('error' in who) return who.error;
    const result = await query<CoverRow>(
      `SELECT edition, storage_path, original_filename, mime_type, byte_size, sha256,
              page_count, page_width_pt, page_height_pt, chosen_at, updated_at
         FROM manuscript_cover_assets
        WHERE manuscript_id = $1 AND member_id = $2 AND edition = $3`,
      [who.manuscriptId, who.memberId, who.edition],
    );
    const row = result.rows[0];
    return NextResponse.json({ cover: row ? metadata(row) : null });
  } catch (error) {
    console.error('[manuscript-cover] read failed', error);
    return NextResponse.json({ error: 'Could not read that cover.' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; edition: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  let written: string | null = null;
  try {
    const who = await identity(request, ctx);
    if ('error' in who) return who.error;

    let form: FormData;
    try { form = await request.formData(); }
    catch { return NextResponse.json({ error: 'Expected a cover PDF upload.' }, { status: 400 }); }
    const file = form.get('cover');
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'No cover PDF was received.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'That cover is larger than 25 MB.' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const inspection = await inspectCoverPdf(new Uint8Array(buffer));
    if (inspection.status === 'refused') {
      const error = inspection.refusal === 'cover_pdf_must_be_single_page'
        ? 'A print cover wrap must be a single-page PDF.'
        : inspection.refusal === 'cover_pdf_has_invalid_geometry'
          ? 'That PDF does not have usable physical page dimensions.'
          : 'That file is not a readable PDF.';
      return NextResponse.json({ error, refusal: inspection.refusal }, { status: inspection.refusal === 'not_pdf' ? 415 : 400 });
    }

    const sha256 = createHash('sha256').update(buffer).digest('hex');
    written = await writeVaultBytes(VAULT_NAMESPACE, randomUUID(), 'pdf', buffer);

    const result = await transaction(async (tx) => {
      const previous = await tx.query<{ storage_path: string }>(
        `SELECT storage_path FROM manuscript_cover_assets
          WHERE manuscript_id = $1 AND member_id = $2 AND edition = $3 FOR UPDATE`,
        [who.manuscriptId, who.memberId, who.edition],
      );
      const saved = await tx.query<CoverRow>(
        `INSERT INTO manuscript_cover_assets
           (manuscript_id, member_id, edition, storage_path, original_filename, mime_type,
            byte_size, sha256, page_count, page_width_pt, page_height_pt, chosen_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,'application/pdf',$6,$7,$8,$9,$10,now(),now())
         ON CONFLICT (manuscript_id, edition) DO UPDATE SET
           member_id = EXCLUDED.member_id,
           storage_path = EXCLUDED.storage_path,
           original_filename = EXCLUDED.original_filename,
           mime_type = EXCLUDED.mime_type,
           byte_size = EXCLUDED.byte_size,
           sha256 = EXCLUDED.sha256,
           page_count = EXCLUDED.page_count,
           page_width_pt = EXCLUDED.page_width_pt,
           page_height_pt = EXCLUDED.page_height_pt,
           chosen_at = now(), updated_at = now()
         RETURNING edition, storage_path, original_filename, mime_type, byte_size, sha256,
                   page_count, page_width_pt, page_height_pt, chosen_at, updated_at`,
        [who.manuscriptId, who.memberId, who.edition, written, file.name || null,
          buffer.length, sha256, inspection.pageCount, inspection.widthPt, inspection.heightPt],
      );
      const old = previous.rows[0]?.storage_path;
      if (old && old !== written) {
        await tx.query(`INSERT INTO vault_erasure_queue (artifact_ref) VALUES ($1)`, [old]);
      }
      return { row: saved.rows[0]!, superseded: old ?? null };
    });

    written = null;
    if (result.superseded) await sweepVaultErasureQueue();
    return NextResponse.json({ cover: metadata(result.row) });
  } catch (error) {
    console.error('[manuscript-cover] write failed', error);
    if (written) await deleteVaultBytes(written);
    return NextResponse.json({ error: 'Could not save that cover.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; edition: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const who = await identity(request, ctx);
    if ('error' in who) return who.error;

    const removed = await transaction(async (tx) => {
      const gone = await tx.query<{ storage_path: string }>(
        `DELETE FROM manuscript_cover_assets
          WHERE manuscript_id = $1 AND member_id = $2 AND edition = $3
        RETURNING storage_path`,
        [who.manuscriptId, who.memberId, who.edition],
      );
      const storagePath = gone.rows[0]?.storage_path;
      if (storagePath) {
        await tx.query(`INSERT INTO vault_erasure_queue (artifact_ref) VALUES ($1)`, [storagePath]);
      }
      return storagePath ?? null;
    });

    if (!removed) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const swept = await sweepVaultErasureQueue();
    return NextResponse.json({ removed: true, bytesDestroyed: swept.remaining === 0 });
  } catch (error) {
    console.error('[manuscript-cover] remove failed', error);
    return NextResponse.json({ error: 'Could not remove that cover.' }, { status: 500 });
  }
}
