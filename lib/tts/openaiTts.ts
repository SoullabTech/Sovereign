// backend: lib/tts/openaiTts.ts

import OpenAI from 'openai';

const OPENAI_TTS_MODEL =
  process.env.OPENAI_TTS_MODEL || 'tts-1'; // or your chosen TTS model

// Lazy-initialized OpenAI client (avoids build-time errors when env var is missing)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required for TTS');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * The ONLY allowed OpenAI usage in this project: text-to-speech.
 * No chat, no completions, no embeddings, no reasoning.
 */
export async function synthesizeSpeech(params: {
  text: string;
  voice?: string;
  format?: 'mp3' | 'wav' | 'opus';
  speed?: number;
}) {
  const { text, voice = 'alloy', format = 'mp3', speed = 1.0 } = params;

  const response = await getOpenAIClient().audio.speech.create({
    model: OPENAI_TTS_MODEL,
    input: text,
    voice: voice as any,
    response_format: format,
    speed: speed,
  });

  return response;
}
