export const dynamic = 'force-dynamic';

/**
 * CASELOAD VOICE TRANSCRIPTION
 *
 * POST — Accept audio blob, transcribe via local Whisper, return text.
 *
 * No storage. No DB. Audio goes in, transcript comes out.
 * Sovereign by design: local Whisper only, no cloud APIs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

const WHISPER_LOCAL_URL = process.env.WHISPER_LOCAL_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Expected multipart/form-data' },
        { status: 415 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: 'No audio file provided' }, { status: 400 });
    }

    const ext = file.type?.includes('mp4') ? '.m4a'
      : file.type?.includes('webm') ? '.webm'
      : file.type?.includes('wav') ? '.wav'
      : '.webm';

    const arrayBuffer = await file.arrayBuffer();
    const safeName = file.name && file.name.includes('.') ? file.name : `recording${ext}`;
    const safeType = file.type || 'audio/webm';
    const fixedFile = new File([arrayBuffer], safeName, { type: safeType });

    const whisperFormData = new FormData();
    whisperFormData.append('file', fixedFile, fixedFile.name);
    whisperFormData.append('model', 'base.en');

    const whisperResponse = await fetch(`${WHISPER_LOCAL_URL}/v1/audio/transcriptions`, {
      method: 'POST',
      body: whisperFormData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('[CASELOAD-TRANSCRIBE] Whisper error:', errorText);
      return NextResponse.json(
        { success: false, error: 'Transcription failed' },
        { status: 502 }
      );
    }

    const result = await whisperResponse.json();
    let transcript = (result.text || '').trim();
    transcript = transcript.replace(/\bMaya\b/gi, 'MAIA');

    return NextResponse.json({ success: true, transcript });
  } catch (error: any) {
    console.error('[CASELOAD-TRANSCRIBE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Transcription failed' },
      { status: 500 }
    );
  }
}
