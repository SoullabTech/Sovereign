/**
 * Web Speech recognition lifecycle tests.
 *
 * Context: on desktop, MAIA's voice input is Chrome's Web Speech API. Chrome
 * zombies a recognition instance that is reused after abort/error — onstart
 * keeps firing but onresult never does, which presented as the beta tester's
 * "stuck mic button" (looks like Listening, hears nothing; only a page refresh
 * recovered). These tests pin the lifecycle contract that fixes it:
 * NEVER reuse a failed/aborted/suspended instance; always adopt a fresh one;
 * drop every callback from superseded instances; recover from device changes.
 *
 * The FakeRecognition below simulates the zombie behavior faithfully: once
 * aborted, a restarted instance still fires onstart but never onresult.
 */

import {
  WebSpeechRecognitionSession,
  classifyRecognitionError,
  type RecognitionLike,
} from '../webSpeechLifecycle';

/** Faithful stand-in for Chrome's webkitSpeechRecognition failure mode. */
class FakeRecognition implements RecognitionLike {
  onstart: ((ev?: any) => void) | null = null;
  onresult: ((ev?: any) => void) | null = null;
  onerror: ((ev?: any) => void) | null = null;
  onend: ((ev?: any) => void) | null = null;
  onaudiostart: ((ev?: any) => void) | null = null;
  onspeechstart: ((ev?: any) => void) | null = null;

  running = false;
  wasAborted = false; // once true, this instance is a zombie on reuse
  startCalls = 0;
  abortCalls = 0;

  start() {
    if (this.running) throw Object.assign(new Error('already started'), { name: 'InvalidStateError' });
    this.running = true;
    this.startCalls++;
    // Chrome zombie semantics: onstart still fires even on a spent object…
    this.onstart?.();
  }

  /** Simulate the user speaking. A zombied instance stays silent — the bug. */
  speak(text: string) {
    if (!this.running) return;
    if (this.wasAborted && this.startCalls > 1) return; // 🧟 zombie: no results ever again
    this.onresult?.({ results: [[{ transcript: text }]], resultIndex: 0 });
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    this.onend?.();
  }

  abort() {
    this.abortCalls++;
    this.wasAborted = true;
    if (!this.running) return;
    this.running = false;
    this.onend?.();
  }

  emitError(error: string) {
    this.onerror?.({ error });
    // Per spec, onend follows onerror
    if (this.running) {
      this.running = false;
      this.onend?.();
    }
  }
}

/** Minimal navigator.mediaDevices stand-in. */
class FakeMediaDevices {
  private listeners = new Map<string, Set<() => void>>();
  addEventListener(type: string, l: () => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(l);
  }
  removeEventListener(type: string, l: () => void) {
    this.listeners.get(type)?.delete(l);
  }
  emitDeviceChange() {
    this.listeners.get('devicechange')?.forEach((l) => l());
  }
  count(type: string) {
    return this.listeners.get(type)?.size ?? 0;
  }
}

describe('classifyRecognitionError', () => {
  it('treats permission denial as fatal + recreate with a retryable message', () => {
    for (const code of ['not-allowed', 'service-not-allowed']) {
      const action = classifyRecognitionError(code, 0);
      expect(action.fatal).toBe(true);
      expect(action.recreate).toBe(true);
      expect(action.userMessage).toMatch(/tap the mic/i);
    }
  });

  it('lets a single network error retry silently but stops after repeated failures', () => {
    expect(classifyRecognitionError('network', 1)).toEqual({ fatal: false, recreate: true });
    const repeated = classifyRecognitionError('network', 2);
    expect(repeated.fatal).toBe(true);
    expect(repeated.userMessage).toMatch(/tap the mic/i);
  });

  it('marks every error (including unknown) as never-reuse-this-instance', () => {
    for (const code of ['no-speech', 'aborted', 'audio-capture', 'bananas-unknown']) {
      expect(classifyRecognitionError(code, 0).recreate).toBe(true);
    }
  });

  it('keeps routine continuous-mode errors non-fatal', () => {
    for (const code of ['no-speech', 'aborted']) {
      expect(classifyRecognitionError(code, 0).fatal).toBe(false);
    }
  });
});

describe('WebSpeechRecognitionSession — instance identity', () => {
  it('adopt() replaces the current instance and bumps the generation', () => {
    const session = new WebSpeechRecognitionSession();
    const a = new FakeRecognition();
    const b = new FakeRecognition();

    const genA = session.adopt(a);
    expect(session.current).toBe(a);
    const genB = session.adopt(b);

    expect(genB).toBeGreaterThan(genA);
    expect(session.current).toBe(b);
    expect(session.isCurrent(genA)).toBe(false);
    expect(session.isCurrent(genB)).toBe(true);
  });

  it('restart-after-invalidation creates a NEW object, never reusing the old one', () => {
    const session = new WebSpeechRecognitionSession();
    const first = new FakeRecognition();
    session.adopt(first);
    first.start();

    // Error strikes → mark invalid (the component's onerror path)
    first.emitError('aborted');
    session.markForRecreate('onerror_aborted');
    expect(session.shouldRecreate).toBe(true);

    // The next listen attempt must build fresh — simulate the component doing so
    const second = new FakeRecognition();
    session.adopt(second);
    expect(session.shouldRecreate).toBe(false);
    expect(session.current).toBe(second);
    expect(session.current).not.toBe(first);

    // And the fresh instance actually hears the user (no zombie)
    second.start();
    const heard: string[] = [];
    second.onresult = () => heard.push('yes');
    second.speak('hello');
    expect(heard).toHaveLength(1);
  });

  it('markForRecreate keeps the instance current (in-flight onend may still run) but flags rebuild', () => {
    const session = new WebSpeechRecognitionSession();
    const inst = new FakeRecognition();
    const gen = session.adopt(inst);

    session.markForRecreate('network');
    expect(session.current).toBe(inst); // soft invalidation
    expect(session.isCurrent(gen)).toBe(true);
    expect(session.shouldRecreate).toBe(true);
  });
});

describe('WebSpeechRecognitionSession — stale callback guard', () => {
  it('drops events from a superseded instance so they cannot mutate current state', () => {
    const session = new WebSpeechRecognitionSession();
    let state = 'IDLE';

    const old = new FakeRecognition();
    const oldGen = session.adopt(old);
    // Wire like the component: guarded handlers stamped with the generation
    old.onend = session.guard(oldGen, () => { state = 'MUTATED_BY_STALE_ONEND'; });

    // Simulate: the component captured the raw handler before discard nulled it
    // (worst case — e.g. an event already in the microtask queue)
    const capturedStaleOnEnd = old.onend!;

    const fresh = new FakeRecognition();
    session.adopt(fresh); // supersedes `old`

    capturedStaleOnEnd(); // stale onend fires late
    expect(state).toBe('IDLE'); // guard dropped it
  });

  it('discard() detaches handlers and aborts, so the instance emits nothing further', () => {
    const session = new WebSpeechRecognitionSession();
    const inst = new FakeRecognition();
    const gen = session.adopt(inst);
    let fired = 0;
    inst.onend = session.guard(gen, () => { fired++; });
    inst.start();

    session.discard('test');

    expect(inst.onend).toBeNull(); // fully detached
    expect(inst.abortCalls).toBe(1); // aborted on discard
    expect(inst.running).toBe(false);
    expect(session.current).toBeNull();
    expect(fired).toBe(0); // the abort couldn't re-enter our handler
  });

  it('unregisters discarded instances from the feedback-prevention registry', () => {
    const unregistered: RecognitionLike[] = [];
    const session = new WebSpeechRecognitionSession({ unregister: (r) => unregistered.push(r) });
    const a = new FakeRecognition();
    const b = new FakeRecognition();
    session.adopt(a);
    session.adopt(b); // discards a
    session.discard('done'); // discards b
    expect(unregistered).toEqual([a, b]);
  });
});

describe('WebSpeechRecognitionSession — TTS suspension (planned, not failure)', () => {
  it('suspendForTts discards the live instance, enters SUSPENDED, and requires a fresh resume', () => {
    const session = new WebSpeechRecognitionSession();
    const inst = new FakeRecognition();
    session.adopt(inst);
    inst.start();

    session.suspendForTts();

    expect(session.state).toBe('SUSPENDED');
    expect(session.current).toBeNull(); // mic capture left the playback window
    expect(inst.running).toBe(false);
    expect(session.shouldRecreate).toBe(true); // resume MUST build fresh
  });

  it('an old instance restarted after a newer one exists cannot affect the session', () => {
    const session = new WebSpeechRecognitionSession();
    const old = new FakeRecognition();
    const oldGen = session.adopt(old);
    session.suspendForTts(); // discards old

    const fresh = new FakeRecognition();
    const freshGen = session.adopt(fresh);

    // Some rogue path restarts the old object directly
    old.start();
    expect(session.isCurrent(oldGen)).toBe(false);
    expect(session.isCurrent(freshGen)).toBe(true);
    expect(session.current).toBe(fresh); // rogue restart changed nothing
  });
});

describe('WebSpeechRecognitionSession — device changes', () => {
  it('devicechange tears down the live instance and returns to a recoverable IDLE', () => {
    const session = new WebSpeechRecognitionSession();
    const media = new FakeMediaDevices();
    let uiRecovered = false;
    session.attachDeviceChange(media, () => { uiRecovered = true; });

    const inst = new FakeRecognition();
    session.adopt(inst);
    inst.start();
    session.setState('LISTENING');

    media.emitDeviceChange();

    expect(inst.running).toBe(false); // stranded instance stopped
    expect(session.current).toBeNull(); // …and invalidated
    expect(session.state).toBe('IDLE'); // recoverable, not latched
    expect(session.shouldRecreate).toBe(true); // reacquire = fresh object
    expect(uiRecovered).toBe(true); // component callback ran (surfaces retry UI)
  });

  it('attachDeviceChange is idempotent (no competing listeners)', () => {
    const session = new WebSpeechRecognitionSession();
    const media = new FakeMediaDevices();
    session.attachDeviceChange(media, () => {});
    session.attachDeviceChange(media, () => {});
    expect(media.count('devicechange')).toBe(1);
  });

  it('dispose (unmount) removes the devicechange listener and prevents any restart', () => {
    const session = new WebSpeechRecognitionSession();
    const media = new FakeMediaDevices();
    let called = 0;
    session.attachDeviceChange(media, () => { called++; });
    const inst = new FakeRecognition();
    session.adopt(inst);

    session.dispose();

    expect(media.count('devicechange')).toBe(0); // listener removed
    expect(session.current).toBeNull();
    expect(inst.onend).toBeNull(); // handlers detached: nothing can restart
    media.emitDeviceChange();
    expect(called).toBe(0); // no post-unmount callbacks
  });
});

describe('failed start() is recoverable', () => {
  it('a start() throw leads to discard + fresh instance on the next attempt, which works', () => {
    const session = new WebSpeechRecognitionSession();

    const broken = new FakeRecognition();
    broken.start = () => { throw Object.assign(new Error('start failed'), { name: 'NotAllowedError' }); };
    session.adopt(broken);

    // Component's ensureFreshAndStart failure path: discard, mark nothing else
    expect(() => broken.start()).toThrow();
    session.discard('start_failed');
    expect(session.shouldRecreate).toBe(true);

    // Next attempt (user tap) builds fresh and succeeds
    const fresh = new FakeRecognition();
    session.adopt(fresh);
    fresh.start();
    const heard: string[] = [];
    fresh.onresult = () => heard.push('ok');
    fresh.speak('recovered');
    expect(heard).toHaveLength(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SOAK: 15 full conversation turns of listen → MAIA speaks (suspend) → resume,
// with injected errors and device changes along the way. This mirrors the
// component's orchestration of the session. The old code FAILS this scenario
// by turn ~3 (reused aborted instance = zombie); the lifecycle passes because
// every resume adopts a fresh object.
// ═══════════════════════════════════════════════════════════════════════════
describe('soak: repeated speak → suspend → resume cycles keep receiving results', () => {
  /** Mirror of the component's use of the session (no React needed). */
  function makeHarness() {
    const media = new FakeMediaDevices();
    const session = new WebSpeechRecognitionSession();
    const transcripts: string[] = [];
    let listening = false; // the "UI truth"
    let voiceError: string | null = null;
    let networkErrors = 0;

    const adoptFresh = (): FakeRecognition => {
      const inst = new FakeRecognition();
      const gen = session.adopt(inst);
      inst.onstart = session.guard(gen, () => { listening = true; voiceError = null; });
      inst.onresult = session.guard(gen, (ev: any) => {
        transcripts.push(ev.results[0][0].transcript);
      });
      inst.onerror = session.guard(gen, (ev: any) => {
        if (ev.error === 'network') networkErrors++;
        const action = classifyRecognitionError(ev.error, networkErrors);
        if (action.recreate) session.markForRecreate(ev.error);
        if (action.fatal) {
          listening = false;
          voiceError = action.userMessage ?? 'retry';
          session.discard(`fatal_${ev.error}`);
        }
      });
      inst.onend = session.guard(gen, () => { listening = false; });
      return inst;
    };

    const ensureFreshAndStart = (): FakeRecognition | null => {
      if (session.shouldRecreate) adoptFresh();
      const inst = session.current as FakeRecognition | null;
      if (!inst) return null;
      try {
        if (!inst.running) inst.start();
        return inst;
      } catch {
        session.discard('start_failed');
        listening = false;
        voiceError = 'retry';
        return null;
      }
    };

    session.attachDeviceChange(media, () => {
      listening = false;
      voiceError = 'Your audio device changed. Tap the mic to reconnect.';
    });

    return {
      media,
      session,
      transcripts,
      ensureFreshAndStart,
      get listening() { return listening; },
      get voiceError() { return voiceError; },
      userTap() { voiceError = null; return ensureFreshAndStart(); },
    };
  }

  it('15 turns, including injected aborts, errors, and a device change mid-run', () => {
    const h = makeHarness();
    const TURNS = 15;

    for (let turn = 1; turn <= TURNS; turn++) {
      // ── user's side of the turn ──────────────────────────────────────────
      let inst = h.ensureFreshAndStart();
      if (!inst || !h.listening) {
        // Recoverable states require a user tap (retryable UI, not a latch)
        expect(h.voiceError).toBeTruthy();
        inst = h.userTap();
      }
      expect(inst).not.toBeNull();
      expect(h.listening).toBe(true);

      inst!.speak(`turn ${turn}`);

      // ── inject adversity on a schedule ───────────────────────────────────
      if (turn % 4 === 0) inst!.emitError('no-speech'); // routine error
      if (turn % 5 === 0) inst!.emitError('aborted');   // abort mid-turn
      if (turn === 8) h.media.emitDeviceChange();       // device swap mid-run

      // ── MAIA speaks: planned suspension of the playback window ───────────
      if (h.session.current) h.session.suspendForTts();
      expect(h.session.current).toBeNull(); // no capture during playback

      // ── MAIA finishes: resume must be a FRESH object ─────────────────────
      const before = h.session.currentGeneration;
      const resumed = h.ensureFreshAndStart();
      expect(resumed).not.toBeNull();
      expect(h.session.currentGeneration).toBeGreaterThan(before);
    }

    // Every single turn was heard — no zombie ever swallowed speech.
    expect(h.transcripts).toEqual(
      Array.from({ length: TURNS }, (_, i) => `turn ${i + 1}`)
    );
  });

  it('control: the OLD reuse pattern zombies within a few turns (documents the bug)', () => {
    // Reuse ONE instance across abort cycles, like the pre-fix code did.
    const inst = new FakeRecognition();
    const heard: string[] = [];
    inst.onresult = (ev: any) => heard.push(ev.results[0][0].transcript);

    inst.start();
    inst.speak('turn 1');
    inst.abort();        // VFP-style abort while MAIA speaks
    inst.start();        // old code: restart the SAME object
    inst.speak('turn 2'); // 🧟 silently dropped
    expect(heard).toEqual(['turn 1']); // the stuck-mic bug, reproduced
  });
});

describe('VoiceFeedbackPrevention no longer competes for the recognition lifecycle', () => {
  it('registerRecognition does not monkey-patch start or attach restart listeners', () => {
    // Import here so the module-level `typeof window` guards run under node env
    const VFP = require('../voice-feedback-prevention').default;
    const prevention = VFP.getInstance();

    const recognition: any = new FakeRecognition();
    const originalStart = recognition.start;
    const listeners: string[] = [];
    recognition.addEventListener = (type: string) => { listeners.push(type); };

    prevention.registerRecognition(recognition);

    expect(recognition.start).toBe(originalStart); // no patching
    expect(listeners).toEqual([]); // no self-restart listeners
    prevention.unregisterRecognition(recognition);
  });
});
