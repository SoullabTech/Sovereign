export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";

export const revalidate = false;
import path from "path";
import { memoryStore } from "../../_backend/src/services/memory/MemoryStore";
import { logger } from "../../_backend/src/utils/logger";

// Force dynamic for Docker/dev builds - Next.js 15 doesn't support conditional exports

/**
 * GET /api/voice/list
 * Static placeholder for Capacitor builds
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: [],
    count: 0,
    note: 'Static placeholder - use POST for runtime data'
  });
}

/**
 * POST /api/voice/list
 * Returns all voice transcripts for a given userId
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    logger.info("Voice list request", {
      userId: userId.substring(0, 8) + '...'
    });

    // Initialize memory store if needed
    if (!memoryStore.isInitialized) {
      const dbPath = path.join(process.cwd(), "app", "api", "backend", "src", "services", "memory", "soullab.sqlite");
      await memoryStore.init(dbPath);
    }

    // Get voice notes directly
    const voiceNotes = await memoryStore.getVoiceNotes(userId, 100);

    // Transform to API response format
    const formattedVoiceNotes = voiceNotes.map(voiceNote => ({
      id: `voice_${voiceNote.id}`,
      text: voiceNote.transcript,
      audioUrl: voiceNote.audio_path ? `/uploads/voice/${path.basename(voiceNote.audio_path)}` : undefined,
      createdAt: voiceNote.created_at,
      duration: voiceNote.duration_seconds,
      // Optional: detect emotion from text (placeholder)
      emotion: detectEmotion(voiceNote.transcript)
    }));

    logger.info("Voice list retrieved", {
      userId: userId.substring(0, 8) + '...',
      count: formattedVoiceNotes.length
    });

    return NextResponse.json({
      success: true,
      data: formattedVoiceNotes,
      count: formattedVoiceNotes.length
    });

  } catch (error: any) {
    logger.error("Voice list error", {
      error: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve voice notes",
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Simple emotion detection based on keywords
 * In production, you might use sentiment analysis or AI
 */
function detectEmotion(text: string): string | undefined {
  const lowercaseText = text.toLowerCase();
  
  const emotionKeywords = {
    happy: ["happy", "joy", "excited", "wonderful", "great", "amazing", "love"],
    sad: ["sad", "depressed", "down", "upset", "cry", "tears", "lonely"],
    anxious: ["anxious", "worried", "nervous", "stress", "panic", "fear"],
    angry: ["angry", "mad", "frustrated", "annoyed", "irritated", "furious"],
    calm: ["calm", "peaceful", "relaxed", "serene", "tranquil", "centered"],
    grateful: ["grateful", "thankful", "blessed", "appreciate", "gratitude"],
    confused: ["confused", "lost", "uncertain", "unsure", "don't know"],
    hopeful: ["hope", "optimistic", "looking forward", "believe", "faith"]
  };

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(keyword => lowercaseText.includes(keyword))) {
      return emotion;
    }
  }

  return undefined;
}