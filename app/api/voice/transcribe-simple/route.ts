export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const revalidate = false;

// This endpoint is called from the Capacitor app which points to the production server
// The static export placeholder won't affect runtime behavior

/**
 * SOVEREIGNTY: This endpoint uses LOCAL Faster-Whisper server (NOT OpenAI cloud).
 * OpenAI is ONLY used for TTS (Text-to-Speech), NOT for transcription.
 *
 * Local Faster-Whisper server runs on port 8000 with OpenAI-compatible API
 * - 100% sovereign (runs locally in Docker, no external API calls)
 * - CTranslate2 backend for fast inference
 * - Base English model for accurate transcription
 */

import { collapseRepetitionLoops, isDegenerate } from '@/lib/voice/transcriptSanity';

const WHISPER_LOCAL_URL = process.env.WHISPER_LOCAL_URL || 'http://127.0.0.1:8000';
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB max for audio transcription

export async function POST(req: NextRequest) {
  console.log("🎤 [TRANSCRIBE-SIMPLE] Request received. Headers:", {
    contentType: req.headers.get('content-type'),
    userAgent: req.headers.get('user-agent')?.substring(0, 50)
  });

  try {
    // Auth: require authenticated member
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Feature gates (canon distinction):
    //
    //   ALLOW_AUDIO_UPLOADS         — broad permission for general audio
    //                                 uploads. Default: false. Sovereignty
    //                                 stance: audio stays on-device.
    //
    //   ALLOW_AUDIO_TRANSCRIPTION   — narrower permission, scoped to bounded
    //                                 transcription recovery (e.g. Android
    //                                 Chrome voice-fallback when the browser's
    //                                 Web Speech API fails). Audio is
    //                                 transcribed by local maia-whisper and
    //                                 NOT sent to OpenAI cloud. This is more
    //                                 sovereign than the alternative — Android
    //                                 Chrome's webkitSpeechRecognition sends
    //                                 audio to Google's speech servers; this
    //                                 path keeps it first-party.
    //
    // Either gate is sufficient. The narrower flag is preferred for
    // accessibility/recovery use cases; the broader flag remains available
    // if a future workflow needs general audio uploads.
    const audioUploadsAllowed = process.env.ALLOW_AUDIO_UPLOADS === 'true';
    const transcriptionAllowed = process.env.ALLOW_AUDIO_TRANSCRIPTION === 'true';
    if (!audioUploadsAllowed && !transcriptionAllowed) {
      return NextResponse.json(
        { success: false, error: 'Audio transcription is disabled. Local-only by default.' },
        { status: 410 }
      );
    }

    // Guard: reject non-multipart requests with a clear 415 error
    const ct = req.headers.get('content-type') ?? '';
    if (!ct.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Expected multipart/form-data (FormData upload). Do not set Content-Type manually.' },
        { status: 415 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    console.log("🎤 [TRANSCRIBE-SIMPLE] FormData parsed. File found:", !!file);

    if (!file) {
      console.error("🎤 [TRANSCRIBE-SIMPLE] ERROR: No audio file in FormData");
      return NextResponse.json(
        { success: false, error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Size cap: reject files over 25MB
    if (file.size > MAX_FILE_SIZE) {
      console.error("🎤 [TRANSCRIBE-SIMPLE] ERROR: File too large:", file.size);
      return NextResponse.json(
        { success: false, error: `Audio file too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` },
        { status: 413 }
      );
    }

    console.log("🎤 [TRANSCRIBE-SIMPLE] Audio file details:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Ensure file has proper name and type (some Whisper servers are picky)
    // Native iOS recorder may send files with missing/incorrect metadata
    const arrayBuffer = await file.arrayBuffer();
    const safeName = file.name && file.name.includes('.') ? file.name : 'recording.wav';
    const safeType = file.type || 'audio/wav';
    const fixedFile = new File([arrayBuffer], safeName, { type: safeType });

    console.log("🎤 [TRANSCRIBE-SIMPLE] Fixed file details:", {
      originalName: file.name,
      fixedName: safeName,
      originalType: file.type,
      fixedType: safeType
    });

    // Forward audio file to local Faster-Whisper server (OpenAI-compatible API)
    const whisperFormData = new FormData();
    whisperFormData.append('file', fixedFile, fixedFile.name);
    // Multilingual: 'base' (Systran/faster-whisper-base) lets Whisper auto-detect
    // the spoken language. No `language` field is sent, so detection is automatic.
    // English-only was 'base.en'. See docs/specs/CONVERSATIONAL_MULTILINGUAL_UNLOCK_2026-06-14.md.
    whisperFormData.append('model', 'base');

    // ⭐ DESKTOP-WHISPER-REPETITION-LOOP-01 — do not decode the room.
    //
    // ⛔ DEVICE-WITNESSED 2026-08-30, with background noise present: Whisper
    // fell into repeating one phrase — "There is." ×60, "no," ×100, "Good to
    // have a star with an apple." ×40 — and those loops were committed as
    // member turns. This request previously sent only the file and the model,
    // so the decoder ran on defaults and was handed stretches of room tone as
    // if they were speech.
    //
    // `vad_filter` drops non-speech before decoding, which removes the input
    // that produces the loop in the first place. `condition_on_previous_text`
    // is the specific feedback path that sustains one: with it on, a repeated
    // phrase becomes the context that makes the next repetition more likely.
    //
    // ⛔ Unknown fields are ignored by the server rather than rejected, so this
    // is safe if a deployment's Whisper build does not implement them — and the
    // collapse below still catches anything that gets through either way.
    whisperFormData.append('vad_filter', 'true');
    whisperFormData.append('condition_on_previous_text', 'false');

    console.log("🎤 [TRANSCRIBE-SIMPLE] Forwarding to Whisper:", WHISPER_LOCAL_URL);

    // Send to local Whisper server (OpenAI-compatible endpoint)
    const whisperResponse = await fetch(`${WHISPER_LOCAL_URL}/v1/audio/transcriptions`, {
      method: 'POST',
      body: whisperFormData,
    });

    console.log("🎤 [TRANSCRIBE-SIMPLE] Whisper response status:", whisperResponse.status);

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('🎤 [TRANSCRIBE-SIMPLE] Whisper error:', errorText);
      return NextResponse.json(
        {
          success: false,
          error: "Local Faster-Whisper transcription failed",
          details: errorText
        },
        { status: 500 }
      );
    }

    const result = await whisperResponse.json();

    // Extract transcription from OpenAI-compatible response format
    let transcription = result.text || '';

    // Post-process to fix common mis-transcriptions
    // "Maya" -> "MAIA" (Whisper often mishears our name)
    transcription = transcription.replace(/\bMaya\b/gi, 'MAIA');

    // ⛔ JUDGED BEFORE COLLAPSING, and the order is load-bearing. Collapsing
    // first would turn a capture that was ENTIRELY a hallucinated loop into a
    // short, plausible-looking utterance ("no no no") and commit it as
    // something the member said. The raw output is what tells us whether there
    // was ever any speech in there at all.
    if (isDegenerate(transcription)) {
      console.warn('🎤 [TRANSCRIBE-SIMPLE] degenerate transcription refused', {
        chars: transcription.length,   // length only — never content
      });
      transcription = '';
    } else {
      // ⭐ There IS speech here. Collapse the runaway repetition and KEEP what
      // surrounds it — the witnessed loops were preceded by real sentences, and
      // discarding the turn would throw away what the member actually said in
      // order to remove what they did not.
      const sanity = collapseRepetitionLoops(transcription);
      if (sanity.collapsed) {
        console.warn('🎤 [TRANSCRIBE-SIMPLE] repetition loop collapsed', {
          before: transcription.length,
          after: sanity.text.length,
        });
      }
      transcription = sanity.text;
    }

    console.log("✅ Local Faster-Whisper transcription:", transcription.length, "chars"); // Never log content

    return NextResponse.json({
      success: true,
      transcription: transcription.trim(),
      confidence: 0.95, // Faster-Whisper doesn't return confidence scores
      source: 'faster-whisper-local' // Indicate local processing
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Transcription endpoint error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Transcription failed",
        details: message
      },
      { status: 500 }
    );
  }
}
