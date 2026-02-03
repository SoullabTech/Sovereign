export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";

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

const WHISPER_LOCAL_URL = process.env.WHISPER_LOCAL_URL || 'http://127.0.0.1:8000';

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
    whisperFormData.append('model', 'base.en');

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

    console.log("✅ Local Faster-Whisper transcription:", transcription.length, "chars"); // Never log content

    return NextResponse.json({
      success: true,
      transcription: transcription.trim(),
      confidence: 0.95, // Faster-Whisper doesn't return confidence scores
      source: 'faster-whisper-local' // Indicate local processing
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
