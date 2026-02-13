/**
 * Local Voice Health Check — status of all sovereign voice services.
 *
 * Returns health of: Kokoro TTS, Whisper STT, Sesame (if configured).
 * This is the dashboard endpoint for "is my MAIA node's voice working?"
 */

import { healthCheckAll } from '@/lib/tts/ttsRouter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const t0 = Date.now();

  const ttsHealth = await healthCheckAll();

  // Check Whisper (STT) health too
  let whisperHealth: { healthy: boolean; url: string; error?: string; latencyMs?: number } | null = null;
  const whisperUrl = process.env.WHISPER_LOCAL_URL;

  if (whisperUrl) {
    const wt0 = Date.now();
    try {
      const response = await fetch(`${whisperUrl}/health`, {
        signal: AbortSignal.timeout(5_000),
      });
      whisperHealth = {
        healthy: response.ok,
        url: whisperUrl,
        latencyMs: Date.now() - wt0,
        ...(!response.ok && { error: `HTTP ${response.status}` }),
      };
    } catch (err: any) {
      whisperHealth = {
        healthy: false,
        url: whisperUrl,
        latencyMs: Date.now() - wt0,
        error: err?.message || 'Connection failed',
      };
    }
  }

  const allHealthy =
    (ttsHealth.kokoro?.healthy ?? true) &&
    (whisperHealth?.healthy ?? true) &&
    ttsHealth.openai.configured;

  const result = {
    status: allHealthy ? 'healthy' : 'degraded',
    totalMs: Date.now() - t0,
    localVoiceEnabled: ttsHealth.localVoiceEnabled,
    tts: {
      provider: ttsHealth.provider,
      kokoro: ttsHealth.kokoro,
      openai: ttsHealth.openai,
      sesame: ttsHealth.sesame,
    },
    stt: {
      whisper: whisperHealth,
    },
  };

  return new Response(JSON.stringify(result, null, 2), {
    status: allHealthy ? 200 : 503,
    headers: { 'Content-Type': 'application/json' },
  });
}
