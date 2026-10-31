export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

/**
 * Founder-local import review.
 *
 * This route deliberately does NOT authenticate a member, write Source custody,
 * create a manuscript, or survive outside the local review process. It exists
 * so the exact integrated Import UI and deterministic parsers can be reviewed
 * with real files while production original-file intake remains 423-held.
 *
 * Three conditions are required on every request:
 *   1. the server process was explicitly started with WS_FOUNDER_LOCAL_REVIEW=1;
 *   2. normalized and raw host claims are loopback;
 *   3. the dedicated review browser carries the process-scoped capability token.
 *
 * A deployed service with the flag absent sees a 404. The eventual production
 * path remains /api/sovereign/manuscripts/ingest and its independent custody,
 * recovery, authentication and release controls are unchanged.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  parseUpload,
  UnsupportedDocxStructureError,
  UnsupportedUploadError,
} from '@/lib/manuscript/ingest/parseUpload';
import { titleFromFilename } from '@/lib/manuscript/ingest/titleSuggestion';
import { verifyLocalReviewAuthority } from '@/lib/writersStudio/localReviewAuthority';

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_TEXT_CHARS = 2_000_000;

function noStore(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

export async function POST(request: NextRequest) {
  const authority = verifyLocalReviewAuthority(request);
  if (!authority.ok) return noStore({ error: authority.error }, authority.status);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return noStore({ error: 'The local file could not be read. Confirm it is under 25 MB.' }, 400);
  }
  const file = form.get('file');
  if (!(file instanceof File)) return noStore({ error: 'No file provided' }, 400);
  if (file.size === 0) return noStore({ error: 'File is empty' }, 400);
  if (file.size > MAX_FILE_BYTES) return noStore({ error: 'File too large (25 MB max)' }, 413);

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await parseUpload(bytes, file.name, file.type);
    if (result.text.length > MAX_TEXT_CHARS) {
      return noStore({ error: 'Manuscript too large (2 MB of editable text max)' }, 413);
    }
    // Counts only. Never log the filename or manuscript body.
    console.log(
      `[writer/local-review] parsed { format: ${result.format}, bytes: ${bytes.byteLength}, `
        + `chars: ${result.text.length}, warnings: ${result.warnings.length} }`,
    );
    return noStore({
      text: result.text,
      warnings: result.warnings,
      fidelity: result.fidelity ?? null,
      title: titleFromFilename(file.name),
      format: result.format,
      sourceArrivalId: null,
      custody: 'none_local_review',
      persistent: false,
    }, 200);
  } catch (error) {
    if (error instanceof UnsupportedUploadError || error instanceof UnsupportedDocxStructureError) {
      return noStore({ error: error.message }, 422);
    }
    console.error('[writer/local-review] deterministic import failed');
    return noStore({ error: 'We could not read that file.' }, 422);
  }
}
