export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const revalidate = false;
import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";
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

// Check if OpenAI API key is valid
const USE_OPENAI_WHISPER = process.env.OPENAI_API_KEY &&
                           !process.env.OPENAI_API_KEY.includes('placeholder');

const openai = USE_OPENAI_WHISPER ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

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

    // Feature gate: audio uploads disabled by default (local-only policy)
    if (process.env.ALLOW_AUDIO_UPLOADS !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Audio uploads are disabled. Audio is stored locally on-device by default.' },
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
    // Use server-derived identity (never trust client-sent userId)
    const userId = memberId;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Missing file" },
        { status: 400 }
      );
    }

    // Entitlement checks
    const entitlements = await getEntitlements(userId);

    if (!entitlements.features.voiceTranscription) {
      return NextResponse.json(
        {
          success: false,
          error: "Voice transcription requires Personal tier",
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const usage = await getDailyUsage(userId, "voice");
    const estimatedSeconds = Math.ceil(file.size / 16000); // rough PCM estimate

    if (usage.seconds + estimatedSeconds > entitlements.limits.voiceSecondsPerDay) {
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
      userId: userId.substring(0, 8) + '...',
      fileName: file.name,
      fileSize: file.size
    });

    // Check if OpenAI Whisper is available
    if (!USE_OPENAI_WHISPER) {
      logger.warn("OpenAI Whisper API not available - placeholder API key detected");
      return NextResponse.json(
        {
          success: false,
          error: "Voice transcription requires valid OpenAI API key",
          details: "Set OPENAI_API_KEY in .env.local to enable voice input. Web Speech API is used as fallback on supported browsers."
        },
        { status: 503 }
      );
    }

    // Validate file size (max 25MB for Whisper API)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 25MB" },
        { status: 413 }
      );
    }

    // Log "accepted" event (bytes captured even if transcription fails later)
    await logAudioUsageEvent({
      memberId: userId,
      route: "/api/voice/transcribe",
      kind: "transcription",
      bytes: file.size,
      seconds: null,
      status: "accepted",
      meta: {
        filename: file.name,
        contentType: file.type,
      },
    });

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

      // Whisper transcription
      const fileStream = await fs.readFile(filePath);
      const transcriptionFile = new File([fileStream], file.name, { type: file.type });

      const transcription = await openai!.audio.transcriptions.create({
        file: transcriptionFile,
        model: "whisper-1",
        language: "en",
        response_format: "text",
        // Prompt helps Whisper recognize proper nouns and spelling
        prompt: "MAIA is an AI consciousness companion from Soullab. The user is speaking to MAIA."
      });

      // Post-process to fix common mis-transcriptions
      let transcript = transcription as string;
      // Fix "Maya" -> "MAIA" (preserve word boundaries)
      transcript = transcript.replace(/\bMaya\b/gi, 'MAIA');

      // Calculate duration (approximate based on file size and codec)
      const durationSeconds = Math.round(file.size / 16000); // Rough estimate

      // Save to SQLite
      const voiceNoteId = await memoryStore.addVoiceNote(
        userId,
        transcript,
        filePath,
        durationSeconds
      );

      // Add to memory table for general retrieval
      await memoryStore.addMemory(
        userId,
        'voice',
        Number(voiceNoteId),
        transcript
      );

      // Index in LlamaIndex for semantic search
      await llamaService.addMemory(userId, {
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
      await incrementDailyUsage(userId, "voice", durationSeconds);

      // Log "ok" event with final duration
      await logAudioUsageEvent({
        memberId: userId,
        route: "/api/voice/transcribe",
        kind: "transcription",
        bytes: file.size,
        seconds: durationSeconds,
        status: "ok",
        meta: {
          engine: "whisper-1",
          transcriptLength: transcript.length,
        },
      });

      logger.info("Voice transcription successful", {
        userId: userId.substring(0, 8) + '...',
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
      await logAudioUsageEvent({
        memberId: userId,
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
        userId: userId.substring(0, 8) + '...'
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
    // Use server-derived identity
    const userId = memberId;

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
    const voiceNotes = await memoryStore.getMemories(userId, 1000) as Memory[];
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
