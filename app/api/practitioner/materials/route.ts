export const dynamic = 'force-dynamic';

/**
 * Practitioner Materials Library — list + add.
 *
 * Spec: docs/specs/developmental-environment/PRACTITIONER_PROGRAM_PLATFORM_ADR_2026-07-14.md
 *
 * GET  — the practitioner's own field's materials, newest first.
 * POST — add one material:
 *          JSON body      { title, url, description?, type? }  → link resource
 *          multipart form { file, title?, description?, type? } → file into the
 *          practitioner vault (original preserved), metadata into the library.
 *
 * Every request resolves the practitioner's OWN field via getAuthoredField —
 * there is no field parameter to reach anyone else's library. Uploaded and
 * linked content is untrusted: it enters at 'uploaded'/'reviewed' and only the
 * practitioner's explicit ratify gesture ever makes it composable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  getAuthoredField,
  listMaterials,
  addLinkMaterial,
  registerFileMaterial,
  AuthoringError,
} from '@/lib/practiceField/programAuthoringService';
import { getPractitionerIdForMember } from '@/lib/studio/getPractitionerIdForMember';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID, createHash } from 'crypto';

const STORAGE_BASE = process.env.FILE_STORAGE_PATH || '/app/data/vault';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB — same ceiling as the vault

const UPLOAD_MIME_TO_MATERIAL: Record<string, string> = {
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'text/plain': 'txt',
  'text/markdown': 'txt',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'video/mp4': 'video',
  'video/quicktime': 'video',
  'video/webm': 'video',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/mp4': 'audio',
  'audio/webm': 'audio',
};

const err = (e: unknown) =>
  e instanceof AuthoringError
    ? NextResponse.json({ error: e.message }, { status: e.status })
    : (console.error('[practitioner/materials]', e),
      NextResponse.json({ error: 'Could not complete that right now.' }, { status: 500 }));

async function requireField(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return { failure: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const field = await getAuthoredField(memberId);
  if (!field) {
    return {
      failure: NextResponse.json(
        { error: 'No authored field — this surface belongs to the field holder.' },
        { status: 403 },
      ),
    };
  }
  return { field, memberId };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireField(request);
    if ('failure' in auth) return auth.failure;
    const materials = await listMaterials(auth.field!);
    return NextResponse.json({ materials });
  } catch (e) {
    return err(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireField(request);
    if ('failure' in auth) return auth.failure;
    const field = auth.field!;

    const contentType = request.headers.get('content-type') || '';

    // ── Link resource ────────────────────────────────────────────────────────
    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      const material = await addLinkMaterial(field, body);
      return NextResponse.json({ material }, { status: 201 });
    }

    // ── File upload → vault original + library metadata ─────────────────────
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('file');
      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'No file in the upload.' }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'Files up to 100MB are supported.' }, { status: 413 });
      }
      const materialType = UPLOAD_MIME_TO_MATERIAL[file.type];
      if (!materialType) {
        return NextResponse.json(
          { error: `Unsupported file type (${file.type || 'unknown'}). PDF, Word, text, image, audio, and video files are supported.` },
          { status: 415 },
        );
      }

      const practitionerId = await getPractitionerIdForMember(auth.memberId!);
      if (!practitionerId) {
        return NextResponse.json({ error: 'Practitioner profile not found.' }, { status: 403 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const checksum = createHash('sha256').update(buffer).digest('hex');
      const fileId = randomUUID();
      const ext = path.extname(file.name).toLowerCase().slice(0, 12);
      const dir = path.join(STORAGE_BASE, practitionerId, 'materials');
      await mkdir(dir, { recursive: true });
      const storagePath = path.join(dir, `${fileId}${ext}`);
      await writeFile(storagePath, buffer);

      await query(
        `INSERT INTO practitioner_files
           (id, practitioner_id, name, original_name, mime_type, size_bytes,
            storage_path, folder_path, file_type, description, file_scope)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'personal')`,
        [
          fileId,
          practitionerId,
          file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200),
          file.name,
          file.type,
          file.size,
          storagePath,
          '/materials',
          materialType === 'txt' ? 'document' : materialType,
          null,
        ],
      );

      const title = (form.get('title') as string) || file.name.replace(/\.[^.]+$/, '');
      const material = await registerFileMaterial(field, {
        title,
        type: (form.get('type') as string) || materialType,
        vaultFileId: fileId,
        checksum,
        description: (form.get('description') as string) || undefined,
      });
      return NextResponse.json({ material }, { status: 201 });
    }

    return NextResponse.json({ error: 'Send JSON (link) or multipart form data (file).' }, { status: 415 });
  } catch (e) {
    return err(e);
  }
}
