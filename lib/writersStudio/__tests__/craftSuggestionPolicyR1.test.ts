import { resolveCraftSuggestionPolicy } from '../craftSuggestionPolicyR1';
import { availableOutcomeKinds, sequenceGateActive } from '@/lib/manuscript/editorialScope/sequence';
import { EDITORIAL_LATITUDES } from '@/lib/manuscript/editorialScope/contract';

describe('Craft R1 writer-selected suggestion posture', () => {
  for (const latitude of EDITORIAL_LATITUDES) {
    for (const hasPriorMaiaTurn of [false, true]) {
      it(`keeps unsolicited proposals off at latitude ${latitude}, prior reply ${hasPriorMaiaTurn}`, () => {
        const policy = resolveCraftSuggestionPolicy({ request: 'What is happening here?', proactive: false });
        const gated = sequenceGateActive({ declaration: { latitude, mayProposeImmediately: false }, hasPriorMaiaTurn });
        expect(availableOutcomeKinds(gated, policy.proposalPolicy)).toEqual(['reply_only']);
        expect(policy.proposalRequested).toBe(false);
      });
    }
  }

  it('requires a requested suggestion without changing the standing setting', () => {
    const choice = { request: 'Show me two alternatives.', proactive: false };
    expect(resolveCraftSuggestionPolicy(choice)).toEqual({ proposalPolicy: 'require', proposalRequested: true });
    expect(choice.proactive).toBe(false);
    expect(resolveCraftSuggestionPolicy({ ...choice, request: 'What works here?' }).proposalPolicy).toBe('reply_only');
  });

  it('recognizes the founder Chapter 10 marked-copy request as an explicit proposal act', () => {
    const request = 'Using what we already discussed, show me one small change that helps the reader experience the spiral bodily and relationally. Keep Activating, Amplifying, Actualizing intact, preserve my cadence, and avoid making it over-written. Put the suggestion directly in the marked copy.';
    expect(resolveCraftSuggestionPolicy({ request, proactive: false })).toEqual({
      proposalPolicy: 'require', proposalRequested: true,
    });
  });

  it('allows volunteering when the writer enabled it, without inventing an explicit request', () => {
    expect(resolveCraftSuggestionPolicy({ request: 'What works here?', proactive: true })).toEqual({
      proposalPolicy: 'allow', proposalRequested: false,
    });
  });

  it.each([false, true])('keeps a Why/Teach action reply-only with proactive=%s', proactive => {
    expect(resolveCraftSuggestionPolicy({
      request: 'Explain why you proposed: rewrite this paragraph.',
      proactive, proposalPolicy: 'reply_only', proposalRequested: true,
    })).toEqual({ proposalPolicy: 'reply_only', proposalRequested: false });
  });

  it('honors an explicit no even when suggestions are enabled', () => {
    expect(resolveCraftSuggestionPolicy({ request: 'Do not rewrite it.', proactive: true })).toEqual({
      proposalPolicy: 'reply_only', proposalRequested: false,
    });
  });
});

import { craftArrivalPolicy } from '../craftSuggestionPolicyR1';
import { craftPrimerPrompt } from '../craftCanvas';

describe('Craft arrival waits for the per-Work choice', () => {
  it.each([false, true])('does not consume an unresolved proactive=%s preference', proactive => {
    expect(craftArrivalPolicy({ resolved: false, proactive })).toBeNull();
  });

  it('continues the carried intention without inventing permission for wording', () => {
    expect(craftArrivalPolicy({ resolved: true, proactive: false })).toEqual({
      proposalPolicy: 'reply_only', proposalRequested: false,
    });
    expect(craftPrimerPrompt(false)).toContain('without supplying replacement wording');
    expect(craftPrimerPrompt(false)).toContain('do not ask the writer to explain them again');
  });

  it('permits a provisional demonstration under the enabled setting, not invented explicit consent', () => {
    expect(craftArrivalPolicy({ resolved: true, proactive: true })).toEqual({
      proposalPolicy: 'allow', proposalRequested: false,
    });
    expect(craftPrimerPrompt(true)).toContain('ONE provisional demonstration');
  });
});
