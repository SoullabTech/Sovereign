export const dynamic = 'force-dynamic';

/**
 * STUDIO VOICE NOTES API
 *
 * GET  - List voice notes for a session
 * POST - Upload audio, save to vault, transcribe via local Whisper
 *
 * Table: session_voice_notes
 * Audio stored at /app/data/vault/{practitionerId}/voice-notes/{noteId}.webm
 * Transcription is sovereign (local Faster-Whisper, no cloud APIs)
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const STORAGE_BASE = process.env.FILE_STORAGE_PATH || '/app/data/vault';
const WHISPER_LOCAL_URL = process.env.WHISPER_LOCAL_URL || 'http://127.0.0.1:8000';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

async function getPractitionerId(): Promise<string | null> {
  const result = await db.query(
    'SELECT id FROM practitioners WHERE slug = $1',
    ['stellium']
  );
  return result.rows[0]?.id || null;
}

// GET — List voice notes for a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId();
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    const { sessionId } = await params;

    const result = await db.query(
      `SELECT id, session_id, client_id, file_path, mime_type,
              original_filename, duration_ms, transcript, created_at
       FROM session_voice_notes
       WHERE session_id = $1 AND practitioner_id = $2
       ORDER BY created_at DESC`,
      [sessionId, practitionerId]
    );

    const voiceNotes = result.rows.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      clientId: row.client_id,
      filePath: row.file_path,
      mimeType: row.mime_type,
      originalFilename: row.original_filename,
      durationMs: row.duration_ms,
      transcript: row.transcript,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ success: true, voiceNotes });
  } catch (error: any) {
    console.error('❌ [VOICE-NOTES] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list voice notes' },
      { status: 500 }
    );
  }
}

// POST — Upload audio + transcribe via local Whisper
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId();
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    const { sessionId } = await params;

    // Validate session belongs to practitioner
    const sessionResult = await db.query(
      'SELECT id, client_id FROM sessions WHERE id = $1 AND practitioner_id = $2',
      [sessionId, practitionerId]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Session not found or not authorized' },
        { status: 404 }
      );
    }

    const clientId = sessionResult.rows[0].client_id || null;

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const durationStr = formData.get('duration_ms') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large (max 100MB)' },
        { status: 400 }
      );
    }

    const durationMs = durationStr ? parseInt(durationStr, 10) : null;
    const noteId = randomUUID();

    console.log('🎙️ [VOICE-NOTES] Upload received:', {
      sessionId,
      size: file.size,
      type: file.type,
      durationMs,
    });

    // Determine file extension from MIME type
    const ext = file.type?.includes('mp4') ? '.m4a'
      : file.type?.includes('webm') ? '.webm'
      : file.type?.includes('wav') ? '.wav'
      : '.webm';

    // Save audio to vault
    const filePath = path.join(STORAGE_BASE, practitionerId, 'voice-notes', `${noteId}${ext}`);
    const fullDir = path.join(STORAGE_BASE, practitionerId, 'voice-notes');
    await mkdir(fullDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    console.log('🎙️ [VOICE-NOTES] Audio saved:', filePath);

    // Transcribe via local Whisper (synchronous — voice notes are short)
    let transcript: string | null = null;

    try {
      // Fix file metadata (same pattern as transcribe-simple)
      const safeName = file.name && file.name.includes('.') ? file.name : `recording${ext}`;
      const safeType = file.type || 'audio/webm';
      const fixedFile = new File([arrayBuffer], safeName, { type: safeType });

      const whisperFormData = new FormData();
      whisperFormData.append('file', fixedFile, fixedFile.name);
      whisperFormData.append('model', 'base.en');

      console.log('🎙️ [VOICE-NOTES] Forwarding to Whisper:', WHISPER_LOCAL_URL);

      const whisperResponse = await fetch(`${WHISPER_LOCAL_URL}/v1/audio/transcriptions`, {
        method: 'POST',
        body: whisperFormData,
      });

      if (!whisperResponse.ok) {
        const errorText = await whisperResponse.text();
        console.error('🎙️ [VOICE-NOTES] Whisper error:', errorText);
      } else {
        const result = await whisperResponse.json();
        transcript = (result.text || '').trim();

        // Post-process: fix common Whisper mis-transcriptions
        transcript = transcript.replace(/\bMaya\b/gi, 'MAIA');

        console.log('🎙️ [VOICE-NOTES] Transcribed:', transcript.length, 'chars');
      }
    } catch (whisperErr: any) {
      console.error('🎙️ [VOICE-NOTES] Whisper call failed:', whisperErr.message);
      // Continue without transcript — audio is still saved
    }

    // Insert row with transcript (or null if transcription failed)
    await db.query(
      `INSERT INTO session_voice_notes
        (id, session_id, practitioner_id, client_id, file_path, mime_type, original_filename, duration_ms, transcript)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [noteId, sessionId, practitionerId, clientId, filePath, file.type || 'audio/webm', file.name || `recording${ext}`, durationMs, transcript]
    );

    console.log('🎙️ [VOICE-NOTES] Saved to DB:', noteId, transcript ? `(${transcript.length} chars)` : '(no transcript)');

    return NextResponse.json({
      success: true,
      voiceNote: {
        id: noteId,
        sessionId,
        clientId,
        durationMs,
        transcript,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ [VOICE-NOTES] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload voice note' },
      { status: 500 }
    );
  }
}
