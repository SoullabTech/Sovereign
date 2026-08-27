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
import { detectFormat, parseUpload, UnsupportedUploadError } from '@/lib/manuscript/ingest/parseUpload';
import { memberRef } from '@/lib/privacy/memberRef';
import { recordArtifactArrival } from '@/lib/manuscript/source/arrivals';

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB — generous for a full book file
const MAX_TEXT_CHARS = 2_000_000; // mirrors the save path's cap in ../route.ts

function titleFromFilename(filename: string): string {
  return filename.replace(/\.[a-z0-9]+$/i, '').trim();
}

/**
 * Refuse an upload out loud.
 *
 * IMPORT-READ-01, 2026-08-27 — why this exists.
 *
 * A member reported that his book would no longer import. Thirty minutes of
 * production logs were then searched for any trace of the attempt and came back
 * empty, and that emptiness was read as evidence the request never reached this
 * route. It was not evidence of anything: of this handler's exit paths, only
 * three said a word. Unauthorized, no-file, empty-file, too-large, unreadable
 * body and over-long text all returned a message to the screen and nothing to
 * the record — so a failure the member could see left the system with no memory
 * of having failed.
 *
 * Every refusal now names itself, in counts and reasons only. Never a filename,
 * never a byte of the manuscript: the member's words are not diagnostics.
 */
function refuse(
  status: number,
  error: string,
  reason: string,
  ctx: { memberId?: string | null; bytes?: number; format?: string | null } = {},
): NextResponse {
  const who = ctx.memberId ? memberRef(ctx.memberId) : 'anonymous';
  console.warn(
    `[MAIA/press] INGEST REFUSED { memberRef: ${who}, status: ${status}, ` +
      `reason: ${reason}, bytes: ${ctx.bytes ?? 'unknown'}, format: ${ctx.format ?? 'unknown'} }`,
  );
  return NextResponse.json({ error, reason }, { status });
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return refuse(401, 'Please sign in and try the import again.', 'no-member-credential');
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      // A throw here does NOT mean no file was chosen — the most common cause is
      // a body dropped in transit before it reached this handler (see
      // experimental.middlewareClientMaxBodySize in next.config.js). Saying
      // "expected a file" sent members looking for a mistake they had not made.
      // Stay neutral about the cause and name the one thing they can act on.
      return refuse(
        400,
        'The upload could not be read. Confirm the file is under 25 MB and try again.',
        'form-data-unreadable',
        { memberId, bytes: Number(request.headers.get('content-length')) || undefined },
      );
    }

    const file = form.get('file');
    if (!(file instanceof File)) {
      return refuse(400, 'No file provided', 'no-file-field', { memberId });
    }
    if (file.size === 0) {
      return refuse(400, 'File is empty', 'zero-bytes', { memberId });
    }
    if (file.size > MAX_FILE_BYTES) {
      return refuse(413, 'File too large (25 MB max)', 'over-file-cap', {
        memberId,
        bytes: file.size,
      });
    }

    // The attempt itself, recorded before any reading is tried. Counts only.
    console.log(
      `[MAIA/press] INGEST ARRIVED { memberRef: ${memberRef(memberId)}, ` +
        `bytes: ${file.size}, format: ${detectFormat(file.name, file.type) ?? 'unrecognised'} }`,
    );

    const buffer = Buffer.from(await file.arrayBuffer());

    let result;
    try {
      result = await parseUpload(buffer, file.name, file.type);
    } catch (err) {
      if (err instanceof UnsupportedUploadError) {
        return refuse(415, err.message, 'unsupported-format', {
          memberId,
          bytes: file.size,
          format: detectFormat(file.name, file.type),
        });
      }

      /* IMPORT-READ-01, 2026-08-27. This branch used to answer every failure
         with "Try a .docx, .pdf, .txt, or .md" — including failures on a file
         that WAS one of those. That tells the member their manuscript is the
         problem when the reader is, which is the same misattribution the
         Canvas made when it opened a substitute manuscript confidently: a
         failure presenting itself as the member's mistake.

         So: name the format we recognised, say the reading failed here, and
         emit a greppable marker carrying the reason — never the content. */
      const format = detectFormat(file.name, file.type);
      const reason = err instanceof Error ? `${err.name}: ${err.message}` : 'unknown';
      console.error(
        `[MAIA/press] INGEST READ FAILURE { memberRef: ${memberRef(memberId)}, ` +
          `format: ${format ?? 'unrecognised'}, bytes: ${file.size}, reason: ${reason} }`,
      );
      return NextResponse.json(
        {
          error: format
            ? `We could not read this ${format === 'text' ? 'text' : format.toUpperCase()} file. ` +
              'Your file looks like a supported type, so this is a fault on our side, not yours. ' +
              'Nothing was saved, and the file is unchanged.'
            : 'We could not read that file. Try a .docx, .pdf, .txt, or .md.',
          reason,
        },
        { status: 422 },
      );
    }

    if (result.text.length > MAX_TEXT_CHARS) {
      return refuse(413, 'Manuscript too large (2MB of text max)', 'over-text-cap', {
        memberId,
        bytes: result.text.length,
        format: result.format,
      });
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
      console.error('[MAIA/press] INGEST CUSTODY FAILURE', err);
      return refuse(
        500,
        'We could not take custody of that file. Nothing was saved — please try again.',
        err instanceof Error ? `${err.name}: ${err.message}` : 'unknown',
        { memberId, bytes: buffer.byteLength, format: result.format },
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
    console.error('[MAIA/press] INGEST UNHANDLED', err);
    return NextResponse.json(
      {
        error: 'Something failed on our side while reading that file. Nothing was saved.',
        reason: err instanceof Error ? `${err.name}: ${err.message}` : 'unknown',
      },
      { status: 500 },
    );
  }
}
