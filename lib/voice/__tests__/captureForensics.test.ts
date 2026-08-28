/**
 * Capture-forensics tests — VOICE-CAPTURE-NO-AUDIO-01A.
 *
 * These tests pin an ADJUDICATION, not a behavior. Nothing in the app branches
 * on `classifyCaptureSilence`; its only consumer is telemetry. What is being
 * fixed here is the reading: how the next production silent death gets
 * interpreted, decided before the data arrives rather than fitted to it.
 *
 * The load-bearing property is that a witness never overstates. Saying
 * "the analyser was hearing voice" when the AudioContext was suspended, or
 * when the loop had stopped ticking, would send the repair at the recognition
 * object for a failure that lives upstream of it — and the whole point of this
 * unit is that we stop guessing which of those it is.
 */

import {
  buildCaptureForensics,
  classifyCaptureSilence,
  msSince,
  ANALYSER_STALL_MS,
  ANALYSER_VOICE_RECENT_MS,
  ANALYSER_SILENT_PEAK,
  type CaptureForensicsInput,
} from '../captureForensics';

const NOW = 1_000_000;

/** A healthy-stream, silent-recognition baseline: the shape of the defect. */
function input(overrides: Partial<CaptureForensicsInput> = {}): CaptureForensicsInput {
  return {
    now: NOW,

    generation: 3,
    sessionState: 'LISTENING',
    shouldRecreate: false,
    recognitionActive: true,
    audioOpened: true,
    onStartAt: NOW - 20_000,
    onAudioStartAt: NOW - 19_900,
    onSpeechStartAt: NOW - 19_500,
    onResultAt: 0,
    onErrorAt: 0,
    onEndAt: 0,

    trackCount: 1,
    trackReadyState: 'live',
    trackEnabled: true,
    trackMuted: false,
    trackDeviceIdPrefix: 'a1b2c3d4',

    analyserPresent: true,
    audioContextState: 'running',
    analyserLoopRunning: true,
    analyserLevel: 0.41,
    analyserLastTickAt: NOW - 16,
    analyserLastVoiceAt: NOW - 800,
    analyserPeakCurrent: 0.52,
    analyserPeakPrevious: 0.48,
    analyserTicks: 54_000,

    silentForMs: 15_000,
    micState: 'LISTENING',
    listeningMode: 'HANDS_FREE',
    isListening: true,
    isRecording: true,
    isSpeaking: false,
    isProcessing: false,
    restartInFlight: false,
    pageHidden: false,
    lastVisibilityChangeAt: 0,
    ...overrides,
  };
}

describe('msSince', () => {
  it('reports -1 for an event that never happened', () => {
    // Not 0. Zero would read as "just now" — the exact opposite of the truth,
    // and the difference between "recognition never returned a result" and
    // "recognition returned one this instant".
    expect(msSince(NOW, 0)).toBe(-1);
  });

  it('never reports a negative age for a stamp from the future', () => {
    expect(msSince(NOW, NOW + 500)).toBe(0);
  });

  it('reports elapsed milliseconds', () => {
    expect(msSince(NOW, NOW - 2_500)).toBe(2_500);
  });
});

describe('classifyCaptureSilence', () => {
  it('names the defect under investigation: audio arriving, recognition mute', () => {
    // onstart/onaudiostart/onspeechstart fired, nothing since, and the local
    // analyser is still seeing the member speak. The stream is fine.
    expect(classifyCaptureSilence(input())).toBe('analyser_hearing_voice');
  });

  it('separates a flat stream from a mute recognizer', () => {
    expect(classifyCaptureSilence(input({
      analyserLastVoiceAt: 0,
      analyserLevel: 0,
      analyserPeakCurrent: 0,
      analyserPeakPrevious: 0,
    }))).toBe('analyser_alive_no_voice');
  });

  it('counts a recent windowed peak as voice even after the voice stamp ages out', () => {
    // A member can fall silent for longer than the recency window while the
    // stream stays perfectly healthy. The peak is what keeps that from being
    // misread as a dead stream.
    expect(classifyCaptureSilence(input({
      analyserLastVoiceAt: NOW - (ANALYSER_VOICE_RECENT_MS + 5_000),
      analyserPeakCurrent: ANALYSER_SILENT_PEAK + 0.01,
      analyserPeakPrevious: 0,
    }))).toBe('analyser_hearing_voice');
  });

  it('does not treat room-floor noise as voice', () => {
    expect(classifyCaptureSilence(input({
      analyserLastVoiceAt: 0,
      analyserPeakCurrent: ANALYSER_SILENT_PEAK,
      analyserPeakPrevious: ANALYSER_SILENT_PEAK,
    }))).toBe('analyser_alive_no_voice');
  });

  it('reports a stalled loop rather than inventing a stream verdict', () => {
    expect(classifyCaptureSilence(input({
      analyserLastTickAt: NOW - (ANALYSER_STALL_MS + 1),
    }))).toBe('analyser_stalled');
  });

  it('treats a loop that never ticked as stalled, not as silence', () => {
    expect(classifyCaptureSilence(input({
      analyserLastTickAt: 0,
      analyserTicks: 0,
    }))).toBe('analyser_stalled');
  });

  it('reports a dead track ahead of any analyser reading', () => {
    // Precedence matters: with no track the analyser is stalled too, and
    // reporting THAT would point the repair at rAF instead of the device.
    for (const override of [
      { trackCount: 0, trackReadyState: null, trackEnabled: null, trackMuted: null },
      { trackReadyState: 'ended' },
      { trackMuted: true },
      { trackEnabled: false },
    ]) {
      expect(classifyCaptureSilence(input(override))).toBe('track_not_delivering');
    }
  });

  it('reports a stopped AudioContext ahead of the analyser reading it invalidates', () => {
    for (const state of ['suspended', 'interrupted', 'closed']) {
      expect(classifyCaptureSilence(input({ audioContextState: state }))).toBe(
        'audio_context_not_running',
      );
    }
  });

  it('refuses to adjudicate without a local witness', () => {
    expect(classifyCaptureSilence(input({ analyserPresent: false }))).toBe('no_analyser');
  });

  it('never claims to hear voice while the page is hidden and the loop is throttled', () => {
    // A backgrounded tab throttles requestAnimationFrame. The verdict must be
    // about the loop, and `pageHidden` must travel with it so the reader can
    // discount the whole event.
    const hidden = input({
      pageHidden: true,
      analyserLastTickAt: NOW - 30_000,
      lastVisibilityChangeAt: NOW - 45_000,
    });
    expect(classifyCaptureSilence(hidden)).toBe('analyser_stalled');
    expect(buildCaptureForensics(hidden).pageHidden).toBe(true);
    expect(buildCaptureForensics(hidden).msSinceVisibilityChange).toBe(45_000);
  });
});

describe('buildCaptureForensics', () => {
  it('emits only flat scalars the telemetry receiver will keep', () => {
    // The receiver drops keys over 64 chars and does not traverse objects, so
    // a nested field would vanish silently — coverage we would believe we had.
    const record = buildCaptureForensics(input());
    for (const [key, value] of Object.entries(record)) {
      expect(key.length).toBeLessThanOrEqual(64);
      expect(['string', 'number', 'boolean']).toContain(value === null ? 'string' : typeof value);
    }
  });

  it('distinguishes "never happened" from "happened just now" on every boundary', () => {
    const record = buildCaptureForensics(input());
    expect(record.msSinceResult).toBe(-1);
    expect(record.msSinceError).toBe(-1);
    expect(record.msSinceEnd).toBe(-1);
    expect(record.msSinceOnStart).toBe(20_000);
    expect(record.msSinceAudioStart).toBe(19_900);
    expect(record.msSinceSpeechStart).toBe(19_500);
  });

  it('carries the witness alongside the raw evidence for it', () => {
    // The classification must never be the only thing reported: a reader has
    // to be able to disagree with the adjudication table from the same record.
    const record = buildCaptureForensics(input());
    expect(record.witness).toBe('analyser_hearing_voice');
    expect(record.msSinceAnalyserTick).toBe(16);
    expect(record.msSinceAnalyserVoice).toBe(800);
    expect(record.analyserPeak).toBe(0.52);
    expect(record.analyserPeakPrev).toBe(0.48);
    expect(record.trackReadyState).toBe('live');
  });

  it('reports zero rather than a huge age when nothing was ever armed', () => {
    const record = buildCaptureForensics(input({ silentForMs: 0 }));
    expect(record.silentForMs).toBe(0);
  });

  it('carries device identity but never a device label', () => {
    // Device labels routinely contain a person's name ("Kelly's AirPods").
    // The input type has no field for one, so this pins the absence.
    const record = buildCaptureForensics(input());
    expect(record.trackDeviceId).toBe('a1b2c3d4');
    expect(Object.keys(record)).not.toContain('trackLabel');
  });
});
