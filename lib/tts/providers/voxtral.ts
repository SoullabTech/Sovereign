/**
 * Voxtral TTS Provider — experimental local voice engine stub.
 *
 * DARK-LAUNCHED: Not wired into production routing.
 * Enable with MAIA_VOXTRAL_ENABLED=1 (default: disabled).
 *
 * Same interface as kokoro.ts — drop-in provider swap.
 * Hits a local Python FastAPI service at VOXTRAL_TTS_URL.
 *
 * LICENSING NOTE: Voxtral open-weights are CC BY-NC 4.0 (non-commercial).
 * Fine for prototyping and internal evaluation. Not suitable for
 * commercial production without a license change from Mistral.
 * For production, prefer Kokoro (Apache-2.0) or CSM-1B (Apache-2.0).
 *
 * See: docs/maia-voice-spec-v1.md § Engine Strategy
 */

const VOXTRAL_DEFAULT_URL = 'http://localhost:8882';

function getVoxtralUrl(): string {
  return process.env.VOXTRAL_TTS_URL || VOXTRAL_DEFAULT_URL;
}

export function isVoxtralEnabled(): boolean {
  return process.env.MAIA_VOXTRAL_ENABLED === '1';
}

export interface VoxtralSynthesisParams {
  text: string;
  voiceId?: string;
  stylePreset?: string;
  speed?: number;
}

/**
 * Synthesize speech via the local Voxtral service.
 */
export async function synthesize(params: VoxtralSynthesisParams): Promise<{
  audioBuffer: Buffer;
  contentType: string;
  provider: 'voxtral';
}> {
  const {
    text,
    voiceId = 'maia_default',
    stylePreset = 'grounded_reflective',
    speed = 1.0,
  } = params;

  const url = `${getVoxtralUrl()}/tts`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      voiceId,
      stylePreset,
      speed,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => 'Unknown error');
    throw new Error(`Voxtral TTS error ${response.status}: ${detail}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') || 'audio/wav';

  return { audioBuffer, contentType, provider: 'voxtral' };
}

/**
 * Check if the Voxtral service is reachable and healthy.
 */
export async function healthCheck(): Promise<{
  healthy: boolean;
  url: string;
  error?: string;
  latencyMs?: number;
}> {
  const url = getVoxtralUrl();
  const t0 = Date.now();

  try {
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5_000),
    });

    return {
      healthy: response.ok,
      url,
      latencyMs: Date.now() - t0,
      ...(!response.ok && { error: `HTTP ${response.status}` }),
    };
  } catch (err: any) {
    return {
      healthy: false,
      url,
      latencyMs: Date.now() - t0,
      error: err?.message || 'Connection failed',
    };
  }
}
