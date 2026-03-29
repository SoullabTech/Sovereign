/**
 * TTS Router — sovereign provider selection with fallback chain.
 *
 * SOVEREIGNTY FLIP (2026-03-28): Kokoro is now the DEFAULT primary provider.
 * OpenAI TTS is fallback only (consent-gated).
 *
 * Provider chain (default):
 *   1. Kokoro (local) → primary, sovereign
 *   2. OpenAI TTS (cloud) → fallback if Kokoro is down AND consent allows
 *   3. Browser Web Speech API → ultimate fallback (client-side only)
 *
 * SOVEREIGNTY: When Kokoro is healthy, no audio data leaves the machine.
 * Fallback to cloud is logged and audited via voiceSovereignty.ts.
 *
 * Env flags:
 *   MAIA_TTS_PROVIDER — "auto" (default=kokoro), "kokoro", "openai", "sesame"
 *   KOKORO_TTS_URL — Kokoro endpoint (default: http://localhost:8880)
 *   MAIA_LOCAL_VOICE_ENABLED — DEPRECATED. Kokoro is always primary now.
 */

import * as kokoro from './providers/kokoro';
import * as sesame from './providers/sesame';
import type { VoiceIntent } from '@/lib/types/voiceIntent';
import { resolveKokoroVoice, resolveSpeed } from '@/lib/voice/voiceMap';
import { resolveArchetypeVoice, resolveArchetypeToKokoro } from '@/lib/voice/voiceArchetypes';
import { resolveStylePreset, type ToneContext } from '@/lib/voice/agentToneMap';
import { applyKokoroProsodySimple } from '@/lib/tts/prosody/kokoroProsody';
import { createCacheKey, getCached, setCache } from '@/lib/tts/voiceCache';

export type TTSProvider = 'kokoro' | 'openai' | 'sesame' | 'voxtral' | 'auto';

/** Single-line JSON log for grep-friendly TTS routing proof. */
function logTtsResolve(payload: Record<string, unknown>) {
  console.info('[tts.resolve]', JSON.stringify(payload));
}

interface TTSRequest {
  text: string;
  voice?: string;
  format?: 'mp3' | 'wav' | 'opus';
  speed?: number;
  voiceHint?: VoiceIntent;
  /** Member's chosen voice archetype — overrides element-based voice selection */
  voiceArchetype?: string | null;
  /** Member's TTS provider preference (from settings) */
  ttsProviderPref?: string | null;
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
 * DEPRECATED: Kokoro is always the default primary. This remains for backward compat
 * with sovereignty logging and health check paths.
 */
export function isLocalVoiceEnabled(): boolean {
  // Always true now — Kokoro is default. Only false if explicitly set to "0"
  // AND MAIA_TTS_PROVIDER is explicitly "openai".
  if (process.env.MAIA_LOCAL_VOICE_ENABLED === '0' &&
      (process.env.MAIA_TTS_PROVIDER || '').toLowerCase() === 'openai') {
    return false;
  }
  return true;
}

/**
 * Get the configured TTS provider.
 */
export function getConfiguredProvider(): TTSProvider {
  const provider = (process.env.MAIA_TTS_PROVIDER || 'auto').toLowerCase();
  if (['kokoro', 'openai', 'sesame', 'voxtral', 'auto'].includes(provider)) {
    return provider as TTSProvider;
  }
  return 'auto';
}

/**
 * Route a TTS request to the appropriate provider with fallback.
 *
 * SOVEREIGNTY FLIP (2026-03-28):
 *   - "auto" now means Kokoro first (was OpenAI)
 *   - All archetypes route through Kokoro by default
 *   - OpenAI is fallback only (consent-gated)
 *
 * When provider is explicit (e.g. "openai"):
 *   - Use that provider directly
 */
export async function synthesize(params: TTSRequest): Promise<TTSResult> {
  const provider = getConfiguredProvider();

  // Determine primary provider
  // auto = kokoro (sovereignty default)
  const primary: TTSProvider =
    provider !== 'auto' ? provider : 'kokoro';

  const memberPref = params.ttsProviderPref || 'auto';

  // ── Archetype resolution: determine Kokoro voice from archetype ──
  if (params.voiceArchetype) {
    const archetypeResolution = resolveArchetypeVoice(params.voiceArchetype);

    logTtsResolve({
      path: 'ttsRouter',
      stage: 'archetype_resolve',
      voiceArchetype: params.voiceArchetype,
      resolvedProvider: archetypeResolution.provider,
      resolvedVoice: archetypeResolution.voice,
      primary,
      ttsProviderEnv: process.env.MAIA_TTS_PROVIDER || null,
    });

    // Only force OpenAI if member explicitly set provider preference to 'openai'
    if (memberPref === 'openai' && archetypeResolution.provider === 'openai') {
      const reason = `member_pref_openai:${params.voiceArchetype}:${archetypeResolution.voice}`;
      throw new TTSFallbackToOpenAI(false, reason, archetypeResolution.voice);
    }
  }

  // Try primary
  if (primary === 'kokoro') {
    try {
      // Archetype overrides element-based selection (member chose a fixed voice)
      // Otherwise, Bridge B: element from Conductor determines the voice
      const kokoroVoice = params.voiceArchetype
        ? resolveArchetypeToKokoro(params.voiceArchetype)
        : params.voiceHint
          ? resolveKokoroVoice(params.voiceHint.element)
          : params.voice;

      // ── PROSODY LAYER: style preset → text shaping → speed resolution ──
      const element = params.voiceHint?.element ?? 'earth';
      const toneCtx: ToneContext = {
        element,
        agent: params.voiceHint?.archetype,
      };
      const stylePreset = resolveStylePreset(toneCtx);

      // Apply Kokoro-specific prosody (text shaping + speed from preset)
      const prosody = applyKokoroProsodySimple({
        text: params.text,
        preset: stylePreset,
        element,
        voice: kokoroVoice || 'af_kore',
      });

      // ── CACHE CHECK ──
      const cacheKey = createCacheKey({
        text: prosody.text,
        voiceId: prosody.voice,
        stylePreset,
        speed: prosody.speed,
      });
      const cached = getCached(cacheKey);
      if (cached) {
        logTtsResolve({
          path: 'ttsRouter',
          stage: 'cache_hit',
          provider: 'kokoro',
          voice: prosody.voice,
          stylePreset,
          cacheKey,
        });
        return {
          audioBuffer: cached.audioBuffer,
          contentType: cached.contentType,
          provider: 'kokoro',
          fallback: false,
          reason: 'cache_hit',
        };
      }

      logTtsResolve({
        path: 'ttsRouter',
        stage: 'dispatch',
        provider: 'kokoro',
        voice: prosody.voice,
        voiceArchetype: params.voiceArchetype || null,
        element,
        stylePreset,
        speed: prosody.speed,
        memberPref,
      });

      const result = await kokoro.synthesize({
        text: prosody.text,
        voice: prosody.voice,
        format: params.format,
        speed: prosody.speed,
      });

      // ── CACHE STORE (fire-and-forget) ──
      setCache(cacheKey, { audioBuffer: result.audioBuffer, contentType: result.contentType });

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
    try {
      logTtsResolve({
        path: 'ttsRouter',
        stage: 'dispatch',
        provider: 'sesame',
        voice: params.voice || 'maya',
        element: params.voiceHint?.element,
        memberPref,
      });

      const result = await sesame.synthesize({
        text: params.text,
        voice: params.voice || 'maya',
        format: params.format,
        speed: params.speed,
        element: params.voiceHint?.element,
      });
      return { ...result, fallback: false, reason: 'sesame_healthy' };
    } catch (sesameErr: any) {
      const reason = sesameErr.message?.includes('timeout') ? 'sesame_timeout'
        : sesameErr.message?.includes('ECONNREFUSED') ? 'sesame_unreachable'
        : 'sesame_error';
      console.warn(`[tts-router] Sesame failed (${reason}), trying Kokoro: ${sesameErr.message}`);

      // Fallback to Kokoro (local) before considering OpenAI
      try {
        const kokoroVoice = params.voiceHint
          ? resolveKokoroVoice(params.voiceHint.element)
          : params.voice;
        const kokoroSpeed = params.voiceHint
          ? resolveSpeed(params.voiceHint.element, params.voiceHint.speed)
          : params.speed;
        const result = await kokoro.synthesize({
          text: params.text,
          voice: kokoroVoice,
          format: params.format,
          speed: kokoroSpeed,
        });
        return { ...result, fallback: true, reason: `${reason}_kokoro_fallback` };
      } catch (kokoroErr: any) {
        const kokoroReason = kokoroErr.message?.includes('ECONNREFUSED') ? 'kokoro_unreachable' : 'kokoro_error';
        console.warn(`[tts-router] Kokoro also failed (${kokoroReason}), falling back to OpenAI`);
        throw new TTSFallbackToOpenAI(true, `${reason}_${kokoroReason}`);
      }
    }
  }

  // OpenAI as explicit provider (only when MAIA_TTS_PROVIDER=openai)
  logTtsResolve({
    path: 'ttsRouter',
    stage: 'dispatch',
    provider: 'openai',
    voice: params.voice || 'default',
    voiceArchetype: params.voiceArchetype || null,
    element: params.voiceHint?.element,
    memberPref,
    note: 'openai_explicit_config',
  });
  throw new TTSFallbackToOpenAI(false, 'openai_explicit_config');
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
