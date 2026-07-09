/**
 * Sesame CSM TTS Provider — local, sovereign text-to-speech.
 *
 * Sesame CSM (Coqui-based) exposes a FastAPI /tts endpoint that accepts
 * structured voice + element context and returns base64-encoded audio.
 *
 * SOVEREIGNTY: A *real* Sesame CSM backend keeps audio local. But the endpoint
 * behind SESAME_TTS_URL is only sovereign if the backend says so — a gTTS
 * placeholder can sit at the same URL and egress to Google. This adapter must
 * therefore NEVER stamp `provider: 'sesame'` on audio it did not verify came
 * from a sovereign Sesame backend. The provenance guard below enforces that:
 * the backend must self-report a sesame/csm `service` and `sovereign !== false`,
 * or synthesis is refused. (See docs/specs/VOICE_FUNCTION_TAXONOMY_2026-07-07.md §B.)
 *
 * Default endpoint: http://localhost:8881 (Docker: http://sesame-tts:8000)
 * Env override: SESAME_TTS_URL
 *
 * API shape (POST /tts):
 *   { text, voice, format, speed, element?, context? }
 *   → { success, audio (base64), duration_ms, service, sovereign?, shaped_text, ... }
 */

const SESAME_DEFAULT_URL = 'http://localhost:8881';

function getSesameUrl(): string {
  return process.env.SESAME_TTS_URL || SESAME_DEFAULT_URL;
}

export interface SesameSynthesisParams {
  text: string;
  voice?: string;
  format?: 'mp3' | 'wav' | 'opus';
  speed?: number;
  /** Elemental context for voice shaping: fire | water | earth | air | aether */
  element?: string;
  /** Conversational context: guidance | reassurance | exploration */
  context?: string;
}

/**
 * Synthesize speech via Sesame CSM.
 * Returns raw audio buffer + content type, same shape as kokoro provider.
 */
export async function synthesize(params: SesameSynthesisParams): Promise<{
  audioBuffer: Buffer;
  contentType: string;
  provider: 'sesame';
}> {
  const {
    text,
    voice = 'maya',
    format = 'mp3',
    speed = 1.0,
    element,
    context,
  } = params;

  const url = `${getSesameUrl()}/tts`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice, format, speed, element, context }),
    // Default 20s; override via SESAME_TIMEOUT_MS for the lab, where genuine csm-1b
    // on CPU can take ~15-30s/passage (production sesame is not qualified anyway).
    signal: AbortSignal.timeout(Number(process.env.SESAME_TIMEOUT_MS) || 20_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => 'Unknown error');
    throw new Error(`Sesame TTS error ${response.status}: ${detail}`);
  }

  const data = await response.json();

  if (!data.success || !data.audio) {
    throw new Error(`Sesame TTS returned no audio: ${JSON.stringify(data)}`);
  }

  // ── Provenance guard ──────────────────────────────────────────────────────
  // Refuse to label this buffer `provider: 'sesame'` unless the backend that
  // served it actually is a sovereign Sesame backend. A backend that admits it
  // is non-sovereign (`sovereign === false`, e.g. a gTTS cloud placeholder) or
  // that reports a non-sesame service identity is rejected — silent mislabeling
  // is worse than an outright failure.
  const reportedService = String(data.service ?? '').toLowerCase();
  if (data.sovereign === false) {
    throw new Error(
      `Sesame provenance violation: backend at ${getSesameUrl()} reports sovereign=false ` +
        `(service="${data.service}", vendor="${data.cloud_vendor ?? 'unknown'}"). ` +
        `Refusing to stamp provider:'sesame' on non-sovereign audio.`,
    );
  }
  if (reportedService && !/sesame|csm/.test(reportedService)) {
    throw new Error(
      `Sesame provenance violation: backend at ${getSesameUrl()} reports ` +
        `service="${data.service}", not a Sesame backend. Refusing to mislabel as provider:'sesame'.`,
    );
  }

  const audioBuffer = Buffer.from(data.audio, 'base64');

  const contentType =
    format === 'mp3' ? 'audio/mpeg'
    : format === 'wav' ? 'audio/wav'
    : format === 'opus' ? 'audio/opus'
    : 'audio/mpeg';

  return { audioBuffer, contentType, provider: 'sesame' };
}

/**
 * Check if Sesame TTS is reachable and healthy.
 */
export async function healthCheck(): Promise<{
  healthy: boolean;
  url: string;
  error?: string;
  latencyMs?: number;
}> {
  const url = getSesameUrl();
  const t0 = Date.now();

  try {
    const response = await fetch(`${url}/health`, {
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
