// backend: app/api/voice/openai-tts/route.ts
import OpenAI from "openai";
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { LimitsEnforcer, getMemberTier, type MemberTier } from '@/lib/limits/LimitsEnforcer';
import { NextRequest } from 'next/server';

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
    if (!process.env.OPENAI_API_KEY) {
      return jsonError("Missing OPENAI_API_KEY on server", 500, { requestId });
    }

    // ═══ IDENTITY RESOLUTION ═══
    const memberId = await getMemberIdFromRequest(req);
    // Use stable anon ID from client header (persisted in localStorage) instead of random per-request ID
    // This ensures Free tier usage actually accumulates across requests
    const headerAnonId = req.headers.get('x-maia-anon-id') ?? undefined;
    const anonId = memberId ? undefined : (headerAnonId || `anon_${requestId.slice(0, 8)}`);
    const isAnon = !memberId;

    // ═══ TIER-BASED LIMITS CHECK ═══
    const memberTier: MemberTier = isAnon ? 'free' : memberId ? await getMemberTier(memberId) : 'free';

    // Estimate TTS duration: ~150 words/min at average pace, ~5 chars/word
    // So roughly 750 chars/min → ~12.5 chars/sec → estimate seconds from text length
    const body = await req.json().catch(() => null) as null | {
      text?: string;
      voice?: string;
      model?: string;
      format?: "mp3" | "wav" | "opus" | "aac" | "flac";
      speed?: number;
    };

    const text = body?.text?.trim();
    if (!text) return jsonError("Missing 'text' in request body", 400, { requestId });

    // Estimate duration for pre-check (refine after actual synthesis)
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
        upgradeHint: 'upgradeHint' in limitsCheck ? limitsCheck.upgradeHint : undefined,
        requestId,
      }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Default to tts-1 for stability; can use tts-1-hd or gpt-4o-mini-tts if desired
    const model = body?.model ?? "tts-1";
    const voice = body?.voice ?? "alloy";
    const format = body?.format ?? "mp3";
    const speed = body?.speed ?? 1.0;

    // OpenAI audio/speech supports max 4096 chars
    if (text.length > 4096) {
      return jsonError("Text too long (max 4096 chars for TTS)", 400, { requestId });
    }

    const t0 = Date.now();

    console.log(`[openai-tts:${requestId}] starting model=${model} voice=${voice} format=${format} chars=${text.length}`);

    const speech = await getOpenAI().audio.speech.create({
      model,
      voice: voice as any,
      input: text,
      response_format: format,
      speed,
    });

    const audioBuffer = Buffer.from(await speech.arrayBuffer());
    const ms = Date.now() - t0;

    // Helpful server logs (you'll see these in Docker/server logs)
    console.log(`[openai-tts:${requestId}] ok model=${model} voice=${voice} format=${format} bytes=${audioBuffer.length} ms=${ms}`);

    // ═══ RECORD VOICE USAGE (non-blocking) ═══
    // Use actual synthesis time as a proxy for audio duration
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

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "no-store",
        "X-Request-Id": requestId,
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
