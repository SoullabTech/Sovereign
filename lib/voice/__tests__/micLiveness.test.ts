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
 */

import {
  assessCaptureLiveness,
  describeCaptureLoss,
  isCaptureLossUnexpected,
  CAPTURE_REASON_CODES,
  CAPTURE_SILENT_DEATH_MS,
  CAPTURE_ARMING_SILENT_MS,
  type CaptureLossCause,
} from '../micLiveness';

const T0 = 1_700_000_000_000;

const base = {
  now: T0,
  lastActivityAt: T0,
  armedAt: T0,
  audioOpened: true,
  applicable: true,
};

describe('assessCaptureLiveness', () => {
  it('reports alive while events are arriving', () => {
    expect(assessCaptureLiveness({ ...base }).dead).toBe(false);
  });

  it('detects silent death once no event has arrived for the full window', () => {
    const v = assessCaptureLiveness({
      ...base,
      now: T0 + CAPTURE_SILENT_DEATH_MS,
    });
    expect(v.dead).toBe(true);
    expect(v.cause).toBe('silent_death');
    expect(v.silentForMs).toBeGreaterThanOrEqual(CAPTURE_SILENT_DEATH_MS);
  });

  it('does NOT fire one millisecond early', () => {
    expect(
      assessCaptureLiveness({ ...base, now: T0 + CAPTURE_SILENT_DEATH_MS - 1 }).dead,
    ).toBe(false);
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
