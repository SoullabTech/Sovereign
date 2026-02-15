/**
 * TTS Router — sovereign provider selection with fallback chain.
 *
 * Routes TTS requests to the configured provider, falling back gracefully
 * if local services are unavailable.
 *
 * Provider chain (when MAIA_LOCAL_VOICE_ENABLED=1):
 *   1. Kokoro (local) → fastest, sovereign
 *   2. OpenAI TTS (cloud) → fallback if local is down
 *   3. Browser Web Speech API → ultimate fallback (client-side only)
 *
 * When MAIA_LOCAL_VOICE_ENABLED=0 (default):
 *   Existing behavior unchanged. OpenAI TTS as primary.
 *
 * SOVEREIGNTY: When local voice is enabled and healthy, no audio data
 * leaves the machine. Fallback to cloud is logged and visible.
 *
 * Env flags:
 *   MAIA_LOCAL_VOICE_ENABLED — "0" (default) or "1"
 *   MAIA_TTS_PROVIDER — "auto" (default), "kokoro", "openai", "sesame"
 *   KOKORO_TTS_URL — Kokoro endpoint (default: http://localhost:8880)
 */

import * as kokoro from './providers/kokoro';

export type TTSProvider = 'kokoro' | 'openai' | 'sesame' | 'auto';

interface TTSRequest {
  text: string;
  voice?: string;
  format?: 'mp3' | 'wav' | 'opus';
  speed?: number;
}

interface TTSResult {
  audioBuffer: Buffer;
  contentType: string;
  provider: string;
  fallback: boolean;
}

/**
 * Is local voice mode enabled?
 */
export function isLocalVoiceEnabled(): boolean {
  return process.env.MAIA_LOCAL_VOICE_ENABLED === '1';
}

/**
 * Get the configured TTS provider.
 */
export function getConfiguredProvider(): TTSProvider {
  const provider = (process.env.MAIA_TTS_PROVIDER || 'auto').toLowerCase();
  if (['kokoro', 'openai', 'sesame', 'auto'].includes(provider)) {
    return provider as TTSProvider;
  }
  return 'auto';
}

/**
 * Route a TTS request to the appropriate provider with fallback.
 *
 * When provider is "auto":
 *   - If local voice enabled → try Kokoro first, fall back to OpenAI
 *   - If local voice disabled → OpenAI only (existing behavior)
 *
 * When provider is explicit (e.g. "kokoro"):
 *   - Try that provider, fall back to OpenAI on failure
 */
export async function synthesize(params: TTSRequest): Promise<TTSResult> {
  const provider = getConfiguredProvider();
  const localEnabled = isLocalVoiceEnabled();

  // Determine primary provider
  const primary: TTSProvider =
    provider !== 'auto' ? provider
    : localEnabled ? 'kokoro'
    : 'openai';

  // Try primary
  if (primary === 'kokoro') {
    try {
      const result = await kokoro.synthesize({
        text: params.text,
        voice: params.voice,
        format: params.format,
        speed: params.speed,
      });
      return { ...result, fallback: false };
    } catch (err: any) {
      console.warn(`[tts-router] Kokoro failed, falling back to OpenAI: ${err.message}`);
      // Fall through to OpenAI
    }
  }

  if (primary === 'sesame') {
    // Sesame integration is Phase 2 — for now, fall through to OpenAI
    console.warn('[tts-router] Sesame provider selected but not yet integrated. Falling back to OpenAI.');
  }

  // OpenAI fallback (or primary if configured)
  // Return null to signal the caller should use the existing OpenAI route.
  // This avoids duplicating the OpenAI TTS logic (which has its own rate limiting,
  // member tier checks, etc.)
  throw new TTSFallbackToOpenAI(primary !== 'openai');
}

/**
 * Sentinel error: signals the API route to use the existing OpenAI TTS path.
 * This is not a failure — it's a routing decision.
 */
export class TTSFallbackToOpenAI extends Error {
  public readonly isFallback: boolean;

  constructor(isFallback: boolean) {
    super('Falling back to OpenAI TTS');
    this.name = 'TTSFallbackToOpenAI';
    this.isFallback = isFallback;
  }
}

/**
 * Health status for all configured TTS providers.
 */
export async function healthCheckAll(): Promise<{
  localVoiceEnabled: boolean;
  provider: TTSProvider;
  kokoro: { healthy: boolean; url: string; error?: string; latencyMs?: number } | null;
  openai: { configured: boolean };
  sesame: { configured: boolean; url: string } | null;
}> {
  const localEnabled = isLocalVoiceEnabled();
  const provider = getConfiguredProvider();

  const kokoroHealth = localEnabled || provider === 'kokoro'
    ? await kokoro.healthCheck()
    : null;

  const sesameUrl = process.env.SESAME_TTS_URL || process.env.NEXT_PUBLIC_SESAME_URL;

  return {
    localVoiceEnabled: localEnabled,
    provider,
    kokoro: kokoroHealth,
    openai: {
      configured: Boolean(process.env.OPENAI_API_KEY),
    },
    sesame: sesameUrl ? { configured: true, url: sesameUrl } : null,
  };
}
