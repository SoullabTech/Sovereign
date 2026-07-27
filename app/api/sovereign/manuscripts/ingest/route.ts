// Production web requires force-dynamic for runtime database access / auth.
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120; // large .docx/.pdf extraction can take a moment

/**
 * Soullab Press — Manuscript upload ingest (DOCX / PDF / TXT / MD → text).
 *
 * POST (multipart/form-data, field `file`) → { text, warnings, title }
 *
 * Extraction only. The returned text flows back into the member's own hands:
 * it lands in the upload textarea, the member reviews it, then proceeds through
 * the existing member-confirmed segmentation + save path in ../route.ts.
 * Nothing is stored here. The author's words are carried through unchanged.
 *
 * Member-scoped by credential — 401 without a verified session. No parameter
 * can name another member; nothing is written.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { parseUpload, UnsupportedUploadError } from '@/lib/manuscript/ingest/parseUpload';

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
      return NextResponse.json({ error: 'Expected multipart/form-data with a file' }, { status: 400 });
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
      `[MAIA/press] manuscript ingest { memberIdPrefix: ${memberId.slice(0, 8)}, ` +
        `format: ${result.format}, chars: ${result.text.length}, warnings: ${result.warnings.length} }`,
    );

    return NextResponse.json({
      text: result.text,
      warnings: result.warnings,
      title: titleFromFilename(file.name),
      format: result.format,
    });
  } catch (err) {
    console.error('[press/manuscripts/ingest] POST error:', err);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
