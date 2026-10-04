import {
  evaluateKeepOffer,
  hasUnresolvedKeepReferent,
  parseFilingInstruction,
} from '../conversational-keep';

describe('R9 exact-referent boundary for conversational Keep', () => {
  it.each([
    'keep this',
    'please keep that for me',
    'save it as an idea',
    'journal this',
    'protect that',
    'this is an idea',
  ])('does not turn unresolved deictic material into a filing: %s', (utterance) => {
    expect(parseFilingInstruction({ utterance })).toBeNull();
  });

  it.each(['keep this', 'remember this', 'hold onto this', 'journal that']) (
    'recognizes unresolved keep-like referents: %s',
    (utterance) => expect(hasUnresolvedKeepReferent(utterance)).toBe(true),
  );
});

describe('J4 candidate generation boundary', () => {
  const base = {
    conversationTurn: 10,
    recentOfferCount: 0,
    recentDeclineCount: 0,
    offersPaused: false,
  };

  it('does not proactively offer a Keep from salience alone', () => {
    expect(evaluateKeepOffer({ ...base, utterance: 'This matters to me.' })).toBeNull();
  });

  it('may generate a candidate only when candidate help was explicitly requested', () => {
    const result = evaluateKeepOffer({
      ...base,
      utterance: 'This matters to me.',
      memberRequestedCandidates: true,
    });
    expect(result?.type).toBe('keep_offer');
    expect(result?.excerpt).toBe('This matters to me.');
  });

  it('still refuses an unresolved deictic Keep request even inside candidate-help mode', () => {
    expect(evaluateKeepOffer({
      ...base,
      utterance: 'remember this',
      memberRequestedCandidates: true,
    })).toBeNull();
  });
});
