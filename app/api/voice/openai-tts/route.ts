// backend: app/api/voice/openai-tts/route.ts
//
// SOVEREIGNTY: When MAIA_LOCAL_VOICE_ENABLED=1, this route tries Kokoro (local)
// first before falling back to OpenAI. The frontend doesn't need to change —
// all existing calls to /api/voice/openai-tts automatically get local voice.
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
import { runWithTTSDeadline, TTSDeadlineExceeded } from '@/lib/voice/ttsDeadline';

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

// VOICE-TTS-REQUEST-DEADLINE-01 — see lib/voice/ttsDeadline.ts for the
// witnessed failure this bounds and why 20s is the number.
async function createSpeechWithDeadline(params: any, requestId: string) {
  return runWithTTSDeadline(
    (signal) => getOpenAI().audio.speech.create(params, { signal }),
    requestId
  );
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

    const rawVoice = body?.voice ?? "alloy";
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
    // ARCHETYPE-AWARE VOICE ROUTING
    // MAIA vow: default voice is always maia_core (OpenAI Alloy).
    // Load member's archetype → resolve provider → route accordingly.
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

    // If archetype routes to OpenAI (MAIA feminine voices), skip Kokoro entirely
    if (archetypeResolution.provider === 'openai') {
      const voice = archetypeResolution.voice;
      const t0 = Date.now();
      console.log(`[openai-tts:${requestId}] archetype=${effectiveArchetype} → OpenAI ${voice} (skipping Kokoro)`);

      if (!process.env.OPENAI_API_KEY) {
        return jsonError("Missing OPENAI_API_KEY on server", 500, { requestId });
      }

      const speechParams: any = {
        // gpt-4o-mini-tts is MAIA's default voice model (supports instructions + better quality)
        // Client can override via body.model; ttsInstructions always requires gpt-4o-mini-tts
        model: ttsInstructions ? "gpt-4o-mini-tts" : (body?.model ?? "gpt-4o-mini-tts"),
        voice: voice,
        input: text,
        response_format: format,
        speed,
        ...(ttsInstructions ? { instructions: ttsInstructions } : {}),
      };
      const speech = await createSpeechWithDeadline(speechParams, requestId);

      const audioBuffer = Buffer.from(await speech.arrayBuffer());
      const ms = Date.now() - t0;

      console.log(`[openai-tts:${requestId}] ARCHETYPE provider=openai voice=${voice} archetype=${effectiveArchetype} hasInstructions=${Boolean(ttsInstructions)} bytes=${audioBuffer.length} ms=${ms}`);

      const actualSeconds = Math.ceil(ms / 1000) || estimatedSeconds;
      LimitsEnforcer.recordUsage({
        memberId: memberId || undefined,
        anonId,
        tier: memberTier,
        resource: 'voice_tts',
        amount: actualSeconds,
      }).catch(err => console.error(`[openai-tts:${requestId}] Usage recording failed:`, err));

      const contentType =
        format === "mp3" ? "audio/mpeg"
        : format === "wav" ? "audio/wav"
        : format === "opus" ? "audio/opus"
        : format === "aac" ? "audio/aac"
        : format === "flac" ? "audio/flac"
        : "application/octet-stream";

      return new Response(new Uint8Array(audioBuffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": audioBuffer.length.toString(),
          "Cache-Control": "no-store",
          "X-Request-Id": requestId,
          "X-TTS-Provider": "openai",
          "X-TTS-Fallback": "0",
          "X-Voice-Archetype": effectiveArchetype,
          "X-PFI-Voice-Plan": ttsInstructions ? "1" : "0",  // Observability: 0 = sovereignty leak
          "X-PFI-TTS-Text-Len": String(text?.length ?? 0),
        },
      });
    }

    // Kokoro archetype (Atlas, Puck) — use voice from archetype, not from client
    const voice = archetypeResolution.voice;
    console.log(`[openai-tts:${requestId}] archetype=${effectiveArchetype} → Kokoro ${voice}`);

    const t0 = Date.now();

    // ═══════════════════════════════════════════════════════════════════
    // SOVEREIGN LOCAL VOICE INTERCEPT
    // Only attempt Kokoro when explicitly configured as the primary provider.
    // Default ('auto') now routes directly to OpenAI for reliability.
    // Set MAIA_TTS_PROVIDER=kokoro to re-enable local-first routing.
    // ═══════════════════════════════════════════════════════════════════
    const configuredProvider = ttsRouter.getConfiguredProvider();
    const useLocalFirst = ttsRouter.isLocalVoiceEnabled() && configuredProvider === 'kokoro';
    if (useLocalFirst) {
      try {
        const result = await ttsRouter.synthesize({ text, voice, format: format as any, speed });
        const ms = Date.now() - t0;

        console.log(`[openai-tts:${requestId}] LOCAL provider=${result.provider} voice=${voice} bytes=${result.audioBuffer.length} ms=${ms}`);

        // Audit: log the successful local synthesis
        logFallbackEvent({
          requestId,
          memberId: memberId || undefined,
          anonId,
          intendedProvider: 'kokoro',
          actualProvider: result.provider,
          isFallback: false,
          reason: 'local_success',
          latencyMs: ms,
          audioBytes: result.audioBuffer.length,
          textLength: text.length,
        });

        // Record usage
        const actualSeconds = Math.ceil(ms / 1000) || estimatedSeconds;
        LimitsEnforcer.recordUsage({
          memberId: memberId || undefined,
          anonId,
          tier: memberTier,
          resource: 'voice_tts',
          amount: actualSeconds,
        }).catch(err => console.error(`[openai-tts:${requestId}] Usage recording failed:`, err));

        const localPolicy = resolveVoicePolicy({
          localVoiceEnabled: true,
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
            "X-Voice-Policy": localPolicy,
            "X-PFI-Voice-Plan": ttsInstructions ? "1" : "0",
            "X-PFI-TTS-Text-Len": String(text?.length ?? 0),
          },
        });
      } catch (localErr: any) {
        // Local failed — check consent before falling through to OpenAI
        const localOnlyHeader = req.headers.get('x-voice-local-only') === '1';
        const cloudConsent = await checkCloudConsent({
          memberId: memberId || undefined,
          localOnlyHeader,
        });

        if (!cloudConsent.allowed) {
          logFallbackEvent({
            requestId,
            memberId: memberId || undefined,
            anonId,
            intendedProvider: 'kokoro',
            actualProvider: 'none',
            isFallback: true,
            reason: `consent_denied:${cloudConsent.reason}`,
            textLength: text.length,
          });

          return jsonError('Local voice unavailable and cloud fallback is not permitted', 503, {
            requestId,
            policy: 'local-only',
          });
        }

        // Log the fallback
        logFallbackEvent({
          requestId,
          memberId: memberId || undefined,
          anonId,
          intendedProvider: 'kokoro',
          actualProvider: 'openai',
          isFallback: true,
          reason: localErr?.reason || 'kokoro_error',
          textLength: text.length,
        });

        console.warn(`[openai-tts:${requestId}] Local TTS failed, falling through to OpenAI: ${localErr?.message}`);
        // Fall through to existing OpenAI logic below
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // OPENAI TTS (original path, or fallback from local)
    // ═══════════════════════════════════════════════════════════════════
    if (!process.env.OPENAI_API_KEY) {
      return jsonError("Missing OPENAI_API_KEY on server", 500, { requestId });
    }

    // For Kokoro archetypes falling back to OpenAI, use alloy (Kokoro voice IDs aren't valid for OpenAI)
    const openaiVoice = archetypeResolution.provider === 'kokoro' ? 'alloy' : voice;
    const fallbackModel = ttsInstructions ? "gpt-4o-mini-tts" : (body?.model ?? "gpt-4o-mini-tts");
    console.log(`[openai-tts:${requestId}] FALLBACK model=${fallbackModel} voice=${openaiVoice} archetype=${effectiveArchetype} hasInstructions=${Boolean(ttsInstructions)} format=${format} chars=${text.length}`);

    const fallbackSpeechParams: any = {
      model: fallbackModel,
      voice: openaiVoice,
      input: text,
      response_format: format,
      speed,
      ...(ttsInstructions ? { instructions: ttsInstructions } : {}),
    };
    const speech = await createSpeechWithDeadline(fallbackSpeechParams, requestId);

    const audioBuffer = Buffer.from(await speech.arrayBuffer());
    const ms = Date.now() - t0;

    console.log(`[openai-tts:${requestId}] ok model=${fallbackModel} voice=${voice} format=${format} bytes=${audioBuffer.length} ms=${ms}`);

    // ═══ RECORD VOICE USAGE (non-blocking) ═══
    const actualSeconds = Math.ceil(ms / 1000) || estimatedSeconds;
    LimitsEnforcer.recordUsage({
      memberId: memberId || undefined,
      anonId,
      tier: memberTier,
      resource: 'voice_tts',
      amount: actualSeconds,
    }).catch(err => console.error(`[openai-tts:${requestId}] Usage recording failed:`, err));

    const contentType =
      format === "mp3" ? "audio/mpeg"
      : format === "wav" ? "audio/wav"
      : format === "opus" ? "audio/opus"
      : format === "aac" ? "audio/aac"
      : format === "flac" ? "audio/flac"
      : "application/octet-stream";

    const isFallbackFromLocal = ttsRouter.isLocalVoiceEnabled();

    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "no-store",
        "X-Request-Id": requestId,
        "X-TTS-Provider": "openai",
        "X-TTS-Fallback": isFallbackFromLocal ? "1" : "0",
        "X-Voice-Policy": isFallbackFromLocal ? "local-prefer" : "cloud-primary",
        "X-PFI-Voice-Plan": ttsInstructions ? "1" : "0",
        "X-PFI-TTS-Text-Len": String(text?.length ?? 0),
      },
    });
  } catch (err: any) {
    // VOICE-TTS-REQUEST-DEADLINE-01: an abandoned generation is a bounded,
    // truthful failure — not an upstream error to be re-narrated. The member
    // keeps MAIA's text; only the optional audio is withdrawn.
    //
    // Note: usage is recorded only on the success path, so an abandoned
    // generation bills nothing. That is a consequence of abandonment, not a
    // change to the quota formula (see VOICE-QUOTA-BILLS-LATENCY-01, parked).
    if (err instanceof TTSDeadlineExceeded) {
      return jsonError("Voice is taking too long right now", 504, {
        requestId,
        voiceUnavailable: true,
        reason: "deadline_exceeded",
        deadlineMs: err.deadlineMs,
        elapsedMs: err.elapsedMs,
      });
    }

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
