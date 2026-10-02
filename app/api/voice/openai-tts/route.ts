// backend: app/api/voice/openai-tts/route.ts
//
// GOVERNED TTS SEAM (Phase 0 — behavior-preserving refactor, 2026-07-26):
// Every synthesis request flows through the provider-neutral ttsRouter.synthesize().
// The router owns the provider decision; this route no longer contains a direct-OpenAI
// bypass. OpenAI rendering happens ONLY when the router signals TTSFallbackToOpenAI,
// and the route distinguishes:
//   - DESIGN-SELECT (isFallback=false): maia_* archetypes route to OpenAI by the router's
//     own design (the ratified production default). Rendered directly — NOT consent-gated.
//   - FAILURE-FALLBACK (isFallback=true): a local provider failed. Consent-gated; may 503.
// Net behavior is unchanged from the pre-seam route: maia_* → OpenAI alloy; Kokoro
// archetypes → local Kokoro with consent-gated OpenAI fallback on failure.
// Ruling: docs/architecture/INTERACTION_ENGINE_VOICE_ABSTRACTION_CANDIDATE_2026-07-26.md (§ Ruling)
//
import OpenAI from "openai";
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { LimitsEnforcer, getMemberTier, type MemberTier } from '@/lib/limits/LimitsEnforcer';
import { NextRequest } from 'next/server';
import * as ttsRouter from '@/lib/tts/ttsRouter';
import { TTSFallbackToOpenAI } from '@/lib/tts/ttsRouter';
import { logFallbackEvent, checkCloudConsent, resolveVoicePolicy } from '@/lib/tts/voiceSovereignty';
import { resolveArchetypeVoice } from '@/lib/voice/voiceArchetypes';
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

function contentTypeForFormat(format: string): string {
  return format === "mp3" ? "audio/mpeg"
    : format === "wav" ? "audio/wav"
    : format === "opus" ? "audio/opus"
    : format === "aac" ? "audio/aac"
    : format === "flac" ? "audio/flac"
    : "application/octet-stream";
}

// ── Provenance taxonomy (Phase 0 item 7) ──
// Why OpenAI was chosen must be unambiguous: intentional selection vs. rescue of a failing
// local path. See the ruling's telemetry-tightening requirement.
type SelectionReason = 'configured_default' | 'archetype_rule' | 'explicit_request';
type FallbackReason = 'provider_unavailable' | 'local_failure' | 'consent_policy' | 'none';

function classifySelectionReason(routerReason?: string): SelectionReason {
  if (routerReason?.startsWith('archetype_openai') || routerReason === 'maia_default_guardrail') {
    return 'archetype_rule';
  }
  return 'configured_default';
}

function classifyFallbackReason(isFailureFallback: boolean, routerReason?: string): FallbackReason {
  if (!isFailureFallback) return 'none';
  if (/timeout|unreachable|ECONNREFUSED/i.test(routerReason || '')) return 'provider_unavailable';
  if (/error/i.test(routerReason || '')) return 'local_failure';
  return 'none';
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    // ═══ IDENTITY RESOLUTION ═══
    // NOTE (Phase 0, disposition per ruling): access semantics are preserved exactly.
    // This route resolves identity and applies tier limits; anonymous callers are handled
    // as before (free tier). Phase 0 does not add, remove, or reinterpret auth/consent/tier
    // policy — the legitimacy of anonymous voice access is NOT adjudicated here.
    const memberId = await getMemberIdFromRequest(req);
    const headerAnonId = req.headers.get('x-maia-anon-id') ?? undefined;
    const isAnon = !memberId;
    if (isAnon && !headerAnonId) {
      console.warn('[limits] Missing x-maia-anon-id header; TTS usage may not accumulate properly');
    }
    const anonId = isAnon ? (headerAnonId || `anon_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`) : undefined;

    // ═══ TIER-BASED LIMITS CHECK ═══
    const memberTier: MemberTier = isAnon ? 'free' : memberId ? await getMemberTier(memberId) : 'free';

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

    const estimatedSeconds = Math.ceil(text.length / 12.5);

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

    const format = body?.format ?? "mp3";
    const speed = body?.speed ?? 1.0;
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
        memberId: memberId ?? 'anon',
        text_length: text.length,
        note: 'TTS called without VoicePlan instructions — ad-hoc voice, sovereignty not guaranteed',
      }));
    }

    if (text.length > 4096) {
      return jsonError("Text too long (max 4096 chars for TTS)", 400, { requestId });
    }

    // ═══════════════════════════════════════════════════════════════════
    // ARCHETYPE RESOLUTION → GOVERNED SEAM
    // MAIA vow: default voice is always maia_core (OpenAI Alloy, by the router's design).
    // The archetype owns the voice id; the client cannot override the provider.
    // We intentionally do NOT pass the member's ttsProvider preference here: the pre-seam
    // route never consulted it, and Phase 0 must not change any member's rendered voice.
    // Honoring an explicit member "local" preference for maia_* is a separate future decision.
    // ═══════════════════════════════════════════════════════════════════
    let memberArchetype: string | null = null;
    if (memberId) {
      try {
        const prefs = await getMemberVoicePreferences(memberId);
        memberArchetype = prefs?.voiceArchetype ?? null;
      } catch (e) {
        // Non-blocking: if prefs fail, default to maia_core
      }
    }
    const effectiveArchetype = memberArchetype || 'maia_core';
    const archetypeResolution = resolveArchetypeVoice(effectiveArchetype);
    const requestedVoice = archetypeResolution.voice;
    const t0 = Date.now();

    try {
      // ── SINGLE DECISION POINT: the router decides the provider ──
      const result = await ttsRouter.synthesize({
        text,
        voice: requestedVoice,
        format: format as any,
        speed,
        voiceArchetype: effectiveArchetype,
      });
      const ms = Date.now() - t0;

      // Local / non-OpenAI success (e.g. Kokoro). No audio left the machine.
      console.log(`[openai-tts:${requestId}] SEAM provider=${result.provider} archetype=${effectiveArchetype} voice=${requestedVoice} bytes=${result.audioBuffer.length} ms=${ms}`);

      logFallbackEvent({
        requestId,
        memberId: memberId || undefined,
        anonId,
        intendedProvider: ttsRouter.getConfiguredProvider(),
        actualProvider: result.provider,
        isFallback: false,
        reason: result.reason || 'seam_success',
        selectionReason: 'archetype_rule',
        fallbackReason: 'none',
        latencyMs: ms,
        audioBytes: result.audioBuffer.length,
        textLength: text.length,
      });

      const actualSeconds = Math.ceil(ms / 1000) || estimatedSeconds;
      LimitsEnforcer.recordUsage({
        memberId: memberId || undefined,
        anonId,
        tier: memberTier,
        resource: 'voice_tts',
        amount: actualSeconds,
      }).catch(err => console.error(`[openai-tts:${requestId}] Usage recording failed:`, err));

      const localPolicy = resolveVoicePolicy({
        localVoiceEnabled: ttsRouter.isLocalVoiceEnabled(),
        configuredProvider: ttsRouter.getConfiguredProvider(),
        cloudConsentAllowed: true,
      });

      return new Response(new Uint8Array(result.audioBuffer), {
        status: 200,
        headers: {
          "Content-Type": result.contentType,
          "Content-Length": result.audioBuffer.length.toString(),
          "Cache-Control": "no-store",
          "X-Request-Id": requestId,
          "X-TTS-Provider": result.provider,
          "X-TTS-Fallback": "0",
          "X-TTS-Selection-Reason": "archetype_rule",
          "X-TTS-Fallback-Reason": "none",
          "X-Voice-Policy": localPolicy,
          "X-Voice-Archetype": effectiveArchetype,
          "X-PFI-Voice-Plan": ttsInstructions ? "1" : "0",  // Observability: 0 = sovereignty leak
          "X-PFI-TTS-Text-Len": String(text?.length ?? 0),
        },
      });
    } catch (routeErr: any) {
      // Only TTSFallbackToOpenAI is a routing decision; anything else is a real error.
      if (!(routeErr instanceof TTSFallbackToOpenAI)) {
        throw routeErr;
      }

      const isFailureFallback: boolean = routeErr.isFallback;
      const routerReason: string | undefined = routeErr.reason;
      const selectionReason = classifySelectionReason(routerReason);

      // Consent gate applies ONLY to a failure-fallback — never to the ratified design default.
      if (isFailureFallback) {
        const localOnlyHeader = req.headers.get('x-voice-local-only') === '1';
        const cloudConsent = await checkCloudConsent({ memberId: memberId || undefined, localOnlyHeader });
        if (!cloudConsent.allowed) {
          logFallbackEvent({
            requestId,
            memberId: memberId || undefined,
            anonId,
            intendedProvider: ttsRouter.getConfiguredProvider(),
            actualProvider: 'none',
            isFallback: true,
            reason: `consent_denied:${cloudConsent.reason}`,
            selectionReason,
            fallbackReason: 'consent_policy',
            textLength: text.length,
          });
          return jsonError('Local voice unavailable and cloud fallback is not permitted', 503, {
            requestId,
            policy: 'local-only',
          });
        }
      }

      if (!process.env.OPENAI_API_KEY) {
        return jsonError("Missing OPENAI_API_KEY on server", 500, { requestId });
      }

      // The router carries the intended OpenAI voice for design-selected archetypes; for a
      // Kokoro archetype falling back, Kokoro voice ids aren't valid for OpenAI → alloy.
      const openaiVoice = routeErr.voice
        ?? (archetypeResolution.provider === 'kokoro' ? 'alloy' : requestedVoice);
      const model = ttsInstructions ? "gpt-4o-mini-tts" : (body?.model ?? "gpt-4o-mini-tts");

      console.log(`[openai-tts:${requestId}] OPENAI ${isFailureFallback ? 'failure-fallback' : 'design-select'} model=${model} voice=${openaiVoice} archetype=${effectiveArchetype} reason=${routerReason} hasInstructions=${Boolean(ttsInstructions)} format=${format} chars=${text.length}`);

      const speechParams: any = {
        model,
        voice: openaiVoice,
        input: text,
        response_format: format,
        speed,
        ...(ttsInstructions ? { instructions: ttsInstructions } : {}),
      };
      const speech = await getOpenAI().audio.speech.create(speechParams);
      const audioBuffer = Buffer.from(await speech.arrayBuffer());
      const ms = Date.now() - t0;
      const fallbackReason = classifyFallbackReason(isFailureFallback, routerReason);

      console.log(`[openai-tts:${requestId}] ok provider=openai fallback=${isFailureFallback} selection=${selectionReason} voice=${openaiVoice} bytes=${audioBuffer.length} ms=${ms}`);

      logFallbackEvent({
        requestId,
        memberId: memberId || undefined,
        anonId,
        intendedProvider: ttsRouter.getConfiguredProvider(),
        actualProvider: 'openai',
        isFallback: isFailureFallback,
        reason: routerReason || (isFailureFallback ? 'local_fallback' : 'openai_design_select'),
        selectionReason,
        fallbackReason,
        latencyMs: ms,
        audioBytes: audioBuffer.length,
        textLength: text.length,
      });

      const actualSeconds = Math.ceil(ms / 1000) || estimatedSeconds;
      LimitsEnforcer.recordUsage({
        memberId: memberId || undefined,
        anonId,
        tier: memberTier,
        resource: 'voice_tts',
        amount: actualSeconds,
      }).catch(err => console.error(`[openai-tts:${requestId}] Usage recording failed:`, err));

      const voicePolicy = resolveVoicePolicy({
        localVoiceEnabled: ttsRouter.isLocalVoiceEnabled(),
        configuredProvider: ttsRouter.getConfiguredProvider(),
        cloudConsentAllowed: true,
      });

      return new Response(new Uint8Array(audioBuffer), {
        status: 200,
        headers: {
          "Content-Type": contentTypeForFormat(format),
          "Content-Length": audioBuffer.length.toString(),
          "Cache-Control": "no-store",
          "X-Request-Id": requestId,
          "X-TTS-Provider": "openai",
          "X-TTS-Fallback": isFailureFallback ? "1" : "0",
          "X-TTS-Selection-Reason": selectionReason,
          "X-TTS-Fallback-Reason": fallbackReason,
          "X-Voice-Policy": voicePolicy,
          "X-Voice-Archetype": effectiveArchetype,
          "X-PFI-Voice-Plan": ttsInstructions ? "1" : "0",
          "X-PFI-TTS-Text-Len": String(text?.length ?? 0),
        },
      });
    }
  } catch (err: any) {
    // This is the money: surface upstream details
    const status = err?.status ?? err?.response?.status ?? 500;

    // OpenAI SDK often provides err.error or err.response; keep it safe but informative
    const detail =
      err?.error?.message ??
      err?.message ??
      "Unknown TTS error";

    console.error(`[openai-tts:${requestId}] FAIL status=${status} detail=${detail}`);
    if (err?.error) console.error(`[openai-tts:${requestId}] error object:`, err.error);
    if (err?.response) console.error(`[openai-tts:${requestId}] response:`, err.response);
    if (err?.stack) console.error(err.stack);

    // Also log key presence for debugging
    console.log(`[openai-tts:${requestId}] OPENAI_API_KEY present?`, Boolean(process.env.OPENAI_API_KEY));
    console.log(`[openai-tts:${requestId}] OPENAI_API_KEY length:`, process.env.OPENAI_API_KEY?.length || 0);

    return jsonError("Failed to generate speech", status, {
      requestId,
      detail,
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({
    message: "OpenAI TTS endpoint active",
    voices: ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
    usage: 'POST with { "text": "...", "voice": "alloy", "format": "mp3" }'
  }), {
    headers: { "Content-Type": "application/json" },
  });
}
