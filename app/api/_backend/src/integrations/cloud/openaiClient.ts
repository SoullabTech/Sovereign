// @ts-nocheck
// Cloud Integration Chokepoint: OpenAI Client
// This file is the ONLY place OpenAI SDK should be imported
// All other files must import from this wrapper

import { OpenAI } from "openai";

/**
 * Get OpenAI client instance for TTS ONLY
 *
 * IMPORTANT: OpenAI is ONLY used for Text-to-Speech (TTS).
 * - ❌ NOT for transcription (use local Whisper)
 * - ❌ NOT for LLM inference (use local Ollama/DeepSeek)
 * - ✅ ONLY for voice synthesis (TTS)
 */
export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured. Required for TTS only.');
  }

  return new OpenAI({ apiKey });
}

/**
 * Generate TTS audio using OpenAI
 * This is the approved use case for OpenAI in MAIA
 */
export async function generateTTS(
  text: string,
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy'
): Promise<Buffer> {
  const client = getOpenAIClient();

  const response = await client.audio.speech.create({
    model: 'tts-1',
    voice,
    input: text,
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer;
}
