// @ts-nocheck
export const dynamic = 'force-dynamic';
// backend: app/api/sovereign/app/maia/voice/route.ts
//
// HELD SEAM-BYPASS EXCEPTION (Phase 0, 2026-07-26 — founder ruling).
// Three-part debt rationale so removal is evidence-driven, not rediscovered:
//
//   WHY IT BYPASSES THE SEAM TODAY:
//     Calls synthesizeMaiaVoice (direct OpenAI, voice "nova"), not lib/tts/ttsRouter. It also
//     resolves no identity, applies no tier limits, and requires no auth (access contract unresolved).
//
//   WHAT OBSERVABLE BEHAVIOR WOULD CHANGE IF ROUTED / SECURED:
//     Routing through the seam would change the rendered voice nova→Kokoro under the R15 guard
//     (member-facing voice change — forbidden in Phase 0). Adding/removing auth here would be an
//     access-POLICY ruling, not hygiene, and could break an intended surface.
//
//   WHAT EVIDENCE WOULD JUSTIFY REMOVING THE BYPASS:
//     (1) Voice: a founder public-voice ruling from the A/B evaluation
//         (docs/ai/TTS_RENDERER_EVALUATION_SPEC_2026-07-26.md), OR a maia_* archetype so the seam
//         design-selects the same voice. (2) Access: a separate evidence-based ruling classifying
//         this route member-only vs. authorized-guest.
//
// Phase 0 preserves exact current behavior and ratifies NOTHING (bypass, provider, voice, access).
// See docs/architecture/INTERACTION_ENGINE_VOICE_ABSTRACTION_CANDIDATE_2026-07-26.md

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