/**
 * Continuity buffer tests.
 *
 * Context: on the web path there is no recorder and no audio artifact — the
 * browser transcribes internally and returns text — so the ONLY record of a
 * spoken turn is one in-memory React ref that is cleared on restart, on submit,
 * and on unmount. A member reported losing 5-10 minutes of speech; another
 * reported repeating herself six times and losing MAIA's replies with it; a
 * third took to copy-pasting live conversations into a document out of
 * paranoia. This buffer is the second copy that makes those losses impossible.
 *
 * The tests pin two things that matter more than the mechanics: the buffer
 * never loses the member's unsent words, and it never becomes memory.
 */

import {
  ConversationContinuityBuffer,
  CONTINUITY_TTL_MS,
  MAX_TURNS,
  type ContinuityStorage,
} from '../conversationContinuityBuffer';

function makeStorage(): ContinuityStorage & { dump: () => Record<string, string> } {
  const map: Record<string, string> = {};
  return {
    getItem: (k) => (k in map ? map[k] : null),
    setItem: (k, v) => { map[k] = v; },
    removeItem: (k) => { delete map[k]; },
    dump: () => ({ ...map }),
  };
}

describe('ConversationContinuityBuffer', () => {
  it('holds the unsent utterance — the piece whose loss is actually felt', () => {
    const b = new ConversationContinuityBuffer({ storage: makeStorage() });
    b.recordPending('what I was beginning to realize');
    expect(b.getPending()?.text).toBe('what I was beginning to realize');
    expect(b.getPending()?.speaker).toBe('member');
  });

  it('stores speech verbatim, with no summarization or repair', () => {
    const b = new ConversationContinuityBuffer({ storage: makeStorage() });
    const partial = 'and then I hadn\'t realized how ang';
    b.recordPending(partial);
    // A partial utterance comes back partial. We never invent what we did not hear.
    expect(b.getPending()?.text).toBe(partial);
  });

  it('moves a sent turn out of pending, so it cannot be handed back twice', () => {
    const b = new ConversationContinuityBuffer({ storage: makeStorage() });
    b.recordPending('hello there');
    b.recordSubmitted('hello there');
    expect(b.getPending()).toBeNull();
    expect(b.getRecentTurns().map((t) => t.text)).toEqual(['hello there']);
  });

  it('preserves MAIA\'s replies too — losing her half loses the conversation', () => {
    const b = new ConversationContinuityBuffer({ storage: makeStorage() });
    b.recordSubmitted('I think I am avoiding something');
    b.recordMaiaReply('What does the avoidance protect?');
    expect(b.getRecentTurns().map((t) => t.speaker)).toEqual(['member', 'maia']);
  });

  it('collapses a streaming reply into one turn, not one per frame', () => {
    const b = new ConversationContinuityBuffer({ storage: makeStorage() });
    b.recordMaiaReply('What does');
    b.recordMaiaReply('What does the avoidance');
    b.recordMaiaReply('What does the avoidance protect?');
    const turns = b.getRecentTurns();
    expect(turns).toHaveLength(1);
    expect(turns[0].text).toBe('What does the avoidance protect?');
  });

  it('survives a new instance — the point is outliving the component', () => {
    const storage = makeStorage();
    new ConversationContinuityBuffer({ storage }).recordPending('mid-sentence thought');
    // Simulates a remount, or a tab refresh, after capture died.
    expect(new ConversationContinuityBuffer({ storage }).getPending()?.text)
      .toBe('mid-sentence thought');
  });

  // ── Sanctuary: the boundary that must never leak. ──

  it('PURGES on disable — Sanctuary forbids retention, not merely accumulation', () => {
    const storage = makeStorage();
    const b = new ConversationContinuityBuffer({ storage });
    b.recordPending('something said before Sanctuary was entered');
    b.recordSubmitted('and a turn that was sent');
    b.setEnabled(false);
    expect(b.getPending()).toBeNull();
    expect(b.getRecentTurns()).toEqual([]);
    expect(Object.keys(storage.dump())).toHaveLength(0);
  });

  it('writes nothing at all while disabled', () => {
    const storage = makeStorage();
    const b = new ConversationContinuityBuffer({ storage });
    b.setEnabled(false);
    b.recordPending('spoken inside Sanctuary');
    b.recordSubmitted('also inside Sanctuary');
    b.recordMaiaReply('and her reply');
    expect(Object.keys(storage.dump())).toHaveLength(0);
    expect(b.getPending()).toBeNull();
  });

  // ── Bounded custody: holding speech creates a duty to surrender it. ──

  it('surrenders expired content rather than handing back stale speech', () => {
    const storage = makeStorage();
    new ConversationContinuityBuffer({ storage }).recordPending('long ago');
    const raw = JSON.parse(Object.values(storage.dump())[0]);
    raw.updatedAt = Date.now() - CONTINUITY_TTL_MS - 1;
    storage.setItem(Object.keys(storage.dump())[0], JSON.stringify(raw));
    expect(new ConversationContinuityBuffer({ storage }).getPending()).toBeNull();
  });

  it('bounds the turn log so the buffer cannot grow without limit', () => {
    const b = new ConversationContinuityBuffer({ storage: makeStorage() });
    for (let i = 0; i < MAX_TURNS + 25; i++) b.recordSubmitted(`turn ${i}`);
    const turns = b.getRecentTurns(1000);
    expect(turns.length).toBeLessThanOrEqual(MAX_TURNS);
    // Oldest are dropped, most recent kept.
    expect(turns[turns.length - 1].text).toBe(`turn ${MAX_TURNS + 24}`);
  });

  it('never drops the pending utterance to make room — it is irreplaceable', () => {
    const b = new ConversationContinuityBuffer({ storage: makeStorage() });
    b.recordPending('the unsent thought');
    for (let i = 0; i < MAX_TURNS + 50; i++) b.recordMaiaReply(`reply number ${i}`);
    expect(b.getPending()?.text).toBe('the unsent thought');
  });

  it('purge removes everything', () => {
    const storage = makeStorage();
    const b = new ConversationContinuityBuffer({ storage });
    b.recordPending('x');
    b.purge();
    expect(Object.keys(storage.dump())).toHaveLength(0);
  });

  // ── Never break the conversation it exists to protect. ──

  it('degrades silently when storage is unavailable (private browsing, SSR)', () => {
    const hostile: ContinuityStorage = {
      getItem: () => { throw new Error('SecurityError'); },
      setItem: () => { throw new Error('QuotaExceededError'); },
      removeItem: () => { throw new Error('SecurityError'); },
    };
    const b = new ConversationContinuityBuffer({ storage: hostile });
    expect(() => {
      b.recordPending('x');
      b.recordSubmitted('y');
      b.recordMaiaReply('z');
      b.getPending();
      b.getRecentTurns();
      b.purge();
    }).not.toThrow();
  });

  it('tolerates corrupt stored data without losing the voice path', () => {
    const storage = makeStorage();
    storage.setItem('maia.voice.continuity.v1', '{not json');
    const b = new ConversationContinuityBuffer({ storage });
    expect(b.getPending()).toBeNull();
    expect(b.getRecentTurns()).toEqual([]);
  });
});
