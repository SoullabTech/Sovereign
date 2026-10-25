import type { AudioFocusSource } from './audioFocus';
import {
  AUDIO_OUTPUT_TAB_NONCE,
  SOULLAB_AUDIO_PREFLIGHT_VERSION,
} from './audioOutputLock';

/**
 * Reader narration is above ambient music and below MAIA/protected speech.
 * These predicates decide only when an already-authorized Reader player must
 * pause. They do not grant identity, media rights, microphone access or output.
 */
export function shouldPauseReaderForFocus(
  source: AudioFocusSource | null,
): boolean {
  return source === 'maia-voice' ||
    source === 'writers-listen' ||
    source === 'external';
}

export function shouldPauseReaderForTabMessage(message: unknown): boolean {
  if (!message || typeof message !== 'object') return false;
  const candidate = message as {
    type?: unknown;
    version?: unknown;
    tab?: unknown;
  };
  if (candidate.version !== SOULLAB_AUDIO_PREFLIGHT_VERSION) return false;
  if (candidate.tab === AUDIO_OUTPUT_TAB_NONCE) return false;
  return candidate.type === 'maia-speech-preflight' ||
    candidate.type === 'reader-narration-preflight';
}
