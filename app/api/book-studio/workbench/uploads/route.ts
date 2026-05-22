/**
 * POST /api/book-studio/workbench/uploads
 * GET  /api/book-studio/workbench/uploads
 *
 * Accept file uploads into the Workbench. The file is stored on the host
 * filesystem (lib/workbench/storage.ts), the extracted text is written to the
 * DB, and the row is returned with its transcription_status.
 *
 * Slice 1 supports:
 *   typed_text  — .txt, .md             → status='reviewed' on upload (no review needed)
 *   typed_doc   — .docx, text-PDFs      → status='reviewed' for .docx, 'draft' for PDFs
 *
 * Slice 2 adds:
 *   handwritten_image, scanned_pdf      → OCR pipeline
 *
 * For Slice 1 we reject image and scanned-PDF uploads with a clear error so
 * the surface doesn't silently accept material it can't process.
 *
 * Auth: requireFounder() — same gate as the rest of /book-studio.
 * Sovereignty: nothing leaves the host. All extraction is local.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireFounder } from '@/lib/founder/founderAuth';
import { query } from '@/lib/db/postgres';
import { writeOriginal, writeReviewed, writeDraft, extFromName, deleteUpload } from '@/lib/workbench/storage';
import { extractText } from '@/lib/workbench/extract/text';
import { extractDocx } from '@/lib/workbench/extract/docx';
import { extractPdf } from '@/lib/workbench/extract/pdf';
import { originalPath } from '@/lib/workbench/storage';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 50 * 1024 * 1024; // 50MB

type SourceKind = 'typed_text' | 'typed_doc' | 'handwritten_image' | 'scanned_pdf';

interface Classification {
  kind: SourceKind | null;
  reason?: string;
}

function classify(mime: string, ext: string): Classification {
  const e = ext.toLowerCase();
  const m = mime.toLowerCase();

  if (e === 'txt' || e === 'md' || m === 'text/plain' || m === 'text/markdown') {
    return { kind: 'typed_text' };
  }
  if (
    e === 'docx' ||
    m === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return { kind: 'typed_doc' };
  }
  if (e === 'pdf' || m === 'application/pdf') {
    // PDF needs runtime classification — could be typed (typed_doc) or scanned (scanned_pdf).
    // Caller resolves after extraction.
    return { kind: 'typed_doc' };
  }
  if (['jpg', 'jpeg', 'png', 'heic', 'heif'].includes(e) || m.startsWith('image/')) {
    return { kind: 'handwritten_image', reason: 'OCR not yet wired (Slice 2)' };
  }
  return { kind: null, reason: `Unsupported type: ${mime || e}` };
}

export async function POST(req: NextRequest) {
  const auth = await requireFounder();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const arrangerId = auth.memberId;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file field' }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'Empty file' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File exceeds ${MAX_BYTES} bytes` },
      { status: 413 },
    );
  }

  const ext = extFromName(file.name);
  const cls = classify(file.type, ext);
  if (!cls.kind) {
    return NextResponse.json({ error: cls.reason ?? 'Unsupported type' }, { status: 415 });
  }
  if (cls.kind === 'handwritten_image' || cls.kind === 'scanned_pdf') {
    return NextResponse.json(
      { error: cls.reason ?? 'OCR not yet wired (Slice 2)' },
      { status: 415 },
    );
  }

  // Create the row first so we have an upload id for the filesystem path.
  const insert = await query<{ id: string }>(
    `INSERT INTO workbench_uploads
       (arranger_id, original_name, mime_type, size_bytes, storage_path,
        source_kind, transcription_status)
     VALUES ($1, $2, $3, $4, '', $5, 'extracting')
     RETURNING id`,
    [arrangerId, file.name, file.type || 'application/octet-stream', file.size, cls.kind],
  );
  const uploadId = insert.rows[0].id;

  try {
    // Write the original file to disk.
    const buf = Buffer.from(await file.arrayBuffer());
    const relPath = await writeOriginal(arrangerId, uploadId, ext, buf);

    // Extract text based on source kind.
    let text = '';
    let status: 'reviewed' | 'draft' = 'reviewed';
    let finalKind: SourceKind = cls.kind;

    if (cls.kind === 'typed_text') {
      text = await extractText(originalPath(arrangerId, uploadId, ext));
      status = 'reviewed';
    } else if (cls.kind === 'typed_doc' && ext === 'docx') {
      text = await extractDocx(originalPath(arrangerId, uploadId, ext));
      status = 'reviewed';
    } else if (cls.kind === 'typed_doc' && ext === 'pdf') {
      const result = await extractPdf(originalPath(arrangerId, uploadId, ext));
      if (result.likelyScanned) {
        // Scanned PDF — Slice 2 territory. Roll back.
        await deleteUpload(arrangerId, uploadId);
        await query('DELETE FROM workbench_uploads WHERE id = $1', [uploadId]);
        return NextResponse.json(
          { error: 'Scanned PDF detected — OCR not yet wired (Slice 2)' },
          { status: 415 },
        );
      }
      text = result.text;
      status = 'draft'; // PDFs need review even when extraction succeeds
    }

    // Persist the extracted text.
    if (status === 'reviewed') {
      await writeReviewed(arrangerId, uploadId, text);
      await query(
        `UPDATE workbench_uploads
         SET storage_path = $1,
             transcription_reviewed = $2,
             transcription_status = 'reviewed',
             updated_at = NOW()
         WHERE id = $3`,
        [relPath, text, uploadId],
      );
    } else {
      await writeDraft(arrangerId, uploadId, text);
      await query(
        `UPDATE workbench_uploads
         SET storage_path = $1,
             transcription_draft = $2,
             transcription_status = 'draft',
             updated_at = NOW()
         WHERE id = $3`,
        [relPath, text, uploadId],
      );
    }

    return NextResponse.json({
      ok: true,
      id: uploadId,
      sourceKind: finalKind,
      transcriptionStatus: status,
    });
  } catch (err) {
    // Roll back the row and filesystem on extraction failure.
    await deleteUpload(arrangerId, uploadId).catch(() => undefined);
    await query(
      `UPDATE workbench_uploads
       SET transcription_status = 'error',
           error_message = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [err instanceof Error ? err.message : 'Extraction failed', uploadId],
    );
    console.error('[WorkbenchUpload]', err);
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireFounder();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 100), 200);
  const result = await query(
    `SELECT id, original_name, mime_type, size_bytes, source_kind,
            transcription_status, sanctuary, created_at, updated_at
     FROM workbench_uploads
     WHERE arranger_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [auth.memberId, limit],
  );

  return NextResponse.json({ uploads: result.rows });
}
