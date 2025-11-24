import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string || "demo-user";
    const language = formData.get("language") as string || "en";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert File to format OpenAI expects
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a File-like object for OpenAI
    const audioFile = new File([buffer], file.name || "audio.webm", {
      type: file.type || "audio/webm"
    });


    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: language === "auto" ? undefined : language,
    });

    const transcribedText = transcription.text.trim();

    return NextResponse.json({
      success: true,
      transcription: transcribedText,
      memoryId: `simple-${Date.now()}`,
      language: language
    });

  } catch (error: any) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to transcribe audio",
        details: error.response?.data || error.toString()
      },
      { status: 500 }
    );
  }
}

// Simple GET endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    service: "Simple Transcription Service",
    status: "Ready",
    whisperModel: "whisper-1"
  });
}