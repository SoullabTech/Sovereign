// backend: lib/tts/openaiTts.ts

import OpenAI from 'openai';
import { modelSupportsInstructions, modelSupportsSpeed } from './openaiSpeechAdapter';

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
  model?: string;
  /**
   * Provider-dialect delivery direction, built by
   * `lib/tts/openaiSpeechAdapter.ts` from MAIA's own prosody hints.
   *
   * ⛔ Never pass member content or MAIA's generated text here. The adapter
   * that produces this string cannot see the spoken text; that is deliberate.
   */
  instructions?: string;
}) {
  const { text, voice = 'alloy', format = 'mp3', speed = 1.0, model, instructions } = params;
  const resolvedModel = model || DEFAULT_TTS_MODEL;

  // ── MUTUAL EXCLUSION (openai@4.104.0 SpeechCreateParams) ──────────────────
  //
  //   instructions — "Does not work with `tts-1` or `tts-1-hd`."
  //   speed        — "Does not work with `gpt-4o-mini-tts`."
  //
  // There is no model that honours both. Sending the unsupported one is not
  // harmless: it produces a request that *looks* like it carried MAIA's intent
  // while the provider silently discards it. Drop it here, at the wire, so the
  // request body is exactly what the model will actually act on.
  const sendInstructions = instructions && modelSupportsInstructions(resolvedModel)
    ? instructions
    : undefined;
  const sendSpeed = modelSupportsSpeed(resolvedModel) ? speed : undefined;

  console.log('🔊 [openai-tts] request', {
    model: resolvedModel,
    voice,
    inputLength: text?.length ?? 0,
    // Length only — the instruction text is closed-vocabulary, but logs are
    // not the place to reprint delivery direction on every sentence.
    control: sendInstructions ? 'instructions' : sendSpeed !== undefined ? 'speed' : 'none',
    instructionsLength: sendInstructions?.length ?? 0,
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    keyLength: process.env.OPENAI_API_KEY?.length || 0,
  });

  if (instructions && !sendInstructions) {
    console.warn(
      `[openai-tts] instructions dropped: model "${resolvedModel}" does not support them ` +
      `(set OPENAI_TTS_MODEL=gpt-4o-mini-tts to let MAIA's prosody govern delivery)`,
    );
  }

  // Bound the cloud TTS call. The OpenAI SDK defaults to a ~600s timeout with
  // retries, so a single hung/slow segment could freeze an entire voice turn
  // (observed all_tts_done ~306s on iOS → MAIA stuck on "thinking"). On timeout
  // the SDK throws and the caller (stream-conversation) falls back to local
  // Kokoro TTS instead of waiting. Tunable via OPENAI_TTS_TIMEOUT_MS.
  const response = await getOpenAI().audio.speech.create(
    {
      model: resolvedModel,
      input: text,
      voice: voice as any,
      response_format: format,
      ...(sendSpeed !== undefined ? { speed: sendSpeed } : {}),
      ...(sendInstructions ? { instructions: sendInstructions } : {}),
    },
    {
      timeout: Number(process.env.OPENAI_TTS_TIMEOUT_MS) || 12000,
      maxRetries: 0,
    },
  );

  return response;
}
