// backend: lib/tts/openaiTts.ts

import OpenAI from 'openai';

const OPENAI_TTS_MODEL =
  process.env.OPENAI_TTS_MODEL || 'tts-1'; // or your chosen TTS model

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  const response = await openai.audio.speech.create({
    model: OPENAI_TTS_MODEL,
    input: text,
    voice: voice as any,
    response_format: format,
    speed: speed,
  });

  return response;
}