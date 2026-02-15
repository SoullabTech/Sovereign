/**
 * Voice Preview API — generate ephemeral preview audio and return a playable URL.
 *
 * POST: Generates MP3 via the TTS router, writes to /tmp, returns { audioUrl }.
 *
 * Why this exists:
 *   iOS WKWebView is unreliable with blob URLs for audio playback.
 *   By returning a real URL that serves the file via GET, <audio src=...>
 *   works consistently across desktop, iOS, and Android WebViews.
 *
 * Files are ephemeral: written to /tmp/maia-tts-preview, cleaned after 10 min.
 * No long-term storage. No content extraction. Just presence, then gone.
 *
 * Routing: OpenAI leads (auto/cloud), Kokoro as fallback (auto) or explicit (local).
 * Preview files are scoped to the requesting member and cannot be accessed by others.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import * as ttsRouter from '@/lib/tts/ttsRouter';
import { synthesizeSpeech } from '@/lib/tts/openaiTts';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const PREVIEW_DIR = '/tmp/maia-tts-preview';
const TTL_MS = 10 * 60 * 1000; // 10 minutes

const SPEED_MIN = 0.94;
const SPEED_MAX = 1.06;
const TEXT_MAX = 600;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

async function ensureDir() {
  await fs.mkdir(PREVIEW_DIR, { recursive: true });
}

/** Best-effort cleanup: delete files older than TTL. Fire-and-forget. */
async function cleanupOldFiles() {
  try {
    const entries = await fs.readdir(PREVIEW_DIR);
    const now = Date.now();
    await Promise.all(
      entries
        .filter((f) => f.endsWith('.mp3'))
        .map(async (f) => {
          const full = path.join(PREVIEW_DIR, f);
          try {
            const stat = await fs.stat(full);
            if (now - stat.mtimeMs > TTL_MS) {
              await fs.unlink(full).catch(() => {});
            }
          } catch {
            // file may have been deleted by another cleanup
          }
        }),
    );
  } catch {
    // ignore cleanup errors entirely
  }
}

export async function POST(req: NextRequest) {
  let memberId: string;
  try {
    memberId = await requireMemberId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { text?: string; voiceId?: string; speed?: number; ttsProvider?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text || text.length > TEXT_MAX) {
    return NextResponse.json(
      { error: `text is required and must be <= ${TEXT_MAX} chars` },
      { status: 400 },
    );
  }

  const voice = body.voiceId || 'alloy';
  const speed = clamp(body.speed ?? 1.0, SPEED_MIN, SPEED_MAX);
  const providerPref = body.ttsProvider || 'auto';

  // Generate MP3 bytes
  let audioBuffer: Buffer;

  // ── Member chose "local" → Kokoro only, no cloud fallback ──
  if (providerPref === 'local') {
    try {
      const result = await ttsRouter.synthesize({ text, voice, format: 'mp3', speed });
      audioBuffer = result.audioBuffer;
    } catch (err) {
      return NextResponse.json(
        { error: 'Local voice engine is offline. Try again when Kokoro is running.' },
        { status: 503 },
      );
    }
  } else {
    // ── "auto" or "cloud" → OpenAI Alloy leads ──
    if (!process.env.OPENAI_API_KEY) {
      // No API key — try Kokoro as last resort (auto only)
      if (providerPref === 'cloud') {
        return NextResponse.json(
          { error: 'Cloud voice requires internet. No API key configured.' },
          { status: 503 },
        );
      }
      // "auto" without API key → fall back to Kokoro
      try {
        const result = await ttsRouter.synthesize({ text, voice, format: 'mp3', speed });
        audioBuffer = result.audioBuffer;
      } catch {
        return NextResponse.json(
          { error: 'No cloud API key and local TTS unavailable' },
          { status: 503 },
        );
      }
    } else {
      try {
        const speech = await synthesizeSpeech({ text, voice, format: 'mp3', speed });
        audioBuffer = Buffer.from(await speech.arrayBuffer());
      } catch (err: any) {
        // OpenAI failed — if "cloud", no fallback
        if (providerPref === 'cloud') {
          return NextResponse.json(
            { error: 'Cloud TTS failed', detail: err?.message },
            { status: 503 },
          );
        }
        // "auto" → try Kokoro as fallback
        try {
          const result = await ttsRouter.synthesize({ text, voice, format: 'mp3', speed });
          audioBuffer = result.audioBuffer;
        } catch {
          return NextResponse.json(
            { error: 'Both cloud and local TTS failed', detail: err?.message },
            { status: 503 },
          );
        }
      }
    }
  }

  // Write to /tmp with member-scoped filename
  await ensureDir();
  void cleanupOldFiles(); // fire-and-forget

  const id = crypto.randomBytes(16).toString('hex');
  const filename = `${memberId}_${id}.mp3`;
  const fullPath = path.join(PREVIEW_DIR, filename);
  await fs.writeFile(fullPath, audioBuffer);

  const audioUrl = `/api/voice/preview/${encodeURIComponent(filename)}`;

  return NextResponse.json(
    { audioUrl },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
