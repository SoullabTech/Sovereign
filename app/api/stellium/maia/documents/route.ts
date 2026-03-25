export const dynamic = 'force-dynamic';

/**
 * MASTER FIELD DOCUMENT API
 *
 * Upload and list teaching materials for Virtual Self training.
 * Documents are stored locally, text extracted, then processed through
 * the extraction pipeline (method → perception → voice).
 *
 * Uses PostgreSQL directly. No Supabase.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { extractFromDocument } from '@/lib/masters/documentExtraction';

// ---------------------------------------------------------------------------
// Ownership guard: verify member → practitioner → persona chain
// ---------------------------------------------------------------------------
async function verifyOwnership(
  memberId: string,
  practitionerId: string,
  personaId?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Verify member owns or administers this practitioner
  const practResult = await query(
    `SELECT id FROM practitioners WHERE id = $1 AND member_id = $2`,
    [practitionerId, memberId]
  );
  if (practResult.rows.length === 0) {
    return { ok: false, error: 'You do not have access to this practitioner account' };
  }

  // If personaId provided, verify it belongs to this practitioner
  if (personaId) {
    const personaResult = await query(
      `SELECT id FROM practitioner_personas WHERE id = $1 AND practitioner_id = $2`,
      [personaId, practitionerId]
    );
    if (personaResult.rows.length === 0) {
      return { ok: false, error: 'Persona does not belong to this practitioner' };
    }
  }

  return { ok: true };
}

// Private storage — NOT in the web root
const STORAGE_BASE = process.env.MASTER_DOCS_PATH || path.join(process.cwd(), '.private', 'master-documents');
const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB

const ALLOWED_FORMATS = ['pdf', 'txt', 'md'] as const;
const ALLOWED_SOURCE_TYPES = ['transcript', 'book', 'class', 'notes'] as const;

type AllowedFormat = typeof ALLOWED_FORMATS[number];
type AllowedSourceType = typeof ALLOWED_SOURCE_TYPES[number];

function getFormat(filename: string): AllowedFormat | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext && (ALLOWED_FORMATS as readonly string[]).includes(ext)) return ext as AllowedFormat;
  return null;
}

async function extractRawText(buffer: Buffer, format: AllowedFormat): Promise<string> {
  if (format === 'txt' || format === 'md') {
    return buffer.toString('utf8');
  }

  if (format === 'pdf') {
    try {
      // Dynamic import — pdf-parse may not be installed yet
      const pdfParse = (await import('pdf-parse')).default;
      const parsed = await pdfParse(buffer);
      return parsed.text ?? '';
    } catch {
      // Fallback: store empty, mark for manual extraction
      return '';
    }
  }

  return '';
}

// ---------------------------------------------------------------------------
// GET — List documents for a practitioner/persona
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const practitionerId = url.searchParams.get('practitionerId');
    const personaId = url.searchParams.get('personaId');

    if (!practitionerId) {
      return NextResponse.json({ error: 'Missing practitionerId' }, { status: 400 });
    }

    // Verify ownership: member → practitioner → persona
    const ownership = await verifyOwnership(memberId, practitionerId, personaId ?? undefined);
    if (!ownership.ok) {
      return NextResponse.json({ error: ownership.error }, { status: 403 });
    }

    let sql = `
      SELECT id, practitioner_id, persona_id, title, source_type, format,
             original_filename, processing_status, processing_error, source_tier,
             content_chars, extracted_at, created_at, updated_at
      FROM persona_documents
      WHERE practitioner_id = $1
    `;
    const params: unknown[] = [practitionerId];

    if (personaId) {
      sql += ` AND persona_id = $2`;
      params.push(personaId);
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await query(sql, params);

    return NextResponse.json({ documents: result.rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[master-documents] GET error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — Upload a document
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();

    const practitionerId = String(formData.get('practitionerId') ?? '');
    const personaId = String(formData.get('personaId') ?? '');
    const title = String(formData.get('title') ?? '');
    const sourceType = String(formData.get('sourceType') ?? '') as AllowedSourceType;
    const sourceTier = String(formData.get('sourceTier') ?? 'primary');
    const file = formData.get('file');

    // Validate required fields
    if (!practitionerId || !personaId || !title || !sourceType || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing required fields (practitionerId, personaId, title, sourceType, file)' }, { status: 400 });
    }

    if (!(ALLOWED_SOURCE_TYPES as readonly string[]).includes(sourceType)) {
      return NextResponse.json({ error: `Invalid sourceType. Must be: ${ALLOWED_SOURCE_TYPES.join(', ')}` }, { status: 400 });
    }

    // Verify ownership: member → practitioner → persona
    const ownership = await verifyOwnership(memberId, practitionerId, personaId);
    if (!ownership.ok) {
      return NextResponse.json({ error: ownership.error }, { status: 403 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: `File too large. Maximum: ${MAX_FILE_BYTES / 1024 / 1024}MB` }, { status: 413 });
    }

    const format = getFormat(file.name);
    if (!format) {
      return NextResponse.json({ error: `Unsupported format. Allowed: ${ALLOWED_FORMATS.join(', ')}` }, { status: 400 });
    }

    // Ensure storage directory exists (private, not web-accessible)
    const practitionerDir = path.join(STORAGE_BASE, practitionerId);
    if (!existsSync(practitionerDir)) {
      await mkdir(practitionerDir, { recursive: true });
    }

    // Save file to disk
    const docId = randomUUID();
    const storageName = `${docId}.${format}`;
    const storagePath = path.join(practitionerDir, storageName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(storagePath, buffer);

    // Extract raw text
    const rawContent = await extractRawText(buffer, format);
    const contentChars = rawContent.length;

    // Insert document record
    const result = await query(
      `INSERT INTO persona_documents
        (id, practitioner_id, persona_id, title, source_type, format, original_filename,
         storage_path, raw_content, content_chars, processing_status, source_tier)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', $11)
       RETURNING id, practitioner_id, persona_id, title, source_type, format,
                 original_filename, processing_status, content_chars, source_tier, created_at`,
      [docId, practitionerId, personaId, title, sourceType, format,
       file.name, storagePath, rawContent, contentChars, sourceTier]
    );

    const doc = result.rows[0];

    console.log(`[master-documents] Uploaded "${title}" (${contentChars} chars, ${format}) for practitioner ${practitionerId}`);

    // Fire-and-forget extraction
    void extractFromDocument(doc.id);

    return NextResponse.json({ document: doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[master-documents] POST error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
