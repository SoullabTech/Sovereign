/**
 * Admin Voice Lab — synthesize a fixed passage through a CHOSEN provider.
 *
 * POST { provider, voice?, text, speed? } → { audioBase64, contentType, provenance }
 *
 * Admin-gated (LABTOOLS_ADMIN_PASSWORD via isAdminRequest). Deterministic:
 * `providerOverride` forces the engine, still subject to the R15 qualification
 * guard — so on a production-context process this route refuses openai/pplex even
 * for an admin (the Lab is never a production egress bypass). Intended to run on
 * the Mac Studio lab stack (MAIA_DEPLOYMENT_CONTEXT=voice-quality-lab).
 *
 * Evaluation integrity: a chosen LOCAL provider that fails returns an honest 503
 * with the reason — it is NOT silently substituted with OpenAI, which would
 * corrupt a blind comparison. The one intended cloud path is provider==='openai'.
 *
 * NOT member-facing. Sends `voice` (concrete id) + `providerOverride`, never
 * `voiceArchetype` — the archetype→provider coupling would defeat deterministic
 * per-engine selection. Archetype is a Lab display grouping only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin/requireAdmin';
import * as ttsRouter from '@/lib/tts/ttsRouter';
import { synthesizeSpeech } from '@/lib/tts/openaiTts';

export const dynamic = 'force-dynamic';

const TEXT_MAX = 1200;
const SPEED_MIN = 0.5;
const SPEED_MAX = 2.0;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type LabProvider = 'openai' | 'kokoro' | 'sesame' | 'pplex';
const LAB_PROVIDERS: LabProvider[] = ['openai', 'kokoro', 'sesame', 'pplex'];

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { provider?: string; voice?: string; text?: string; speed?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const provider = body.provider as LabProvider;
  if (!LAB_PROVIDERS.includes(provider)) {
    return NextResponse.json(
      { error: `provider must be one of ${LAB_PROVIDERS.join(', ')}` },
      { status: 400 },
    );
  }

  const text = body.text?.trim();
  if (!text || text.length > TEXT_MAX) {
    return NextResponse.json(
      { error: `text is required and must be <= ${TEXT_MAX} chars` },
      { status: 400 },
    );
  }
  const voice = body.voice?.trim() || undefined;
  const speed = clamp(body.speed ?? 1.0, SPEED_MIN, SPEED_MAX);

  const started = Date.now();
  try {
    const result = await ttsRouter.synthesize({
      text,
      voice,
      speed,
      format: 'mp3',
      providerOverride: provider,
    });
    return NextResponse.json({
      audioBase64: result.audioBuffer.toString('base64'),
      contentType: result.contentType,
      provenance: {
        provider: result.provider,
        requestedProvider: provider,
        voice: voice ?? null,
        fallback: result.fallback,
        reason: result.reason,
        latencyMs: Date.now() - started,
      },
    });
  } catch (err: any) {
    // R15 refusal: provider not qualified for this deployment context.
    if (err?.name === 'ProviderNotQualifiedError') {
      return NextResponse.json(
        { error: `provider "${err.provider}" is not qualified for context "${err.context}"`, refused: true },
        { status: 403 },
      );
    }

    // Router routing signal (openai path OR a failed local provider).
    if (err?.name === 'TTSFallbackToOpenAI') {
      // Intended OpenAI render (openai_primary / archetype_openai): isFallback === false.
      if (err.isFallback === false && provider === 'openai') {
        try {
          const speech = await synthesizeSpeech({ text, voice: voice || 'alloy', format: 'mp3', speed });
          const audioBuffer = Buffer.from(await speech.arrayBuffer());
          return NextResponse.json({
            audioBase64: audioBuffer.toString('base64'),
            contentType: 'audio/mpeg',
            provenance: {
              provider: 'openai',
              requestedProvider: 'openai',
              voice: voice ?? 'alloy',
              fallback: false,
              reason: err.reason || 'openai_primary',
              latencyMs: Date.now() - started,
            },
          });
        } catch (openaiErr: any) {
          return NextResponse.json(
            { error: 'OpenAI synthesis failed', detail: openaiErr?.message },
            { status: 503 },
          );
        }
      }

      // A chosen LOCAL provider failed → honest error, no silent OpenAI substitution.
      return NextResponse.json(
        {
          error: `provider "${provider}" is unavailable`,
          reason: err.reason,
          hint: provider === 'pplex'
            ? 'PersonaPlex (MLX) must be running on this host — lab stack only'
            : `${provider} service unreachable`,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: 'Synthesis failed', detail: err?.message }, { status: 500 });
  }
}
