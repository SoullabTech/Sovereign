export const dynamic = 'force-dynamic';

/**
 * STUDIO VOICE NOTES API
 *
 * GET  - List voice notes for a session
 * POST - Upload audio, save to vault, transcribe via local Whisper
 *
 * Audio is stored locally in /app/data/vault/{practitionerId}/voice-notes/
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
      `SELECT id, session_id, client_id, duration_seconds, transcript,
              transcription_status, transcription_error, drafted_note,
              created_at, updated_at, transcribed_at
       FROM voice_notes
       WHERE session_id = $1 AND practitioner_id = $2
       ORDER BY created_at DESC`,
      [sessionId, practitionerId]
    );

    const voiceNotes = result.rows.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      clientId: row.client_id,
      durationSeconds: row.duration_seconds,
      transcript: row.transcript,
      transcriptionStatus: row.transcription_status,
      transcriptionError: row.transcription_error,
      draftedNote: row.drafted_note,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      transcribedAt: row.transcribed_at,
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
    const durationStr = formData.get('duration_seconds') as string;

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

    const durationSeconds = durationStr ? parseInt(durationStr, 10) : null;
    const noteId = randomUUID();

    console.log('🎙️ [VOICE-NOTES] Upload received:', {
      sessionId,
      size: file.size,
      type: file.type,
      durationSeconds,
    });

    // Determine file extension from MIME type
    const ext = file.type?.includes('mp4') ? '.m4a'
      : file.type?.includes('webm') ? '.webm'
      : file.type?.includes('wav') ? '.wav'
      : '.webm';

    // Save audio to vault
    const storagePath = `${practitionerId}/voice-notes/${noteId}${ext}`;
    const fullDir = path.join(STORAGE_BASE, practitionerId, 'voice-notes');
    await mkdir(fullDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(path.join(STORAGE_BASE, storagePath), buffer);

    console.log('🎙️ [VOICE-NOTES] Audio saved:', storagePath);

    // Insert row with pending status
    await db.query(
      `INSERT INTO voice_notes
        (id, practitioner_id, session_id, client_id, storage_path, mime_type, size_bytes, duration_seconds, transcription_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'transcribing')`,
      [noteId, practitionerId, sessionId, clientId, storagePath, file.type || 'audio/webm', file.size, durationSeconds]
    );

    // Transcribe via local Whisper (synchronous — voice notes are short)
    let transcript: string | null = null;
    let transcriptionStatus = 'failed';
    let transcriptionError: string | null = null;

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
        transcriptionError = `Whisper error: ${errorText.substring(0, 500)}`;
      } else {
        const result = await whisperResponse.json();
        transcript = (result.text || '').trim();

        // Post-process: fix common Whisper mis-transcriptions
        transcript = transcript.replace(/\bMaya\b/gi, 'MAIA');

        transcriptionStatus = 'completed';
        console.log('🎙️ [VOICE-NOTES] Transcribed:', transcript.length, 'chars');
      }
    } catch (whisperErr: any) {
      console.error('🎙️ [VOICE-NOTES] Whisper call failed:', whisperErr.message);
      transcriptionError = whisperErr.message;
    }

    // Update row with transcription result
    await db.query(
      `UPDATE voice_notes
       SET transcript = $1, transcription_status = $2, transcription_error = $3,
           transcribed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE NULL END,
           updated_at = NOW()
       WHERE id = $4`,
      [transcript, transcriptionStatus, transcriptionError, noteId]
    );

    return NextResponse.json({
      success: true,
      voiceNote: {
        id: noteId,
        sessionId,
        clientId,
        durationSeconds,
        transcript,
        transcriptionStatus,
        transcriptionError,
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
