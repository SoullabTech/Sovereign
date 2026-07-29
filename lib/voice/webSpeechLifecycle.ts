/**
 * Web Speech recognition object lifecycle.
 *
 * WHY THIS EXISTS
 * ---------------
 * On desktop, MAIA's voice input uses the browser Web Speech API
 * (`webkitSpeechRecognition`, continuous mode). That API has a well-known,
 * environment-dependent failure mode: after an instance has been `abort()`ed
 * and restarted a few times — which happens on every turn, because we abort
 * recognition while MAIA speaks to prevent feedback — Chrome may keep firing
 * `onstart` (the button still says "Listening") while silently never firing
 * `onresult` again. The object is a zombie. The mic button looks active, but
 * MAIA hears nothing. A page refresh "fixes" it because a brand-new object is
 * created.
 *
 * The permanent fix is to never reuse a recognition object once it has failed,
 * aborted unexpectedly, been suspended for TTS, or had its audio device change
 * underneath it — always discard it and create a fresh one before the next
 * listen. This module owns exactly that object lifecycle so it can be reasoned
 * about and unit-tested in isolation, separate from the large React component
 * that orchestrates transcripts, silence timers, and VAD.
 *
 * SCOPE: web (`webkitSpeechRecognition`) only. The native Capacitor speech path
 * (iOS/Android app) and the Firefox/Whisper MediaRecorder fallback do NOT use
 * this module and are unaffected by it.
 *
 * This module is intentionally framework-agnostic (no React, no Capacitor) and
 * side-effect-light: it holds a reference to the current instance, a monotonic
 * generation counter used to stale-guard callbacks, and (optionally) a
 * `devicechange` listener. The owning component supplies the factory that
 * builds+configures+wires a recognition instance, and drives all higher-level
 * state.
 */

/** The subset of the Web Speech API `SpeechRecognition` surface we rely on. */
export interface RecognitionLike {
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onstart?: ((ev?: any) => void) | null;
  onresult?: ((ev?: any) => void) | null;
  onerror?: ((ev?: any) => void) | null;
  onend?: ((ev?: any) => void) | null;
  onaudiostart?: ((ev?: any) => void) | null;
  onspeechstart?: ((ev?: any) => void) | null;
}

/** Minimal `navigator.mediaDevices` shape needed for devicechange wiring. */
export interface MediaDevicesLike {
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

export type WebRecognitionState =
  | 'IDLE'        // No live instance; ready for a fresh start
  | 'ARMING'      // Instance created, waiting for onstart to confirm it is live
  | 'LISTENING'   // Confirmed live and returning results
  | 'SUSPENDED'   // Intentionally torn down while MAIA speaks (planned, not a failure)
  | 'ERROR';      // Terminal failure; listening cleared, awaiting user retry

/** How a given Web Speech `onerror` should be handled by the owning component. */
export interface RecognitionErrorClass {
  /**
   * Terminal for this listening session: stop listening, surface a retryable
   * message, do not auto-restart. The user re-arms by tapping the mic.
   */
  fatal: boolean;
  /**
   * The current instance must not be reused. The next listen attempt (whether
   * the onend auto-restart or an explicit user tap) must build a fresh object.
   */
  recreate: boolean;
  /** User-facing, retryable message. Only set for fatal errors. */
  userMessage?: string;
}

/**
 * Classify a Web Speech API error string into lifecycle actions.
 *
 * Pure and total: every error maps to an action, and unknown errors default to
 * the safe "recreate, non-fatal" behavior (throw the object away, try again).
 *
 * `network` is only fatal after repeated failures — a single transient network
 * blip is worth one silent retry, but a wall of them means Google's speech
 * service is unreachable and blinking the mic forever is worse than stopping.
 * The caller owns the running count.
 */
export function classifyRecognitionError(
  error: string,
  networkErrorCount: number,
): RecognitionErrorClass {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return {
        fatal: true,
        recreate: true,
        userMessage:
          'Microphone access is blocked. Enable mic permission for this site, then tap the mic to try again.',
      };
    case 'network':
      if (networkErrorCount >= 2) {
        return {
          fatal: true,
          recreate: true,
          userMessage:
            'Voice recognition lost its connection. Tap the mic to try again.',
        };
      }
      return { fatal: false, recreate: true };
    case 'no-speech':
    case 'aborted':
    case 'audio-capture':
    default:
      // Non-fatal: the object is spent, but we keep listening and rebuild on
      // the next cycle. `no-speech`/`aborted` are routine in continuous mode.
      return { fatal: false, recreate: true };
  }
}

/**
 * Owns the current Web Speech recognition instance and its generation.
 *
 * Lifecycle guarantees:
 *  - Exactly one instance is "current" at a time. `adopt()` replaces the old
 *    one (discarding it first), so a stale instance can never coexist with a
 *    fresh one.
 *  - Every callback wired through `guard(gen, fn)` is a no-op unless its
 *    generation is still current. A discarded/replaced instance whose late
 *    `onend`/`onresult` still fires cannot mutate current state.
 *  - `discard()` fully detaches handlers and aborts before dropping the
 *    reference, so a torn-down instance emits nothing further.
 *  - `markForRecreate()` is the SOFT signal: the instance stays current (so an
 *    in-flight `onend` can still run its restart logic) but `shouldRecreate`
 *    becomes true so that restart builds a fresh object instead of reusing this
 *    one. This is the path for non-fatal `onerror`.
 */
export class WebSpeechRecognitionSession {
  current: RecognitionLike | null = null;
  state: WebRecognitionState = 'IDLE';

  private generation = 0;
  private needsRefresh = false;
  private readonly unregister?: (r: RecognitionLike) => void;

  private mediaDevices: MediaDevicesLike | null = null;
  private deviceChangeHandler: (() => void) | null = null;

  constructor(opts?: { unregister?: (r: RecognitionLike) => void }) {
    this.unregister = opts?.unregister;
  }

  /** The generation stamped on the current instance (0 before first adopt). */
  get currentGeneration(): number {
    return this.generation;
  }

  /**
   * A fresh object must be built before the next listen — either because the
   * last one was invalidated/suspended, or because there is no instance at all.
   */
  get shouldRecreate(): boolean {
    return this.needsRefresh || this.current == null;
  }

  /**
   * Adopt a freshly-created (not yet started) instance as the current one.
   * Discards any previous instance first, bumps the generation, and clears the
   * needs-refresh flag. Returns the new generation for the caller to stamp into
   * its handler closures via `guard()`.
   */
  adopt(instance: RecognitionLike): number {
    this.discard('replaced');
    this.current = instance;
    this.needsRefresh = false;
    this.generation += 1;
    return this.generation;
  }

  /** Is `gen` the live generation? False once the instance is replaced/discarded. */
  isCurrent(gen: number): boolean {
    return this.current != null && gen === this.generation;
  }

  /**
   * Wrap a handler so it only runs while `gen` is current. This is the
   * stale-callback guard: a late event from a superseded instance is dropped
   * before it can touch component state.
   */
  guard<A extends any[]>(gen: number, fn: (...args: A) => void): (...args: A) => void {
    return (...args: A) => {
      if (!this.isCurrent(gen)) return;
      fn(...args);
    };
  }

  /**
   * SOFT invalidation: keep the current instance (so an already-firing `onend`
   * can complete its restart decision) but require the next start to rebuild.
   * Used for non-fatal `onerror`.
   */
  markForRecreate(_reason: string): void {
    this.needsRefresh = true;
  }

  /**
   * HARD teardown: detach every handler, abort/stop, unregister, and drop the
   * reference. Never throws. After this, `isCurrent(anyGen)` is false, so no
   * late callback from the old instance can do anything.
   */
  discard(_reason: string): void {
    const inst = this.current;
    if (!inst) return;
    this.current = null;
    // Detach first so abort() cannot re-enter our handlers.
    try {
      inst.onstart = null;
      inst.onresult = null;
      inst.onerror = null;
      inst.onend = null;
      inst.onaudiostart = null;
      inst.onspeechstart = null;
    } catch {
      /* some engines make handler props non-writable after teardown */
    }
    try {
      (inst.abort ?? inst.stop)?.call(inst);
    } catch {
      /* already stopped / invalid state */
    }
    try {
      this.unregister?.(inst);
    } catch {
      /* unregister is best-effort */
    }
  }

  /**
   * Planned teardown for MAIA's TTS playback window. This is NOT a failure:
   * we discard the live instance (mic capture leaves the playback window) and
   * mark for recreate so the post-playback resume builds a fresh object.
   */
  suspendForTts(): void {
    this.discard('tts_suspend');
    this.needsRefresh = true;
    this.state = 'SUSPENDED';
  }

  setState(state: WebRecognitionState): void {
    this.state = state;
  }

  /**
   * Wire a `devicechange` listener. When the active audio device changes
   * underneath a live session, the bound instance is stranded — so we hard-
   * discard it, mark for recreate, drop to IDLE, and hand control back to the
   * component callback (which returns the UI to a recoverable state and, if
   * appropriate, reacquires through the normal start path). Idempotent.
   */
  attachDeviceChange(mediaDevices: MediaDevicesLike, onDeviceChange: () => void): void {
    if (this.deviceChangeHandler) return;
    this.mediaDevices = mediaDevices;
    this.deviceChangeHandler = () => {
      this.discard('devicechange');
      this.needsRefresh = true;
      this.state = 'IDLE';
      onDeviceChange();
    };
    mediaDevices.addEventListener('devicechange', this.deviceChangeHandler);
  }

  detachDeviceChange(): void {
    if (this.mediaDevices && this.deviceChangeHandler) {
      try {
        this.mediaDevices.removeEventListener('devicechange', this.deviceChangeHandler);
      } catch {
        /* best-effort */
      }
    }
    this.mediaDevices = null;
    this.deviceChangeHandler = null;
  }

  /** Full teardown for component unmount: discard instance + drop listeners. */
  dispose(): void {
    this.discard('dispose');
    this.detachDeviceChange();
    this.needsRefresh = false;
    this.state = 'IDLE';
  }
}
