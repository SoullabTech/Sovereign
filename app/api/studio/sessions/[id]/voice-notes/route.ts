export const dynamic = 'force-dynamic';

/**
 * SESSION VOICE NOTES API
 *
 * POST: Upload audio file, transcribe via local Faster-Whisper, store to DB
 * GET: List voice notes for a session
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { query } from '@/lib/db/postgres';
import { requirePractitioner } from '@/lib/auth/getCurrentPractitioner';

// Use project-local storage in dev, Docker path in prod
const UPLOAD_DIR = process.env.VOICE_NOTES_DIR ||
  (process.env.NODE_ENV === 'production' ? '/app/storage/voice-notes' : './storage/voice-notes');

function safeExtFromMime(mime: string): string {
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('mpeg')) return 'mp3';
  if (mime.includes('mp4') || mime.includes('m4a')) return 'm4a';
  if (mime.includes('wav')) return 'wav';
  return 'bin';
}

async function ensureDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

async function writeFileFromBlob(file: File, dstPath: string) {
  const arrayBuffer = await file.arrayBuffer();
  const buf = Buffer.from(arrayBuffer);
  await fs.writeFile(dstPath, buf);
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await ctx.params;

  const auth = await requirePractitioner(req);
  if ('error' in auth) return auth.error;
  const { practitionerId } = auth.identity;

  const result = await query(
    `SELECT id, session_id, client_id, mime_type, original_filename, duration_ms, transcript, created_at
     FROM session_voice_notes
     WHERE session_id = $1 AND practitioner_id = $2
     ORDER BY created_at DESC`,
    [sessionId, practitionerId]
  );

  // Add audioUrl to each item
  const items = result.rows.map(row => ({
    ...row,
    audioUrl: `/api/studio/voice-notes/${row.id}/audio`,
  }));

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await ctx.params;

  const auth = await requirePractitioner(req);
  if ('error' in auth) return auth.error;
  const { practitionerId } = auth.identity;

  const form = await req.formData();
  const file = form.get('audio') as File | null;
  const clientId = (form.get('clientId') as string | null) || null;

  if (!file) {
    return NextResponse.json({ error: 'Missing audio file (field: audio)' }, { status: 400 });
  }

  await ensureDir();

  const id = crypto.randomUUID();
  const mimeType = file.type || 'application/octet-stream';
  const ext = safeExtFromMime(mimeType);
  const originalName = file.name || null;

  const filename = `${id}.${ext}`;
  const dstPath = path.join(UPLOAD_DIR, filename);

  await writeFileFromBlob(file, dstPath);

  // Transcribe via existing sovereign endpoint
  // Re-create FormData with 'file' field (what transcribe-simple expects)
  const transcribeForm = new FormData();
  const arrayBuffer = await file.arrayBuffer();
  const transcribeFile = new File([arrayBuffer], file.name || 'recording.webm', { type: mimeType });
  transcribeForm.set('file', transcribeFile);

  const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
  let transcript: string | null = null;

  try {
    const tr = await fetch(`${baseUrl}/api/voice/transcribe-simple`, {
      method: 'POST',
      body: transcribeForm,
    });

    if (tr.ok) {
      const json = await tr.json();
      transcript = json?.transcription || null;
    }
  } catch (e) {
    console.error('[voice-notes] Transcription failed:', e);
    // Continue without transcript — can retry later
  }

  // Insert into DB
  const insertResult = await query(
    `INSERT INTO session_voice_notes
     (id, session_id, practitioner_id, client_id, file_path, mime_type, original_filename, transcript)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, session_id, client_id, mime_type, original_filename, duration_ms, transcript, created_at`,
    [id, sessionId, practitionerId, clientId, dstPath, mimeType, originalName, transcript]
  );

  const row = insertResult.rows[0];
  const audioUrl = `/api/studio/voice-notes/${id}/audio`;

  return NextResponse.json({
    item: {
      ...row,
      audioUrl,
    },
  });
}
