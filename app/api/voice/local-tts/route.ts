/**
 * Local TTS API Route — sovereign voice synthesis.
 *
 * Same interface as /api/voice/openai-tts but routes through
 * the local TTS provider (Kokoro) when MAIA_LOCAL_VOICE_ENABLED=1.
 *
 * Falls back to OpenAI TTS only if:
 *   1. Local provider is unavailable, AND
 *   2. Cloud consent allows it (per-member + global)
 *
 * SOVEREIGNTY: When this route succeeds via Kokoro, no audio data
 * leaves the machine. Headers tell the truth about what happened:
 *   X-TTS-Provider  — which engine generated the audio
 *   X-TTS-Fallback  — 1 if local failed and cloud was used
 *   X-Voice-Policy   — the sovereignty policy in effect
 */

import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { LimitsEnforcer, getMemberTier, type MemberTier } from '@/lib/limits/LimitsEnforcer';
import { NextRequest } from 'next/server';
import * as ttsRouter from '@/lib/tts/ttsRouter';
import { TTSFallbackToOpenAI } from '@/lib/tts/ttsRouter';
import { synthesizeSpeech } from '@/lib/tts/openaiTts';
import { logFallbackEvent, checkCloudConsent, resolveVoicePolicy } from '@/lib/tts/voiceSovereignty';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonError(message: string, status = 500, extra?: Record<string, unknown>) {
  return new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  // Gate: if local voice is not enabled, redirect to existing OpenAI route
  if (!ttsRouter.isLocalVoiceEnabled()) {
    return jsonError('Local voice not enabled. Use /api/voice/openai-tts instead.', 404, {
      requestId,
      hint: 'Set MAIA_LOCAL_VOICE_ENABLED=1 to enable local TTS',
    });
  }

  try {
    // ═══ IDENTITY RESOLUTION ═══
    const memberId = await getMemberIdFromRequest(req);
    const headerAnonId = req.headers.get('x-maia-anon-id') ?? undefined;
    const isAnon = !memberId;
    const anonId = isAnon ? (headerAnonId || `anon_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`) : undefined;

    // ═══ TIER-BASED LIMITS CHECK ═══
    const memberTier: MemberTier = isAnon ? 'free' : memberId ? await getMemberTier(memberId) : 'free';

    const body = await req.json().catch(() => null) as null | {
      text?: string;
      voice?: string;
      format?: 'mp3' | 'wav' | 'opus';
      speed?: number;
    };

    const text = body?.text?.trim();
    if (!text) return jsonError("Missing 'text' in request body", 400, { requestId });
    if (text.length > 4096) return jsonError('Text too long (max 4096 chars)', 400, { requestId });

    const estimatedSeconds = Math.ceil(text.length / 12.5);

    const limitsCheck = await LimitsEnforcer.checkUsage({
      memberId: memberId || undefined,
      anonId,
      tier: memberTier,
      resource: 'voice_tts',
      amount: estimatedSeconds,
    });

    if (limitsCheck.action === 'block') {
      return new Response(JSON.stringify({
        error: limitsCheck.message,
        blocked: true,
        tier: memberTier,
        requestId,
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const t0 = Date.now();
    const voice = body?.voice ?? 'af_kore';
    const format = body?.format ?? 'mp3';
    const speed = body?.speed ?? 1.0;

    console.log(`[local-tts:${requestId}] starting provider=${ttsRouter.getConfiguredProvider()} voice=${voice} chars=${text.length}`);

    // ═══ CONSENT RESOLUTION ═══
    const localOnlyHeader = req.headers.get('x-voice-local-only') === '1';
    const cloudConsent = await checkCloudConsent({
      memberId: memberId || undefined,
      localOnlyHeader,
    });

    const voicePolicy = resolveVoicePolicy({
      localVoiceEnabled: ttsRouter.isLocalVoiceEnabled(),
      configuredProvider: ttsRouter.getConfiguredProvider(),
      cloudConsentAllowed: cloudConsent.allowed,
    });

    let audioBuffer: Buffer;
    let contentType: string;
    let provider: string;
    let fallback = false;
    let fallbackReason: string | undefined;

    try {
      const result = await ttsRouter.synthesize({ text, voice, format, speed });
      audioBuffer = result.audioBuffer;
      contentType = result.contentType;
      provider = result.provider;
      fallback = result.fallback;
    } catch (err) {
      if (err instanceof TTSFallbackToOpenAI) {
        fallback = err.isFallback;
        fallbackReason = err.reason;

        // ═══ CONSENT GATE ═══
        // If cloud is not allowed, fail closed — truth over convenience
        if (fallback && !cloudConsent.allowed) {
          // Log the blocked fallback for sovereignty accounting
          logFallbackEvent({
            requestId,
            memberId: memberId || undefined,
            anonId,
            intendedProvider: ttsRouter.getConfiguredProvider(),
            actualProvider: 'none',
            isFallback: true,
            reason: `consent_denied:${cloudConsent.reason}`,
            textLength: text.length,
          });

          return jsonError(
            'Local voice unavailable and cloud fallback is not permitted',
            503,
            {
              requestId,
              policy: voicePolicy,
              consentReason: cloudConsent.reason,
              hint: voicePolicy === 'local-only'
                ? 'Local TTS is down. Enable cloud fallback or wait for local recovery.'
                : 'Cloud voice consent is disabled for this account.',
            }
          );
        }

        provider = 'openai';

        if (!process.env.OPENAI_API_KEY) {
          return jsonError('Local TTS unavailable and no OpenAI API key configured', 503, { requestId });
        }

        console.log(`[local-tts:${requestId}] ${fallback ? 'falling back' : 'routing'} to OpenAI TTS (reason=${fallbackReason})`);
        const speech = await synthesizeSpeech({ text, voice, format, speed });
        audioBuffer = Buffer.from(await speech.arrayBuffer());
        contentType = format === 'mp3' ? 'audio/mpeg'
          : format === 'wav' ? 'audio/wav'
          : format === 'opus' ? 'audio/opus'
          : 'application/octet-stream';
      } else {
        throw err;
      }
    }

    const ms = Date.now() - t0;
    console.log(`[local-tts:${requestId}] ok provider=${provider} fallback=${fallback} policy=${voicePolicy} voice=${voice} bytes=${audioBuffer.length} ms=${ms}`);

    // ═══ SOVEREIGNTY AUDIT (fire-and-forget) ═══
    logFallbackEvent({
      requestId,
      memberId: memberId || undefined,
      anonId,
      intendedProvider: ttsRouter.getConfiguredProvider() === 'auto' ? 'kokoro' : ttsRouter.getConfiguredProvider(),
      actualProvider: provider,
      isFallback: fallback,
      reason: fallback ? fallbackReason : 'local_success',
      latencyMs: ms,
      audioBytes: audioBuffer.length,
      textLength: text.length,
    });

    // Record usage (non-blocking)
    const actualSeconds = Math.ceil(ms / 1000) || estimatedSeconds;
    LimitsEnforcer.recordUsage({
      memberId: memberId || undefined,
      anonId,
      tier: memberTier,
      resource: 'voice_tts',
      amount: actualSeconds,
    }).catch(err => console.error(`[local-tts:${requestId}] Usage recording failed:`, err));

    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'no-store',
        'X-Request-Id': requestId,
        'X-TTS-Provider': provider,
        'X-TTS-Fallback': fallback ? '1' : '0',
        'X-Voice-Policy': voicePolicy,
      },
    });
  } catch (err: any) {
    const status = err?.status ?? 500;
    const detail = err?.message ?? 'Unknown TTS error';
    console.error(`[local-tts:${requestId}] FAIL status=${status} detail=${detail}`);
    return jsonError('Failed to generate speech', status, { requestId, detail });
  }
}

export async function GET() {
  const status = ttsRouter.isLocalVoiceEnabled();
  return new Response(JSON.stringify({
    message: status ? 'Local TTS endpoint active' : 'Local TTS not enabled',
    enabled: status,
    provider: ttsRouter.getConfiguredProvider(),
    usage: 'POST with { "text": "...", "voice": "af_heart", "format": "mp3" }',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
