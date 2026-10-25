/** LISTEN-14 · EXCLUSIVE audio-output ownership for a same-origin browser profile.
 *
 * Web Locks is the authority for MUTUAL EXCLUSION; BroadcastChannel only
 * requests preemption. A message is not a grant. Missing browser capability,
 * timed-out priority reservation, or busy music lock => refuse a new play.
 * No member information, text, provider media, file bytes, URL, storage or
 * network API is used. Not authentication or authorization to speak/stream.
 *
 * LISTEN-47 adds Reader narration as a named priority output. It may preempt
 * music, but it cannot preempt MAIA speech: a MAIA-owned lock stays held and
 * Reader times out/refuses. Failed priority playback never restarts music.
 */
import { SOULLAB_AUDIO_TAB_CHANNEL, requestAudioFocus } from './audioFocus';

export type AudioOutputKind =
  | 'maia-speech'
  | 'reader-narration'
  | 'listening-music';

type AudioPreflightType =
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

function intent(type: AudioPreflightType): boolean {
  try {
    const channel = new BroadcastChannel(SOULLAB_AUDIO_TAB_CHANNEL);
    // No identifiers or session credentials in the inter-tab transport.
    channel.postMessage({
      type,
      version: SOULLAB_AUDIO_PREFLIGHT_VERSION,
      tab: AUDIO_OUTPUT_TAB_NONCE,
    });
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
 * Music declines if another output remains busy after a short preflight.
 * MAIA speech and Reader narration request a cooperative pause, then await the
 * lock with a bounded deadline. MAIA remains higher priority because Reader
 * does not ask MAIA to release and refuses while a MAIA speech lease is active.
 *
 * Playback that ultimately fails may have paused prior music during preflight.
 * Do not automatically restart the prior soundtrack.
 */
export async function acquireAudioOutput(
  kind: AudioOutputKind,
): Promise<AudioOutputLease | null> {
  if (!available()) return null;

  const priorityOutput = kind !== 'listening-music';
  const preflight: AudioPreflightType =
    kind === 'maia-speech' ? 'maia-speech-preflight'
      : kind === 'reader-narration' ? 'reader-narration-preflight'
        : 'music-preflight';
  if (!intent(preflight)) return null;

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
    const options: LockOptions = priorityOutput
      ? { mode: 'exclusive', signal: controller.signal }
      : { mode: 'exclusive', ifAvailable: true };

    void navigator.locks.request(
      SOULLAB_AUDIO_OUTPUT_LOCK,
      options,
      async lock => {
        if (!lock) {
          settle(null);
          return;
        }
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
      },
    ).catch(() => settle(null));
  });
  return started;
}
