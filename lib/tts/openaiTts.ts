// backend: lib/tts/openaiTts.ts

import OpenAI from 'openai';

import { sanitizeSpeechInputPlain } from './sanitizeForSpeech';

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
 *
 * VOICE-TTS-LEAK-02: speech sanitization is enforced HERE at the provider
 * boundary, not trusted to callers.
 *
 * Kokoro has had a boundary invariant since VOICE-TTS-LEAK-01; OpenAI had only
 * a convention that happened to hold at the two call sites that existed. That
 * asymmetry was tolerable while cloud was a rare fallback. Under the
 * Alloy-primary amendment it would make the PRIMARY provider the unprotected
 * one — the inverse of what the SSML failure taught — so it is closed first.
 *
 * OpenAI TTS does not interpret SSML either: it would read the markup aloud
 * exactly as Kokoro did. Both providers therefore take the same plain-text
 * contract, and no caller can reintroduce markup by choosing a different input
 * representation.
 */
export async function synthesizeSpeech(params: {
  text: string;
  voice?: string;
  format?: 'mp3' | 'wav' | 'opus';
  speed?: number;
  model?: 'tts-1' | 'tts-1-hd';
}) {
  const { text, voice = 'alloy', format = 'mp3', speed = 1.0, model } = params;

  const safeInput = sanitizeSpeechInputPlain(text);

  // A response containing only removed presentation artifacts must not become
  // an empty synthesis request — and must not leave the machine as one either.
  if (!safeInput) {
    throw new Error('OpenAI TTS input empty after speech sanitization');
  }

  if (safeInput !== text) {
    console.info('[tts.sanitize]', JSON.stringify({
      provider: 'openai',
      ssml: /<speak\b/i.test(text),
      originalChars: text.length,
      sanitizedChars: safeInput.length,
    }));
  }

  console.log('🔊 [openai-tts] request', {
    model: model || DEFAULT_TTS_MODEL,
    voice,
    inputLength: safeInput.length,
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    keyLength: process.env.OPENAI_API_KEY?.length || 0,
  });

  // Bound the cloud TTS call. The OpenAI SDK defaults to a ~600s timeout with
  // retries, so a single hung/slow segment could freeze an entire voice turn
  // (observed all_tts_done ~306s on iOS → MAIA stuck on "thinking"). On timeout
  // the SDK throws and the caller (stream-conversation) falls back to local
  // Kokoro TTS instead of waiting. Tunable via OPENAI_TTS_TIMEOUT_MS.
  const response = await getOpenAI().audio.speech.create(
    {
      model: model || DEFAULT_TTS_MODEL,
      input: safeInput,
      voice: voice as any,
      response_format: format,
      speed: speed,
    },
    {
      timeout: Number(process.env.OPENAI_TTS_TIMEOUT_MS) || 12000,
      maxRetries: 0,
    },
  );

  return response;
}