/**
 * Sesame CSM TTS Provider — local, sovereign text-to-speech.
 *
 * Sesame CSM (Coqui-based) exposes a FastAPI /tts endpoint that accepts
 * structured voice + element context and returns base64-encoded audio.
 *
 * SOVEREIGNTY: No network calls leave the machine. Audio stays local.
 *
 * Default endpoint: http://localhost:8881 (Docker: http://sesame-tts:8000)
 * Env override: SESAME_TTS_URL
 *
 * API shape (POST /tts):
 *   { text, voice, format, speed, element?, context? }
 *   → { success, audio (base64), duration_ms, service, shaped_text, voice_personality }
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
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => 'Unknown error');
    throw new Error(`Sesame TTS error ${response.status}: ${detail}`);
  }

  const data = await response.json();

  if (!data.success || !data.audio) {
    throw new Error(`Sesame TTS returned no audio: ${JSON.stringify(data)}`);
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
