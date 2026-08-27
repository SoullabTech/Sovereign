import {
  shouldNormalizeToIdle,
  restartPolicy,
  staleLatchesToClearForTap,
  TURN_COMPLETE_RECOVERABLE,
  type MicStateName,
} from '../restartAuthority';

/**
 * THE REGRESSION THESE LOCK
 * -------------------------
 * authorityGuard admits a restart only from IDLE or ERROR. The post-TTS handler
 * returned the mic to IDLE only from PLAYING_TTS. A turn ending in SUBMITTING or
 * WAITING_FOR_TTS therefore left micState pinned at a rejected value, and every
 * later restart — including an explicit user tap — was blocked for the rest of
 * the session. One answer, then dead, on PWA and iOS.
 */
describe('shouldNormalizeToIdle — the dead-after-one-round fix', () => {
  it('normalizes SUBMITTING — the state that killed the session', () => {
    expect(shouldNormalizeToIdle('SUBMITTING', false)).toBe(true);
  });

  it('normalizes WAITING_FOR_TTS', () => {
    expect(shouldNormalizeToIdle('WAITING_FOR_TTS', false)).toBe(true);
  });

  it('still normalizes PLAYING_TTS — the only state the old code handled', () => {
    expect(shouldNormalizeToIdle('PLAYING_TTS', false)).toBe(true);
  });

  it.each<MicStateName>(['ERROR', 'INTERRUPTED'])('normalizes recoverable %s', (s) => {
    expect(shouldNormalizeToIdle(s, false)).toBe(true);
  });

  it('NEVER stomps live capture', () => {
    expect(shouldNormalizeToIdle('LISTENING', false)).toBe(false);
    expect(shouldNormalizeToIdle('CAPTURING', false)).toBe(false);
  });

  it('leaves a REAL arming alone but clears a stale one', () => {
    expect(shouldNormalizeToIdle('ARMING', true)).toBe(false);   // genuinely arming
    expect(shouldNormalizeToIdle('ARMING', false)).toBe(true);   // stale latch
  });

  it('is a no-op on IDLE', () => {
    expect(shouldNormalizeToIdle('IDLE', false)).toBe(false);
  });

  it('every recoverable state normalizes — no privileged predecessor', () => {
    // The old bug in one assertion: normalization keyed on ONE state, not the set.
    for (const s of TURN_COMPLETE_RECOVERABLE) {
      expect(shouldNormalizeToIdle(s, false)).toBe(true);
    }
  });
});

const base = {
  handsFree: false, isSpeaking: false, isProcessing: false, requestInFlight: false,
};

describe('restartPolicy — HANDS_FREE re-arms, PUSH_TO_TALK honours the tap', () => {
  it('PWA/iOS HANDS_FREE: MAIA stopping re-arms automatically', () => {
    expect(restartPolicy({ ...base, source: 'maia_stopped_speaking', handsFree: true }))
      .toEqual({ allowed: true });
  });

  it('PUSH_TO_TALK: MAIA stopping does NOT auto-restart', () => {
    const d = restartPolicy({ ...base, source: 'maia_stopped_speaking', handsFree: false });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe('push_to_talk_awaits_tap');
  });

  it('PUSH_TO_TALK: the next user tap IS honoured — turn 2 is reachable', () => {
    // "Push-to-talk" is not a licence for the button to stop working.
    expect(restartPolicy({ ...base, source: 'user_tap', handsFree: false }))
      .toEqual({ allowed: true });
  });

  it('refuses any source while MAIA is still speaking', () => {
    expect(restartPolicy({ ...base, source: 'user_tap', isSpeaking: true }).reason)
      .toBe('maia_speaking');
    expect(restartPolicy({ ...base, source: 'maia_stopped_speaking', handsFree: true, isSpeaking: true }).reason)
      .toBe('maia_speaking');
  });

  it('refuses while a turn is still processing', () => {
    expect(restartPolicy({ ...base, source: 'user_tap', isProcessing: true }).reason)
      .toBe('processing');
  });

  it('re-entrancy outranks everything, including forceOverride', () => {
    // Two concurrent starts is the failure the old competing paths produced.
    expect(restartPolicy({ ...base, source: 'user_tap', requestInFlight: true, forceOverride: true }).reason)
      .toBe('request_in_flight');
  });

  it('forceOverride admits a restart the policy would otherwise refuse', () => {
    expect(restartPolicy({ ...base, source: 'recognition_stopped', isSpeaking: true, forceOverride: true }))
      .toEqual({ allowed: true });
  });

  it.each(['interruption_end', 'foreground_resume'] as const)(
    '%s follows hands-free policy, not its own private predicate', (source) => {
      expect(restartPolicy({ ...base, source, handsFree: true }).allowed).toBe(true);
      expect(restartPolicy({ ...base, source, handsFree: false }).reason).toBe('push_to_talk_awaits_tap');
    });
});

describe('staleLatchesToClearForTap — a gesture must never be silently swallowed', () => {
  it('clears a stale restartInFlight left by a previous turn', () => {
    expect(staleLatchesToClearForTap({ restartInFlight: true, isStarting: false, micState: 'IDLE' }))
      .toEqual(['restartInFlight']);
  });

  it('clears a stale isStarting when nothing is actually arming', () => {
    expect(staleLatchesToClearForTap({ restartInFlight: false, isStarting: true, micState: 'SUBMITTING' }))
      .toEqual(['isStarting']);
  });

  it('does NOT clear isStarting during a real arming sequence', () => {
    expect(staleLatchesToClearForTap({ restartInFlight: false, isStarting: true, micState: 'ARMING' }))
      .toEqual([]);
  });

  it('clears both when both leaked', () => {
    expect(staleLatchesToClearForTap({ restartInFlight: true, isStarting: true, micState: 'SUBMITTING' }))
      .toEqual(['restartInFlight', 'isStarting']);
  });

  it('clears nothing on a clean state', () => {
    expect(staleLatchesToClearForTap({ restartInFlight: false, isStarting: false, micState: 'IDLE' }))
      .toEqual([]);
  });
});

describe('turn-2 reachability — the acceptance shape, end to end', () => {
  /** Turn 1 ended in `endState`; can turn 2 be reached? */
  function turn2Reachable(endState: MicStateName, handsFree: boolean, viaTap: boolean) {
    const normalized = shouldNormalizeToIdle(endState, false) ? 'IDLE' : endState;
    const admissible = normalized === 'IDLE' || normalized === 'ERROR';
    const policy = restartPolicy({
      ...base,
      source: viaTap ? 'user_tap' : 'maia_stopped_speaking',
      handsFree,
    });
    return admissible && policy.allowed;
  }

  it.each<MicStateName>(['PLAYING_TTS', 'WAITING_FOR_TTS', 'SUBMITTING', 'ERROR', 'INTERRUPTED'])(
    'HANDS_FREE: turn 2 reachable after a turn ending in %s', (endState) => {
      expect(turn2Reachable(endState, true, false)).toBe(true);
    });

  it.each<MicStateName>(['PLAYING_TTS', 'WAITING_FOR_TTS', 'SUBMITTING', 'ERROR', 'INTERRUPTED'])(
    'PUSH_TO_TALK: the tap reaches turn 2 after a turn ending in %s', (endState) => {
      expect(turn2Reachable(endState, false, true)).toBe(true);
    });

  it('FALSIFICATION: the OLD PLAYING_TTS-only rule leaves SUBMITTING unreachable', () => {
    const oldNormalize = (s: MicStateName) => (s === 'PLAYING_TTS' ? 'IDLE' : s);
    const oldAdmissible = (s: MicStateName) => {
      const n = oldNormalize(s);
      return n === 'IDLE' || n === 'ERROR';
    };
    expect(oldAdmissible('SUBMITTING')).toBe(false);        // the incident
    expect(oldAdmissible('WAITING_FOR_TTS')).toBe(false);   // the incident
    expect(oldAdmissible('PLAYING_TTS')).toBe(true);        // why it "worked" sometimes
  });
});
