// backend: lib/voice/maiaVoiceService.ts
//
// HELD SEAM-BYPASS EXCEPTION (Phase 0, 2026-07-26 — founder ruling):
// This is a direct OpenAI (tts-1, default voice "nova") synthesis path that bypasses the
// governed lib/tts/ttsRouter seam. It is DELIBERATELY NOT routed through the seam in Phase 0:
// under the R15 production qualification guard, an un-archetyped request would resolve to
// Kokoro, changing the rendered voice nova→Kokoro — NOT behavior-preserving, and beyond Phase 0
// authorization ("no member-facing voice change"). Callers: lib/sovereign/maiaService.ts,
// lib/learning/enhanced-maia-service.ts, app/api/sovereign/app/maia/voice. Preservation here
// does NOT ratify the bypass, the provider, the voice, or those callers. Retirement / archetype
// assignment / accepting a new voice requires a separate evidence-based ruling.
// See docs/architecture/INTERACTION_ENGINE_VOICE_ABSTRACTION_CANDIDATE_2026-07-26.md

import OpenAI from "openai";

// Make OpenAI API key optional for testing
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export type MaiaVoiceFormat = "mp3" | "opus";

export async function synthesizeMaiaVoice(
  text: string,
  options?: { format?: MaiaVoiceFormat; voice?: string }
): Promise<Buffer> {
  const trimmed = text?.trim();
  if (!trimmed) {
    throw new Error("Cannot synthesize empty text");
  }

  if (!openai) {
    throw new Error("OpenAI API key not configured - voice synthesis unavailable");
  }

  const format: MaiaVoiceFormat = options?.format ?? "mp3";
  const voice = (options?.voice ?? "nova") as any;

  const response = await openai.audio.speech.create({
    model: "tts-1", // TTS ONLY
    voice,
    response_format: format,
    input: trimmed,
  });

  // @ts-ignore - SDK returns ArrayBuffer-like
  const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Clean, simple OpenAI TTS-only voice service
// MAIA's mind (Claude/DeepSeek) is completely separate from MAIA's voice (OpenAI TTS)