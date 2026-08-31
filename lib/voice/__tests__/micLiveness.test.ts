/**
 * Capture liveness tests.
 *
 * Context: a beta tester held a 5-10 minute voice conversation on macOS Safari
 * during which the capture path was dead. The mic button still read
 * "Listening". No error fired, no state changed, and everything spoken in the
 * interval was gone. `webSpeechLifecycle` covers failures recognition REPORTS;
 * these tests pin the contract for the failure that reports nothing — where the
 * only observable is an ABSENCE of events, and only a watchdog can see it.
 *
 * The load-bearing property under test is asymmetric: a missed death costs the
 * member their train of thought, but a FALSE death interrupts a working
 * conversation. So these tests pin both directions — dead is detected, and the
 * legitimate silences (MAIA speaking, a turn processing, a member thinking) are
 * never mistaken for it.
 *
 * ── 2026-08-31: THE FALSE-DEATH DIRECTION WAS UNTESTED WHERE IT MATTERED ────
 *
 * This file claimed to protect "a member thinking", but its only silence guard
 * tested `applicable: false` — a window where recognition is legitimately torn
 * down. It never tested a HEALTHY, APPLICABLE, actually-listening capture with
 * a quiet member, which is the case that shipped broken: production telemetry
 * showed the watchdog killing a live session twice, on ordinary silence, with
 * the track live, the AudioContext running and the analyser ticking 12ms ago.
 * The member experienced it as "she stops listening after about twenty
 * seconds".
 *
 * Absence of recognition events is therefore no longer sufficient evidence of
 * death. A verdict now requires a CHALLENGE the member issued and recognition
 * failed to answer: a speech ONSET (voice after a quiet gap) that is newer than
 * the last recognition event and older than the response grace.
 *
 * The onset framing is deliberate and the tests below pin both of its edges:
 * quiet members are alive indefinitely, AND long continuous speech is alive —
 * because one speech episode raises exactly one onset, and a single answer to
 * it keeps the session alive for the whole utterance.
 */

import {
  assessCaptureLiveness,
  describeCaptureLoss,
  isCaptureLossUnexpected,
  CAPTURE_REASON_CODES,
  CAPTURE_SILENT_DEATH_MS,
  CAPTURE_ARMING_SILENT_MS,
  ANALYSER_ONSET_QUIET_MS,
  RECOGNITION_RESPONSE_GRACE_MS,
  type CaptureLossCause,
} from '../micLiveness';

const T0 = 1_700_000_000_000;

const base = {
  now: T0,
  lastActivityAt: T0,
  armedAt: T0,
  audioOpened: true,
  applicable: true,
  // No speech onset: the member has not spoken since recognition last spoke.
  analyserVoiceOnsetAt: 0,
};

describe('assessCaptureLiveness', () => {
  it('reports alive while events are arriving', () => {
    expect(assessCaptureLiveness({ ...base }).dead).toBe(false);
  });

  // ── SILENCE IS NOT EVIDENCE ────────────────────────────────────────────────
  //
  // The removed test asserted that no event for CAPTURE_SILENT_DEATH_MS meant
  // dead. Production falsified it: that is what a thinking member looks like.

  it('holds a quiet member alive well past the old 15s window', () => {
    const v = assessCaptureLiveness({ ...base, now: T0 + CAPTURE_SILENT_DEATH_MS * 2 });
    expect(v.dead).toBe(false);
  });

  it('holds a quiet member alive through 60+ seconds of genuine silence', () => {
    // The branch's own physical witness: 60s of quiet, then speak again.
    // A verdict here would fail that witness before it began.
    expect(assessCaptureLiveness({ ...base, now: T0 + 60_000 }).dead).toBe(false);
    expect(assessCaptureLiveness({ ...base, now: T0 + 5 * 60_000 }).dead).toBe(false);
  });

  it('never declares death from absence alone, however long', () => {
    // No onset means the member issued no challenge. Unfalsifiable, so alive.
    expect(assessCaptureLiveness({ ...base, now: T0 + 60 * 60_000 }).dead).toBe(false);
  });

  // ── THE CHALLENGE: A SPOKEN ONSET RECOGNITION DID NOT ANSWER ───────────────

  it('declares silent death when recognition ignores a new speech onset', () => {
    const onset = T0 + 30_000;               // member speaks again after quiet
    const v = assessCaptureLiveness({
      ...base,
      analyserVoiceOnsetAt: onset,
      now: onset + RECOGNITION_RESPONSE_GRACE_MS,
    });
    expect(v.dead).toBe(true);
    expect(v.cause).toBe('silent_death');
  });

  it('does NOT fire one millisecond before the response grace elapses', () => {
    const onset = T0 + 30_000;
    expect(
      assessCaptureLiveness({
        ...base,
        analyserVoiceOnsetAt: onset,
        now: onset + RECOGNITION_RESPONSE_GRACE_MS - 1,
      }).dead,
    ).toBe(false);
  });

  it('resets when recognition answers the onset before the grace expires', () => {
    const onset = T0 + 30_000;
    const v = assessCaptureLiveness({
      ...base,
      analyserVoiceOnsetAt: onset,
      lastActivityAt: onset + 400,           // an interim arrived: it is alive
      now: onset + RECOGNITION_RESPONSE_GRACE_MS * 3,
    });
    expect(v.dead).toBe(false);
  });

  // ── LONG-FORM SPEECH MUST NOT BE CUT OFF ───────────────────────────────────

  it('holds a member speaking continuously past the grace alive', () => {
    // One episode raises ONE onset. Recognition answered it once; no further
    // onset can occur until a real quiet gap. Timing recognition against
    // continuous speech instead would reintroduce the long-form cutoff.
    const onset = T0;
    const v = assessCaptureLiveness({
      ...base,
      analyserVoiceOnsetAt: onset,
      lastActivityAt: onset + 300,
      now: onset + 90_000,                   // ninety seconds of talking
    });
    expect(v.dead).toBe(false);
  });

  it('ignores an onset older than the last recognition event', () => {
    // Ordinary healthy turn-taking: the member spoke, recognition answered.
    const onset = T0 + 10_000;
    expect(
      assessCaptureLiveness({
        ...base,
        analyserVoiceOnsetAt: onset,
        lastActivityAt: onset + 1_000,
        now: onset + 60_000,
      }).dead,
    ).toBe(false);
  });

  it('cannot reach a verdict without an analyser witness', () => {
    // A stalled analyser produces no new onsets. Absence of a witness reads as
    // "cannot say", never as "dead" — track and context failures have their
    // own causes and do not route through this verdict.
    expect(
      assessCaptureLiveness({ ...base, analyserVoiceOnsetAt: 0, now: T0 + 10 * 60_000 }).dead,
    ).toBe(false);
  });

  it('keeps the onset quiet-gap long enough to survive a mid-sentence breath', () => {
    expect(ANALYSER_ONSET_QUIET_MS).toBeGreaterThanOrEqual(1_000);
    // And the grace comfortably exceeds an observed healthy first interim
    // (250-1600ms in the 2026-08-31 production capture).
    expect(RECOGNITION_RESPONSE_GRACE_MS).toBeGreaterThanOrEqual(3_000);
  });

  it('detects a stillborn instance: onstart fired but audio never opened', () => {
    const v = assessCaptureLiveness({
      ...base,
      audioOpened: false,
      now: T0 + CAPTURE_ARMING_SILENT_MS,
    });
    expect(v.dead).toBe(true);
    expect(v.cause).toBe('never_armed');
  });

  it('gives an unopened instance the full arming window before judging it', () => {
    expect(
      assessCaptureLiveness({
        ...base,
        audioOpened: false,
        now: T0 + CAPTURE_ARMING_SILENT_MS - 1,
      }).dead,
    ).toBe(false);
  });

  // ── The false-positive guards. Each of these is a legitimate silence. ──

  it('stays silent while inapplicable, however long the gap', () => {
    // MAIA speaking / turn processing / restart in flight: recognition is
    // intentionally torn down. Declaring death here would interrupt a
    // conversation that is working perfectly.
    const v = assessCaptureLiveness({
      ...base,
      applicable: false,
      now: T0 + CAPTURE_SILENT_DEATH_MS * 10,
    });
    expect(v.dead).toBe(false);
    expect(v.silentForMs).toBe(0);
  });

  it('never judges an instance that was never armed', () => {
    expect(
      assessCaptureLiveness({ ...base, armedAt: 0, now: T0 + CAPTURE_SILENT_DEATH_MS * 5 }).dead,
    ).toBe(false);
  });

  it('measures from the later of armedAt and lastActivityAt', () => {
    // A fresh instance armed just now is alive even if the previous instance's
    // last activity was long ago — otherwise every restart would look dead.
    const v = assessCaptureLiveness({
      ...base,
      lastActivityAt: T0 - CAPTURE_SILENT_DEATH_MS * 3,
      armedAt: T0,
      now: T0 + 500,
    });
    expect(v.dead).toBe(false);
  });

  it('tolerates clock skew rather than reporting a negative silence', () => {
    const v = assessCaptureLiveness({ ...base, now: T0 - 5_000 });
    expect(v.dead).toBe(false);
    expect(v.silentForMs).toBe(0);
  });
});

describe('describeCaptureLoss', () => {
  const causes: CaptureLossCause[] = [
    'silent_death', 'never_armed', 'track_ended', 'track_muted',
    'restart_loop', 'abort_loop', 'inactivity',
    'audio_context_interrupted', 'device_changed', 'permission_lost',
  ];

  it.each(causes)('gives %s a message with a recovery action', (cause) => {
    const msg = describeCaptureLoss(cause);
    expect(msg.length).toBeGreaterThan(0);
    expect(msg).toMatch(/tap|re-allow|check/i);
  });

  it('never shows a raw error code to the member', () => {
    for (const cause of causes) {
      expect(describeCaptureLoss(cause)).not.toContain(cause);
    }
  });

  it('never blames the member for a capture-layer failure', () => {
    for (const cause of causes) {
      expect(describeCaptureLoss(cause)).not.toMatch(/you (?:did|caused|broke)/i);
    }
  });

  it('says so when speech was preserved — the member\'s first fear', () => {
    const msg = describeCaptureLoss('track_muted', { transcriptPreserved: true });
    expect(msg).toMatch(/saved in the message box/i);
  });

  it('does not claim preservation when nothing was preserved', () => {
    expect(describeCaptureLoss('track_muted')).not.toMatch(/saved/i);
  });

  it('does not guess WHICH application took the mic — we cannot observe that', () => {
    expect(describeCaptureLoss('track_muted')).not.toMatch(/zoom|teams|meet|discord/i);
    expect(describeCaptureLoss('track_muted')).toMatch(/another app/i);
  });
});

describe('isCaptureLossUnexpected', () => {
  it('treats an expected stand-down as not worth interrupting for', () => {
    expect(isCaptureLossUnexpected('inactivity')).toBe(false);
  });

  it('treats every genuine break as worth interrupting for', () => {
    for (const cause of ['silent_death', 'track_muted', 'track_ended', 'never_armed'] as const) {
      expect(isCaptureLossUnexpected(cause)).toBe(true);
    }
  });
});

describe('CAPTURE_REASON_CODES', () => {
  it('gives every cause a canonical code for bug reports', () => {
    const causes: CaptureLossCause[] = [
      'silent_death', 'never_armed', 'track_ended', 'track_muted',
      'restart_loop', 'abort_loop', 'inactivity',
      'audio_context_interrupted', 'device_changed', 'permission_lost',
    ];
    for (const c of causes) {
      expect(CAPTURE_REASON_CODES[c]).toMatch(/^[A-Z_]+$/);
    }
  });

  it('codes are unique, so a report names exactly one failure', () => {
    const values = Object.values(CAPTURE_REASON_CODES);
    expect(new Set(values).size).toBe(values.length);
  });
});
