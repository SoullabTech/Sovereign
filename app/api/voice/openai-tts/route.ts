// backend: app/api/voice/openai-tts/route.ts
//
// SOVEREIGNTY: this legacy-named gateway is local by default. Cloud voice is
// reachable only when the authenticated member explicitly chose `cloud` AND
// MAIA_ALLOW_CLOUD_VOICE=1. A request/header or archetype alone is not consent.
//
import 'server-only';
import OpenAI from "openai";
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { LimitsEnforcer, getMemberTier, type MemberTier } from '@/lib/limits/LimitsEnforcer';
import { PROVIDER_SPEND_LIMIT_REACHED, estimateVoiceSeconds, isProviderSpendGateError, reserveVoiceProviderSpend } from '@/lib/limits/ProviderSpendGate';
import { NextRequest } from 'next/server';
import * as ttsRouter from '@/lib/tts/ttsRouter';
import { resolveVoicePreference } from '@/lib/tts/cloudVoicePolicy';
import { logFallbackEvent, checkCloudConsent, resolveVoicePolicy } from '@/lib/tts/voiceSovereignty';
import { resolveArchetypeToKokoro, resolveArchetypeVoice } from '@/lib/voice/voiceArchetypes';
import { getMemberVoicePreferences } from '@/lib/voice/voiceControlsService';

export const runtime = "nodejs"; // important: TTS returns binary; avoid edge surprises
export const dynamic = "force-dynamic";

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

function jsonError(message: string, status = 500, extra?: Record<string, unknown>) {
  return new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    // ═══ IDENTITY RESOLUTION ═══
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return jsonError('Authentication required for cloud voice', 401, { requestId });
    }
    const anonId: undefined = undefined;

    // ═══ TIER-BASED LIMITS CHECK ═══
    const memberTier: MemberTier = await getMemberTier(memberId);

    const body = await req.json().catch(() => null) as null | {
      text?: string;
      voice?: string;
      model?: string;
      format?: "mp3" | "wav" | "opus" | "aac" | "flac";
      speed?: number;
      instructions?: string;  // MAIA vocal intent — passed to gpt-4o-mini-tts instructions field
    };

    const text = body?.text?.trim();
    if (!text) return jsonError("Missing 'text' in request body", 400, { requestId });

    const estimatedSeconds = estimateVoiceSeconds(text);

    const limitsCheck = await LimitsEnforcer.checkUsage({
      memberId: memberId || undefined,
      anonId,
      tier: memberTier,
      resource: 'voice_tts',
      amount: estimatedSeconds,
    });

    if (limitsCheck.action === 'block') {
      console.log(`[openai-tts:${requestId}] Usage blocked: ${limitsCheck.message}`);
      return new Response(JSON.stringify({
        error: limitsCheck.message,
        blocked: true,
        tier: memberTier,
        requestId,
      }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    const allowedFormats = new Set(['mp3', 'wav', 'opus', 'aac', 'flac']);
    const requestedFormat = body?.format;
    const format = requestedFormat && allowedFormats.has(requestedFormat) ? requestedFormat : 'mp3';
    const requestedSpeed = Number(body?.speed ?? 1.0);
    const speed = Number.isFinite(requestedSpeed)
      ? Math.max(0.25, Math.min(4.0, requestedSpeed))
      : 1.0;
    // MAIA vocal intent: if present, upgrade model to gpt-4o-mini-tts which supports instructions
    const ttsInstructions = body?.instructions?.trim() || undefined;

    // PFI sovereignty gate (enforcement step 1: observe + log).
    // Instructions MUST originate from a VoicePlan produced by the oracle route.
    // When absent, log a sovereignty leak warning — future: hard reject.
    // grep tag:pfi.tts.no_voice_plan to audit callers that bypass PFI.
    if (!ttsInstructions) {
      console.warn(JSON.stringify({
        tag: 'pfi.tts.no_voice_plan',
        requestId,
        authenticatedMember: true,
        text_length: text.length,
        note: 'TTS called without VoicePlan instructions — ad-hoc voice, sovereignty not guaranteed',
      }));
    }

    if (text.length > 4096) {
      return jsonError("Text too long (max 4096 chars for TTS)", 400, { requestId });
    }

    // ═══════════════════════════════════════════════════════════════════
    // SOVEREIGN VOICE AUTHORITY
    //
    // Provider choice comes from the authenticated member's stored preference,
    // not from the request body, route name, archetype metadata, or provider
    // availability. `auto`, unset, and local all remain local. Cloud requires:
    //   1. stored tts_provider === "cloud";
    //   2. MAIA_ALLOW_CLOUD_VOICE=1;
    //   3. no per-request local-only override;
    //   4. no recorded global/member denial.
    // ═══════════════════════════════════════════════════════════════════
    let memberArchetype: string | null = null;
    let memberProviderPreference: string | null = null;
    try {
      const prefs = await getMemberVoicePreferences(memberId);
      memberArchetype = prefs?.voiceArchetype ?? null;
      memberProviderPreference = prefs?.ttsProvider ?? null;
    } catch {
      // Preference uncertainty must fail local, never cloud.
    }

    const effectiveArchetype = memberArchetype || 'maia_core';
    const archetypeResolution = resolveArchetypeVoice(effectiveArchetype);
    const localVoice = resolveArchetypeToKokoro(effectiveArchetype);
    const localOnlyHeader = req.headers.get('x-voice-local-only') === '1';
    const voicePreference = resolveVoicePreference(memberProviderPreference);
    const recordedCloudConsent = await checkCloudConsent({ memberId, localOnlyHeader });
    const cloudVoiceAuthorized =
      !localOnlyHeader &&
      recordedCloudConsent.allowed &&
      voicePreference.effective === 'cloud' &&
      archetypeResolution.provider === 'openai';

    const localFormat: 'mp3' | 'wav' | 'opus' =
      format === 'wav' || format === 'opus' ? format : 'mp3';

    const synthesizeLocal = async (reason: string): Promise<Response> => {
      const localStartedAt = Date.now();
      try {
        // Pin the local provider explicitly. Do not let an environment default,
        // archetype intercept, or local failure construct a cloud fallback.
        const result = await ttsRouter.synthesize({
          text,
          voice: localVoice,
          format: localFormat,
          speed,
          providerOverride: 'kokoro',
          ttsProviderPref: 'local',
        });
        const ms = Date.now() - localStartedAt;
        logFallbackEvent({
          requestId,
          memberId,
          intendedProvider: cloudVoiceAuthorized ? 'openai' : 'kokoro',
          actualProvider: result.provider,
          isFallback: cloudVoiceAuthorized,
          reason,
          latencyMs: ms,
          audioBytes: result.audioBuffer.length,
          textLength: text.length,
        });
        // Local synthesis has no paid-provider reservation. Retain the existing
        // best-effort product meter without making local speech depend on it.
        void LimitsEnforcer.recordUsage({
          memberId,
          tier: memberTier,
          resource: 'voice_tts',
          amount: estimatedSeconds,
        });
        return new Response(new Uint8Array(result.audioBuffer), {
          status: 200,
          headers: {
            'Content-Type': result.contentType,
            'Content-Length': result.audioBuffer.length.toString(),
            'Cache-Control': 'no-store',
            'X-Request-Id': requestId,
            'X-TTS-Provider': result.provider,
            'X-TTS-Fallback': cloudVoiceAuthorized ? '1' : '0',
            'X-Voice-Policy': 'local-only',
            'X-Voice-Archetype': effectiveArchetype,
            'X-PFI-Voice-Plan': ttsInstructions ? '1' : '0',
            'X-PFI-TTS-Text-Len': String(text.length),
          },
        });
      } catch (localError) {
        console.warn(`[openai-tts:${requestId}] LOCAL_UNAVAILABLE category=${localError instanceof Error ? localError.name : typeof localError}`);
        return jsonError('Local voice is temporarily unavailable', 503, {
          requestId,
          code: 'LOCAL_VOICE_UNAVAILABLE',
        });
      }
    };

    if (!cloudVoiceAuthorized) {
      console.info('[tts.policy]', JSON.stringify({
        path: 'openai-tts',
        storedPreference: voicePreference.stored,
        effective: voicePreference.effective,
        archetypeProvider: archetypeResolution.provider,
        localOnlyHeader,
        cloudConsentAllowed: recordedCloudConsent.allowed,
        decision: 'local',
      }));
      return synthesizeLocal('sovereign_primary');
    }

    // Explicit member choice + explicit deployment permission. Reserve paid
    // usage atomically before provider dispatch. If accounting or the provider
    // is unavailable, preserve speech locally; a limit refusal remains a limit.
    const voice = archetypeResolution.voice;
    const cloudStartedAt = Date.now();
    if (!process.env.OPENAI_API_KEY) {
      return synthesizeLocal('cloud_key_unavailable');
    }

    const allowedModels = new Set(['gpt-4o-mini-tts', 'tts-1', 'tts-1-hd']);
    const requestedModel = body?.model ?? 'gpt-4o-mini-tts';
    const model = ttsInstructions
      ? 'gpt-4o-mini-tts'
      : allowedModels.has(requestedModel)
        ? requestedModel
        : 'gpt-4o-mini-tts';
    const speechParams: any = {
      model,
      voice,
      input: text,
      response_format: format,
      speed,
      ...(ttsInstructions ? { instructions: ttsInstructions } : {}),
    };

    try {
      await reserveVoiceProviderSpend({
        memberId,
        estimatedSeconds,
        provider: 'openai',
        purpose: 'voice_tts',
      });
      const speech = await getOpenAI().audio.speech.create(speechParams);
      const audioBuffer = Buffer.from(await speech.arrayBuffer());
      const ms = Date.now() - cloudStartedAt;
      logFallbackEvent({
        requestId,
        memberId,
        intendedProvider: 'openai',
        actualProvider: 'openai',
        isFallback: false,
        reason: 'member_chose_cloud',
        latencyMs: ms,
        audioBytes: audioBuffer.length,
        textLength: text.length,
      });
      const contentType =
        format === 'mp3' ? 'audio/mpeg'
        : format === 'wav' ? 'audio/wav'
        : format === 'opus' ? 'audio/opus'
        : format === 'aac' ? 'audio/aac'
        : format === 'flac' ? 'audio/flac'
        : 'application/octet-stream';
      return new Response(new Uint8Array(audioBuffer), {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': audioBuffer.length.toString(),
          'Cache-Control': 'no-store',
          'X-Request-Id': requestId,
          'X-TTS-Provider': 'openai',
          'X-TTS-Fallback': '0',
          'X-Voice-Policy': resolveVoicePolicy({
            localVoiceEnabled: ttsRouter.isLocalVoiceEnabled(),
            configuredProvider: 'openai',
            cloudConsentAllowed: true,
          }),
          'X-Voice-Archetype': effectiveArchetype,
          'X-PFI-Voice-Plan': ttsInstructions ? '1' : '0',
          'X-PFI-TTS-Text-Len': String(text.length),
        },
      });
    } catch (cloudError) {
      if (
        isProviderSpendGateError(cloudError) &&
        cloudError.code === PROVIDER_SPEND_LIMIT_REACHED
      ) {
        throw cloudError;
      }
      console.warn(`[openai-tts:${requestId}] CLOUD_UNAVAILABLE category=${cloudError instanceof Error ? cloudError.name : typeof cloudError}`);
      return synthesizeLocal(
        isProviderSpendGateError(cloudError)
          ? 'provider_accounting_unavailable'
          : 'cloud_provider_unavailable',
      );
    }
  } catch (err: any) {
    if (isProviderSpendGateError(err)) {
      return jsonError(err.message, err.status, { requestId, code: err.code });
    }
    const upstreamStatus = Number(err?.status ?? err?.response?.status ?? 500);
    const status = upstreamStatus >= 400 && upstreamStatus < 600 ? upstreamStatus : 500;
    console.error(`[openai-tts:${requestId}] FAIL category=upstream_${status}`);
    return jsonError("Failed to generate speech", status, { requestId });
  }
}

export async function GET() {
  return new Response(JSON.stringify({
    message: 'Soullab TTS gateway active',
    policy: 'local by default; cloud requires an authenticated explicit member choice and release flag',
    usage: 'POST with { "text": "...", "format": "mp3" }',
  }), {
    headers: { "Content-Type": "application/json" },
  });
}
