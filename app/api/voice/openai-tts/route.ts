// backend: app/api/voice/openai-tts/route.ts
//
// SOVEREIGNTY FLIP (2026-03-28): Kokoro is default primary.
// This route tries Kokoro first via ttsRouter, then falls back to OpenAI.
// When OpenAI IS used (fallback or explicit), the Speech Director layer
// generates context-aware instructions for gpt-4o-mini-tts.
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
import { resolveStylePreset } from '@/lib/voice/agentToneMap';
import { buildOpenAIInstructions } from '@/lib/tts/prosody/openaiInstructions';
import { shapeForSpeech } from '@/lib/voice/textShaper';

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
    // SOVEREIGNTY FLIP (2026-03-28): All archetypes default to Kokoro.
    // OpenAI is fallback only (when Kokoro is unavailable).
    // Load member's archetype → resolve Kokoro voice → route through ttsRouter.
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

    // All archetypes go through ttsRouter (Kokoro primary)
    const voice = archetypeResolution.voice;
    console.log(`[openai-tts:${requestId}] archetype=${effectiveArchetype} → Kokoro ${voice} (sovereignty default)`);

    const t0 = Date.now();

    // ═══════════════════════════════════════════════════════════════════
    // SOVEREIGN LOCAL VOICE — KOKORO PRIMARY (2026-03-28)
    // All TTS goes through ttsRouter which defaults to Kokoro.
    // Prosody, text shaping, and cache are handled inside ttsRouter.
    // OpenAI fallback only triggers when Kokoro is down + consent allows.
    // ═══════════════════════════════════════════════════════════════════
    {
      try {
        const result = await ttsRouter.synthesize({
          text, voice, format: format as any, speed,
          voiceArchetype: effectiveArchetype,
        });
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
            "X-Voice-Archetype": effectiveArchetype,
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
    // OPENAI TTS — SPEECH DIRECTOR LAYER (fallback or explicit provider)
    //
    // When OpenAI IS used, drive it properly:
    //   1. Resolve style preset from agent/element/context
    //   2. Shape text for speech (clause breaking, cleanup)
    //   3. Build instruction-guided prosody for gpt-4o-mini-tts
    //
    // This turns OpenAI from a "renderer" into a "co-performer."
    // ═══════════════════════════════════════════════════════════════════
    if (!process.env.OPENAI_API_KEY) {
      return jsonError("Missing OPENAI_API_KEY on server", 500, { requestId });
    }

    // For Kokoro archetypes falling back to OpenAI, use alloy (Kokoro voice IDs aren't valid for OpenAI)
    const openaiVoice = archetypeResolution.provider === 'kokoro' ? 'alloy' : voice;

    // ── Speech Director: style preset → instructions ──
    const element = body?.voice ? undefined : 'earth'; // TODO: pass element from conductor when available
    const stylePreset = resolveStylePreset({
      agent: undefined, // TODO: pass agent context from request
      element: element as any,
    });
    const shapedText = shapeForSpeech(text);

    // Build instruction string: use client-provided ttsInstructions if present,
    // otherwise generate from style preset (Speech Director)
    const effectiveInstructions = ttsInstructions || buildOpenAIInstructions({
      preset: stylePreset,
      element: element as any,
    });

    // Always use gpt-4o-mini-tts (supports instructions field)
    const fallbackModel = "gpt-4o-mini-tts";
    console.log(`[openai-tts:${requestId}] FALLBACK model=${fallbackModel} voice=${openaiVoice} archetype=${effectiveArchetype} preset=${stylePreset} hasClientInstructions=${Boolean(ttsInstructions)} format=${format} chars=${shapedText.length}`);

    const fallbackSpeechParams: any = {
      model: fallbackModel,
      voice: openaiVoice,
      input: shapedText,
      response_format: format,
      speed,
      instructions: effectiveInstructions,
    };
    const speech = await getOpenAI().audio.speech.create(fallbackSpeechParams);

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
        "X-Voice-Archetype": effectiveArchetype,
        "X-Voice-Style-Preset": stylePreset,
        "X-Speech-Director": ttsInstructions ? "client" : "auto",
        "X-PFI-Voice-Plan": ttsInstructions ? "1" : "0",
        "X-PFI-TTS-Text-Len": String(shapedText?.length ?? 0),
      },
    });
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
