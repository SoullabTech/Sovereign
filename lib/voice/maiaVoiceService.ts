// backend: lib/voice/maiaVoiceService.ts
//
// HELD SEAM-BYPASS EXCEPTION (Phase 0, 2026-07-26 — founder ruling).
// Documented per a three-part debt rationale so removal is evidence-driven, not rediscovered:
//
//   WHY IT BYPASSES THE SEAM TODAY:
//     Direct OpenAI synthesis (tts-1, default voice "nova"), not routed through lib/tts/ttsRouter.
//     Callers: lib/sovereign/maiaService.ts, lib/learning/enhanced-maia-service.ts, and
//     app/api/sovereign/app/maia/voice.
//
//   WHAT OBSERVABLE BEHAVIOR WOULD CHANGE IF ROUTED:
//     Under the R15 production qualification guard, an un-archetyped request resolves to Kokoro,
//     so routing this through the seam would change the rendered voice nova→Kokoro for every
//     caller — a member-facing voice change, which Phase 0 forbids ("no member-facing voice change").
//
//   WHAT EVIDENCE WOULD JUSTIFY REMOVING THE BYPASS:
//     Either (a) a founder public-voice ruling from the TTS renderer A/B evaluation
//     (docs/ai/TTS_RENDERER_EVALUATION_SPEC_2026-07-26.md) that accepts the resulting voice, OR
//     (b) assigning these callers an explicit maia_* archetype so the seam design-selects the
//     same OpenAI voice (no member-facing change).
//
// Preservation here ratifies NOTHING — not the bypass, the provider, the voice, or the callers.
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