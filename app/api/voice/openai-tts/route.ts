// app/api/voice/openai-tts/route.ts
//
// SOVEREIGNTY: URL kept for frontend compatibility.
// All requests now route to Kokoro (local). OpenAI is not used.
// See lib/ai/openaiPolicy.ts for the zero-access doctrine.
//
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

  try {
    // ═══ IDENTITY RESOLUTION ═══
    const memberId = await getMemberIdFromRequest(req);
    const headerAnonId = req.headers.get('x-maia-anon-id') ?? undefined;
    const isAnon = !memberId;
    const anonId = isAnon
      ? (headerAnonId || `anon_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`)
      : undefined;

    // ═══ TIER-BASED LIMITS ═══
    const memberTier: MemberTier = isAnon ? 'free' : memberId ? await getMemberTier(memberId) : 'free';

    const body = await req.json().catch(() => null) as null | {
      text?: string;
      voice?: string;
      model?: string;
      format?: 'mp3' | 'wav' | 'opus' | 'aac' | 'flac';
      speed?: number;
      voiceHint?: import('@/lib/types/voiceIntent').VoiceIntent;
    };

    const text = body?.text?.trim();
    if (!text) return jsonError("Missing 'text' in request body", 400, { requestId });

    if (text.length > 4096) {
      return jsonError('Text too long (max 4096 chars for TTS)', 400, { requestId });
    }

    const estimatedSeconds = Math.ceil(text.length / 12.5);

    const limitsCheck = await LimitsEnforcer.checkUsage({
      memberId: memberId || undefined,
      anonId,
      tier: memberTier,
      resource: 'voice_tts',
      amount: estimatedSeconds,
    });

    if (limitsCheck.action === 'block') {
      return new Response(
        JSON.stringify({ error: limitsCheck.message, blocked: true, tier: memberTier, requestId }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const voice = body?.voice ?? undefined;
    const format = (body?.format ?? 'mp3') as 'mp3' | 'wav' | 'opus';
    const speed = body?.speed ?? 1.0;
    const voiceHint = body?.voiceHint ?? undefined;

    const t0 = Date.now();

    // ═══ SOVEREIGN LOCAL VOICE ═══
    let result: Awaited<ReturnType<typeof ttsRouter.synthesize>>;
    try {
      result = await ttsRouter.synthesize({ text, voice, format, speed, voiceHint });
    } catch (err: any) {
      console.error(`[tts:${requestId}] Provider unavailable: ${err.message}`);

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

      return jsonError(
        'Voice synthesis unavailable. Kokoro is not running or unreachable.',
        503,
        { requestId, detail: err.message }
      );
    }

    const ms = Date.now() - t0;

    logFallbackEvent({
      requestId,
      memberId: memberId || undefined,
      anonId,
      intendedProvider: 'kokoro',
      actualProvider: result.provider,
      isFallback: false,
      reason: result.reason || 'local_success',
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
    }).catch((err) => console.error(`[tts:${requestId}] Usage recording failed:`, err));

    const policy = resolveVoicePolicy({
      localVoiceEnabled: true,
      configuredProvider: ttsRouter.getConfiguredProvider(),
      cloudConsentAllowed: false,
    });

    return new Response(new Uint8Array(result.audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Content-Length': result.audioBuffer.length.toString(),
        'Cache-Control': 'no-store',
        'X-Request-Id': requestId,
        'X-TTS-Provider': result.provider,
        'X-TTS-Fallback': '0',
        'X-Voice-Policy': policy,
      },
    });
  } catch (err: any) {
    console.error(`[tts:${requestId}] Unexpected error: ${err.message}`);
    return jsonError('Failed to generate speech', 500, { requestId, detail: err.message });
  }
}

export async function GET() {
  const health = await ttsRouter.healthCheckAll();
  return new Response(
    JSON.stringify({
      message: 'MAIA TTS endpoint — sovereign voice only',
      provider: health.provider,
      kokoro: health.kokoro,
      policy: 'local-only',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
