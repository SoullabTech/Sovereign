// backend: lib/voice/maiaVoiceService.ts

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
  options?: { format?: MaiaVoiceFormat }
): Promise<Buffer> {
  const trimmed = text?.trim();
  if (!trimmed) {
    throw new Error("Cannot synthesize empty text");
  }

  if (!openai) {
    throw new Error("OpenAI API key not configured - voice synthesis unavailable");
  }

  const format: MaiaVoiceFormat = options?.format ?? "mp3";

  const response = await openai.audio.speech.create({
    model: "tts-1", // TTS ONLY
    voice: "alloy",  // you can change later to another voice
    response_format: format,
    input: trimmed,
  });

  // @ts-ignore - SDK returns ArrayBuffer-like
  const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Clean, simple OpenAI TTS-only voice service
// MAIA's mind (Claude/DeepSeek) is completely separate from MAIA's voice (OpenAI TTS)