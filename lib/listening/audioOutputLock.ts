/** LISTEN-14 / LISTEN-47 · EXCLUSIVE audio-output ownership for a same-origin browser profile.
 *
 * Web Locks is the authority for MUTUAL EXCLUSION; BroadcastChannel only
 * requests preemption. A message is not a grant. Missing browser capability,
 * timed-out spoken-output reservation, or busy music lock => refuse a new play.
 * No member information, text, provider media, file bytes, URL, storage or
 * network API is used. Not authentication or authorization to speak/stream.
 *
 * MAIA speech has priority over Reader narration, and both have priority over
 * persistent music. Reader narration may preempt music but may not force MAIA
 * to release. Music never preempts active narration. None of these transitions
 * automatically restarts a prior soundtrack.
 */
import { SOULLAB_AUDIO_TAB_CHANNEL, requestAudioFocus } from './audioFocus';

export type AudioOutputKind =
  | 'maia-speech'
  | 'reader-narration'
  | 'listening-music';

type AudioPreflightIntent =
  | 'maia-speech-preflight'
  | 'reader-narration-preflight'
  | 'music-preflight';

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

function intent(type: AudioPreflightIntent): boolean {
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

function preflightFor(kind: AudioOutputKind): AudioPreflightIntent {
  if (kind === 'maia-speech') return 'maia-speech-preflight';
  if (kind === 'reader-narration') return 'reader-narration-preflight';
  return 'music-preflight';
}

/**
 * Grants a held, exclusive same-browser-profile Web Lock BEFORE output starts.
 * This lock persists until the owner's explicit release, tab termination or
 * document disposal. No timer/stale heartbeat may silently grant exclusivity.
 *
 * Music declines immediately when another output remains busy after a 75ms
 * preflight. MAIA speech and Reader narration wait up to 2.5s for a permitted
 * higher-priority transition. Reader listeners release for MAIA preflight;
 * MAIA is not required to release for Reader. A failed spoken-output start may
 * have paused prior music during preflight. Never restart it automatically.
 */
export async function acquireAudioOutput(
  kind: AudioOutputKind,
): Promise<AudioOutputLease | null> {
  if (!available()) return null;
  const priorityOutput = kind !== 'listening-music';
  if (!intent(preflightFor(kind))) return null;

  if (kind === 'maia-speech') requestAudioFocus('maia-voice');
  if (kind === 'reader-narration') requestAudioFocus('reader-narration');
  await wait(priorityOutput ? 25 : 75);

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
    if (priorityOutput) timeout = setTimeout(() => controller.abort(), 2500);
    const options: LockOptions =
      priorityOutput ? {mode: 'exclusive', signal: controller.signal}
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
