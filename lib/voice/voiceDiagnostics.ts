/**
 * Voice diagnostic events — client-side, fire-and-forget.
 *
 * Captures the four boundaries that fail silently on Android Chrome (and
 * potentially other browsers) so we can diagnose "mic granted, but no
 * conversation" issues without bothering the user for repro.
 *
 *   voice_mic_granted        — getUserMedia resolved
 *   voice_listening_started  — recognition/recorder reports it's listening
 *   voice_transcribe_sent    — audio dispatched to transcription path
 *   voice_transcribe_result  — transcription returned (any text, even empty)
 *   voice_transcribe_error   — transcription failed
 *
 * No conversation content is logged — only technical metadata (UA, codec,
 * duration, error name). Fires to /api/telemetry/client which logs to
 * `docker logs maia-sovereign` (no DB table until volume justifies one).
 */

export type VoiceDiagEvent =
  // Web path (Web Speech API, see components/voice/ContinuousConversation.tsx web branch)
  // Lifecycle events follow the spec order: granted → start → audiostart →
  // speechstart → result|error → end. We log every boundary so the next
  // tester report ("voice didn't work") translates directly to the layer
  // that failed: e.g., listening_started without audio_started =
  // recognition reported start but never received audio.
  | 'voice_mic_granted'
  | 'voice_listening_started'
  | 'voice_audio_started'
  | 'voice_speech_started'
  | 'voice_transcribe_sent'
  | 'voice_transcribe_result'
  | 'voice_transcribe_error'
  | 'voice_recognition_ended'
  // Stage 2 — silent-after-listening fallback (Android Chrome). Fires when
  // listening_started arrived but no transcribe_result followed within the
  // timeout. Synthesized from observed boundaries; metadata makes that explicit.
  | 'voice_silent_after_listening'
  // Observed failure mode on Android Chrome (Tara's trace, 2026-05-14):
  // audio_started fires, but speech_started never does, then recognition_ended
  // — recognizer received audio but its VAD never acknowledged speech.
  // Observational name. Recovery behavior (stop restart loop, switch to text)
  // is gated to Android Chrome via isAndroidWebChrome().
  | 'voice_audio_no_speech'
  // Stage 3 — Android Chrome voice fallback. When voice_audio_no_speech hits
  // the recovery threshold, instead of going straight to text we try a
  // one-shot MediaRecorder capture + POST to /api/voice/transcribe-simple
  // (local maia-whisper, NOT OpenAI cloud). All four are observational —
  // no transcript content in telemetry, only durations/byte-counts/mime/error.
  | 'voice_fallback_recording_started'
  // ── TTS playback witness ────────────────────────────────────────────────
  // Capture had telemetry; playback had none. That asymmetry is why a whole
  // tester session of "choppy, cut off, repeated the beginning" produced a
  // silent log while the capture stream stayed legible. These events make the
  // playback path observable WITHOUT changing its behavior.
  //
  // The sequence that would mechanically prove the suspected replay bug:
  //   playback_started     chunkId=X attempt=1 currentTimeMs ~0
  //   playback_interrupted chunkId=X errorName=AbortError currentTimeMs > 0
  //                                                    ← audio was already audible
  //   playback_retry       chunkId=X
  //   playback_resumed     chunkId=X attempt=2 currentTimeMs ~0
  //                                                    ← the head plays again
  //
  // NOTE the fourth event is playback_RESUMED, not a second playback_started:
  // attemptPlay emits `started` only on attempt 1 and `resumed` thereafter. A
  // witness parser watching for a repeated `started` would match nothing and
  // wrongly clear the replay hypothesis.
  //
  // Metadata is media-element state only. No transcript, no spoken text.
  | 'voice_playback_started'
  | 'voice_playback_interrupted'
  | 'voice_playback_retry'
  | 'voice_playback_resumed'
  | 'voice_playback_ended'
  | 'voice_playback_failed'
  | 'voice_fallback_transcribe_sent'
  | 'voice_fallback_transcribe_result'
  | 'voice_fallback_failed'
  // Native iOS path (@capacitor-community/speech-recognition)
  // Naming follows "Observable state before interpreted meaning":
  // we report what the plugin emitted, not what we think it meant.
  //
  // Note: this plugin only exposes three listeners (partialResults, audioLevel,
  // listeningState) — there is no native "final result" event. We emit
  // `ios_voice_final_result_received` when the app commits a partial as final
  // (silence-timeout auto-submit). The metadata `source` field makes the
  // origin explicit so analysts can tell observed from synthesized.
  | 'ios_voice_permission_requested'
  | 'ios_voice_permission_granted'
  | 'ios_voice_permission_denied'
  | 'ios_voice_listening_started'
  | 'ios_voice_partial_result_received'
  | 'ios_voice_final_result_received'
  | 'ios_voice_result_empty'
  | 'ios_voice_error'
  | 'ios_voice_listening_stopped';

type Meta = Record<string, string | number | boolean | null>;

let sessionToken: string | null = null;
function getSessionToken(): string {
  if (sessionToken) return sessionToken;
  // Short random session token correlates events within one mic-engagement.
  // Not persisted — just helps grouping in docker logs.
  sessionToken = Math.random().toString(36).slice(2, 10);
  return sessionToken;
}

/** Reset the session token — call when a new mic engagement begins. */
export function resetVoiceSession(): void {
  sessionToken = null;
}

export function logVoiceEvent(event: VoiceDiagEvent, metadata: Meta = {}): void {
  if (typeof window === 'undefined') return;

  const payload = {
    event,
    path: typeof window !== 'undefined' ? window.location.pathname : null,
    metadata: {
      ...metadata,
      session: getSessionToken(),
      ua: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 120) : '',
    },
  };

  // Browser console for live debugging
  // eslint-disable-next-line no-console
  console.log('[voice-diag]', event, payload.metadata);

  // Server-side log via /api/telemetry/client
  try {
    fetch('/api/telemetry/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // never block voice flow on telemetry
  }
}
