/**
 * Client diagnostic telemetry receiver.
 *
 * Accepts fire-and-forget events from the browser when known broken states
 * are detected (redirect loops, voice pipeline boundaries). Strict event
 * allowlist — no arbitrary client claims. No PII beyond truncated UA.
 *
 * Dispatch:
 *   redirect_loop_detected  → onboarding_events (via trackOnboarding)
 *   voice_*                 → server console.log only (visible in docker logs)
 *
 * Always returns 204 — telemetry never blocks user flow.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ALLOWED_EVENTS = new Set([
  'redirect_loop_detected',
  // Web voice path (Web Speech API lifecycle, in spec order)
  'voice_mic_granted',
  'voice_listening_started',
  'voice_audio_started',
  'voice_speech_started',
  'voice_transcribe_sent',
  'voice_transcribe_result',
  'voice_transcribe_error',
  'voice_recognition_ended',
  // Synthesized fallback signal — fires when listening_started arrived
  // but no transcribe_result followed within timeout (Android Chrome scope).
  'voice_silent_after_listening',
  // Observed Android Chrome failure mode: audio_started fires, speech_started
  // never does, recognition_ended — recognizer's VAD never triggered.
  'voice_audio_no_speech',
  // Stage 3 — Android Chrome voice fallback (MediaRecorder → local Whisper).
  'voice_fallback_recording_started',
  'voice_fallback_transcribe_sent',
  'voice_fallback_transcribe_result',
  'voice_fallback_failed',
  // Native iOS voice path (@capacitor-community/speech-recognition)
  'ios_voice_permission_requested',
  'ios_voice_permission_granted',
  'ios_voice_permission_denied',
  'ios_voice_listening_started',
  'ios_voice_partial_result_received',
  'ios_voice_final_result_received',
  'ios_voice_result_empty',
  'ios_voice_error',
  'ios_voice_listening_stopped',
  // Add Meeting Audio — listening posture telemetry. Aggregate signal only,
  // used to determine whether the native desktop meeting-app gap is real
  // before considering a companion app. Doctrine: participation before
  // infrastructure (see project_maia_ux_doctrine + project_add_meeting_audio_posture).
  'meeting_audio_unsupported',
  'meeting_audio_toggle_enabled',
  'meeting_audio_picker_cancelled',
  'meeting_audio_no_track',
  'meeting_audio_self_capture_blocked',
  'meeting_audio_blocked_feedback',

  // ── VOICE-02B: receiver admission for the witness families ───────────────
  // These 17 names were already defined in the VoiceDiagEvent union and were
  // already being emitted by the client — but this allowlist did not admit
  // them, so every one was dropped at the gate above and answered with the
  // SAME 204 as an accepted event. The client could not tell, and neither
  // could a reader of `docker logs`: the events simply never appeared.
  //
  // That is the failure mode this lane exists to refuse. A soak run against a
  // build without these lines would have produced silence on exactly the
  // questions #1098-#1101 were built to answer, and that silence would have
  // read as "mechanism not observed" rather than "mechanism not observable".
  //
  // Admission only. No behavior change, no new event names, no metadata
  // expansion, no persistence.

  // Capture liveness (#1096) — mic/track/AudioContext death and salvage.
  'voice_status_surfaced',
  'voice_transcript_salvaged',
  'voice_capture_lost',
  'voice_track_listeners_attached',

  // TTS playback witness (#1098) — StreamingAudioQueue media-element state.
  'voice_playback_started',
  'voice_playback_interrupted',
  'voice_playback_retry',
  'voice_playback_resumed',
  'voice_playback_ended',
  'voice_playback_failed',

  // V5 utterance-tail witness (#1099 composer path, #1100 continuous path,
  // #1101 recognition-epoch boundary).
  'voice_result_interim',
  'voice_result_final',
  'voice_silence_timer_armed',
  'voice_silence_timer_fired',
  'voice_turn_commit_requested',
  'voice_turn_committed',
  'voice_result_after_commit',
] as const);

type AllowedEvent = typeof ALLOWED_EVENTS extends Set<infer T> ? T : never;

interface ClientPayload {
  event: AllowedEvent;
  path?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export async function POST(req: NextRequest) {
  // Static export bypass for Capacitor builds
  if (process.env.CAPACITOR_BUILD === '1') {
    return new NextResponse(null, { status: 204 });
  }

  let payload: ClientPayload;
  try {
    payload = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  if (!payload?.event || !ALLOWED_EVENTS.has(payload.event)) {
    return new NextResponse(null, { status: 204 });
  }

  const memberId = req.cookies.get('maia_member_id')?.value
    || req.headers.get('x-member-id')
    || null;

  // Truncate metadata to bounded sizes — defense in depth
  const safeMetadata: Record<string, string | number | boolean | null> = {};
  if (payload.metadata && typeof payload.metadata === 'object') {
    for (const [k, v] of Object.entries(payload.metadata)) {
      if (typeof k !== 'string' || k.length > 64) continue;
      if (v === null || typeof v === 'boolean' || typeof v === 'number') {
        safeMetadata[k] = v;
      } else if (typeof v === 'string') {
        safeMetadata[k] = v.slice(0, 200);
      }
    }
  }

  if (payload.event === 'redirect_loop_detected') {
    try {
      const { trackOnboarding } = await import('@/lib/onboarding/telemetry');
      trackOnboarding({
        event: 'redirect_loop_detected',
        memberId,
        path: typeof payload.path === 'string' ? payload.path.slice(0, 80) : null,
        metadata: safeMetadata,
      });
    } catch {
      // never throw from telemetry
    }
  } else {
    // Voice diagnostics: server-side log only (visible via `docker logs maia-sovereign`)
    // No DB write yet — table will be added in a follow-up if voice events prove load-bearing.
    console.log('[client-telemetry]', JSON.stringify({
      event: payload.event,
      member_id: memberId,
      path: typeof payload.path === 'string' ? payload.path.slice(0, 80) : null,
      metadata: safeMetadata,
      ts: new Date().toISOString(),
    }));
  }

  return new NextResponse(null, { status: 204 });
}
