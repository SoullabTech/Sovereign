// Production web requires force-dynamic for runtime database access / auth.
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120; // large .docx/.pdf extraction can take a moment

/**
 * Soullab Press — Manuscript upload ingest (DOCX / PDF / TXT / MD → text).
 *
 * POST (multipart/form-data, field `file`) → { text, warnings, title, sourceArrivalId }
 *
 * The extracted text flows back into the member's own hands: it lands in the
 * upload textarea, the member reviews it, then proceeds through the existing
 * member-confirmed segmentation + save path in ../route.ts. The author's words
 * are carried through unchanged.
 *
 * WS-01 — this is also the ONLY moment the arrival itself exists.
 *
 * Downstream, the text passes through a member-editable textarea and a
 * member-editable confirm-cuts preview before anything is written, so nothing
 * the client sends later can be called "what arrived". So the artifact's exact
 * bytes and the extraction they produced are placed in custody HERE, before the
 * member can edit and before any segmentation runs. Custody is recorded even if
 * the member then abandons the import — an unclaimed arrival is an orphan row a
 * sweep can collect, which is strictly better than a false claim of custody.
 *
 * Member-scoped by credential — 401 without a verified session. No parameter
 * can name another member; nothing is written.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { parseUpload, UnsupportedUploadError } from '@/lib/manuscript/ingest/parseUpload';
import { memberRef } from '@/lib/privacy/memberRef';
import { recordArtifactArrival } from '@/lib/manuscript/source/arrivals';

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB — generous for a full book file
const MAX_TEXT_CHARS = 2_000_000; // mirrors the save path's cap in ../route.ts

function titleFromFilename(filename: string): string {
  return filename.replace(/\.[a-z0-9]+$/i, '').trim();
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      // A throw here does NOT mean no file was chosen — the most common cause is
      // a body dropped in transit before it reached this handler (see
      // experimental.middlewareClientMaxBodySize in next.config.js). Saying
      // "expected a file" sent members looking for a mistake they had not made.
      // Stay neutral about the cause and name the one thing they can act on.
      return NextResponse.json(
        { error: 'The upload could not be read. Confirm the file is under 25 MB and try again.' },
        { status: 400 },
      );
    }

    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'File too large (25 MB max)' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let result;
    try {
      result = await parseUpload(buffer, file.name, file.type);
    } catch (err) {
      if (err instanceof UnsupportedUploadError) {
        return NextResponse.json({ error: err.message }, { status: 415 });
      }
      console.error('[press/manuscripts/ingest] parse error:', err);
      return NextResponse.json(
        { error: 'We could not read that file. Try a .docx, .pdf, .txt, or .md.' },
        { status: 422 },
      );
    }

    if (result.text.length > MAX_TEXT_CHARS) {
      return NextResponse.json({ error: 'Manuscript too large (2MB of text max)' }, { status: 413 });
    }

    // Log marker: counts only, never content.
    console.log(
      `[MAIA/press] manuscript ingest { memberRef: ${memberRef(memberId)}, ` +
        `format: ${result.format}, chars: ${result.text.length}, warnings: ${result.warnings.length} }`,
    );

    // Bytes into custody before anything interprets them. A failure here fails
    // the import: an arrival we could not preserve must not proceed as though
    // it had been (P0 — Source custody).
    let sourceArrivalId: string;
    try {
      const arrival = await recordArtifactArrival({
        memberId,
        bytes: buffer,
        originalFilename: file.name,
        mimeType: file.type || null,
        sourceText: result.text,
        extractor: result.format,
      });
      sourceArrivalId = arrival.id;
    } catch (err) {
      console.error('[press/manuscripts/ingest] source custody failed', err);
      return NextResponse.json(
        { error: 'We could not take custody of that file. Nothing was saved — please try again.' },
        { status: 500 },
      );
    }

    // Log marker: counts and provenance only, never content.
    console.log(
      `[MAIA/press] source custody { memberRef: ${memberRef(memberId)}, ` +
        `kind: artifact_extraction, bytes: ${buffer.byteLength}, chars: ${result.text.length} }`,
    );

    return NextResponse.json({
      text: result.text,
      warnings: result.warnings,
      title: titleFromFilename(file.name),
      format: result.format,
      sourceArrivalId,
    });
  } catch (err) {
    console.error('[press/manuscripts/ingest] POST error:', err);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
