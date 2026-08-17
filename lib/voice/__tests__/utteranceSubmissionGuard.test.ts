/**
 * Regression proof for the 2512 double-send.
 *
 * These tests model the ACTUAL native event sequence observed on device:
 * a silence timeout submits, iOS emits one more partial carrying the same
 * hypothesis, and the `listeningState: stopped` handler then submits again.
 *
 * The negative controls matter as much as the assertions. `describe('negative
 * control')` reconstructs the PRE-FIX logic and proves it double-sends on the
 * same input. Without that, a passing suite would not distinguish "the guard
 * works" from "the scenario never fired".
 */

import {
  createUtteranceGuardState,
  beginUtterance,
  noteSpeechContent,
  trySubmitUtterance,
  normalizeUtterance,
} from '../utteranceSubmissionGuard';

/** Collects everything that actually reached `onTranscript`. */
function makeConversation() {
  const state = createUtteranceGuardState();
  const sent: string[] = [];
  const submit = (text: string, _source: string) => {
    if (trySubmitUtterance(state, text).admitted) sent.push(text);
  };
  return { state, sent, submit };
}

describe('utterance submission guard — the reproduced double-send', () => {
  it('admits ONE send when a trailing partial re-populates the buffer before `stopped`', () => {
    const { state, sent, submit } = makeConversation();

    // mic opens
    beginUtterance(state);
    // user speaks; recognizer emits partials
    noteSpeechContent(state, 'what is alive in me right now');

    // path 2: 2500ms silence timeout submits and calls stop()
    submit('what is alive in me right now', 'partial_silence_timeout_2500ms');

    // iOS emits one final partial with the SAME hypothesis while winding down.
    // This is what re-populated accumulatedTranscript on device.
    noteSpeechContent(state, 'what is alive in me right now');

    // path 4: `listeningState: stopped` finds a non-empty buffer and submits
    submit('what is alive in me right now', 'listeningState:stopped');

    expect(sent).toEqual(['what is alive in me right now']);
  });

  it('admits ONE send when manual stop races the native stopped event', () => {
    const { state, sent, submit } = makeConversation();
    beginUtterance(state);
    noteSpeechContent(state, 'i need to slow down');

    submit('i need to slow down', 'stopListening');
    submit('i need to slow down', 'listeningState:stopped');

    expect(sent).toEqual(['i need to slow down']);
  });

  it('admits ONE send when both silence timers fire for the same utterance', () => {
    const { state, sent, submit } = makeConversation();
    beginUtterance(state);
    noteSpeechContent(state, 'tell me more');

    submit('tell me more', 'audio_level_silence_timeout_1500ms');
    submit('tell me more', 'partial_silence_timeout_2500ms');

    expect(sent).toEqual(['tell me more']);
  });

  it('refuses the echo regardless of how long the two sends are apart', () => {
    // The old dedup was a 2000ms window while the silence timer fired at
    // 2500ms — the window was shorter than the interval it guarded. The
    // semantic guard has no window, so elapsed time is irrelevant.
    const { state, sent, submit } = makeConversation();
    beginUtterance(state);
    noteSpeechContent(state, 'hello maia');

    submit('hello maia', 'first');
    submit('hello maia', 'ten minutes later, same utterance, no restart');

    expect(sent).toEqual(['hello maia']);
  });
});

describe('utterance submission guard — what must still get through', () => {
  it('allows the same words again as a genuinely separate utterance after a restart', () => {
    const { state, sent, submit } = makeConversation();

    beginUtterance(state);
    noteSpeechContent(state, 'yes');
    submit('yes', 'turn 1');

    // MAIA responds, mic re-arms — authoritative native `started`
    beginUtterance(state);
    noteSpeechContent(state, 'yes');
    submit('yes', 'turn 2');

    expect(sent).toEqual(['yes', 'yes']);
  });

  it('allows the same words again when new speech content arrives without a restart', () => {
    const { state, sent, submit } = makeConversation();
    beginUtterance(state);
    noteSpeechContent(state, 'okay');
    submit('okay', 'turn 1');

    // recognizer keeps going and hears something different, then the same word
    noteSpeechContent(state, 'okay so');
    noteSpeechContent(state, 'okay');
    submit('okay', 'turn 2');

    expect(sent).toEqual(['okay', 'okay']);
  });

  it('allows distinct utterances within one recognition session', () => {
    const { state, sent, submit } = makeConversation();
    beginUtterance(state);

    noteSpeechContent(state, 'first thing');
    submit('first thing', 'a');
    noteSpeechContent(state, 'second thing');
    submit('second thing', 'b');

    expect(sent).toEqual(['first thing', 'second thing']);
  });

  it('treats case and whitespace differences as the same utterance', () => {
    const { state, sent, submit } = makeConversation();
    beginUtterance(state);
    noteSpeechContent(state, 'Hello   Maia');

    submit('Hello   Maia', 'first');
    submit('hello maia', 'echo with different casing/spacing');

    expect(sent).toEqual(['Hello   Maia']);
    expect(normalizeUtterance('Hello   Maia')).toBe('hello maia');
  });

  it('refuses empty and whitespace-only transcripts without consuming the utterance', () => {
    const state = createUtteranceGuardState();
    expect(trySubmitUtterance(state, '').admitted).toBe(false);
    expect(trySubmitUtterance(state, '   ').admitted).toBe(false);
    // still armed — an empty submission must not disarm a real one
    expect(trySubmitUtterance(state, 'real words').admitted).toBe(true);
  });
});

describe('negative control — the pre-fix logic must fail these same scenarios', () => {
  /**
   * Reconstruction of the behaviour at be5b3b802: a 2000ms exact-match window
   * consulted and updated ONLY by processAccumulatedTranscript, while the
   * native paths called onTranscript directly.
   */
  function makeLegacyConversation() {
    let lastSent = '';
    let lastSentTime = 0;
    const sent: string[] = [];
    const submit = (text: string, source: string, now: number) => {
      if (source === 'processAccumulatedTranscript') {
        const n = text.toLowerCase().trim();
        if (n === lastSent.toLowerCase().trim() && now - lastSentTime < 2000) return;
        lastSent = text;
        lastSentTime = now;
      }
      // every native path bypassed the dedup entirely
      sent.push(text);
    };
    return { sent, submit };
  }

  it('CONTROL: legacy logic double-sends on the trailing-partial race', () => {
    const { sent, submit } = makeLegacyConversation();
    submit('what is alive in me right now', 'partial_silence_timeout_2500ms', 0);
    submit('what is alive in me right now', 'listeningState:stopped', 120);
    // This is the defect. If this ever collapses to one entry, the control has
    // stopped reproducing the bug and the tests above prove nothing.
    expect(sent).toHaveLength(2);
  });

  it('CONTROL: legacy window is shorter than the silence interval it guarded', () => {
    const { sent, submit } = makeLegacyConversation();
    submit('hello maia', 'processAccumulatedTranscript', 0);
    submit('hello maia', 'processAccumulatedTranscript', 2500);
    expect(sent).toHaveLength(2);
  });
});
