// backend: lib/tts/openaiTts.ts

import OpenAI from 'openai';

const DEFAULT_TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'tts-1';

// Lazy initialization to avoid build-time errors when OPENAI_API_KEY is not set
let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
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
  model?: 'tts-1' | 'tts-1-hd';
}) {
  const { text, voice = 'alloy', format = 'mp3', speed = 1.0, model } = params;

  console.log('🔊 [openai-tts] request', {
    model: model || DEFAULT_TTS_MODEL,
    voice,
    inputLength: text?.length ?? 0,
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    keyLength: process.env.OPENAI_API_KEY?.length || 0,
  });

  const response = await getOpenAI().audio.speech.create({
    model: model || DEFAULT_TTS_MODEL,
    input: text,
    voice: voice as any,
    response_format: format,
    speed: speed,
  });

  return response;
}