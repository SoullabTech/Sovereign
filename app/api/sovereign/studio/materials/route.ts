/**
 * GATHER-02 — bringing something in, and seeing what you have.
 *
 * POST accepts either a file (multipart) or something typed (JSON: a note, a
 * transcript, a link). Bytes go to the shared vault BEFORE the row exists, in
 * the same order WS-01 established: a row asserting custody over bytes that
 * were never durably written is the failure worth preventing, and an orphaned
 * file is a harmless thing a sweep can collect.
 *
 * Nothing here attaches a material to a Work. Gathering and belonging are two
 * acts — belonging is a member declaration with their own sentence, recorded
 * in living_work_materials by the existing route.
 *
 * A link's address is stored and the page is NOT fetched. Fetching on the
 * writer's behalf would make outbound requests they did not make, from a
 * self-hosted system whose whole point is that nothing sits in between.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
/* A truncated UUID is still a fragment of the real identifier. memberRef
   is a one-way hash: correlation across log lines without the id itself. */
import { memberRef } from '@/lib/privacy/memberRef';
import { writeVaultBytes } from '@/lib/storage/fileVault';
import { parseUpload, UnsupportedUploadError } from '@/lib/manuscript/ingest/parseUpload';
import {
  canExtractText,
  checkArrival,
  isMaterialKind,
  kindForFile,
  openingName,
  type MaterialKind,
} from '@/lib/studio/materials/kinds';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VAULT_NAMESPACE = 'studio-materials';
const MAX_FILE_BYTES = 200 * 1024 * 1024;
const MAX_TEXT_CHARS = 2_000_000;

function extensionOf(filename: string): string {
  const match = /\.([A-Za-z0-9]{1,8})$/.exec(filename);
  return match ? match[1].toLowerCase() : 'bin';
}

interface Row {
  id: string;
  kind: string;
  title: string;
  artifact_hash: string | null;
  artifact_size: number | null;
  original_filename: string | null;
  mime_type: string | null;
  source_url: string | null;
  extraction_method: string | null;
  extracted_chars: number | null;
  arrived_at: string;
}

const shape = (r: Row) => ({
  id: r.id,
  kind: r.kind,
  title: r.title,
  artifactHash: r.artifact_hash,
  artifactSize: r.artifact_size,
  originalFilename: r.original_filename,
  mimeType: r.mime_type,
  sourceUrl: r.source_url,
  extractionMethod: r.extraction_method,
  extractedChars: r.extracted_chars,
  arrivedAt: r.arrived_at,
});

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Deliberately never selects extracted_text: a listing of 256 materials
    // must not carry every extracted book across the wire.
    const res = await query<Row>(
      `SELECT id, kind, title, artifact_hash, artifact_size, original_filename,
              mime_type, source_url, extraction_method, extracted_chars, arrived_at
         FROM studio_materials
        WHERE member_id = $1
        ORDER BY arrived_at DESC`,
      [memberId],
    );
    return NextResponse.json({ materials: res.rows.map(shape) });
  } catch (error) {
    console.error('[studio/materials] list failed', error);
    return NextResponse.json({ error: 'Could not read your materials just now' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contentType = request.headers.get('content-type') ?? '';
  try {
    return contentType.includes('multipart/form-data')
      ? await bringFile(request, memberId)
      : await bringTyped(request, memberId);
  } catch (error) {
    if (error instanceof UnsupportedUploadError) {
      return NextResponse.json({ error: 'unsupported', message: error.message }, { status: 400 });
    }
    console.error('[studio/materials] bring failed', error);
    return NextResponse.json({ error: 'Could not bring that in just now' }, { status: 500 });
  }
}

async function bringFile(request: NextRequest, memberId: string) {
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file was sent' }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: 'too_large', message: 'That file is larger than this room can hold.' },
      { status: 413 },
    );
  }

  const kind = kindForFile(file.name, file.type);
  if (!kind) {
    // An explicit refusal, not a silent fallback to "document" over bytes
    // nobody can read.
    return NextResponse.json(
      {
        error: 'unsupported',
        message: `The Studio does not yet know what to do with ${file.name}. Documents, recordings, images and transcripts can come in.`,
      },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const artifactHash = createHash('sha256').update(bytes).digest('hex');

  // Bytes first, then the row. A row asserting custody over bytes that were
  // never durably written is the failure worth preventing; the reverse leak is
  // an orphan a sweep collects.
  const fileId = `${Date.now().toString(36)}-${artifactHash.slice(0, 16)}`;
  const artifactRef = await writeVaultBytes(
    VAULT_NAMESPACE,
    fileId,
    extensionOf(file.name),
    bytes,
  );

  let extractedText: string | null = null;
  let extractionMethod: string | null = null;
  if (canExtractText(kind, file.name)) {
    try {
      const parsed = await parseUpload(bytes, file.name, file.type);
      if (parsed.text.trim().length > 0) {
        extractedText = parsed.text.slice(0, MAX_TEXT_CHARS);
        extractionMethod = `parseUpload:${parsed.format}`;
      }
    } catch {
      // The thing is kept whether or not we could read it. A material we
      // cannot parse is still the writer's material — it simply has no text,
      // which the room says rather than hides.
      extractedText = null;
      extractionMethod = null;
    }
  }

  const title =
    (form.get('title') as string | null)?.trim() ||
    openingName({ kind, originalFilename: file.name });

  const verdict = checkArrival({
    kind,
    artifactRef,
    artifactHash,
    artifactSize: bytes.byteLength,
    originalFilename: file.name,
    sourceUrl: null,
  });
  if (!verdict.ok) {
    return NextResponse.json({ error: 'invalid', message: verdict.reason }, { status: 400 });
  }

  const res = await query<Row>(
    `INSERT INTO studio_materials
       (member_id, kind, title, artifact_ref, artifact_hash, artifact_size,
        original_filename, mime_type, extracted_text, extraction_method, extracted_chars)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING id, kind, title, artifact_hash, artifact_size, original_filename,
               mime_type, source_url, extraction_method, extracted_chars, arrived_at`,
    [
      memberId,
      kind,
      title,
      artifactRef,
      artifactHash,
      bytes.byteLength,
      file.name,
      file.type || null,
      extractedText,
      extractionMethod,
      extractedText?.length ?? null,
    ],
  );

  console.log('[MAIA/studio] material arrived', {
    member: memberRef(memberId),
    kind,
    bytes: bytes.byteLength,
    extracted: extractedText !== null,
  });

  return NextResponse.json({ material: shape(res.rows[0]) }, { status: 201 });
}

async function bringTyped(request: NextRequest, memberId: string) {
  const body = (await request.json()) as Record<string, unknown>;
  const kindValue = body.kind;
  if (!isMaterialKind(kindValue)) {
    return NextResponse.json({ error: 'Unknown kind of material' }, { status: 400 });
  }
  const kind = kindValue as MaterialKind;
  if (kind === 'document' || kind === 'audio' || kind === 'image') {
    return NextResponse.json(
      { error: 'invalid', message: `A ${kind} comes in as a file.` },
      { status: 400 },
    );
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const sourceUrl = typeof body.sourceUrl === 'string' ? body.sourceUrl.trim() : '';

  if (kind === 'link') {
    if (!sourceUrl) return NextResponse.json({ error: 'A link needs an address' }, { status: 400 });
    /* A link keeps its ADDRESS and nothing else. Accepting text alongside it
       would store words under a source they did not come from — the page is
       never fetched, so anything here would be someone's summary wearing the
       source's name. A thought about a link is a note. */
    if (text) {
      return NextResponse.json(
        {
          error: 'invalid',
          message:
            'A link keeps its address only — the page is never fetched. Bring your own words in as a note.',
        },
        { status: 400 },
      );
    }
    try {
      const parsed = new URL(sourceUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return NextResponse.json({ error: 'That is not a web address' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'That is not a web address' }, { status: 400 });
    }
  } else if (!text) {
    return NextResponse.json({ error: 'There is nothing here yet' }, { status: 400 });
  }

  if (text.length > MAX_TEXT_CHARS) {
    return NextResponse.json(
      { error: 'too_large', message: 'That is longer than this room can hold.' },
      { status: 413 },
    );
  }

  const title =
    (typeof body.title === 'string' ? body.title.trim() : '') ||
    openingName({ kind, sourceUrl: sourceUrl || null, text });

  const verdict = checkArrival({
    kind,
    artifactRef: null,
    artifactHash: null,
    artifactSize: null,
    originalFilename: null,
    sourceUrl: kind === 'link' ? sourceUrl : null,
  });
  if (!verdict.ok) {
    return NextResponse.json({ error: 'invalid', message: verdict.reason }, { status: 400 });
  }

  // What the writer typed IS the text — the extraction method says so plainly,
  // so nothing later mistakes it for something read out of a file.
  const res = await query<Row>(
    `INSERT INTO studio_materials
       (member_id, kind, title, source_url, extracted_text, extraction_method, extracted_chars)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, kind, title, artifact_hash, artifact_size, original_filename,
               mime_type, source_url, extraction_method, extracted_chars, arrived_at`,
    [
      memberId,
      kind,
      title,
      kind === 'link' ? sourceUrl : null,
      text || null,
      text ? 'member_typed' : null,
      text ? text.length : null,
    ],
  );

  console.log('[MAIA/studio] material arrived', {
    member: memberRef(memberId),
    kind,
    chars: text.length,
  });

  return NextResponse.json({ material: shape(res.rows[0]) }, { status: 201 });
}
