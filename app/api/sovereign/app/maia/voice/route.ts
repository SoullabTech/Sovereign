// @ts-nocheck
// backend: app/api/sovereign/app/maia/voice/route.ts

import { NextRequest, NextResponse } from "next/server";
import { synthesizeMaiaVoice } from "@/lib/voice/maiaVoiceService";

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export const runtime = "nodejs";

type VoiceRequestBody = {
  text: string;
  format?: "mp3" | "opus";
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VoiceRequestBody;

    if (!body?.text || typeof body.text !== "string") {
      return NextResponse.json(
        { error: "Missing 'text' in body" },
        { status: 400 }
      );
    }

    const format = body.format ?? "mp3";
    const audioBuffer = await synthesizeMaiaVoice(body.text, { format });

    const contentType =
      format === "opus" ? "audio/ogg; codecs=opus" : "audio/mpeg";

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(audioBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("❌ MAIA TTS error:", error);
    return NextResponse.json(
      { error: "Failed to generate voice" },
      { status: 500 }
    );
  }
}