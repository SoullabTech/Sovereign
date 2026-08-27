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
import { resolveVoicePreference } from '@/lib/tts/cloudVoicePolicy';
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

  // ── Resolve log: what this preview request decided ──
  console.info('[tts.resolve]', JSON.stringify({
    path: 'preview',
    memberId: (memberId || '').slice(0, 8),
    ttsProviderPref: providerPref,
    voiceId: voice,
    localEnabled: process.env.MAIA_LOCAL_VOICE_ENABLED === '1',
  }));

  // Generate MP3 bytes
  let audioBuffer: Buffer;

  // ── Member chose "local" → Kokoro only, no cloud fallback ──
  if (providerPref === 'local') {
    console.info('[tts.attempt]', JSON.stringify({ path: 'preview', provider: 'kokoro', voice, reason: 'member_chose_local' }));
    try {
      const result = await ttsRouter.synthesize({ text, voice, format: 'mp3', speed, ttsProviderPref: 'local' });
      audioBuffer = result.audioBuffer;
    } catch (err) {
      return NextResponse.json(
        { error: 'Local voice engine is offline. Try again when Kokoro is running.' },
        { status: 503 },
      );
    }
  } else {
    // ── VOICE-SOVEREIGNTY-02: this route bypassed the policy entirely ──
    //
    // `synthesizeSpeech` is imported directly from `lib/tts/openaiTts`, so it
    // never passes through `ttsRouter` and never hits `assertCloudVoiceAllowed`.
    // The constructor guard added in VOICE-SOVEREIGNTY-01 therefore did not
    // reach here: on 37bbf0c23 an `auto` member playing a voice preview still
    // executed OpenAI TTS, while the canon said local. The gate is a choke
    // point only for paths that go through it.
    //
    // The same single question is asked here as in stream-conversation, from
    // the same resolver. Preview is a member-facing voice surface, so the
    // matrix must be true of it too.
    // A settings-page voice preview is never a Sanctuary turn: it synthesizes a
    // fixed sample line, not anything the member said. Declared explicitly
    // rather than defaulted, because the resolver requires an answer.
    const previewPref = resolveVoicePreference(providerPref, { sanctuary: false });
    const cloudUsable = previewPref.effective === 'cloud'
      && !!process.env.OPENAI_API_KEY
      && process.env.DISABLE_OPENAI_COMPLETELY !== 'true';

    if (!cloudUsable) {
      // ⛔ No 503 for a cloud member any more. The ruling is explicit:
      //   cloud preference + cloud unavailable -> local if local is healthy.
      // Refusing to preview anything because the chosen provider is unavailable
      // is the silence case wearing a status code.
      if (previewPref.cloudRequestedButUnavailable) {
        console.info('[tts.policy]', JSON.stringify({
          path: 'preview',
          storedPreference: previewPref.stored,
          effective: previewPref.effective,
          note: 'cloud voice unavailable under current sovereignty policy; member preference preserved',
        }));
      }
      console.info('[tts.attempt]', JSON.stringify({ path: 'preview', provider: 'kokoro', voice, reason: 'sovereign_primary' }));
      try {
        const result = await ttsRouter.synthesize({ text, voice, format: 'mp3', speed, ttsProviderPref: 'auto' });
        audioBuffer = result.audioBuffer;
      } catch {
        return NextResponse.json(
          { error: 'No cloud API key and local TTS unavailable' },
          { status: 503 },
        );
      }
    } else {
      console.info('[tts.attempt]', JSON.stringify({ path: 'preview', provider: 'openai', voice, reason: 'member_chose_cloud' }));
      try {
        const speech = await synthesizeSpeech({ text, voice, format: 'mp3', speed });
        audioBuffer = Buffer.from(await speech.arrayBuffer());
      } catch (err: any) {
        // ⛔ Deliberately NO early 503 for a cloud member. Only an explicit
        // `cloud` preference can reach this branch at all, and the ruling says
        // that member falls to local when their provider is unavailable — the
        // same rule as stream-conversation, so the two surfaces cannot drift.
        console.info('[tts.attempt]', JSON.stringify({ path: 'preview', provider: 'kokoro', voice, reason: 'openai_fallback' }));
        try {
          const result = await ttsRouter.synthesize({ text, voice, format: 'mp3', speed, ttsProviderPref: 'auto' });
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
