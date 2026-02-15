/**
 * TTS Router — sovereign provider selection with fallback chain.
 *
 * Routes TTS requests to the configured provider, falling back gracefully
 * if local services are unavailable — but only with consent.
 *
 * Provider chain (when MAIA_LOCAL_VOICE_ENABLED=1):
 *   1. Kokoro (local) → fastest, sovereign
 *   2. OpenAI TTS (cloud) → fallback if local is down AND consent allows
 *   3. Browser Web Speech API → ultimate fallback (client-side only)
 *
 * When MAIA_LOCAL_VOICE_ENABLED=0 (default):
 *   Existing behavior unchanged. OpenAI TTS as primary.
 *
 * SOVEREIGNTY: When local voice is enabled and healthy, no audio data
 * leaves the machine. Fallback to cloud is logged and audited.
 *
 * Env flags:
 *   MAIA_LOCAL_VOICE_ENABLED — "0" (default) or "1"
 *   MAIA_TTS_PROVIDER — "auto" (default), "kokoro", "openai", "sesame"
 *   KOKORO_TTS_URL — Kokoro endpoint (default: http://localhost:8880)
 */

import * as kokoro from './providers/kokoro';
import type { VoiceIntent } from '@/lib/types/voiceIntent';
import { resolveKokoroVoice, resolveSpeed, resolveVoiceWithArchetype } from '@/lib/voice/voiceMap';
import { resolveArchetypeVoice } from '@/lib/voice/voiceArchetypes';

export type TTSProvider = 'kokoro' | 'openai' | 'sesame' | 'auto';

interface TTSRequest {
  text: string;
  voice?: string;
  format?: 'mp3' | 'wav' | 'opus';
  speed?: number;
  voiceHint?: VoiceIntent;
  /** Member's chosen voice archetype — overrides element-based voice selection */
  voiceArchetype?: string | null;
}

interface TTSResult {
  audioBuffer: Buffer;
  contentType: string;
  provider: string;
  fallback: boolean;
  /** Why the provider was chosen (for audit trail) */
  reason?: string;
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

  // Check if archetype routes to OpenAI (MAIA feminine voices) — skip Kokoro entirely
  if (params.voiceArchetype) {
    const archetypeResolution = resolveArchetypeVoice(params.voiceArchetype);
    if (archetypeResolution.provider === 'openai') {
      const reason = `archetype_openai:${params.voiceArchetype}:${archetypeResolution.voice}`;
      console.info('[voice]', {
        archetype: params.voiceArchetype,
        voice: `openai:${archetypeResolution.voice}`,
        provider: 'openai',
        reason,
      });
      throw new TTSFallbackToOpenAI(false, reason, archetypeResolution.voice);
    }
  }

  // Try primary
  if (primary === 'kokoro') {
    try {
<<<<<<< HEAD
      // Archetype overrides element-based selection (member chose a fixed voice)
      // Otherwise, Bridge B: element from Conductor determines the voice
      const kokoroVoice = params.voiceArchetype
        ? resolveVoiceWithArchetype(params.voiceHint?.element ?? 'earth', params.voiceArchetype)
        : params.voiceHint
          ? resolveKokoroVoice(params.voiceHint.element)
          : params.voice;
=======
      // Voice selection priority: explicit member choice > conductor element > default
      // If params.voice is set (member chose a specific voice in settings), honor it.
      // Otherwise fall back to conductor's element-based selection.
      const kokoroVoice = params.voice
        ? params.voice
        : params.voiceHint
          ? resolveKokoroVoice(params.voiceHint.element)
          : undefined;
>>>>>>> origin/claude/happy-morse
      const kokoroSpeed = params.voiceHint
        ? resolveSpeed(params.voiceHint.element, params.voiceHint.speed)
        : params.speed;

      // Voice identity logging — watch the body learn
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
      return { ...result, fallback: false, reason: 'kokoro_healthy' };
    } catch (err: any) {
      const reason = err.message?.includes('timeout') ? 'kokoro_timeout'
        : err.message?.includes('ECONNREFUSED') ? 'kokoro_unreachable'
        : 'kokoro_error';
      console.warn(`[tts-router] Kokoro failed (${reason}), falling back to OpenAI: ${err.message}`);
      // Fall through to OpenAI with reason
      throw new TTSFallbackToOpenAI(true, reason);
    }
  }

  if (primary === 'sesame') {
    // Sesame integration is Phase 2 — for now, fall through to OpenAI
    console.warn('[tts-router] Sesame provider selected but not yet integrated. Falling back to OpenAI.');
    throw new TTSFallbackToOpenAI(true, 'sesame_not_integrated');
  }

  // OpenAI as primary (not a fallback)
  // Log voice intent even on cloud path — see what the body would have chosen
  if (params.voiceHint) {
    console.info('[voice]', {
      element: params.voiceHint.element,
      phase: params.voiceHint.phase,
      voice: `openai:${params.voice || 'default'}`,
      speed: params.speed,
      provider: 'openai',
    });
  }
  throw new TTSFallbackToOpenAI(false, 'openai_primary');
}

/**
 * Sentinel error: signals the API route to use the existing OpenAI TTS path.
 * This is not a failure — it's a routing decision.
 */
export class TTSFallbackToOpenAI extends Error {
  public readonly isFallback: boolean;
  /** Why the fallback happened (for audit logging) */
  public readonly reason: string;
  /** Specific OpenAI voice to use (when archetype routes to OpenAI by design) */
  public readonly voice?: string;

  constructor(isFallback: boolean, reason: string = 'unknown', voice?: string) {
    super('Falling back to OpenAI TTS');
    this.name = 'TTSFallbackToOpenAI';
    this.isFallback = isFallback;
    this.reason = reason;
    this.voice = voice;
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
