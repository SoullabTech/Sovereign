/**
 * Add Meeting Audio — observational telemetry (client, fire-and-forget).
 *
 * Listening posture, not product escalation. Used to determine whether the
 * native desktop meeting-app gap (Loopback territory) is a real member
 * problem before considering a companion app. Aggregate operational signal
 * only — no PII, no session content, no fingerprinting.
 *
 *   meeting_audio_unsupported          — getDisplayMedia not available in this env
 *   meeting_audio_toggle_enabled       — user enabled the Add Meeting Audio toggle
 *   meeting_audio_picker_cancelled     — user cancelled the OS picker
 *   meeting_audio_no_track             — picker returned no audio track ("Share tab audio" not checked)
 *   meeting_audio_self_capture_blocked — user selected the Session Room tab itself; guard fired
 *   meeting_audio_blocked_feedback     — practitioner self-reports the gap (clicked feedback link)
 *   meeting_audio_launch_opened        — opened a meeting link from the in-room launcher (metadata.platform)
 *
 * Fires to /api/telemetry/client which logs to `docker logs maia-sovereign`.
 * No DB table until volume justifies one.
 *
 * Doctrine: participation before infrastructure
 *   (see project_maia_ux_doctrine + project_add_meeting_audio_posture).
 */

export type MeetingAudioEvent =
  | 'meeting_audio_unsupported'
  | 'meeting_audio_toggle_enabled'
  | 'meeting_audio_picker_cancelled'
  | 'meeting_audio_no_track'
  | 'meeting_audio_self_capture_blocked'
  | 'meeting_audio_blocked_feedback'
  | 'meeting_audio_launch_opened';

type Meta = Record<string, string | number | boolean | null>;

export function logMeetingAudioEvent(event: MeetingAudioEvent, metadata: Meta = {}): void {
  if (typeof window === 'undefined') return;

  const payload = {
    event,
    path: window.location.pathname,
    metadata,
  };

  try {
    fetch('/api/telemetry/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // never block recording flow on telemetry
    });
  } catch {
    // never throw from telemetry
  }
}
