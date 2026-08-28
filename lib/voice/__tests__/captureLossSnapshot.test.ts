/**
 * VOICE-CAPTURE-NO-AUDIO-01a — the snapshot must discriminate, not just record.
 *
 * The failure it exists to explain, from build 847485d41:
 *   onstart ✓ onaudiostart ✓ onspeechstart ✓ · onresult ✗ onerror ✗ onend ✗
 *
 * Two mechanisms produce that identical signature. The only field that
 * separates them is what the local analyser saw, so that is what is tested
 * hardest here.
 */

import {
  assessLocalAudio,
  buildCaptureLossSnapshot,
  ANALYSER_STALE_MS,
  type CaptureLossSnapshotInput,
} from '../captureLossSnapshot';

const NOW = 1_000_000;

function input(over: Partial<CaptureLossSnapshotInput> = {}): CaptureLossSnapshotInput {
  return {
    now: NOW,
    silentForMs: 15_000,
    recognition: {
      generation: 4,
      sessionState: 'LISTENING',
      shouldRecreate: false,
      handlerAt: {
        onstart: NOW - 16_000,
        onaudiostart: NOW - 15_900,
        onspeechstart: NOW - 15_000,
        onresult: 0,
        onerror: 0,
        onend: 0,
      },
    },
    track: { readyState: 'live', enabled: true, muted: false, label: 'Scarlett 2i2 USB' },
    localAudio: {
      contextState: 'running',
      level: 0.31,
      lastLevelUpdateAt: NOW - 20,
      lastAboveThresholdAt: NOW - 400,
      peakRecent: 0.52,
      threshold: 0.05,
    },
    capture: {
      micState: 'LISTENING',
      listeningMode: 'HANDS_FREE',
      isListening: true,
      isRecording: true,
      restartInFlight: false,
    },
    ...over,
  };
}

describe('assessLocalAudio — the A/B discriminator', () => {
  it('reports voice_present when energy occurred INSIDE the silent window', () => {
    // Recognition dead 15s; voice heard 400ms ago → audio fine, recognizer dead.
    expect(assessLocalAudio(input())).toBe('voice_present');
  });

  it('reports silent when the last energy predates the silent window', () => {
    // Voice last heard 20s ago, window is 15s → the member may simply have
    // stopped speaking, or the input died. Either way: not proof of life.
    const i = input();
    i.localAudio.lastAboveThresholdAt = NOW - 20_000;
    expect(assessLocalAudio(i)).toBe('silent');
  });

  it('treats energy exactly at the window boundary as present', () => {
    const i = input();
    i.localAudio.lastAboveThresholdAt = NOW - 15_000;
    expect(assessLocalAudio(i)).toBe('voice_present');
  });

  it('reports analyser_stalled when the loop itself stopped writing', () => {
    // A stale reading is not a quiet room — it means nothing was witnessed,
    // and claiming "silent" from it would be a false attribution.
    const i = input();
    i.localAudio.lastLevelUpdateAt = NOW - (ANALYSER_STALE_MS + 1);
    expect(assessLocalAudio(i)).toBe('analyser_stalled');
  });

  it('reports unavailable when no analyser ever ran', () => {
    const i = input();
    i.localAudio.lastLevelUpdateAt = 0;
    expect(assessLocalAudio(i)).toBe('unavailable');
  });
});

describe('buildCaptureLossSnapshot', () => {
  it('records -1 for handlers that never fired, not 0 or a bogus age', () => {
    const s = buildCaptureLossSnapshot(input());
    expect(s.msSinceOnResult).toBe(-1);
    expect(s.msSinceOnError).toBe(-1);
    expect(s.msSinceOnEnd).toBe(-1);
    expect(s.msSinceOnSpeechStart).toBe(15_000);
    expect(s.msSinceOnAudioStart).toBe(15_900);
  });

  it('reproduces the 847485d41 signature and names it a recognizer death', () => {
    const s = buildCaptureLossSnapshot(input());
    expect(s.localAudioVerdict).toBe('voice_present');
    expect(s.trackReadyState).toBe('live');
    expect(s.trackMuted).toBe(false);
    expect(s.audioContextState).toBe('running');
    // Recognition heard nothing while the analyser heard speech.
    expect(s.msSinceOnResult).toBe(-1);
    expect(s.audioLevel).toBeGreaterThan(s.audioThreshold);
  });

  it('distinguishes an input-delivery death from a recognizer death', () => {
    const i = input();
    i.localAudio.level = 0.0;
    i.localAudio.peakRecent = 0.004;
    i.localAudio.lastAboveThresholdAt = NOW - 30_000;
    const s = buildCaptureLossSnapshot(i);
    expect(s.localAudioVerdict).toBe('silent');
    // Still "live" — which is exactly why the track state alone cannot decide.
    expect(s.trackReadyState).toBe('live');
  });

  it('handles a stream that was already gone', () => {
    const s = buildCaptureLossSnapshot(input({ track: null }));
    expect(s.trackPresent).toBe(false);
    expect(s.trackReadyState).toBeNull();
    expect(s.trackLabel).toBeNull();
  });

  it('carries no transcript content — only states, ages and levels', () => {
    // The guarantee is structural: string-valued fields are restricted to a
    // fixed whitelist of state enums plus the device label, and none of them
    // can hold free text. Anything a member said is a long string; every
    // permitted value here is a short identifier.
    const ALLOWED_STRING_FIELDS = [
      'localAudioVerdict', 'recognitionState', 'trackReadyState',
      'trackLabel', 'audioContextState', 'micState', 'listeningMode',
    ];
    const s = buildCaptureLossSnapshot(input());

    for (const [key, value] of Object.entries(s)) {
      if (typeof value !== 'string') continue;
      expect(ALLOWED_STRING_FIELDS).toContain(key);
      expect(value.length).toBeLessThan(64);
    }
  });

  it('clamps negative or absent durations rather than emitting nonsense', () => {
    const i = input({ silentForMs: -5 });
    i.localAudio.lastLevelUpdateAt = NOW + 50; // clock skew
    const s = buildCaptureLossSnapshot(i);
    expect(s.silentForMs).toBe(0);
    expect(s.audioLevelAgeMs).toBe(0);
  });
});
