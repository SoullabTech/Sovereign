/**
 * DESKTOP-CONVERSATIONAL-SILENCE-01 — silence before speech is not the end of
 * an utterance.
 *
 * THE DEFECT, DEVICE-MEASURED (Electron on localhost, 2026-08-31). After MAIA
 * answered, Desktop re-armed correctly — `voice_listening_started`,
 * `recording_started`, `audio_admitted`, all within a second. The member then
 * simply did not speak. No `speech_detected` was ever emitted. About two
 * seconds later:
 *
 *     capture_stopped  reason="silence"
 *     Whisper 200, transcription: 0 chars
 *     voice_fallback_failed  reason="empty_transcript"
 *     mic → IDLE
 *
 * and the conversation was over. The member had done nothing but think.
 *
 * THE CAUSE. `lastLoudAt` is initialised to the capture's start, so a capture
 * that has heard nothing is indistinguishable from one whose speech just
 * ended. minMs (800ms) + silenceHoldoffMs (1500ms) elapse and the stop fires.
 * `speech_detected` existed as an observational milestone that nothing read.
 *
 * THE INVARIANT:
 *
 *     silence BEFORE speech  = the member is thinking  → keep waiting
 *     silence AFTER  speech  = utterance boundary      → stop and transcribe
 *
 * and its corollary, which is what actually ended conversations:
 *
 *     utterance ended  ≠  conversation ended
 *
 * SCOPE. This module is shared with the Android-Chrome recovery and the
 * Firefox/Zen no-Web-Speech branch, where it is a bounded ONE-SHOT. The gate is
 * opt-in and Desktop passes it; the other two are byte-for-byte unchanged.
 * Enabling it for all three would repeat the mistake `desktopUtteranceLimits.ts`
 * documents: a value authored for a bounded recovery quietly becoming the
 * semantics of a first-class conversation turn.
 *
 * SCOPE OF THESE TESTS. Structural pins over the source, as with the other
 * units in this programme — jest here runs in Node with no MediaRecorder, no
 * AudioContext and no microphone, so the timing logic cannot be executed. The
 * physical witness is the merge gate: MAIA answers, 60s of true silence, still
 * listening, zero Whisper requests during it, then speech that lands.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');
const FALLBACK = readFileSync(join(ROOT, 'lib/voice/androidVoiceFallback.ts'), 'utf8');
const CONTINUOUS = readFileSync(
  join(ROOT, 'components/voice/ContinuousConversation.tsx'), 'utf8',
);

/** The polling body that decides when a capture ends. */
function silenceLoop(): string {
  const start = FALLBACK.indexOf('const checkSilence = ');
  expect(start).toBeGreaterThan(-1);
  return FALLBACK.slice(start, FALLBACK.indexOf('const silenceTimer', start));
}

describe('silence before speech is not an utterance boundary', () => {
  it('records when speech actually began, not merely that it did', () => {
    // A boolean would not survive the next question asked of it. The timestamp
    // is what distinguishes "not yet begun" from "just finished".
    expect(silenceLoop()).toContain('speechAt = speechAt ?? now;');
  });

  it('gates the silence stop on speech having begun', () => {
    const loop = silenceLoop();
    expect(loop).toContain('const speechHasBegun = !opts.requireSpeechBeforeSilenceStop || speechAt !== null;');
    expect(loop).toMatch(/if \(speechHasBegun && elapsed >= opts\.minMs && silenceFor >= opts\.silenceHoldoffMs\)/);
  });

  it('does not gate the never-admitted path, which is a real apparatus failure', () => {
    // PLATFORM-D02A-01 must still fire when the graph never delivered audio.
    // That is not a quiet member; it is a microphone that was never listening.
    expect(silenceLoop()).toContain("stop('no_admission');");
  });
});

describe('an idle capture is not a turn', () => {
  it('names the ceiling-with-no-speech case separately from a real max', () => {
    expect(silenceLoop()).toContain("? 'idle_no_speech'");
    expect(silenceLoop()).toContain(": 'max');");
  });

  it('never uploads an idle capture to Whisper', () => {
    // The gate must sit BEFORE the transcribe section, or silence reaches the
    // network and comes back as the 0-character transcript that ended the
    // conversation.
    const gate = FALLBACK.indexOf("outcome.stopReason === 'idle_no_speech'");
    const transcribe = FALLBACK.indexOf('── Transcribe ──');
    expect(gate).toBeGreaterThan(-1);
    expect(transcribe).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(transcribe);
  });

  it('reports it as its own reason, not as an empty transcript', () => {
    expect(FALLBACK).toContain("reason: 'no_speech_detected'");
  });
});

describe('an idle capture does not end the conversation', () => {
  it('is handled before the failure branch, and surfaces no error', () => {
    const idle = CONTINUOUS.indexOf("} else if (result.reason === 'no_speech_detected') {");
    const failure = CONTINUOUS.indexOf('console.warn(`❌ [web whisper] Failed:');
    expect(idle).toBeGreaterThan(-1);
    expect(failure).toBeGreaterThan(-1);
    expect(idle).toBeLessThan(failure);

    // Everything between the idle branch and the failure branch must not call
    // onVoiceUnavailable — that is what set the mic IDLE and stood the
    // conversation down.
    const branch = CONTINUOUS.slice(idle, failure);
    expect(branch).not.toContain('onVoiceUnavailable');
  });

  it('creates no phantom member turn from silence', () => {
    const idle = CONTINUOUS.indexOf("} else if (result.reason === 'no_speech_detected') {");
    const branch = CONTINUOUS.slice(idle, CONTINUOUS.indexOf('} else {', idle));
    expect(branch).not.toContain('onTranscript');
    expect(branch).not.toContain('witnessDispatch');
  });
});

describe('the conversation re-arms, and explicit Stop still dominates', () => {
  function recycleBlock(): string {
    const start = CONTINUOUS.indexOf('if (idleCapture) {');
    expect(start).toBeGreaterThan(-1);
    return CONTINUOUS.slice(start, start + 700);
  }

  it('re-arms through the restart authority, never by calling startListening', () => {
    // The single-conductor rule. A direct call would also bypass every guard
    // that makes Stop authoritative.
    const block = recycleBlock();
    expect(block).toContain("requestRestartFnRef.current?.('desktop_idle_recycle')");
    expect(block).not.toContain('startListening(');
  });

  it('only re-arms while the conversation is still active', () => {
    expect(recycleBlock()).toContain(
      'isListeningRef.current || wantsContinuousConversationRef.current',
    );
  });

  it('cannot resurrect a stopped conversation', () => {
    // stopListening clears BOTH refs unconditionally (77263e58), so the guard
    // above is false after an explicit Stop and authorityGuard would refuse the
    // restart even if it were reached. Two independent barriers, not one.
    const stop = CONTINUOUS.indexOf('const stopListening = useCallback');
    const body = CONTINUOUS.slice(stop, CONTINUOUS.indexOf('if (options?.userExitMode)', stop));
    expect(body).toContain('handsFreeActiveRef.current = false;');
    expect(body).toContain('wantsContinuousConversationRef.current = false;');
  });

  it('is a first-class restart source, distinguishable in the trace', () => {
    const AUTHORITY = readFileSync(join(ROOT, 'lib/voice/restartAuthority.ts'), 'utf8');
    expect(AUTHORITY).toContain("| 'desktop_idle_recycle'");
  });

  it('emits an observable so a long silence is legible', () => {
    // Without this a five-minute pause is an unexplained gap in the record.
    expect(recycleBlock()).toContain("logVoiceEvent('desktop_idle_capture_recycled'");
    const RECEIVER = readFileSync(join(ROOT, 'app/api/telemetry/client/route.ts'), 'utf8');
    expect(RECEIVER).toContain("'desktop_idle_capture_recycled'");
  });
});

describe('Android and Firefox/Zen are unchanged', () => {
  it('keeps the gate opt-in, defaulting to the previous behaviour', () => {
    expect(FALLBACK).toContain('requireSpeechBeforeSilenceStop?: boolean;');
    expect(FALLBACK).toContain(
      'requireSpeechBeforeSilenceStop: options.requireSpeechBeforeSilenceStop === true,',
    );
  });

  it('passes it only under the Desktop classification', () => {
    const call = CONTINUOUS.indexOf('recordAndTranscribe(stream, {');
    const args = CONTINUOUS.slice(call, CONTINUOUS.indexOf('});', call));
    expect(args).toContain('...(info.isDesktop ? { requireSpeechBeforeSilenceStop: true } : {})');
  });

  it('leaves the module\'s own 8s bound alone', () => {
    // The recorder default is Android's bounded recovery contract. Widening it
    // here is the mistake desktopUtteranceLimits.ts exists to document.
    expect(FALLBACK).toContain('const DEFAULT_MAX_RECORDING_MS = 8000;');
    expect(FALLBACK).toContain('const DEFAULT_SILENCE_HOLDOFF_MS = 1500;');
  });

  it('does not disturb the Desktop utterance ceiling this branch already had', () => {
    const call = CONTINUOUS.indexOf('recordAndTranscribe(stream, {');
    const args = CONTINUOUS.slice(call, CONTINUOUS.indexOf('});', call));
    expect(args).toContain('...(info.isDesktop ? { maxMs: DESKTOP_MAX_UTTERANCE_MS } : {})');
  });
});
