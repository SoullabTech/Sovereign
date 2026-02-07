/**
 * Upload Audio Recording for Post-Session Analysis
 * POST /api/supervision/upload
 *
 * Upload a pre-recorded audio file for transcription and analysis.
 * Audio stored locally, processed by local Whisper - HIPAA compliant.
 */

export const dynamic = 'force-dynamic';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  createSession,
  updateSession,
  enqueueJob
} from '@/lib/supervision/SupervisionStore';

const STORAGE_DIR = process.env.SUPERVISION_STORAGE_DIR || 'storage/supervision';
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB max
const ALLOWED_TYPES = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/mp4'];

export async function POST(request: NextRequest) {
  try {
    // Auth: require authenticated member
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Feature gate: audio uploads disabled by default (local-only policy)
    if (process.env.ALLOW_AUDIO_UPLOADS !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Audio uploads are disabled. Audio is stored locally on-device by default.' },
        { status: 410 }
      );
    }

    // Guard: reject non-multipart requests with a clear 415 error
    const ct = request.headers.get('content-type') ?? '';
    if (!ct.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Expected multipart/form-data (FormData upload). Do not set Content-Type manually.' },
        { status: 415 }
      );
    }

    const formData = await request.formData();

    // Extract fields — use authenticated member as practitioner identity
    const audioFile = formData.get('audio') as File | null;
    const practitionerId = memberId;
    const caseId = formData.get('caseId') as string | null;
    const sessionType = formData.get('sessionType') as string | null;
    const title = formData.get('title') as string | null;
    const durationMs = formData.get('durationMs') as string | null;

    if (!audioFile) {
      return NextResponse.json({
        success: false,
        error: 'audio file is required'
      }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(audioFile.type)) {
      return NextResponse.json({
        success: false,
        error: `Invalid audio type: ${audioFile.type}. Allowed: ${ALLOWED_TYPES.join(', ')}`
      }, { status: 400 });
    }

    // Validate file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      }, { status: 400 });
    }

    // Create session first to get ID
    const session = await createSession({
      practitionerId: practitionerId || undefined,
      caseId: caseId || undefined,
      sessionType: (sessionType as 'individual' | 'group' | 'peer' | 'consultation' | 'team_meeting') || 'consultation',
      title: title || `Uploaded: ${audioFile.name}`,
      metadata: {
        uploadedVia: 'api',
        originalFilename: audioFile.name,
        fileSize: audioFile.size,
        mimeType: audioFile.type,
        uploadedAt: new Date().toISOString()
      }
    });

    // Create storage directory
    const sessionDir = path.join(process.cwd(), STORAGE_DIR, session.id);
    if (!existsSync(sessionDir)) {
      await mkdir(sessionDir, { recursive: true });
    }

    // Determine file extension from mime type
    const extMap: Record<string, string> = {
      'audio/wav': '.wav',
      'audio/mp3': '.mp3',
      'audio/mpeg': '.mp3',
      'audio/webm': '.webm',
      'audio/ogg': '.ogg',
      'audio/m4a': '.m4a',
      'audio/mp4': '.m4a'
    };
    const ext = extMap[audioFile.type] || '.audio';

    // Save audio file
    const audioPath = path.join(sessionDir, `recording${ext}`);
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    await writeFile(audioPath, audioBuffer);

    // Update session with recording path
    await updateSession(session.id, {
      recording_path: audioPath,
      processing_status: 'processing',
      ended_at: new Date().toISOString(),
      total_duration_ms: durationMs ? parseInt(durationMs, 10) : undefined
    });

    // Queue transcription and analysis jobs
    await Promise.all([
      // First: transcription
      enqueueJob({ sessionId: session.id, jobType: 'transcribe', priority: 1 }),
      // Then: diarization
      enqueueJob({ sessionId: session.id, jobType: 'diarize', priority: 2 })
    ]);

    console.log(`📤 [SUPERVISION] Audio uploaded for session ${session.id}: ${audioFile.name} (${(audioFile.size / (1024 * 1024)).toFixed(2)}MB)`);

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        title: session.title,
        processingStatus: 'processing'
      },
      upload: {
        filename: audioFile.name,
        size: audioFile.size,
        type: audioFile.type,
        storagePath: audioPath
      },
      message: 'Audio uploaded. Transcription and analysis queued.',
      nextSteps: [
        'Transcription will run via local Whisper',
        'Speaker diarization will identify participants',
        'Clinical analysis will generate insights',
        `Check status at: /api/supervision/session/${session.id}`
      ]
    });

  } catch (error) {
    console.error('🔴 [SUPERVISION] Error uploading audio:', error);

    if ((error as { code?: string }).code === '42P01') {
      return NextResponse.json({
        success: false,
        error: 'Supervision tables not found. Run database migration first.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to upload audio'
    }, { status: 500 });
  }
}
