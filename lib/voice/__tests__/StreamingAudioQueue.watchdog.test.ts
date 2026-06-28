/**
 * StreamingAudioQueue — iOS playback watchdog
 *
 * Regression guard for the "stuck thinking" hang reported by a beta tester:
 * a voice chunk plays, server + TTS succeed, but the WebView never delivers
 * `audio.onended`. Before the watchdog, the queue stranded there forever, so
 * `onComplete` never fired, `isResponding` stayed true, and the 75s recovery
 * backstop tripped with "I seem to have gotten stuck."
 *
 * These tests do NOT require an iOS device: the audio element is supplied to
 * the queue, so we simulate the stall directly by simply never firing
 * `onended`. Case 1 FAILS if the watchdog is removed — it is the real receipt.
 */

jest.mock('@/lib/voice/ios-audio-session', () => ({
  ensureAudioReady: jest.fn().mockResolvedValue({}),
  getAudioStatus: jest
    .fn()
    .mockReturnValue({ state: 'running', unlocked: true, keepAliveActive: false }),
}));

jest.mock('@/lib/voice/voiceDebugBus', () => ({
  pushVoiceDebug: jest.fn(),
}));

jest.mock('@/lib/voice/voice-feedback-prevention', () => ({
  VoiceFeedbackPrevention: {
    getInstance: () => ({
      registerAudioElement: jest.fn(),
      unregisterAudioElement: jest.fn(),
    }),
  },
}));

import { StreamingAudioQueue } from '@/lib/voice/StreamingAudioQueue';

// Watchdog ceiling when chunk duration is unknown (onloadedmetadata never
// fires): 20000ms fallback + 15000ms grace. Mirrors armWatchdog() in the queue.
const WATCHDOG_CEILING_MS = 20000 + 15000;

/** Minimal stand-in for the HTMLAudioElement the queue plays. */
function makeFakeAudio(duration = 3) {
  const audio: any = {
    duration,
    currentTime: 0,
    ended: false,
    onloadedmetadata: null as null | (() => void),
    onplay: null as null | (() => void),
    onpause: null as null | (() => void),
    onended: null as null | (() => void),
    onerror: null as null | ((e: unknown) => void),
    setAttribute: jest.fn(),
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    /** Test helper: simulate the WebView delivering a clean end-of-playback. */
    fireEnded() {
      this.ended = true;
      this.currentTime = this.duration;
      this.onended?.();
    },
  };
  return audio;
}

/** Flush the (untimed) async chain inside attemptPlay so the watchdog arms. */
async function flushMicrotasks() {
  for (let i = 0; i < 8; i++) await Promise.resolve();
}

describe('StreamingAudioQueue iOS playback watchdog', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('drives onComplete when audio.onended NEVER fires (iOS stall)', async () => {
    const onComplete = jest.fn();
    const queue = new StreamingAudioQueue({ onComplete });
    const audio = makeFakeAudio();

    // Chunk starts playing but its onended will never arrive.
    queue.enqueue({ audio: audio as unknown as HTMLAudioElement, text: 'hello there' });
    queue.markStreamingComplete(); // stream ended; chunk still "playing"
    await flushMicrotasks(); // attemptPlay resolves → watchdog armed

    // Nothing has completed yet — we are mid-stall, watchdog pending.
    expect(onComplete).not.toHaveBeenCalled();
    expect(queue.getIsPlaying()).toBe(true);

    // Just before the ceiling: still stuck (proves it's the timer, not something else).
    await jest.advanceTimersByTimeAsync(WATCHDOG_CEILING_MS - 1000);
    expect(onComplete).not.toHaveBeenCalled();

    // Past the ceiling: the watchdog must rescue the queue.
    await jest.advanceTimersByTimeAsync(2000);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(queue.getIsPlaying()).toBe(false);
    expect(audio.pause).toHaveBeenCalled(); // zombie element stopped
  });

  it('completes once on a normal onended and clears the watchdog (no double-fire)', async () => {
    const onComplete = jest.fn();
    const queue = new StreamingAudioQueue({ onComplete });
    const audio = makeFakeAudio();

    queue.enqueue({ audio: audio as unknown as HTMLAudioElement, text: 'all good' });
    queue.markStreamingComplete();
    await flushMicrotasks(); // watchdog armed

    expect(onComplete).not.toHaveBeenCalled();

    // WebView delivers onended normally.
    audio.fireEnded();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(queue.getIsPlaying()).toBe(false);

    // The watchdog must have been cleared — advancing well past the ceiling
    // does NOT fire onComplete a second time.
    await jest.advanceTimersByTimeAsync(WATCHDOG_CEILING_MS + 5000);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('stop() cancels a pending watchdog so it cannot advance a stopped queue', async () => {
    const onComplete = jest.fn();
    const queue = new StreamingAudioQueue({ onComplete });
    const audio = makeFakeAudio();

    queue.enqueue({ audio: audio as unknown as HTMLAudioElement, text: 'interrupt me' });
    await flushMicrotasks(); // watchdog armed

    queue.stop(); // user interrupt mid-playback

    await jest.advanceTimersByTimeAsync(WATCHDOG_CEILING_MS + 5000);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
