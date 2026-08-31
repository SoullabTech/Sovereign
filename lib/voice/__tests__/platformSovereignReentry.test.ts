/**
 * PLATFORM-SOVEREIGN-REENTRY-01
 *
 * The defect these pin, stated as the member met it: one spoken turn worked, and
 * then the holoflower went inert. Tapping it did nothing, however many times. The
 * only way back into the conversation was Text → Speak, which re-declares voice
 * consent explicitly. Reproduced on Firefox and on MAIA Desktop — both reach the
 * sovereign-whisper transport — and NOT on Chrome or Safari, which take the
 * browser Web Speech path and so never execute the code below.
 *
 * ⛔ WHY SOURCE-PROPERTY ASSERTIONS. `OracleConversation.tsx` is ~11k lines with
 * ~129 state holders and no render harness in this repo (no @testing-library).
 * `desktopUtteranceLimit.test.ts` established the pattern for exactly this file:
 * read the source and pin the invariant. These are weaker than behavioural tests
 * and are not pretending otherwise — but each one goes red if its defect returns,
 * which is the property that matters here. The member-facing proof is the founder
 * walk: three spoken turns on Firefox and on Desktop with no Text → Speak escape.
 */
import fs from 'fs';
import path from 'path';

const ORACLE = path.resolve(__dirname, '../../../components/OracleConversation.tsx');
const HOOK = path.resolve(__dirname, '../../../hooks/useVoiceSession.ts');
const STATE = path.resolve(__dirname, '../VoiceSessionState.ts');

const oracle = fs.readFileSync(ORACLE, 'utf8');
const hook = fs.readFileSync(HOOK, 'utf8');
const sessionState = fs.readFileSync(STATE, 'utf8');

/**
 * Comments stripped. Negative controls below assert that a defective EXPRESSION is
 * absent; without this they also match the comments that describe the defect, so
 * documenting a bug would fail the test that guards it.
 */
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/** The non-streaming post-TTS restart loop, isolated from the rest of the file. */
function restartLoop(): string {
  const start = oracle.indexOf('const attemptMicRestart = (attempt: number) => {');
  expect(start).toBeGreaterThan(-1);
  const end = oracle.indexOf('attemptMicRestart(1);', start);
  expect(end).toBeGreaterThan(start);
  return oracle.slice(start, end);
}

// ── A · speech is consent to keep speaking ──────────────────────────────────
describe('A — the convergence boundary does not reclassify speech as typing', () => {
  it('handleTextMessage clears voice consent only for non-speech turns', () => {
    // The whole defect in one line: this clear used to be unconditional, so every
    // spoken turn erased its own consent on the way through the shared boundary.
    expect(oracle).toContain(
      "if (actionClass !== 'speech-transcription') {\n      lastSendWasVoiceRef.current = false;\n    }",
    );
  });

  it('no unguarded clear survives anywhere in the file', () => {
    // Negative control. If someone reinstates the bare statement — or adds a second
    // one on another path — this goes red even though the guarded form still exists.
    const clears = [...oracle.matchAll(/lastSendWasVoiceRef\.current = false;/g)];
    expect(clears).toHaveLength(1);
    const before = oracle.slice(0, clears[0].index!);
    expect(before.endsWith("if (actionClass !== 'speech-transcription') {\n      ")).toBe(true);
  });

  it('the guard still matches what the convergence boundary actually sends', () => {
    // The guard is a string comparison against a value produced 2,400 lines away.
    // If that call is ever re-worded, the guard silently stops matching and the
    // defect returns in full — with no type error to catch it.
    expect(oracle).toContain(
      "await handleTextMessage(cleanedText, undefined, undefined, 'speech-transcription');",
    );
  });

  it('an accepted transcript still establishes consent in the first place', () => {
    expect(oracle).toContain('lastSendWasVoiceRef.current = true;');
  });
});

// ── B · verification must observe, not remember ─────────────────────────────
describe('B — restart verification reads live state, not a render snapshot', () => {
  it('the session exposes a live phase reader', () => {
    expect(sessionState).toMatch(/getPhase\(\):\s*VoicePhase;/);
    expect(hook).toMatch(/return \{\s*\n\s*state,\s*\n\s*methods,/);
    expect(hook).toContain('    getPhase,');
  });

  it('that reader goes through the ref, so it cannot be a snapshot', () => {
    const decl = hook.indexOf('const getPhase = useCallback');
    expect(decl).toBeGreaterThan(-1);
    const body = hook.slice(decl, hook.indexOf('}, [continuousConvRef]);', decl));
    expect(body).toContain('continuousConvRef.current');
  });

  it('`state` remains a per-render object literal — the reason the reader exists', () => {
    // Not a defect to fix here; the fact that makes `state.phase` unusable for
    // verification. If `state` ever becomes live, this test should be revisited
    // deliberately rather than silently.
    expect(hook).toMatch(/const state: VoiceSessionState = \{/);
    expect(hook).toMatch(/phase: currentPhase,/);
  });

  it('the restart verifier calls getPhase() and never reads the snapshot', () => {
    const loop = code(restartLoop());
    expect(loop).toContain('const phase = voiceSession.getPhase();');
    // Negative control: the exact expression that could not observe its own restart.
    expect(loop).not.toContain('voiceSession.state.phase');
  });

  it('a start still in progress is not counted as a failed start', () => {
    // Making the restart actually fire re-opens a race the old dead code could not
    // hit: the verifier samples 150ms after requesting a start, and the witnessed
    // capture was admitted at 101ms. If ARMING read as failure, the retry would
    // supersede the healthy capture it was checking — `revokeSovereignCapture`
    // bumps the generation before aborting — turning this repair into the very
    // teardown-suppression mechanism the diagnosis identified as latent.
    const loop = code(restartLoop());
    const verify = loop.slice(loop.indexOf('const phase = voiceSession.getPhase();'));
    for (const live of ["'listening'", "'arming'", "'capturing'"]) {
      expect(verify.slice(0, verify.indexOf('} else {'))).toContain(live);
    }
  });

  it('the post-reset final attempt is gated live too', () => {
    const loop = code(restartLoop());
    // The forced-reset branch runs from its `attempt >` test until the loop's normal
    // entry gate, which is the next thing in the function.
    const reset = loop.slice(
      loop.indexOf('if (attempt > '),
      loop.indexOf('voiceSession.state.capabilities'),
    );
    expect(reset).toContain("voiceSession.getPhase() === 'idle'");

    // The captured capabilities were computed before the reset that precedes them,
    // so they could not describe the state that reset produced. Exactly one read of
    // that snapshot may remain in the whole loop — the entry gate recorded below.
    // If the reset ever reverts to it, this count becomes 2 and goes red.
    expect([...loop.matchAll(/voiceSession\.state\.capabilities/g)]).toHaveLength(1);
  });

  it('records the one snapshot read this unit deliberately did NOT touch', () => {
    // ⛔ HONEST SCOPE. The loop's entry gate still reads `state.capabilities`, and it
    // is the same class of stale read. It is left alone because no evidence shows it
    // misfiring — in the witnessed Firefox trace it evaluated true and the loop ran —
    // and because its `else` aborts the loop outright, so changing it blind risks
    // trading a mic that will not restart for one that never tries. Recorded here so
    // it is visible rather than forgotten; a future unit with evidence owns it.
    const loop = code(restartLoop());
    const entry = loop.slice(0, loop.indexOf('const canRestart'));
    expect(entry).toContain('voiceSession.state.capabilities.canStartListening');
  });
});

// ── C · a recovery path that can actually run ───────────────────────────────
describe('C — the bounded recovery is reachable on the path that fails', () => {
  it('the retry ceiling reaches the attempt the reset branch waits for', () => {
    const loop = restartLoop();
    const reset = loop.match(/if \(attempt > (\d+)\) \{/);
    const retry = loop.match(/if \(attempt (<=?) (\d+)\) \{\s*\n\s*setTimeout\(\(\) => attemptMicRestart\(attempt \+ 1\)/);
    expect(reset).not.toBeNull();
    expect(retry).not.toBeNull();

    // Arithmetic, not a literal: the highest attempt the verification-failure path
    // can schedule must EXCEED the threshold the reset waits for. Previously the
    // ceiling was `< 8` against a `> 8` reset, so attempt 9 never existed and the
    // recovery block was dead code on the only path that reaches it.
    //
    // ⛔ The operator is load-bearing and must be captured, not skipped. `< N`
    // schedules at most N (from attempt N-1); `<= N` schedules N+1. An earlier
    // version of this test matched `<=?` and added 1 regardless — so it passed
    // against the original defect and proved nothing. Reverting the fix must turn
    // this red; if it does not, the test is decoration.
    const resetThreshold = Number(reset![1]);
    const bound = Number(retry![2]);
    const highestScheduled = retry![1] === '<=' ? bound + 1 : bound;
    expect(highestScheduled).toBeGreaterThan(resetThreshold);
  });
});

// ── D · the loop says what it did ───────────────────────────────────────────
describe('D — restart logging reports the action taken, not the one skipped', () => {
  it('a typed turn says so instead of printing eight phantom attempts', () => {
    const loop = code(restartLoop());
    const skip = loop.indexOf('Last turn was typed');
    const attempt = loop.indexOf('Attempting mic restart');
    expect(skip).toBeGreaterThan(-1);
    expect(attempt).toBeGreaterThan(skip); // the bail-out precedes the claim

    // Negative control: the claim must not be re-decoupled from the act. The
    // original `if (lastSendWasVoiceRef.current) startListening(...)` sat AFTER
    // the log, so a run that started nothing still reported eight attempts — and
    // a device walk read them as microphone evidence.
    expect(loop).not.toContain('if (lastSendWasVoiceRef.current) voiceSession.methods.startListening');
    // and the start call is now unconditional at its site, because the bail-out above
    // has already returned for the typed case.
    expect(loop).toContain("voiceSession.methods.startListening('non_stream_restart_attempt');");
  });
});

// ── E · non-degradation: the stop gesture ───────────────────────────────────
describe('E — re-entry is repaired without breaking the stop gesture', () => {
  it('a tap while listening still stops, and a tap while muted still starts', () => {
    // Kelly's required negative control: fixing "the orb will not start" must not
    // produce "the orb will not stop". Both branches of the holoflower toggle
    // remain, keyed on isMuted.
    expect(oracle).toContain('if (isMuted) {');
    expect(oracle).toContain('🔇 Stopping voice via holoflower (USER EXIT MODE)');
    expect(oracle).toContain('[voice] startListening called');
  });

  it('the Text → Speak path still declares voice consent explicitly', () => {
    // It was the member's only escape while the orb was inert. It must keep working
    // after the orb does — it is a legitimate gesture, not a workaround.
    expect(oracle).toContain("await voiceSession.methods.startListening('speak_button_gesture');");
  });
});
