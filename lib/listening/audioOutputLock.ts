/** LISTEN-14 · EXCLUSIVE audio-output ownership for a same-origin browser profile.
 *
 * Web Locks is the authority for MUTUAL EXCLUSION; BroadcastChannel only
 * requests preemption. A message is not a grant. Missing browser capability,
 * timed-out speech reservation, or busy music lock => refuse a new play.
 * No member information, text, provider media, file bytes, URL, storage or
 * network API is used. Not authentication or authorization to speak/stream.
 *
 * This is a REVIEW CANDIDATE; the MAIA voice owner must accept this change.
 */
import { SOULLAB_AUDIO_TAB_CHANNEL, requestAudioFocus } from './audioFocus';

export type AudioOutputKind = 'maia-speech' | 'listening-music';

export interface AudioOutputLease {
  release: () => void;
  readonly kind: AudioOutputKind;
}

export const SOULLAB_AUDIO_OUTPUT_LOCK = 'soullab:exclusive-audio-output:v1';
export const SOULLAB_AUDIO_PREFLIGHT_VERSION = 2;
export const AUDIO_OUTPUT_TAB_NONCE: string =
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID() : Math.random().toString(36).slice(2);
const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

function available(): boolean {
  return typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.locks?.request === 'function' &&
    typeof BroadcastChannel === 'function';
}

function intent(type: 'maia-speech-preflight' | 'music-preflight'): boolean {
  try {
    const channel = new BroadcastChannel(SOULLAB_AUDIO_TAB_CHANNEL);
    // No identifiers or session credentials in the inter-tab transport.
    channel.postMessage({ type, version: SOULLAB_AUDIO_PREFLIGHT_VERSION, tab: AUDIO_OUTPUT_TAB_NONCE });
    channel.close();
    return true;
  } catch {
    return false;
  }
}

/**
 * Grants a held, exclusive same-browser-profile Web Lock BEFORE output starts.
 * This lock persists until the owner's explicit release, tab termination or
 * document disposal. No timer/stale heartbeat may silently grant exclusivity.
 *
 * For music, if another output is still busy after a 75ms preflight window,
 * decline rather than awaiting (e.g., active MAIA speech).
 *
 * For speech, make a priority pause request in the same document and across
 * tabs, then await the lock with a bounded 2.5s deadline. If an existing tab
 * can't release its output lock, do NOT allow audible speech to start.
 *
 * A speech playback that ultimately fails may have paused prior music during
 * preflight. Do not automatically restart the prior soundtrack.
 */
export async function acquireAudioOutput(
  kind: AudioOutputKind,
): Promise<AudioOutputLease | null> {
  if (!available()) return null;
  const speech = kind === 'maia-speech';
  if (!intent(speech ? 'maia-speech-preflight' : 'music-preflight'))
    return null;

  if (speech) requestAudioFocus('maia-voice');
  await wait(speech ? 25 : 75);

  if (!available()) return null;

  let settled = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let releaseCallback: (() => void) | undefined;
  let releaseCalled = false;
  const started = new Promise<AudioOutputLease | null>(resolve => {
    const settle = (lease: AudioOutputLease | null) => {
      if (settled) {
        lease?.release();
        return;
      }
      settled = true;
      if (timeout) clearTimeout(timeout);
      resolve(lease);
    };

    const controller = new AbortController();
    if (speech) timeout = setTimeout(() => controller.abort(), 2500);
    const options: LockOptions =
      speech ? {mode: 'exclusive', signal: controller.signal}
        : {mode: 'exclusive', ifAvailable: true};

    void navigator.locks.request(SOULLAB_AUDIO_OUTPUT_LOCK, options,
      async lock => {
        if (!lock) { settle(null); return; }
        await new Promise<void>(release => {
          releaseCallback = release;
          settle({
            kind,
            release: () => {
              if (releaseCalled) return;
              releaseCalled = true;
              releaseCallback?.();
            },
          });
          // If the requester has already timed out, settle() releases it.
        });
      }).catch(() => settle(null));
  });
  return started;
}
