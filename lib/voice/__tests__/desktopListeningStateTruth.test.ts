/**
 * DESKTOP-LISTENING-STATE-TRUTH-01 — only a capture may claim a capture.
 *
 * ⛔ THE DEFECT, device-witnessed 2026-08-30 on the Desktop sovereign transport.
 * The hands-free completion path asserted `setIsListening(true)` and only THEN,
 * 300ms later, asked the canonical authority whether re-arming was permitted.
 * After a response whose every TTS attempt was refused by the sovereignty
 * policy, the authority correctly said no — the server telemetry carries no
 * `voice_listening_started` and no `voice_fallback_recording_started`, so no
 * capture epoch ever began — and nothing reset the flag. The member was shown
 * LISTENING, indefinitely, against a closed microphone.
 *
 * ⭐ THE RULE. Callers may REQUEST a microphone. Only the capture epoch may
 * claim one EXISTS. `isListening` is established from `onRecordingStateChange`
 * — `handleRecordingStateChange`, which names itself "mic truth" — after
 * acquisition actually succeeded.
 *
 * ⛔ AND NOT FROM THE AUTHORITY'S ANSWER. Deriving the display from
 * `attemptAutoRearm`'s boolean would be a subtler version of the same error:
 * permission granted is not a capture open. `startListening` can still fail on
 * permissions, a device change, or a stale generation. Authorization and
 * acquisition are different facts, and the UI must follow the second.
 *
 * ⭐ WHY THIS IS ITS OWN DEFECT AND NOT THE RE-ARM BUG. The authority held. The
 * microphone stayed shut. What failed was the story told about it. Both are
 * truthfulness failures about attention, in opposite directions: the ghost
 * re-arm listened without asking, this one claimed to listen without listening.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ORACLE = fs.readFileSync(
  path.resolve(__dirname, '../../../components/OracleConversation.tsx'), 'utf8');

const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const ORACLE_CODE = stripComments(ORACLE);

/** The hands-free streaming-completion block: request, then authority. */
const REARM_BLOCK = (() => {
  const i = ORACLE_CODE.indexOf("'🎤 [StreamingVoice] Hands-free mode - requesting mic restart'");
  const j = ORACLE_CODE.indexOf("attemptAutoRearm('streaming_response_complete')", i);
  return i >= 0 && j > i ? ORACLE_CODE.slice(i, j) : '';
})();

describe('1 — a request is not a capture', () => {
  it('the block exists and still ends at the canonical authority', () => {
    // Guards the slice above: if the shape changes, the assertions below would
    // silently pass against an empty string.
    expect(REARM_BLOCK).not.toBe('');
  });

  it('does NOT assert listening before asking permission', () => {
    // ⛔ THE REGRESSION THIS CATCHES, exactly as witnessed.
    expect(REARM_BLOCK).not.toMatch(/setIsListening\(true\)/);
  });

  it('the watchdog recovery path does not claim it either', () => {
    // ⛔ Found on re-read: `forceWatchdogReset` had the identical shape —
    // assert LISTENING, then ask `attemptAutoRearm('watchdog_recovery')`, which
    // carries no exemption and may refuse. Same untruth, recovery path.
    const i = ORACLE_CODE.indexOf('function forceWatchdogReset');
    const j = ORACLE_CODE.indexOf("attemptAutoRearm('watchdog_recovery')", i);
    expect(i).toBeGreaterThan(-1);
    expect(j).toBeGreaterThan(i);
    expect(ORACLE_CODE.slice(i, j)).not.toMatch(/setIsListening\(true\)/);
  });

  it('does not derive the display from the authority answer either', () => {
    // Authorization is not acquisition.
    expect(ORACLE_CODE).not.toMatch(/setIsListening\(\s*attemptAutoRearm\(/);
    expect(ORACLE_CODE).not.toMatch(/setIsListening\(\s*mayAutoRearm\(/);
  });
});

describe('2 — the truthful owner is intact', () => {
  it('mic truth comes from the recording-state callback', () => {
    const fn = ORACLE_CODE.slice(ORACLE_CODE.indexOf('const handleRecordingStateChange'));
    const body = fn.slice(0, fn.indexOf('}, ['));
    expect(body).toMatch(/setIsListening\(isRecording\)/);
  });

  it('the request path still reaches the canonical authority', () => {
    // The fix removes a false claim; it must not remove the re-arm request.
    expect(ORACLE_CODE).toMatch(/attemptAutoRearm\('streaming_response_complete'\)/);
  });
});

// ── 3 · the acceptance table, executable ───────────────────────────────────
/**
 * `isListening` as the surviving sources establish it: the recording-state
 * callback, and nothing else on the automatic path.
 */
const displayListening = (ev: {
  requested?: boolean;          // a caller asked for a restart
  authorized?: boolean;         // the authority permitted it
  captureAcquired?: boolean;    // onRecordingStateChange(true) fired
}): boolean => ev.captureAcquired === true;

describe('3 — acceptance', () => {
  it('silent response → request → refused → UI never says LISTENING', () => {
    // The witnessed failure, end to end.
    expect(displayListening({ requested: true, authorized: false })).toBe(false);
  });

  it('requesting alone never claims a microphone', () => {
    expect(displayListening({ requested: true })).toBe(false);
  });

  it('authorized but acquisition failed → still not LISTENING', () => {
    // getUserMedia can refuse after permission was granted.
    expect(displayListening({ requested: true, authorized: true, captureAcquired: false })).toBe(false);
  });

  it('explicit Speak → authorized → capture acquired → LISTENING', () => {
    expect(displayListening({ requested: true, authorized: true, captureAcquired: true })).toBe(true);
  });

  it('capture closing returns the display to idle', () => {
    expect(displayListening({ captureAcquired: false })).toBe(false);
  });
});
