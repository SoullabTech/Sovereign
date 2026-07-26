// @ts-nocheck
export const dynamic = 'force-dynamic';
// backend: app/api/sovereign/app/maia/voice/route.ts
//
// HELD SEAM-BYPASS EXCEPTION (Phase 0, 2026-07-26 — founder ruling):
// Deliberately NOT routed through lib/tts/ttsRouter in Phase 0 — doing so would change the
// rendered voice (OpenAI nova → Kokoro) under the R15 production guard, violating the
// "no member-facing voice change" condition. ACCESS CONTRACT ALSO UNRESOLVED: this route
// resolves no identity, applies no tier limits, and requires no auth. Phase 0 preserves its
// exact current behavior and does NOT ratify the bypass, the provider, the voice, or its
// access semantics. Retirement / seam migration / access ruling is a separate evidence-based
// review. See docs/architecture/INTERACTION_ENGINE_VOICE_ABSTRACTION_CANDIDATE_2026-07-26.md

import { NextRequest, NextResponse } from "next/server";

export const revalidate = false;
import { synthesizeMaiaVoice } from "@/lib/voice/maiaVoiceService";

// Skip during static export (Capacitor builds)

export const runtime = "nodejs";

type VoiceRequestBody = {
  text: string;
  format?: "mp3" | "opus";
  voice?: string;
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
    const voice = body.voice;
    const audioBuffer = await synthesizeMaiaVoice(body.text, { format, voice });

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