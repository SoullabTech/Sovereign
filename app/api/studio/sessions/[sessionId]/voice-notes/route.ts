export const dynamic = 'force-dynamic';

/**
 * STUDIO VOICE NOTES API
 *
 * GET  - List voice notes for a session
 * POST - Upload audio, save to vault, transcribe via local Whisper
 *
 * Table: voice_notes
 * Audio stored at /app/data/vault/{practitionerId}/voice-notes/{noteId}.webm
 * Transcription is sovereign (local Faster-Whisper, no cloud APIs)
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { getEntitlements } from '@/lib/entitlements';
import { logAudioUsageEvent } from '@/lib/usage/audioUsage';

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
      `SELECT id, session_id, client_id, storage_path, mime_type,
              size_bytes, duration_seconds, transcript,
              transcription_status, drafted_note, created_at
       FROM voice_notes
       WHERE session_id = $1 AND practitioner_id = $2
       ORDER BY created_at DESC`,
      [sessionId, practitionerId]
    );

    const voiceNotes = result.rows.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      clientId: row.client_id,
      storagePath: row.storage_path,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      durationSeconds: row.duration_seconds,
      transcript: row.transcript,
      transcriptionStatus: row.transcription_status,
      draftedNote: row.drafted_note,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ success: true, voiceNotes });
  } catch (error: any) {
    console.error('[VOICE-NOTES] GET error:', error);
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

    // Feature gate: audio uploads disabled by default (local-only policy)
    if (process.env.ALLOW_AUDIO_UPLOADS !== 'true') {
      logAudioUsageEvent({
        memberId,
        route: "/api/studio/sessions/[sessionId]/voice-notes",
        kind: "upload",
        bytes: 0,
        seconds: null,
        status: "rejected",
        errorCode: "FEATURE_DISABLED",
        meta: { reason: "ALLOW_AUDIO_UPLOADS not enabled" },
      });
      return NextResponse.json(
        { success: false, error: 'Audio uploads are disabled. Audio is stored locally on-device by default.' },
        { status: 410 }
      );
    }

    // Entitlement check: cloudAudioUploads feature flag
    const entitlements = await getEntitlements(memberId);
    if (!entitlements.features.cloudAudioUploads) {
      logAudioUsageEvent({
        memberId,
        route: "/api/studio/sessions/[sessionId]/voice-notes",
        kind: "upload",
        bytes: 0,
        seconds: null,
        status: "rejected",
        errorCode: "TIER_GATE",
        meta: { tier: entitlements.tier },
      });
      return NextResponse.json(
        { success: false, error: 'Cloud audio uploads are disabled for your tier', upgradeRequired: true },
        { status: 403 }
      );
    }

    // Guard: reject non-multipart requests with a clear 415 error
    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes('multipart/form-data')) {
      logAudioUsageEvent({
        memberId,
        route: "/api/studio/sessions/[sessionId]/voice-notes",
        kind: "upload",
        bytes: 0,
        seconds: null,
        status: "rejected",
        errorCode: "UNSUPPORTED_MEDIA_TYPE",
        meta: { contentType },
      });
      return NextResponse.json(
        { success: false, error: 'Expected multipart/form-data (FormData upload). Do not set Content-Type manually.' },
        { status: 415 }
      );
    }

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
      logAudioUsageEvent({
        memberId,
        route: "/api/studio/sessions/[sessionId]/voice-notes",
        kind: "upload",
        bytes: 0,
        seconds: null,
        status: "rejected",
        errorCode: "NO_FILE",
      });
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      logAudioUsageEvent({
        memberId,
        route: "/api/studio/sessions/[sessionId]/voice-notes",
        kind: "upload",
        bytes: file.size,
        seconds: null,
        status: "rejected",
        errorCode: "SIZE_LIMIT",
        meta: { maxBytes: MAX_FILE_SIZE },
      });
      return NextResponse.json(
        { success: false, error: 'File too large (max 100MB)' },
        { status: 413 }
      );
    }

    const durationSeconds = durationStr ? parseInt(durationStr, 10) : null;
    const noteId = randomUUID();

    console.log('[VOICE-NOTES] Upload received:', {
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
    const storagePath = path.join(STORAGE_BASE, practitionerId, 'voice-notes', `${noteId}${ext}`);
    const fullDir = path.join(STORAGE_BASE, practitionerId, 'voice-notes');
    await mkdir(fullDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(storagePath, buffer);

    console.log('[VOICE-NOTES] Audio saved:', storagePath);

    // Insert row with pending transcription status
    await db.query(
      `INSERT INTO voice_notes
        (id, session_id, practitioner_id, client_id, storage_path, mime_type, size_bytes, duration_seconds, transcription_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')`,
      [noteId, sessionId, practitionerId, clientId, storagePath, file.type || 'audio/webm', file.size, durationSeconds]
    );

    // Transcribe via local Whisper (synchronous — voice notes are short)
    let transcript: string | null = null;
    let transcriptionStatus = 'pending';

    try {
      // Fix file metadata (same pattern as transcribe-simple)
      const safeName = file.name && file.name.includes('.') ? file.name : `recording${ext}`;
      const safeType = file.type || 'audio/webm';
      const fixedFile = new File([arrayBuffer], safeName, { type: safeType });

      const whisperFormData = new FormData();
      whisperFormData.append('file', fixedFile, fixedFile.name);
      whisperFormData.append('model', 'base.en');

      console.log('[VOICE-NOTES] Forwarding to Whisper:', WHISPER_LOCAL_URL);

      const whisperResponse = await fetch(`${WHISPER_LOCAL_URL}/v1/audio/transcriptions`, {
        method: 'POST',
        body: whisperFormData,
      });

      if (!whisperResponse.ok) {
        const errorText = await whisperResponse.text();
        console.error('[VOICE-NOTES] Whisper error:', errorText);
        transcriptionStatus = 'failed';

        await db.query(
          `UPDATE voice_notes SET transcription_status = 'failed', transcription_error = $1, updated_at = NOW()
           WHERE id = $2`,
          [errorText.slice(0, 500), noteId]
        );
      } else {
        const result = await whisperResponse.json();
        transcript = (result.text || '').trim();

        // Post-process: fix common Whisper mis-transcriptions
        transcript = transcript.replace(/\bMaya\b/gi, 'MAIA');

        transcriptionStatus = 'completed';

        await db.query(
          `UPDATE voice_notes SET transcript = $1, transcription_status = 'completed', transcribed_at = NOW(), updated_at = NOW()
           WHERE id = $2`,
          [transcript, noteId]
        );

        console.log('[VOICE-NOTES] Transcribed:', transcript.length, 'chars');
      }
    } catch (whisperErr: any) {
      console.error('[VOICE-NOTES] Whisper call failed:', whisperErr.message);
      transcriptionStatus = 'failed';

      await db.query(
        `UPDATE voice_notes SET transcription_status = 'failed', transcription_error = $1, updated_at = NOW()
         WHERE id = $2`,
        [whisperErr.message?.slice(0, 500) || 'Unknown error', noteId]
      );
    }

    console.log('[VOICE-NOTES] Saved to DB:', noteId, transcriptionStatus, transcript ? `(${transcript.length} chars)` : '(no transcript)');

    // Log audio usage for metering (fire-and-forget)
    logAudioUsageEvent({
      memberId,
      route: '/api/studio/sessions/[sessionId]/voice-notes',
      kind: 'upload',
      bytes: file.size,
      seconds: durationSeconds,
      status: transcriptionStatus === 'completed' ? 'ok' : 'error',
      errorCode: transcriptionStatus === 'failed' ? 'TRANSCRIBE_FAILED' : null,
      meta: {
        sessionId,
        noteId,
        mimeType: file.type,
        transcriptLength: transcript?.length ?? 0,
      },
    });

    return NextResponse.json({
      success: true,
      voiceNote: {
        id: noteId,
        sessionId,
        clientId,
        storagePath,
        mimeType: file.type || 'audio/webm',
        sizeBytes: file.size,
        durationSeconds,
        transcript,
        transcriptionStatus,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[VOICE-NOTES] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload voice note' },
      { status: 500 }
    );
  }
}
