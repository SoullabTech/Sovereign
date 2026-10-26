/**
 * Browser-safe client for Soullab voice synthesis.
 *
 * Provider credentials remain server-side. The server route applies identity,
 * limits, local/cloud voice policy and no-store response headers.
 */
import { apiFetch } from '../http/apiBase';

export interface SoullabTtsOptions {
  voice?: string;
  speed?: number;
  format?: 'mp3' | 'wav' | 'opus' | 'aac' | 'flac';
  instructions?: string;
}

export async function requestSoullabTts(
  text: string,
  options: SoullabTtsOptions = {},
): Promise<ArrayBuffer> {
  const normalizedText = text.trim();
  if (!normalizedText) throw new Error('Voice text is required');

  const response = await apiFetch('/api/voice/openai-tts', {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: normalizedText,
      voice: options.voice ?? 'alloy',
      speed: Math.max(0.25, Math.min(4, options.speed ?? 1)),
      format: options.format ?? 'mp3',
      ...(options.instructions ? { instructions: options.instructions } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`Soullab voice request failed (${response.status})`);
  }
  return response.arrayBuffer();
}
