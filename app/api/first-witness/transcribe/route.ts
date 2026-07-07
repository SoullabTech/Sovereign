export const dynamic = 'force-dynamic';

/**
 * POST /api/first-witness/transcribe — Dictate for The First Witness.
 *
 * Forwards an audio clip to the LOCAL Faster-Whisper server (WHISPER_LOCAL_URL, sovereign —
 * audio never leaves the host) and returns the text. No auth (the witness is standalone),
 * NO PERSISTENCE — the clip is transcribed and discarded; nothing is stored. Type and speech
 * are two expressions of the same conversation.
 */

import { NextRequest, NextResponse } from 'next/server';

const WHISPER_LOCAL_URL = process.env.WHISPER_LOCAL_URL || 'http://127.0.0.1:8000';
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req: NextRequest) {
  const ct = req.headers.get('content-type') ?? '';
  if (!ct.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Expected multipart/form-data (audio upload).' }, { status: 415 });
  }

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No audio provided.' }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'Audio clip too long.' }, { status: 413 });

  try {
    const buf = await file.arrayBuffer();
    const name = file.name && file.name.includes('.') ? file.name : 'recording.webm';
    const fixed = new File([buf], name, { type: file.type || 'audio/webm' });

    // Local Faster-Whisper (OpenAI-compatible). 'base' → auto language detection.
    const whisperForm = new FormData();
    whisperForm.append('file', fixed, fixed.name);
    whisperForm.append('model', 'base');

    const whisper = await fetch(`${WHISPER_LOCAL_URL}/v1/audio/transcriptions`, {
      method: 'POST',
      body: whisperForm,
    });
    if (!whisper.ok) {
      console.error('[first-witness/transcribe] whisper', whisper.status);
      return NextResponse.json({ error: 'Could not catch that — try again.' }, { status: 502 });
    }
    const data = await whisper.json().catch(() => ({} as any));
    return NextResponse.json({ text: String(data?.text || '').trim() });
  } catch (err: any) {
    console.error('[first-witness/transcribe] error', err?.message);
    return NextResponse.json({ error: 'Could not catch that — try again.' }, { status: 502 });
  }
}
