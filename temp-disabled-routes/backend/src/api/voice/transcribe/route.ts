import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";
import { memoryStore } from "../../../services/memory/MemoryStore";
import { llamaService } from "../../../services/memory/LlamaService";
import { logger } from "../../../utils/logger";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ensure upload directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.join(process.cwd(), "uploads", "voice");
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing file or userId" }, 
        { status: 400 }
      );
    }

    logger.info("Voice transcription request", {
      userId: userId.substring(0, 8) + '...',
      fileName: file.name,
      fileSize: file.size
    });

    // Validate file size (max 25MB for Whisper API)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 25MB" },
        { status: 400 }
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

      // Whisper transcription
      const fileStream = await fs.readFile(filePath);
      const transcriptionFile = new File([fileStream], file.name, { type: file.type });
      
      const transcription = await openai.audio.transcriptions.create({
        file: transcriptionFile,
        model: "whisper-1",
        language: "en", // Optional: specify language for better accuracy
        response_format: "text"
      });

      const transcript = transcription as string; // When response_format is "text"

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
        voiceNoteId,
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
        } catch (error) {
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

    } catch (transcriptionError: any) {
      // Clean up file on error
      try {
        await fs.unlink(filePath);
      } catch (e) {
        // Ignore cleanup errors
      }

      logger.error("Whisper transcription failed", {
        error: transcriptionError.message,
        userId: userId.substring(0, 8) + '...'
      });

      return NextResponse.json(
        { 
          success: false, 
          error: "Transcription failed. Please try again.",
          details: transcriptionError.message 
        }, 
        { status: 500 }
      );
    }

  } catch (error: any) {
    logger.error("Voice transcription error", {
      error: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "An unexpected error occurred",
        details: error.message 
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
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const voiceNoteId = pathParts[pathParts.length - 1];
    const userId = url.searchParams.get('userId');

    if (!voiceNoteId || !userId) {
      return NextResponse.json(
        { error: 'voiceNoteId and userId are required' },
        { status: 400 }
      );
    }

    // Initialize memory store if needed
    if (!memoryStore.isInitialized) {
      const dbPath = path.join(process.cwd(), "backend", "src", "services", "memory", "soullab.sqlite");
      await memoryStore.init(dbPath);
    }

    // Retrieve voice note from database
    const voiceNotes = await memoryStore.getMemories(userId, 1000);
    const voiceNote = voiceNotes.find(
      note => note.memory_type === 'voice' && 
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

  } catch (error: any) {
    logger.error('Failed to retrieve voice note', {
      error: error.message
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}