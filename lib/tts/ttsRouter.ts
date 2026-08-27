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

import {
  assertCloudVoiceAllowed,
  resolveVoicePreference,
  CloudVoiceForbidden,
  type VoiceRequestContext,
} from './cloudVoicePolicy';
import * as kokoro from './providers/kokoro';
import * as sesame from './providers/sesame';
import * as personaplex from './providers/personaplex';
import type { VoiceIntent } from '@/lib/types/voiceIntent';
import { resolveKokoroVoice, resolveSpeed, resolveVoiceWithArchetype } from '@/lib/voice/voiceMap';
import { resolveArchetypeVoice } from '@/lib/voice/voiceArchetypes';

export type TTSProvider = 'kokoro' | 'openai' | 'sesame' | 'pplex' | 'auto';

// ─────────────────────────────────────────────────────────────────────────────
// DEPLOYMENT-QUALIFICATION GUARD (Refusal R15)
//
// A provider may only be *selected* in a deployment context where it is
// qualified. This is the structural gate that keeps the Voice Lab's provider
// switcher from becoming a production egress bypass: lab may compare every
// engine; `production-maia` may select only Stage-A-qualified (local, sovereign)
// providers. `openai`, `pplex`, and `sesame` are NOT qualified for
// production-maia — openai is cloud egress (governance question: docs/adr/012),
// pplex is MLX with no x86 production backend, and the production `maia-sesame-tts`
// service does CI text-shaping only (not audio synthesis), so selecting `sesame`
// there would emit a buffer stamped provider:'sesame' from a non-Sesame backend —
// a mislabeled production provider. `sesame` remains a candidate in the lab
// (voice-quality-lab) until a verified Sesame CSM audio backend exists. Widening
// the production-maia allow-list requires an explicit, referenced decision
// record — not a config flip.
//
// Capability and gate ship together: the pplex dispatch branch below is only
// reachable through this guard.
// ─────────────────────────────────────────────────────────────────────────────

export type DeploymentContext = 'production-maia' | 'voice-quality-lab';

/**
 * Providers a context is allowed to *select*. `auto` is always allowed — it
 * resolves to a local provider (kokoro) in production and never widens the set.
 */
const QUALIFIED_PROVIDERS: Record<DeploymentContext, TTSProvider[]> = {
  // Stage-A local/sovereign providers only. NOT openai (egress), NOT pplex (MLX),
  // NOT sesame (prod maia-sesame-tts is CI-shaping only, not audio — mislabel risk).
  'production-maia': ['auto', 'kokoro'],
  // Lab compares everything.
  'voice-quality-lab': ['auto', 'openai', 'kokoro', 'sesame', 'pplex'],
};

/**
 * The active deployment context. FAIL-CLOSED: anything other than an explicit
 * `voice-quality-lab` is treated as `production-maia` (the strict context), so a
 * missing/typo'd env can never silently unlock cloud/unqualified providers.
 */
export function getDeploymentContext(): DeploymentContext {
  return process.env.MAIA_DEPLOYMENT_CONTEXT === 'voice-quality-lab'
    ? 'voice-quality-lab'
    : 'production-maia';
}

/** Refusal signal: a provider was selected in a context where it is not qualified. */
export class ProviderNotQualifiedError extends Error {
  public readonly provider: TTSProvider;
  public readonly context: DeploymentContext;
  constructor(provider: TTSProvider, context: DeploymentContext) {
    super(`TTS provider "${provider}" is not qualified for deployment context "${context}"`);
    this.name = 'ProviderNotQualifiedError';
    this.provider = provider;
    this.context = context;
  }
}

/**
 * Guard: throw ProviderNotQualifiedError if `provider` may not be selected in
 * `context`. The refusal is logged for audit before it throws.
 */
export function assertProviderQualified(
  provider: TTSProvider,
  context: DeploymentContext = getDeploymentContext(),
): void {
  if (!QUALIFIED_PROVIDERS[context].includes(provider)) {
    logTtsResolve({ path: 'ttsRouter', stage: 'guard_refusal', provider, context });
    throw new ProviderNotQualifiedError(provider, context);
  }
}

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
  /**
   * Admin/lab only: force a specific provider for this one request (deterministic
   * A/B comparison in the Voice Lab). Still passes through assertProviderQualified,
   * so it can NEVER select a provider the deployment context forbids — it is not a
   * guard bypass. Overrides the env-configured provider when present.
   */
  providerOverride?: TTSProvider;
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
  if (['kokoro', 'openai', 'sesame', 'pplex', 'auto'].includes(provider)) {
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
  // A per-request providerOverride (Voice Lab) wins over the env-configured
  // provider, but is subject to the SAME qualification guard below — the lab
  // switcher cannot select a provider the deployment context forbids.
  const provider = params.providerOverride ?? getConfiguredProvider();

  // ── QUALIFICATION GUARD (R15): refuse selecting a provider not qualified for
  // this deployment context. Guards the resolved provider (override or env);
  // `auto` is always qualified and resolves to a local engine in production.
  // Does not touch the archetype→OpenAI path below (that is ADR-012's open
  // question). ──
  assertProviderQualified(provider);

  const localEnabled = isLocalVoiceEnabled();

  // Determine primary provider
  const primary: TTSProvider =
    provider !== 'auto' ? provider
    : localEnabled ? 'kokoro'
    : 'openai';

  // ── Archetype intercept: OpenAI archetypes skip Kokoro entirely ──
  if (params.voiceArchetype) {
    const archetypeResolution = resolveArchetypeVoice(params.voiceArchetype);

    logTtsResolve({
      path: 'ttsRouter',
      stage: 'archetype_intercept',
      voiceArchetype: params.voiceArchetype,
      resolvedProvider: archetypeResolution.provider,
      resolvedVoice: archetypeResolution.voice,
      localEnabled,
      ttsProviderEnv: process.env.MAIA_TTS_PROVIDER || null,
    });

    if (archetypeResolution.provider === 'openai') {
      const reason = `archetype_openai:${params.voiceArchetype}:${archetypeResolution.voice}`;
      throw new TTSFallbackToOpenAI(false, reason, archetypeResolution.voice, params.ttsProviderPref);
    }
  }

  // ── GUARDRAIL: MAIA OpenAI family cannot hit Kokoro unless member explicitly chose "local" ──
  const memberPref = params.ttsProviderPref || 'auto';
  const archetype = params.voiceArchetype || null;
  const isMaiaOpenAiFamily =
    typeof archetype === 'string' &&
    archetype.startsWith('maia_') &&
    resolveArchetypeVoice(archetype).provider === 'openai';

  if (isMaiaOpenAiFamily && memberPref !== 'local') {
    logTtsResolve({
      path: 'ttsRouter',
      stage: 'guardrail_force_openai',
      voiceArchetype: archetype,
      memberPref,
    });
    throw new TTSFallbackToOpenAI(false, 'maia_default_guardrail', resolveArchetypeVoice(archetype).voice, params.ttsProviderPref);
  }

  // Try primary
  if (primary === 'kokoro') {
    try {
      // Archetype overrides element-based selection (member chose a fixed voice)
      // Otherwise, Bridge B: element from Conductor determines the voice
      const kokoroVoice = params.voiceArchetype
        ? resolveVoiceWithArchetype(params.voiceHint?.element ?? 'earth', params.voiceArchetype)
        : params.voiceHint
          ? resolveKokoroVoice(params.voiceHint.element)
          : params.voice;
      const kokoroSpeed = params.voiceHint
        ? resolveSpeed(params.voiceHint.element, params.voiceHint.speed)
        : params.speed;

      logTtsResolve({
        path: 'ttsRouter',
        stage: 'dispatch',
        provider: 'kokoro',
        voice: kokoroVoice,
        voiceArchetype: params.voiceArchetype || null,
        element: params.voiceHint?.element,
        memberPref,
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
      throw new TTSFallbackToOpenAI(true, reason, undefined, params.ttsProviderPref);
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
        throw new TTSFallbackToOpenAI(true, `${reason}_${kokoroReason}`, undefined, params.ttsProviderPref);
      }
    }
  }

  if (primary === 'pplex') {
    try {
      logTtsResolve({
        path: 'ttsRouter',
        stage: 'dispatch',
        provider: 'pplex',
        voice: params.voice || 'default',
        element: params.voiceHint?.element,
        memberPref,
      });

      const result = await personaplex.synthesize({
        text: params.text,
        voice: params.voice,
        format: params.format,
        speed: params.speed,
      });
      return { ...result, fallback: false, reason: 'pplex_healthy' };
    } catch (err: any) {
      const reason = err?.message?.includes('timed out') ? 'pplex_timeout'
        : err?.message?.includes('ECONNREFUSED') ? 'pplex_unreachable'
        : 'pplex_error';
      console.warn(`[tts-router] PersonaPlex failed (${reason}), falling back to OpenAI: ${err?.message}`);
      throw new TTSFallbackToOpenAI(true, reason, undefined, params.ttsProviderPref);
    }
  }

  // OpenAI as primary (not a fallback)
  logTtsResolve({
    path: 'ttsRouter',
    stage: 'dispatch',
    provider: 'openai',
    voice: params.voice || 'default',
    voiceArchetype: params.voiceArchetype || null,
    element: params.voiceHint?.element,
    memberPref,
  });
  throw new TTSFallbackToOpenAI(false, 'openai_primary', undefined, params.ttsProviderPref);
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

  constructor(
    isFallback: boolean,
    reason: string = 'unknown',
    voice?: string,
    /**
     * The member's stored TTS preference for THIS request.
     *
     * Under the third-pass canon 'auto' resolves to cloud, so this parameter
     * is no longer where fail-closed lives — see `context` below.
     */
    memberPref?: string | null,
    /**
     * Session context for THIS request.
     *
     * ⛔ Defaults to `{ sanctuary: true }`, which is REFUSED. Fail-closed is
     * the point, and the amendment MOVED it here: `memberPref` used to default
     * to 'auto' and 'auto' used to be refused, so omission failed safe. Now
     * 'auto' is the cloud-preferring default, and that same omission would
     * fail OPEN — a seventh escape added later, forgetting to pass context,
     * would quietly gain cloud access it never declared.
     *
     * Defaulting to Sanctuary restores the property: an escape that does not
     * say what kind of session it belongs to is treated as the most protected
     * kind, and refused. Permission must be supplied deliberately; it can
     * never be arrived at by omission.
     */
    context: VoiceRequestContext = { sanctuary: true },
  ) {
    // ⭐ VOICE-SOVEREIGNTY-01. THE choke point. This router has six separate
    // escapes to OpenAI, and repairing each individually is discipline — which
    // is exactly what drifted and put `provider:"openai"` on ordinary member
    // turns while Kokoro was healthy. Refusing here means every escape, and
    // every escape added later, inherits the refusal without anyone having to
    // remember. Under the canon this constructor cannot complete.
    //
    // ⭐ VOICE-SOVEREIGNTY-02 (founder ruling, second pass). The flag alone is
    // no longer sufficient. `MAIA_ALLOW_CLOUD_VOICE=1` permits cloud voice to
    // HONOUR AN EXPLICIT MEMBER CHOICE — it does not re-open the router to
    // everyone. Without this, flipping the flag would let an `auto` member
    // whose Kokoro is down reach OpenAI through the router's internal
    // fallback: the original `auto`-shaped default, restored by the back door
    // through a path nobody was looking at. Both conditions must hold.
    super('Falling back to OpenAI TTS');
    this.name = 'TTSFallbackToOpenAI';
    this.isFallback = isFallback;
    this.reason = reason;
    this.voice = voice;

    const pref = resolveVoicePreference(memberPref, context);
    if (pref.sanctuaryForcedLocal) {
      // ⭐ THE ONE ROW WITH NO ESCAPE. Sanctuary never reaches a cloud
      // provider — not by preference, not by outage, not by flag, and not
      // through this router's internal fallback. Refused before anything else
      // is considered.
      throw new CloudVoiceForbidden(`ttsRouter:${reason}:sanctuary`);
    }
    if (pref.effective !== 'cloud') {
      // An explicit `local` member is not overridden by availability. The
      // member asked to stay on the machine.
      throw new CloudVoiceForbidden(`ttsRouter:${reason}:pref=${pref.stored}`);
    }
    assertCloudVoiceAllowed(`ttsRouter:${reason}`);
  }
}

/**
 * Health status for all configured TTS providers.
 */
export async function healthCheckAll(): Promise<{
  localVoiceEnabled: boolean;
  provider: TTSProvider;
  deploymentContext: DeploymentContext;
  kokoro: { healthy: boolean; url: string; error?: string; latencyMs?: number } | null;
  openai: { configured: boolean };
  sesame: { configured: boolean; url: string } | null;
  pplex: { healthy: boolean; url: string; error?: string; latencyMs?: number } | null;
}> {
  const localEnabled = isLocalVoiceEnabled();
  const provider = getConfiguredProvider();
  const deploymentContext = getDeploymentContext();

  const kokoroHealth = localEnabled || provider === 'kokoro'
    ? await kokoro.healthCheck()
    : null;

  const sesameUrl = process.env.SESAME_TTS_URL || process.env.NEXT_PUBLIC_SESAME_URL;

  // PersonaPlex only probed where it can be selected (lab context or explicit
  // pplex) — avoids adding a dead round-trip on the production path.
  const pplexHealth =
    deploymentContext === 'voice-quality-lab' || provider === 'pplex'
      ? await personaplex.healthCheck()
      : null;

  return {
    localVoiceEnabled: localEnabled,
    provider,
    deploymentContext,
    kokoro: kokoroHealth,
    openai: {
      configured: Boolean(process.env.OPENAI_API_KEY),
    },
    sesame: sesameUrl ? { configured: true, url: sesameUrl } : null,
    pplex: pplexHealth,
  };
}
