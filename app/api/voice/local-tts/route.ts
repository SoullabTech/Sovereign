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
import { logFallbackEvent, resolveVoicePolicy } from '@/lib/tts/voiceSovereignty';

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

  // Under zero-OpenAI policy, local voice is always required.
  // isLocalVoiceEnabled() defaults true; only disabled by MAIA_LOCAL_VOICE_ENABLED=0.
  if (!ttsRouter.isLocalVoiceEnabled()) {
    return jsonError('Local voice explicitly disabled (MAIA_LOCAL_VOICE_ENABLED=0). No cloud fallback available.', 503, {
      requestId,
      hint: 'Remove MAIA_LOCAL_VOICE_ENABLED=0 or set it to 1 to enable Kokoro TTS.',
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
    const voice = body?.voice ?? 'af_heart';
    const format = body?.format ?? 'mp3';
    const speed = body?.speed ?? 1.0;

    console.log(`[local-tts:${requestId}] starting provider=${ttsRouter.getConfiguredProvider()} voice=${voice} chars=${text.length}`);

    // Zero-OpenAI policy: local-only, no cloud fallback.
    const voicePolicy = resolveVoicePolicy({
      localVoiceEnabled: true,
      configuredProvider: ttsRouter.getConfiguredProvider(),
      cloudConsentAllowed: false,
    });

    let audioBuffer: Buffer;
    let contentType: string;
    let provider: string;

    try {
      const result = await ttsRouter.synthesize({ text, voice, format, speed });
      audioBuffer = result.audioBuffer;
      contentType = result.contentType;
      provider = result.provider;
    } catch (err) {
      logFallbackEvent({
        requestId,
        memberId: memberId || undefined,
        anonId,
        intendedProvider: 'kokoro',
        actualProvider: 'none',
        isFallback: false,
        reason: 'provider_unavailable',
        textLength: text.length,
      });
      return jsonError('Local voice engine is offline. Kokoro is not running or unreachable.', 503, { requestId });
    }

    const ms = Date.now() - t0;
    console.log(`[local-tts:${requestId}] ok provider=${provider} policy=${voicePolicy} voice=${voice} bytes=${audioBuffer.length} ms=${ms}`);

    // ═══ SOVEREIGNTY AUDIT (fire-and-forget) ═══
    logFallbackEvent({
      requestId,
      memberId: memberId || undefined,
      anonId,
      intendedProvider: 'kokoro',
      actualProvider: provider,
      isFallback: false,
      reason: 'local_success',
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
