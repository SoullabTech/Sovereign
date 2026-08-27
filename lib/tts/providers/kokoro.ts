/**
 * Kokoro TTS Provider — local, sovereign text-to-speech.
 *
 * Kokoro-FastAPI exposes an OpenAI-compatible /v1/audio/speech endpoint,
 * so this adapter speaks the same protocol as OpenAI TTS but hits localhost.
 *
 * SOVEREIGNTY: No network calls leave the machine. Audio stays local.
 *
 * Default endpoint: http://localhost:8880 (Kokoro-FastAPI Docker)
 * Env override: KOKORO_TTS_URL
 */

import { sanitizeSpeechInput } from '../sanitizeForSpeech';

const KOKORO_DEFAULT_URL = 'http://localhost:8880';

function getKokoroUrl(): string {
  // In Docker: use container name. Outside Docker: use localhost.
  return process.env.KOKORO_TTS_URL || KOKORO_DEFAULT_URL;
}

/**
 * Kokoro voice IDs — validate these against your actual Kokoro build.
 * Don't ship product promises based on this list; it varies by version/fork.
 */
export const KOKORO_VOICES = [
  'af_kore',    // Female, primary MAIA voice
  'af_heart',   // Female, warm
  'af_kore',    // Female, balanced (Maia Kore — primary voice)
  'af_bella',   // Female, clear
  'af_sarah',   // Female, neutral (Maia Warm)
  'af_nicole',  // Female, direct (Maia Clear)
  'am_adam',    // Male, warm
  'am_michael', // Male, clear (Atlas)
  'am_puck',    // Male, playful (Puck)
  'bm_lewis',   // Male, deep (Atlas Deep)
] as const;

export type KokoroVoice = typeof KOKORO_VOICES[number] | string;

/**
 * Map OpenAI voice names to Kokoro equivalents.
 * This lets existing code that requests "alloy" or "nova" work without changes.
 */
const OPENAI_TO_KOKORO: Record<string, string> = {
  alloy: 'af_kore',
  nova: 'af_bella',
  shimmer: 'af_sarah',
  echo: 'am_adam',
  onyx: 'am_michael',
  fable: 'af_kore',
};

function resolveVoice(voice: string): string {
  return OPENAI_TO_KOKORO[voice] || voice;
}

export interface KokoroSynthesisParams {
  text: string;
  voice?: string;
  format?: 'mp3' | 'wav' | 'opus';
  speed?: number;
}

/**
 * Synthesize speech via Kokoro's OpenAI-compatible endpoint.
 * Returns raw audio buffer, same shape as OpenAI TTS response.
 *
 * VOICE-TTS-LEAK-01: sanitization is enforced HERE at the provider boundary.
 * Routes may shape text or SSML, but neither representation may bypass the
 * speech sanitizer before Kokoro receives it.
 */
export async function synthesize(params: KokoroSynthesisParams): Promise<{
  audioBuffer: Buffer;
  contentType: string;
  provider: 'kokoro';
}> {
  const {
    text,
    voice = 'af_kore',
    format = 'mp3',
    speed = 1.0,
  } = params;

  const url = `${getKokoroUrl()}/v1/audio/speech`;
  const resolvedVoice = resolveVoice(voice);
  const safeInput = sanitizeSpeechInput(text);

  // A response containing only removed presentation artifacts should not become
  // an empty/silent synthesis request.
  const speakable = safeInput
    .replace(/<[^>]+>/g, '')
    .replace(/&(?:nbsp|amp|lt|gt|quot|apos);/gi, '')
    .trim();
  if (!speakable) {
    throw new Error('Kokoro TTS input empty after speech sanitization');
  }

  if (safeInput !== text) {
    console.info('[tts.sanitize]', JSON.stringify({
      provider: 'kokoro',
      ssml: /<speak\b/i.test(text),
      originalChars: text.length,
      sanitizedChars: safeInput.length,
    }));
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: safeInput,
      voice: resolvedVoice,
      model: 'kokoro',
      response_format: format,
      speed,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => 'Unknown error');
    throw new Error(`Kokoro TTS error ${response.status}: ${detail}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());

  const contentType =
    format === 'mp3' ? 'audio/mpeg'
    : format === 'wav' ? 'audio/wav'
    : format === 'opus' ? 'audio/opus'
    : 'application/octet-stream';

  return { audioBuffer, contentType, provider: 'kokoro' };
}

/**
 * Check if Kokoro TTS is reachable and healthy.
 */
export async function healthCheck(): Promise<{
  healthy: boolean;
  url: string;
  error?: string;
  latencyMs?: number;
}> {
  const url = getKokoroUrl();
  const t0 = Date.now();

  try {
    // Kokoro-FastAPI has a /v1/audio/speech endpoint; a lightweight check
    // is to hit the root or /docs. We'll try a minimal synthesis.
    const response = await fetch(`${url}/v1/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: 'ok',
        voice: 'af_kore',
        model: 'kokoro',
      }),
      signal: AbortSignal.timeout(10_000),
    });

    return {
      healthy: response.ok,
      url,
      latencyMs: Date.now() - t0,
      ...(!response.ok && { error: `HTTP ${response.status}` }),
    };
  } catch (err: any) {
    return {
      healthy: false,
      url,
      latencyMs: Date.now() - t0,
      error: err?.message || 'Connection failed',
    };
  }
}
