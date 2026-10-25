/** LISTEN-10: cooperative, in-browser AUDIO FOCUS signal only.
 * A focus event is a request to PAUSE other local audio. It is never
 * evidence of user identity, copyright permission or playback entitlement.
 * No personal/song metadata leaves the current browser context. */
export type AudioFocusSource =
  | 'listening-room'
  | 'reader-narration'
  | 'writers-listen'
  | 'maia-voice'
  | 'sound-sanctuary'
  | 'external';

export const SOULLAB_AUDIO_FOCUS_EVENT = 'soullab:audio-focus-request';
export const SOULLAB_AUDIO_TAB_CHANNEL = 'soullab-audio-focus-v1';
export const SOULLAB_SESSION_END_EVENT = 'soullab:member-session-ended';

export function requestAudioFocus(source: AudioFocusSource): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SOULLAB_AUDIO_FOCUS_EVENT, {
    detail: { source }
  }));
  if (source === 'listening-room' || source === 'reader-narration') {
    // Reuse the existing Writer TTS stop contract without modifying Writer.
    window.dispatchEvent(new Event('ws-stop-maia-reading'));
  }
}

export function audioFocusSource(event: Event): AudioFocusSource | null {
  if (!(event instanceof CustomEvent)) return null;
  const value: unknown = event.detail?.source;
  if (value === 'listening-room' || value === 'reader-narration' ||
      value === 'writers-listen' || value === 'maia-voice' ||
      value === 'sound-sanctuary' || value === 'external')
    return value;
  return null;
}
