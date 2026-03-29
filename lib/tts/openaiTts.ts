// backend: lib/tts/openaiTts.ts

import OpenAI from 'openai';

const DEFAULT_TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';

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
  model?: string;
  /** gpt-4o-mini-tts instruction field — controls tone, pacing, emotion */
  instructions?: string;
}) {
  const { text, voice = 'alloy', format = 'mp3', speed = 1.0, model, instructions } = params;
  const effectiveModel = instructions ? 'gpt-4o-mini-tts' : (model || DEFAULT_TTS_MODEL);

  console.log('🔊 [openai-tts] request', {
    model: effectiveModel,
    voice,
    inputLength: text?.length ?? 0,
    hasInstructions: Boolean(instructions),
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
  });

  const response = await getOpenAI().audio.speech.create({
    model: effectiveModel,
    input: text,
    voice: voice as any,
    response_format: format,
    speed,
    ...(instructions ? { instructions } : {}),
  } as any);

  return response;
}