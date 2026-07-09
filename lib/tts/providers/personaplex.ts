/**
 * PersonaPlex TTS Provider — local, sovereign MLX voice rendering.
 *
 * Adapter that puts PersonaPlex behind the ttsRouter `synthesize()` contract,
 * alongside Kokoro and Sesame. PersonaPlex speaks a different wire protocol than
 * the OpenAI-compatible engines: it streams base64-encoded PCM (float32, 24 kHz)
 * chunks. This adapter collects those chunks and wraps them in a WAV container so
 * the router can return a single `Buffer` like every other provider.
 *
 * HARDWARE NOTE: PersonaPlex is MLX (Apple-Silicon). It runs on the Mac Studio
 * Voice Lab, NOT on the x86 minisforum production host. It is a `voice-quality-lab`
 * provider only until a production-capable serving backend exists.
 * See docs/adr/012-openai-tts-production-status.md and the qualification guard
 * in ttsRouter.ts (R15).
 *
 * SOVEREIGNTY: renders locally; no audio leaves the machine.
 *
 * Env override: PERSONAPLEX_URL (default http://localhost:8765)
 */

import {
  renderWithPersonaPlexSync,
  checkPersonaPlexHealth,
} from '@/lib/voice/personaplex/personaPlexClient';

const PERSONAPLEX_DEFAULT_URL = 'http://localhost:8765';

/** PersonaPlex streams float32 PCM at 24 kHz. TTS output is treated as mono. */
const PP_SAMPLE_RATE = 24_000;
const PP_CHANNELS = 1;

export interface PersonaPlexSynthesisParams {
  text: string;
  /** Accepted for interface parity with other providers; PP uses `mode` prosody. */
  voice?: string;
  /** Output container. PersonaPlex always yields PCM → we emit WAV. */
  format?: 'mp3' | 'wav' | 'opus';
  speed?: number;
  /** MAIA voice mode (affects prosody). Defaults to 'talk'. */
  mode?: 'talk' | 'care' | 'note';
}

/**
 * Wrap raw little-endian float32 PCM in a canonical 44-byte WAV header
 * (WAVE_FORMAT_IEEE_FLOAT = 3). Browsers' WebAudio decodeAudioData accepts this.
 */
function pcmFloat32ToWav(
  pcm: Buffer,
  sampleRate: number = PP_SAMPLE_RATE,
  channels: number = PP_CHANNELS,
): Buffer {
  const bytesPerSample = 4; // float32
  const byteRate = sampleRate * channels * bytesPerSample;
  const blockAlign = channels * bytesPerSample;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(36 + pcm.length, 4); // chunk size
  header.write('WAVE', 8, 'ascii');
  header.write('fmt ', 12, 'ascii');
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(3, 20); // audioFormat = 3 (IEEE float)
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bytesPerSample * 8, 34); // bits per sample = 32
  header.write('data', 36, 'ascii');
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

/**
 * Synthesize speech via PersonaPlex. Collects all streamed PCM chunks and
 * returns a single WAV buffer — the shape ttsRouter expects.
 */
export async function synthesize(params: PersonaPlexSynthesisParams): Promise<{
  audioBuffer: Buffer;
  contentType: string;
  provider: 'personaplex';
}> {
  const { text, speed = 1.0, mode = 'talk' } = params;

  const result = await renderWithPersonaPlexSync({
    text,
    mode,
    sanctuary: false,
    speed,
  });

  if (!result.chunks.length) {
    throw new Error('PersonaPlex returned no audio chunks');
  }

  // Concatenate all base64 PCM (float32 LE) chunks in order.
  const pcm = Buffer.concat(
    result.chunks.map((c) => Buffer.from(c.audioB64, 'base64')),
  );
  const audioBuffer = pcmFloat32ToWav(pcm);

  return { audioBuffer, contentType: 'audio/wav', provider: 'personaplex' };
}

/**
 * Health check — mirrors the { healthy, url, error?, latencyMs? } shape used by
 * the Kokoro adapter so healthCheckAll() can treat providers uniformly.
 */
export async function healthCheck(): Promise<{
  healthy: boolean;
  url: string;
  error?: string;
  latencyMs?: number;
}> {
  const url = process.env.PERSONAPLEX_URL || PERSONAPLEX_DEFAULT_URL;
  const { available, latencyMs, error } = await checkPersonaPlexHealth();
  return {
    healthy: available,
    url,
    ...(latencyMs !== undefined && { latencyMs }),
    ...(error && { error }),
  };
}
