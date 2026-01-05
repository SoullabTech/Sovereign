export const dynamic = 'force-static';
import { NextRequest, NextResponse } from "next/server";

export const revalidate = false;

// This endpoint is called from the Capacitor app which points to the production server
// The static export placeholder won't affect runtime behavior

/**
 * SOVEREIGNTY: This endpoint uses LOCAL Whisper.cpp server (NOT OpenAI).
 * OpenAI is ONLY used for TTS (Text-to-Speech), NOT for transcription.
 *
 * Local Whisper.cpp server runs on http://127.0.0.1:8080
 * - 100% sovereign (no external API calls)
 * - GPU-accelerated (Metal on Apple Silicon)
 * - Base English model for fast, accurate transcription
 */

const WHISPER_LOCAL_URL = process.env.WHISPER_LOCAL_URL || 'http://127.0.0.1:8080';

export async function POST(req: NextRequest) {
  console.log("🎤 [TRANSCRIBE-SIMPLE] Request received. Headers:", {
    contentType: req.headers.get('content-type'),
    userAgent: req.headers.get('user-agent')?.substring(0, 50)
  });

  try {
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

    console.log("🎤 [TRANSCRIBE-SIMPLE] Audio file details:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Forward audio file to local Whisper.cpp server
    const whisperFormData = new FormData();
    whisperFormData.append('file', file);

    console.log("🎤 [TRANSCRIBE-SIMPLE] Forwarding to Whisper:", WHISPER_LOCAL_URL);

    // Send to local Whisper server
    const whisperResponse = await fetch(`${WHISPER_LOCAL_URL}/inference`, {
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
          error: "Local Whisper transcription failed",
          details: errorText
        },
        { status: 500 }
      );
    }

    const result = await whisperResponse.json();

    // Extract transcription from Whisper.cpp response format
    let transcription = result.text || result.transcription || '';

    // Post-process to fix common mis-transcriptions
    // "Maya" -> "MAIA" (Whisper often mishears our name)
    transcription = transcription.replace(/\bMaya\b/gi, 'MAIA');

    console.log("✅ Local Whisper transcription:", transcription.length, "chars"); // Never log content

    return NextResponse.json({
      success: true,
      transcription: transcription.trim(),
      confidence: 0.95, // Whisper.cpp doesn't return confidence scores
      source: 'whisper-local' // Indicate local processing
    });

  } catch (error: any) {
    console.error("Transcription endpoint error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Transcription failed",
        details: error.message
      },
      { status: 500 }
    );
  }
}
