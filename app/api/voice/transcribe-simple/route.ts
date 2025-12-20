import { NextRequest, NextResponse } from "next/server";

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
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No audio file provided" },
        { status: 400 }
      );
    }

    console.log("📁 Audio file details:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Forward audio file to local Whisper.cpp server
    const whisperFormData = new FormData();
    whisperFormData.append('file', file);

    // Send to local Whisper server
    const whisperResponse = await fetch(`${WHISPER_LOCAL_URL}/inference`, {
      method: 'POST',
      body: whisperFormData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('Local Whisper transcription error:', errorText);
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
    const transcription = result.text || result.transcription || '';

    console.log("✅ Local Whisper transcription:", transcription.substring(0, 100));

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
