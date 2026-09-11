/**
 * VOICE TURN-CLOSE AUTHORITY — a recognizer boundary is not the member's pause.
 *
 * IOS-CONVERSATION-RUNTIME-01 · Repair Two (founder-authorized 2026-09-11,
 * lane doc E19). Witnessed on device (E16.1): the native recognizer delivered
 * a 537-character partial and then, inside the same task with no stop event,
 * its next partial was `And`. The web layer replaced its buffer with each
 * partial, so 537 characters were discarded and only the ~60-character tail
 * was sent after the 2.5 s silence timer. The member's turn was closed by the
 * recognizer's segmenting, not by the member's pause.
 *
 * The repair moves turn-close authority off the recognizer boundary:
 *   1. partials are FOLDED into the turn (`lib/voice/turnAccumulator.ts`);
 *      a segment reset commits the previous partial instead of dropping it;
 *   2. a recognizer `stopped` event with text pending HOLDS the text for the
 *      silence timer instead of sending at the recognizer's boundary;
 *   3. the silence timers keep their values — 2500 ms and 1500 ms — unchanged,
 *      per ruling ("do not change timeout values").
 *
 * Boundary (E19): this gate says nothing about output silence (defect a) or
 * competing capture ownership (defect b). It pins only turn-close authority.
 *
 * Source-shape assertions strip comments first, so the file cannot fail this
 * gate because its own prose documents the behaviour the gate forbids.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  acceptPartial,
  composeTurnText,
  emptyTurnAccumulator,
  isSegmentReset,
} from '@/lib/voice/turnAccumulator';

const SOURCE = join(process.cwd(), 'components', 'voice', 'ContinuousConversation.tsx');

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

// The E16.1 witness, reduced: a long first segment, then a partial that starts over.
const E16_LONG_SEGMENT =
  'So I have been thinking about the way the conversation keeps cutting me off ' +
  'around thirty seconds and I wanted to describe what actually happens because ' +
  'it seems like she hears everything I say and then only the last few words ' +
  'come through as the thing I said which makes the reply land on the wrong part ' +
  'of what I was trying to say and that is the thing I most want to understand ' +
  'before we change anything else about how listening works on the phone';

describe('turn accumulator — pure helpers', () => {
  it('⭐ E16.1 reproduction: a segment reset carries the long partial forward instead of discarding it', () => {
    let state = emptyTurnAccumulator();
    state = acceptPartial(state, 'So I have been');
    state = acceptPartial(state, E16_LONG_SEGMENT);
    expect(state.committed).toHaveLength(0);
    expect(state.live).toBe(E16_LONG_SEGMENT);

    // The recognizer starts a new segment inside the same task: no stop event,
    // just a partial that no longer contains the start of the previous one.
    state = acceptPartial(state, 'And');
    expect(state.committed).toEqual([E16_LONG_SEGMENT]);
    expect(state.live).toBe('And');

    state = acceptPartial(state, 'And then it only sends the tail');
    const turn = composeTurnText(state);
    expect(turn.startsWith(E16_LONG_SEGMENT)).toBe(true);
    expect(turn.endsWith('And then it only sends the tail')).toBe(true);
    expect(turn.length).toBeGreaterThan(E16_LONG_SEGMENT.length);
  });

  it('an ordinary shortening revision is NOT a reset', () => {
    expect(isSegmentReset('so that that\'s the thing', 'so that\'s the thing')).toBe(false);
    let state = acceptPartial(emptyTurnAccumulator(), 'so that that\'s the thing');
    state = acceptPartial(state, 'so that\'s the thing');
    expect(state.committed).toHaveLength(0);
    expect(composeTurnText(state)).toBe('so that\'s the thing');
  });

  it('a growing partial is never a reset', () => {
    let state = emptyTurnAccumulator();
    for (const p of ['I', 'I want', 'I want to', 'I want to say something']) {
      state = acceptPartial(state, p);
    }
    expect(state.committed).toHaveLength(0);
    expect(composeTurnText(state)).toBe('I want to say something');
  });

  it('a short previous partial is never committed as a segment (fewer than three words)', () => {
    expect(isSegmentReset('Um so', 'And')).toBe(false);
    let state = acceptPartial(emptyTurnAccumulator(), 'Um so');
    state = acceptPartial(state, 'And');
    expect(state.committed).toHaveLength(0);
    expect(state.live).toBe('And');
  });

  it('a reset requires both a different first word and at most half the words', () => {
    // same first word, much shorter → a revision, not a reset
    expect(isSegmentReset('so the thing I wanted to say was this', 'so the')).toBe(false);
    // different first word, but nearly as long → not a reset
    expect(isSegmentReset('so the thing I wanted to say', 'and the thing I wanted to')).toBe(false);
    // different first word AND at most half → reset
    expect(isSegmentReset('so the thing I wanted to say was this', 'and then')).toBe(true);
    // first-word comparison is case-insensitive
    expect(isSegmentReset('So the thing I wanted to say was this', 'so')).toBe(false);
  });

  it('empty partials are ignored and state is never mutated', () => {
    const start = acceptPartial(emptyTurnAccumulator(), 'one two three four');
    const same = acceptPartial(start, '   ');
    expect(same).toBe(start);
    const next = acceptPartial(start, 'five');
    expect(start.committed).toHaveLength(0);
    expect(next.committed).toEqual(['one two three four']);
  });

  it('composeTurnText joins committed segments then the live one, skipping blanks', () => {
    expect(composeTurnText({ committed: ['first part ', ' ', 'second part'], live: ' tail ' }))
      .toBe('first part second part tail');
    expect(composeTurnText(emptyTurnAccumulator())).toBe('');
  });
});

describe('ContinuousConversation — turn-close authority lives with the silence timers', () => {
  const code = stripComments(readFileSync(SOURCE, 'utf8'));

  it('⭐ the native partial handler folds partials with acceptPartial and composes the whole turn', () => {
    const handlerStart = code.indexOf("addListener('partialResults'");
    expect(handlerStart).toBeGreaterThan(-1);
    const handler = code.slice(handlerStart, handlerStart + 3000);
    expect(handler).toMatch(/nativeTurnRef\.current = acceptPartial\(/);
    expect(handler).toMatch(/composeTurnText\(nativeTurnRef\.current\)/);
    expect(handler).toMatch(/accumulatedTranscript\.current = turnText/);
    // The pre-repair shape — replace the buffer with the raw partial — is gone.
    expect(handler).not.toMatch(/accumulatedTranscript\.current = transcript\b/);
    // A segment reset is reported, not silent.
    expect(handler).toMatch(/logVoiceEvent\('ios_voice_segment_carried'/);
  });

  it('⭐ the recognizer `stopped` state no longer sends the turn', () => {
    // The `native_stop` dispatch source was the send-at-recognizer-boundary path.
    expect(code).not.toMatch(/witnessDispatch\(\s*'native_stop'/);
    const stoppedStart = code.indexOf("state.status === 'stopped'");
    expect(stoppedStart).toBeGreaterThan(-1);
    const stopped = code.slice(stoppedStart, stoppedStart + 1500);
    expect(stopped).toMatch(/logVoiceEvent\('ios_voice_stop_held_pending_turn'/);
    expect(stopped).toMatch(/armNativeFallbackSilenceTimer\(\)/);
    expect(stopped).not.toMatch(/onTranscript\(/);
  });

  it('a native restart with text pending re-arms the fallback timer instead of orphaning the text', () => {
    const defStart = code.indexOf('const armNativeFallbackSilenceTimer = ');
    expect(defStart).toBeGreaterThan(-1);
    const after = code.slice(defStart, defStart + 2500);
    expect(after).toMatch(/if \(accumulatedTranscript\.current\.trim\(\)\) \{\s*armNativeFallbackSilenceTimer\(\);/);
  });

  it('the silence timers still send through the witnessed silence-timer seam', () => {
    expect(code).toMatch(/witnessDispatch\('native_silence', 'silence_timer'/);
    expect(code).toMatch(/witnessDispatch\('native_audio_silence', 'silence_timer'/);
  });

  it('⛔ timeout values are unchanged: 2500 ms partial silence, 1500 ms audio-level silence', () => {
    expect(code).toMatch(/\}, 2500\);/);
    expect(code).toMatch(/source: 'partial_silence_timeout_2500ms'/);
    expect(code).toMatch(/\b1500\b/);
    expect(code).not.toMatch(/partial_silence_timeout_(?!2500ms)\d+ms/);
  });

  it('both new diagnostic events are declared in the closed event-name union', () => {
    const diag = readFileSync(join(process.cwd(), 'lib', 'voice', 'voiceDiagnostics.ts'), 'utf8');
    expect(diag).toMatch(/'ios_voice_segment_carried'/);
    expect(diag).toMatch(/'ios_voice_stop_held_pending_turn'/);
  });
});
