// lib/voice/maiaVoiceService.ts
/**
 * SOVEREIGNTY: OpenAI TTS removed.
 *
 * Previously used OpenAI `tts-1` via openai.audio.speech.create().
 * Now routes to Kokoro (local) via ttsRouter.synthesize().
 *
 * Interface preserved — callers (sovereign/app/maia/voice/route.ts,
 * lib/sovereign/maiaService.ts) continue to work without changes.
 *
 * See lib/ai/openaiPolicy.ts for the zero-access doctrine.
 */

import * as ttsRouter from '@/lib/tts/ttsRouter';

export type MaiaVoiceFormat = 'mp3' | 'opus';

export async function synthesizeMaiaVoice(
  text: string,
  options?: { format?: MaiaVoiceFormat; voice?: string }
): Promise<Buffer> {
  const trimmed = text?.trim();
  if (!trimmed) {
    throw new Error('Cannot synthesize empty text');
  }

  const format = options?.format ?? 'mp3';
  const voice = options?.voice ?? 'af_heart';

  const result = await ttsRouter.synthesize({ text: trimmed, voice, format });
  return result.audioBuffer;
}
