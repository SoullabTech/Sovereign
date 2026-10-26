import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminUnauthorized, checkAdminAuth } from '@/lib/admin/adminAuth';
import { healthCheckAll } from '@/lib/tts/ttsRouter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type HealthStatus = 'up' | 'down' | 'not-configured';

function statusOf(
  value: { healthy?: boolean } | null | undefined,
): HealthStatus {
  if (!value) return 'not-configured';
  return value.healthy ? 'up' : 'down';
}

/**
 * Administrative local-voice health summary.
 *
 * The provider helpers may know internal URLs and error details, but this route
 * deliberately returns neither. It is independently admin-gated in addition to
 * its explicit access-matrix rule and is never cacheable.
 */
export async function GET(req: NextRequest) {
  const auth = await checkAdminAuth(
    req,
    ['founder', 'cto', 'operations'],
    '/api/health/local-voice',
  );
  if (!auth.authed) return adminUnauthorized();

  const t0 = Date.now();
  const ttsHealth = await healthCheckAll();

  let whisper: { status: HealthStatus; latencyMs?: number } = {
    status: 'not-configured',
  };
  const whisperUrl = process.env.WHISPER_LOCAL_URL;
  if (whisperUrl) {
    const startedAt = Date.now();
    try {
      const response = await fetch(`${whisperUrl}/health`, {
        signal: AbortSignal.timeout(5_000),
      });
      whisper = {
        status: response.ok ? 'up' : 'down',
        latencyMs: Date.now() - startedAt,
      };
    } catch {
      whisper = {
        status: 'down',
        latencyMs: Date.now() - startedAt,
      };
    }
  }

  const kokoro = {
    status: statusOf(ttsHealth.kokoro),
    ...(ttsHealth.kokoro?.latencyMs != null
      ? { latencyMs: ttsHealth.kokoro.latencyMs }
      : {}),
  };
  const sesame = {
    status: ttsHealth.sesame?.configured ? 'up' : 'not-configured',
  } as const;
  const pplex = {
    status: statusOf(ttsHealth.pplex),
    ...(ttsHealth.pplex?.latencyMs != null
      ? { latencyMs: ttsHealth.pplex.latencyMs }
      : {}),
  };

  const selectedTtsHealthy =
    ttsHealth.provider === 'sesame'
      ? sesame.status === 'up'
      : ttsHealth.provider === 'pplex'
        ? pplex.status === 'up'
        : kokoro.status === 'up';
  const allHealthy = selectedTtsHealthy && whisper.status === 'up';

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      totalMs: Date.now() - t0,
      localVoiceEnabled: ttsHealth.localVoiceEnabled,
      deploymentContext: ttsHealth.deploymentContext,
      selectedProvider: ttsHealth.provider,
      tts: { kokoro, sesame, pplex },
      stt: { whisper },
    },
    {
      status: allHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
