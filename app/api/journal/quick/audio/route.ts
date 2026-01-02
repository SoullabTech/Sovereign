/**
 * Voice Journal Audio Upload API
 * POST /api/journal/quick/audio
 *
 * Handles audio file uploads for voice journal entries.
 * Stores files locally in storage/audio/journals/{userId}/
 * Updates the quick_journal_entries row with audio metadata.
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { query } from '@/lib/db/postgres';

// Node runtime required for filesystem writes
export const runtime = 'nodejs';

function safeSegment(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form: any = await request.formData();

    const userId = String(form.get('userId') || '');
    const entryId = String(form.get('entryId') || '');
    const durationMs = Number(form.get('durationMs') || 0);
    const transcriptSource = String(form.get('transcriptSource') || 'none');
    const transcriptConfidenceVal = form.get('transcriptConfidence');
    const transcriptConfidence = transcriptConfidenceVal
      ? Number(transcriptConfidenceVal)
      : null;

    const file = form.get('audio') as File | null;

    if (!userId || !entryId || !file) {
      return NextResponse.json(
        { success: false, error: 'Missing userId, entryId, or audio file' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB for voice memos)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Audio file too large (max 50MB)' },
        { status: 400 }
      );
    }

    const safeUser = safeSegment(userId);
    const ts = Date.now();
    const ext = 'webm'; // MediaRecorder default for audio/webm
    const fname = `${safeSegment(entryId)}-${ts}-${crypto.randomBytes(4).toString('hex')}.${ext}`;

    const baseDir = path.join(process.cwd(), 'storage', 'audio', 'journals', safeUser);
    await ensureDir(baseDir);

    const absPath = path.join(baseDir, fname);
    const relPath = path.join('storage', 'audio', 'journals', safeUser, fname);

    // Write audio file to disk
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(absPath, Buffer.from(arrayBuffer));

    // Update the journal entry with audio metadata
    const audioMime = file.type || 'audio/webm';
    await query(
      `UPDATE quick_journal_entries
       SET audio_path = $1,
           audio_mime = $2,
           audio_duration_ms = $3,
           transcript_source = $4,
           transcript_confidence = $5
       WHERE id = $6 AND user_id = $7`,
      [
        relPath,
        audioMime,
        durationMs || null,
        transcriptSource,
        transcriptConfidence,
        entryId,
        userId
      ]
    );

    console.log(`🎙️ [VoiceJournal] Audio saved: ${relPath} (${Math.round(file.size / 1024)}KB, ${durationMs}ms)`);

    return NextResponse.json({
      success: true,
      audioPath: relPath,
      audioMime,
      audioDurationMs: durationMs || null,
      transcriptSource
    });

  } catch (error) {
    console.error('❌ [VoiceJournal] Upload failed:', error);
    return NextResponse.json(
      { success: false, error: 'Audio upload failed' },
      { status: 500 }
    );
  }
}
