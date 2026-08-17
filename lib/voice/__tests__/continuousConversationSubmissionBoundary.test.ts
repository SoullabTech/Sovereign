/**
 * Structural regression guards for ContinuousConversation.tsx (2512).
 *
 * These assert properties of the SOURCE, not of a rendered component. That is
 * deliberate and it is the honest scope: both defects fixed in 2512 were
 * structural — a latch released by hand on some paths but not others, and a
 * dedup that lived on one submission path out of five. Behavioural coverage of
 * the guard itself is in utteranceSubmissionGuard.test.ts; these tests exist so
 * the STRUCTURE cannot silently regress when someone adds a sixth path or a
 * seventh early return.
 *
 * ⚠️ What these do NOT prove: that the microphone works on a device. They are
 * source assertions. Device behaviour is witnessed on hardware, never here.
 */

import * as fs from 'fs';
import * as path from 'path';

const SOURCE = fs.readFileSync(
  path.join(__dirname, '../../../components/voice/ContinuousConversation.tsx'),
  'utf8'
);

describe('isCallingProcessRef latch is structurally released', () => {
  it('is cleared ONLY inside a finally block — never by a hand-written return path', () => {
    const clears = SOURCE.match(/isCallingProcessRef\.current\s*=\s*false/g) ?? [];

    // Exactly one clear should exist in the whole file, and it lives in the
    // finally. The pre-2512 code had five hand-written clears and one return
    // path that forgot — which latched the guard true forever and silently
    // stopped submitting anything the member said.
    expect(clears).toHaveLength(1);

    const finallyBlock = SOURCE.match(/\}\s*finally\s*\{([\s\S]*?)\n\s*\}/);
    expect(finallyBlock).not.toBeNull();
    expect(finallyBlock![1]).toContain('isCallingProcessRef.current = false');
  });

  it('sets the latch exactly once, immediately before the try', () => {
    const sets = SOURCE.match(/isCallingProcessRef\.current\s*=\s*true/g) ?? [];
    expect(sets).toHaveLength(1);
    expect(SOURCE).toMatch(/isCallingProcessRef\.current\s*=\s*true;\s*\n[\s\S]{0,600}?\n\s*try\s*\{/);
  });
});

describe('utterance submission has exactly one admission boundary', () => {
  /**
   * The three permitted direct `onTranscript` calls are one-shot transcription
   * results (Android fallback x2, web Whisper x1). Each delivers exactly one
   * transcript per recording and never shares the accumulation buffer, so they
   * are not part of the silence-timer race. Everything that submits an
   * ACCUMULATED transcript must go through submitUtterance.
   */
  const ONE_SHOT_WHISPER_CALLS = 3;

  it('routes every accumulated-transcript path through submitUtterance', () => {
    const submitCalls = SOURCE.match(/submitUtterance\(/g) ?? [];
    // 1 definition + 5 submission paths
    expect(submitCalls.length).toBeGreaterThanOrEqual(5);

    for (const source of [
      'processAccumulatedTranscript',
      'partial_silence_timeout_2500ms',
      'audio_level_silence_timeout_1500ms',
      'listeningState:stopped',
      'stopListening',
    ]) {
      expect(SOURCE).toContain(`submitUtterance(`);
      expect(SOURCE).toContain(source);
    }
  });

  it('leaves no accumulated-transcript path calling onTranscript directly', () => {
    const directCalls = SOURCE.match(/(?<!\w)onTranscript\(/g) ?? [];
    // 1 inside submitUtterance itself + the one-shot whisper/fallback paths.
    // If this count rises, a new submission path was added that bypasses the
    // guard — route it through submitUtterance instead of raising the number.
    expect(directCalls).toHaveLength(1 + ONE_SHOT_WHISPER_CALLS);
  });

  it('arms the guard on authoritative native start and on a genuinely new web turn', () => {
    const arms = SOURCE.match(/beginUtterance\(utteranceGuardRef\.current\)/g) ?? [];
    expect(arms).toHaveLength(2);
    // Identity must reach the consumer, or the server has nothing to dedupe on.
    expect(SOURCE).toContain('onTranscript(text, { utteranceId: decision.utteranceId })');
    // The native arm must sit with the authoritative `started` confirmation
    // that 2511 established as the sole owner of LISTENING.
    expect(SOURCE).toMatch(
      /setMicState\('LISTENING', 'listeningState:started'\);[\s\S]{0,400}?beginUtterance\(utteranceGuardRef\.current\)/
    );
  });

  it('does NOT arm on a continuation restart — that is the same utterance continuing', () => {
    // iOS Safari ignores `continuous` and fires onend mid-sentence; the
    // auto-restart must not be mistaken for a new utterance.
    const continuationBranch = SOURCE.match(
      /if \(continuationRestartRef\.current\) \{([\s\S]*?)\} else \{([\s\S]*?)\n\s{6}\}/
    );
    expect(continuationBranch).not.toBeNull();
    expect(continuationBranch![1]).not.toContain('beginUtterance');
    expect(continuationBranch![2]).toContain('beginUtterance');
  });
});

describe('2511 invariants are not regressed', () => {
  it('LISTENING is still owned by the native started confirmation', () => {
    expect(SOURCE).toContain("setMicState('LISTENING', 'listeningState:started')");
    // A resolved start() promise must never fabricate LISTENING.
    expect(SOURCE).not.toMatch(/await NativeSpeechRecognition\.start\([^)]*\);\s*setMicState\('LISTENING'/);
  });

  it('ARMING still has a bounded recovery path', () => {
    expect(SOURCE).toContain('armingTimeoutRef');
  });

  it('restart_in_flight is still cleared on confirmed start', () => {
    expect(SOURCE).toMatch(/restartInFlightRef\.current = false/);
  });
});
