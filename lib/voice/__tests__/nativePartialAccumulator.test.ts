/**
 * The defect these tests pin: iOS `partialResults` are monotonic only WITHIN a
 * single `SFSpeechRecognitionTask`. Across a task boundary they restart at the
 * empty string, and the previous consumer (a straight assignment) overwrote
 * everything said before the boundary.
 *
 * The negative controls matter as much as the positives: an accumulator that
 * never lets the recognizer revise its own segment would be just as wrong in
 * the other direction, showing the member stale text they already corrected.
 */

import {
  createNativePartialState,
  applyNativePartial,
  sealNativeSegment,
  joinNativeTranscript,
} from '../nativePartialAccumulator';

const feed = (partials: string[]) =>
  partials.reduce(
    (acc, p) => {
      const r = applyNativePartial(acc.state, p);
      return { state: r.state, text: r.text, boundaries: acc.boundaries + (r.boundary ? 1 : 0) };
    },
    { state: createNativePartialState(), text: '', boundaries: 0 }
  );

describe('nativePartialAccumulator — ordinary growth within one segment', () => {
  it('adopts each partial as the recognizer extends it', () => {
    const r = feed(['I was', 'I was thinking', 'I was thinking about']);
    expect(r.text).toBe('I was thinking about');
    expect(r.boundaries).toBe(0);
  });

  it('lets the recognizer revise its own segment downward without a boundary', () => {
    // iOS routinely shortens a phrase when a later frame changes its mind.
    const r = feed(['I was thinking aloud maybe', 'I was thinking allowed']);
    expect(r.text).toBe('I was thinking allowed');
    expect(r.boundaries).toBe(0);
  });

  it('treats a punctuation-only revision as the same segment', () => {
    const r = feed(['how are you', "how are you, really"]);
    expect(r.text).toBe('how are you, really');
    expect(r.boundaries).toBe(0);
  });
});

describe('nativePartialAccumulator — recognizer restart mid-utterance', () => {
  it('JOINS across an unannounced in-task reset instead of overwriting', () => {
    // This is the reported field symptom, reproduced: a long stretch of speech
    // followed by a partial that shares no opening word with it.
    const r = feed([
      'so the thing I keep coming back to is',
      'so the thing I keep coming back to is whether the system',
      'and then it just stops',
    ]);
    expect(r.text).toBe(
      'so the thing I keep coming back to is whether the system and then it just stops'
    );
    expect(r.boundaries).toBe(1);
  });

  it('keeps every segment across repeated restarts', () => {
    const r = feed(['first thought here', 'second thought here', 'third thought here']);
    expect(r.text).toBe('first thought here second thought here third thought here');
    expect(r.boundaries).toBe(2);
  });

  it('never shrinks the committed body once a boundary is crossed', () => {
    const after = feed(['a long opening statement', 'tiny']);
    expect(after.text.startsWith('a long opening statement')).toBe(true);
  });
});

describe('nativePartialAccumulator — sealSegment is the primary authority', () => {
  it('a sealed segment survives a next partial that shares its first word', () => {
    // Without the explicit seal the prefix heuristic would read "and" as a
    // continuation and destroy the earlier clause. This is why lifecycle
    // evidence outranks inference.
    let state = createNativePartialState();
    state = applyNativePartial(state, 'and I think the whole architecture holds').state;
    state = sealNativeSegment(state); // listeningState: stopped
    const r = applyNativePartial(state, 'and then');
    expect(r.text).toBe('and I think the whole architecture holds and then');
  });

  it('is idempotent', () => {
    let state = applyNativePartial(createNativePartialState(), 'hello there').state;
    state = sealNativeSegment(state);
    const once = joinNativeTranscript(state);
    state = sealNativeSegment(state);
    expect(joinNativeTranscript(state)).toBe(once);
  });

  it('does not double-append a partial replayed across the stop boundary', () => {
    let state = applyNativePartial(createNativePartialState(), 'the same words').state;
    state = sealNativeSegment(state);
    state = applyNativePartial(state, 'the same words').state;
    state = sealNativeSegment(state);
    expect(joinNativeTranscript(state)).toBe('the same words');
  });
});

describe('nativePartialAccumulator — an empty partial is not evidence', () => {
  it('holds text when the plugin emits an empty match', () => {
    let state = applyNativePartial(createNativePartialState(), 'still here').state;
    const r = applyNativePartial(state, '');
    expect(r.text).toBe('still here');
    expect(r.boundary).toBe(false);
  });

  it('holds text when the plugin emits whitespace', () => {
    const state = applyNativePartial(createNativePartialState(), 'still here').state;
    expect(applyNativePartial(state, '   ').text).toBe('still here');
  });
});

describe('nativePartialAccumulator — a forming segment is not a boundary', () => {
  it('replaces a one- or two-character segment rather than committing it', () => {
    // "I" → "Uh" share no prefix, but committing "I" would litter the
    // transcript with recognizer false starts.
    const r = feed(['I', 'Uh', 'Uh huh I see']);
    expect(r.text).toBe('Uh huh I see');
    expect(r.boundaries).toBe(0);
  });
});
