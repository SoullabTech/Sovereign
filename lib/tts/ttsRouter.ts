/**
 * TTS Router — sovereign provider selection.
 *
 * Zero OpenAI policy: OpenAI is not a provider, not a fallback, not an option.
 * See lib/ai/openaiPolicy.ts for the doctrine.
 *
 * Provider chain:
 *   1. Kokoro (local) — primary, always attempted
 *   2. Sesame — when integrated (Phase 2)
 *   3. Browser Web Speech API — client-side only, not routed here
 *
 * If the configured provider is unavailable, the route returns 503.
 * There is no silent cloud fallback.
 *
 * Env flags:
 *   MAIA_TTS_PROVIDER — "auto" (default), "kokoro", "sesame"
 *   KOKORO_TTS_URL    — Kokoro endpoint (default: http://localhost:8880)
 */

import * as kokoro from './providers/kokoro';
import type { VoiceIntent } from '@/lib/types/voiceIntent';
import { resolveKokoroVoice, resolveSpeed } from '@/lib/voice/voiceMap';

export type TTSProvider = 'kokoro' | 'sesame' | 'auto';

interface TTSRequest {
  text: string;
  voice?: string;
  format?: 'mp3' | 'wav' | 'opus';
  speed?: number;
  voiceHint?: VoiceIntent;
}

interface TTSResult {
  audioBuffer: Buffer;
  contentType: string;
  provider: string;
  fallback: boolean;
  reason?: string;
}

/**
 * Get the configured TTS provider.
 * Any env setting of 'openai' logs a warning and maps to 'auto'.
 */
export function getConfiguredProvider(): TTSProvider {
  const raw = (process.env.MAIA_TTS_PROVIDER || 'auto').toLowerCase();
  if (raw === 'openai') {
    console.warn(
      '[tts-router] MAIA_TTS_PROVIDER=openai is no longer valid (zero-access doctrine). ' +
        'Falling back to "auto". Set MAIA_TTS_PROVIDER=kokoro or remove the variable.'
    );
    return 'auto';
  }
  if (['kokoro', 'sesame', 'auto'].includes(raw)) {
    return raw as TTSProvider;
  }
  return 'auto';
}

/**
 * isLocalVoiceEnabled: under zero-OpenAI policy, local voice is always the intent.
 * Returns true unless explicitly disabled with MAIA_LOCAL_VOICE_ENABLED=0.
 */
export function isLocalVoiceEnabled(): boolean {
  return process.env.MAIA_LOCAL_VOICE_ENABLED !== '0';
}

/**
 * Route a TTS request to the appropriate provider.
 *
 * "auto" and "kokoro" → Kokoro.
 * "sesame" → not yet integrated, throws.
 *
 * No OpenAI fallback. If the provider is unavailable, throws so the
 * route can return 503 cleanly.
 */
export async function synthesize(params: TTSRequest): Promise<TTSResult> {
  const provider = getConfiguredProvider();

  if (provider === 'sesame') {
    throw new Error(
      '[tts-router] Sesame provider is not yet integrated. ' +
        'Set MAIA_TTS_PROVIDER=kokoro or configure Sesame first.'
    );
  }

  // Kokoro — primary ("auto" resolves here too)
  const kokoroVoice = params.voiceHint
    ? resolveKokoroVoice(params.voiceHint.element)
    : params.voice;
  const kokoroSpeed = params.voiceHint
    ? resolveSpeed(params.voiceHint.element, params.voiceHint.speed)
    : params.speed;

  console.info('[voice]', {
    element: params.voiceHint?.element,
    phase: params.voiceHint?.phase,
    voice: kokoroVoice,
    speed: kokoroSpeed,
    provider: 'kokoro',
  });

  const result = await kokoro.synthesize({
    text: params.text,
    voice: kokoroVoice,
    format: params.format,
    speed: kokoroSpeed,
  });

  return { ...result, fallback: false, reason: 'kokoro_primary' };
}

/**
 * Health status for all configured TTS providers.
 */
export async function healthCheckAll(): Promise<{
  provider: TTSProvider;
  kokoro: { healthy: boolean; url: string; error?: string; latencyMs?: number } | null;
  sesame: { configured: boolean; url: string } | null;
}> {
  const provider = getConfiguredProvider();
  const kokoroHealth = await kokoro.healthCheck();
  const sesameUrl = process.env.SESAME_TTS_URL || process.env.NEXT_PUBLIC_SESAME_URL;

  return {
    provider,
    kokoro: kokoroHealth,
    sesame: sesameUrl ? { configured: true, url: sesameUrl } : null,
  };
}
