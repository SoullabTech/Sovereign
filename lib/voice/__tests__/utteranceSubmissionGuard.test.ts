/**
 * Utterance identity — regression proof for the production double-send.
 *
 * Production signature this closes (conversation_turns, 2026-08-17):
 *   271 duplicate consecutive member turns in 30 days, mean gap 0.30s,
 *   6599/6604 in the SAME session, and 212 of 271 carrying NON-NULL but
 *   DIFFERENT exchange ids with ZERO matches — proof that the client minted a
 *   fresh id per submission, leaving UNIQUE (exchange_id, seq) inert.
 *
 * The tests are organised around the two ways this can fail. Refusing a real
 * repeat is the WORSE failure — it discards member speech invisibly — so it
 * gets equal weight here, not a footnote.
 */

import {
  createUtteranceGuardState,
  beginUtterance,
  trySubmitUtterance,
  mintUtteranceId,
} from '../utteranceSubmissionGuard';

/** Collects what actually reached onTranscript, with the id each carried. */
function makeConversation() {
  const state = createUtteranceGuardState();
  const sent: Array<{ text: string; utteranceId: string }> = [];
  const submit = (text: string, _source: string) => {
    const d = trySubmitUtterance(state, text);
    if (d.admitted) sent.push({ text, utteranceId: d.utteranceId });
    return d;
  };
  return { state, sent, submit };
}

describe('one listening episode yields one submission', () => {
  it('collapses iOS hypothesis revisions of a single utterance', () => {
    const { state, sent, submit } = makeConversation();
    beginUtterance(state);

    // iOS re-emits the same utterance capitalized and punctuated as
    // recognition winds down. Different bytes, one utterance.
    submit('what is alive in me right now', 'partial_silence_timeout_2500ms');
    submit('What is alive in me right now?', 'listeningState:stopped');

    expect(sent).toHaveLength(1);
    expect(sent[0].text).toBe('what is alive in me right now');
  });

  it('collapses a manual stop racing the native stopped event', () => {
    const { state, sent, submit } = makeConversation();
    beginUtterance(state);
    submit('i need to slow down', 'stopListening');
    submit('I need to slow down.', 'listeningState:stopped');
    expect(sent).toHaveLength(1);
  });

  it('collapses both silence timers firing for one episode', () => {
    const { state, sent, submit } = makeConversation();
    beginUtterance(state);
    submit('tell me more', 'audio_level_silence_timeout_1500ms');
    submit('Tell me more!', 'partial_silence_timeout_2500ms');
    expect(sent).toHaveLength(1);
  });

  it('refuses the echo no matter how much time passed — no window to outlast', () => {
    const { state, sent, submit } = makeConversation();
    beginUtterance(state);
    submit('hello maia', 'first');
    // The old repair was a 2000ms window while the silence timer fired at
    // 2500ms. Identity has no window, so elapsed time cannot defeat it.
    submit('hello maia', 'an hour later, same episode, no restart');
    expect(sent).toHaveLength(1);
  });

  it('gives every admitted turn a stable id to carry to the server', () => {
    const { state, sent, submit } = makeConversation();
    const id = beginUtterance(state);
    submit('what is alive', 'x');
    expect(sent[0].utteranceId).toBe(id);
  });
});

describe('a member repeating themselves must still be heard', () => {
  it('admits the identical sentence spoken as a NEW episode', () => {
    const { state, sent, submit } = makeConversation();

    beginUtterance(state);
    submit('What is alive?', 'turn 1');

    // MAIA answers, the mic re-arms, native `started` fires.
    beginUtterance(state);
    submit('What is alive?', 'turn 2');

    expect(sent).toHaveLength(2);
    expect(sent[0].utteranceId).not.toBe(sent[1].utteranceId);
  });

  it('admits it even seconds apart, where a 30s text window would have eaten it', () => {
    const { state, sent, submit } = makeConversation();
    beginUtterance(state);
    submit('What is alive?', 'turn 1');
    beginUtterance(state); // 10s later, deliberate repeat
    submit('What is alive?', 'turn 2');
    expect(sent).toHaveLength(2);
  });

  it('admits many deliberate repeats in a row', () => {
    const { state, sent, submit } = makeConversation();
    for (let i = 0; i < 5; i++) {
      beginUtterance(state);
      submit('yes', `turn ${i}`);
    }
    expect(sent).toHaveLength(5);
    expect(new Set(sent.map(s => s.utteranceId)).size).toBe(5);
  });

  it('admits distinct utterances across consecutive episodes', () => {
    const { state, sent, submit } = makeConversation();
    beginUtterance(state);
    submit('first thing', 'a');
    beginUtterance(state);
    submit('second thing', 'b');
    expect(sent.map(s => s.text)).toEqual(['first thing', 'second thing']);
  });
});

describe('refusals and identity hygiene', () => {
  it('refuses empty and whitespace-only transcripts without consuming the episode', () => {
    const state = createUtteranceGuardState();
    beginUtterance(state);
    expect(trySubmitUtterance(state, '')).toEqual({ admitted: false, reason: 'empty' });
    expect(trySubmitUtterance(state, '   ')).toEqual({ admitted: false, reason: 'empty' });
    expect(trySubmitUtterance(state, 'real words').admitted).toBe(true);
  });

  it('names the refusal reason so a device trace can distinguish the two', () => {
    const state = createUtteranceGuardState();
    beginUtterance(state);
    trySubmitUtterance(state, 'hello');
    const second = trySubmitUtterance(state, 'hello');
    expect(second).toEqual({ admitted: false, reason: 'utterance_already_submitted' });
  });

  it('still assigns an identity when a path submits with no episode open', () => {
    // Defensive: a transcript must never travel anonymously, or the server has
    // nothing to dedupe on and we are back to the production failure.
    const state = createUtteranceGuardState();
    const d = trySubmitUtterance(state, 'orphan transcript');
    expect(d.admitted).toBe(true);
    if (d.admitted) expect(d.utteranceId).toBeTruthy();
  });

  it('mints unique ids', () => {
    const ids = new Set(Array.from({ length: 200 }, () => mintUtteranceId()));
    expect(ids.size).toBe(200);
  });
});

describe('negative controls — the two repairs that were rejected', () => {
  it('CONTROL: exact byte compare fails on every observed iOS revision pair', () => {
    const pairs: Array<[string, string]> = [
      ['what is alive in me right now', 'What is alive in me right now?'],
      ['i need to slow down', 'I need to slow down.'],
      ['tell me more', 'Tell me more!'],
    ];
    // This is why the shipped guard let duplicates through.
    for (const [a, b] of pairs) expect(a === b).toBe(false);
  });

  it('CONTROL: a normalized text+time window would discard a deliberate repeat', () => {
    // The repair proposed before this one. Modelled here so the reason it was
    // rejected stays visible: it silently drops real member speech.
    const normalize = (s: string) =>
      s.toLowerCase().replace(/[.,!?;:]+/g, '').replace(/\s+/g, ' ').trim();
    const wouldDrop = (a: string, b: string, gapMs: number) =>
      normalize(a) === normalize(b) && gapMs < 30_000;

    expect(wouldDrop('What is alive?', 'What is alive?', 10_000)).toBe(true);

    // Identity admits that same case, which is the whole point.
    const { state, sent, submit } = makeConversation();
    beginUtterance(state);
    submit('What is alive?', 'turn 1');
    beginUtterance(state);
    submit('What is alive?', 'turn 2');
    expect(sent).toHaveLength(2);
  });
});
