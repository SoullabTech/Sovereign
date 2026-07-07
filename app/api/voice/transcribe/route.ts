export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const revalidate = false;
import fs from "fs/promises";
import path from "path";
import { memoryStore } from "../../_backend/src/services/memory/MemoryStore";
import { llamaService } from "../../_backend/src/services/memory/LlamaService";
import { logger } from "../../_backend/src/utils/logger";
import { v4 as uuidv4 } from "uuid";
import { getEntitlements } from "@/lib/entitlements";
import { getDailyUsage, incrementDailyUsage } from "@/lib/usage";
import { logAudioUsageEvent } from "@/lib/usage/audioUsage";

interface Memory {
  id: number | string;
  memory_type: string;
  reference_id?: number;
  content: string;
  created_at: string;
}

// Skip during static export (Capacitor builds)

// SOVEREIGNTY: transcription uses the LOCAL Faster-Whisper server (maia-whisper),
// never OpenAI cloud — inbound member audio never leaves the host. OpenAI cloud
// STT (whisper-1) removed 2026-07-06 (sovereignty completion, step 3). Mirrors the
// local-only path already used by /api/voice/transcribe-simple.
const WHISPER_LOCAL_URL = process.env.WHISPER_LOCAL_URL || 'http://127.0.0.1:8000';

// Ensure upload directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.join(process.cwd(), "uploads", "voice");
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
};

export async function POST(req: NextRequest) {
  try {
    // Auth: require authenticated member (server-derived, never trust client)
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Feature gates (canon distinction):
    //   ALLOW_AUDIO_UPLOADS       — broad audio-upload permission (default off)
    //   ALLOW_AUDIO_TRANSCRIPTION — narrower, bounded transcription recovery
    //                               (e.g. Android Chrome voice-fallback);
    //                               first-party + local maia-whisper only,
    //                               never OpenAI cloud. Preferred for
    //                               accessibility/recovery use cases.
    // Either gate is sufficient.
    const audioUploadsAllowed = process.env.ALLOW_AUDIO_UPLOADS === 'true';
    const transcriptionAllowed = process.env.ALLOW_AUDIO_TRANSCRIPTION === 'true';
    if (!audioUploadsAllowed && !transcriptionAllowed) {
      logAudioUsageEvent({
        memberId,
        route: "/api/voice/transcribe",
        kind: "transcription",
        bytes: 0,
        status: "rejected",
        errorCode: "FEATURE_DISABLED",
        meta: { reason: "ALLOW_AUDIO_UPLOADS and ALLOW_AUDIO_TRANSCRIPTION both unset" },
      });
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

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Missing file" },
        { status: 400 }
      );
    }

    // Entitlement checks
    const entitlements = await getEntitlements(memberId);

    if (!entitlements.features.voiceTranscription) {
      logAudioUsageEvent({
        memberId,
        route: "/api/voice/transcribe",
        kind: "transcription",
        bytes: file.size,
        status: "rejected",
        errorCode: "TIER_GATE",
        meta: { tier: entitlements.tier, reason: "voiceTranscription not enabled" },
      });
      return NextResponse.json(
        {
          success: false,
          error: "Voice transcription requires Guardian tier or an Audio Minutes add-on.",
          upgradeRequired: true,
          currentTier: entitlements.tier,
        },
        { status: 403 }
      );
    }

    const usage = await getDailyUsage(memberId, "voice");
    const estimatedSeconds = Math.ceil(file.size / 16000); // rough PCM estimate

    if (usage.seconds + estimatedSeconds > entitlements.limits.voiceSecondsPerDay) {
      logAudioUsageEvent({
        memberId,
        route: "/api/voice/transcribe",
        kind: "transcription",
        bytes: file.size,
        status: "rejected",
        errorCode: "DAILY_LIMIT",
        meta: { usedSeconds: usage.seconds, limitSeconds: entitlements.limits.voiceSecondsPerDay },
      });
      return NextResponse.json(
        {
          success: false,
          error: `Daily voice limit reached (${Math.floor(entitlements.limits.voiceSecondsPerDay / 60)} min/day). Resets at midnight.`,
        },
        { status: 429 }
      );
    }

    if (estimatedSeconds > entitlements.limits.maxRecordingSeconds) {
      return NextResponse.json(
        {
          success: false,
          error: `Recording too long. Max ${entitlements.limits.maxRecordingSeconds}s for your tier.`,
        },
        { status: 400 }
      );
    }

    logger.info("Voice transcription request", {
      memberId: memberId.substring(0, 8) + '...',
      fileName: file.name,
      fileSize: file.size
    });

    // Validate file size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      logAudioUsageEvent({
        memberId,
        route: "/api/voice/transcribe",
        kind: "transcription",
        bytes: file.size,
        status: "rejected",
        errorCode: "SIZE_LIMIT",
        meta: { maxBytes: 25 * 1024 * 1024 },
      });
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 25MB" },
        { status: 413 }
      );
    }

    // Save file temporarily
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = await ensureUploadDir();
    const fileName = `${Date.now()}-${uuidv4()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);

    try {
      // Initialize memory services if needed
      if (!memoryStore.isInitialized) {
        const dbPath = path.join(process.cwd(), "backend", "src", "services", "memory", "soullab.sqlite");
        await memoryStore.init(dbPath);
      }
      if (!llamaService.isInitialized) {
        await llamaService.init();
      }

      // Transcribe via the LOCAL Faster-Whisper server (OpenAI-compatible API).
      // Audio is forwarded to maia-whisper on the host and never sent to OpenAI cloud.
      const fileStream = await fs.readFile(filePath);
      const transcriptionFile = new File([fileStream], file.name, { type: file.type });

      const whisperFormData = new FormData();
      whisperFormData.append('file', transcriptionFile, file.name);
      // 'base' (Systran/faster-whisper-base) auto-detects language (multilingual).
      whisperFormData.append('model', 'base');

      const whisperResponse = await fetch(`${WHISPER_LOCAL_URL}/v1/audio/transcriptions`, {
        method: 'POST',
        body: whisperFormData,
      });
      if (!whisperResponse.ok) {
        const errorText = await whisperResponse.text();
        throw new Error(`Local Faster-Whisper transcription failed: ${errorText}`);
      }
      const whisperResult = await whisperResponse.json();

      // Post-process to fix common mis-transcriptions
      let transcript = (whisperResult.text || '') as string;
      // Fix "Maya" -> "MAIA" (preserve word boundaries)
      transcript = transcript.replace(/\bMaya\b/gi, 'MAIA');

      // Calculate duration (approximate based on file size and codec)
      const durationSeconds = Math.round(file.size / 16000); // Rough estimate

      // Save to SQLite
      const voiceNoteId = await memoryStore.addVoiceNote(
        memberId,
        transcript,
        filePath,
        durationSeconds
      );

      // Add to memory table for general retrieval
      await memoryStore.addMemory(
        memberId,
        'voice',
        Number(voiceNoteId),
        transcript
      );

      // Index in LlamaIndex for semantic search
      await llamaService.addMemory(memberId, {
        id: `voice_${voiceNoteId}`,
        type: 'voice',
        content: transcript,
        meta: {
          fileName: file.name,
          durationSeconds,
          createdAt: new Date().toISOString()
        }
      });

      // Track usage for quota enforcement
      await incrementDailyUsage(memberId, "voice", durationSeconds);

      // Log "ok" event with final duration
      logAudioUsageEvent({
        memberId,
        route: "/api/voice/transcribe",
        kind: "transcription",
        bytes: file.size,
        seconds: durationSeconds,
        status: "ok",
        meta: {
          engine: "faster-whisper-local",
          transcriptLength: transcript.length,
        },
      });

      logger.info("Voice transcription successful", {
        memberId: memberId.substring(0, 8) + '...',
        voiceNoteId,
        transcriptLength: transcript.length,
        durationSeconds
      });

      // Clean up temp file after a delay (keep for potential playback)
      setTimeout(async () => {
        try {
          await fs.unlink(filePath);
        } catch {
          // File might already be deleted
        }
      }, 60000); // Delete after 1 minute

      return NextResponse.json({
        success: true,
        transcript,
        voiceNoteId: `voice_${voiceNoteId}`,
        duration: durationSeconds,
        message: "Voice note transcribed and saved successfully"
      });

    } catch (transcriptionError: unknown) {
      // Clean up file on error
      try {
        await fs.unlink(filePath);
      } catch {
        // Ignore cleanup errors
      }

      const errorMessage = transcriptionError instanceof Error ? transcriptionError.message : String(transcriptionError);

      // Log "error" event
      logAudioUsageEvent({
        memberId,
        route: "/api/voice/transcribe",
        kind: "transcription",
        bytes: file.size,
        seconds: null,
        status: "error",
        errorCode: "TRANSCRIBE_FAILED",
        meta: { message: errorMessage },
      });

      logger.error("Whisper transcription failed", {
        error: errorMessage,
        memberId: memberId.substring(0, 8) + '...'
      });

      return NextResponse.json(
        {
          success: false,
          error: "Transcription failed. Please try again.",
          details: errorMessage
        },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error("Voice transcription error", {
      error: errorMessage,
      stack: errorStack
    });

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/voice/transcribe/:voiceNoteId
 * Retrieve a specific voice note transcription
 */
export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    // Auth: require authenticated member
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const voiceNoteId = pathParts[pathParts.length - 1];

    if (!voiceNoteId) {
      return NextResponse.json(
        { error: 'voiceNoteId is required' },
        { status: 400 }
      );
    }

    // Initialize memory store if needed
    if (!memoryStore.isInitialized) {
      const dbPath = path.join(process.cwd(), "backend", "src", "services", "memory", "soullab.sqlite");
      await memoryStore.init(dbPath);
    }

    // Retrieve voice note from database
    const voiceNotes = await memoryStore.getMemories(memberId, 1000) as Memory[];
    const voiceNote = voiceNotes.find(
      (note: Memory) => note.memory_type === 'voice' &&
      note.reference_id === parseInt(voiceNoteId.replace('voice_', ''))
    );

    if (!voiceNote) {
      return NextResponse.json(
        { error: 'Voice note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: voiceNoteId,
        transcript: voiceNote.content,
        createdAt: voiceNote.created_at
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error('Failed to retrieve voice note', {
      error: errorMessage
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
