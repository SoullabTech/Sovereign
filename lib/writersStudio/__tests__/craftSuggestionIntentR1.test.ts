import { craftProposalRequested } from '../craftScopeR1';

describe('Craft wording requests are not keyword matches', () => {
  it.each([
    'Please do not rewrite this. Just explain it.',
    'Don’t revise my words yet.',
    'Why did you rewrite my sentence?',
    'Do you think this needs a rewrite?',
    'Explain the difference between a rewrite and a line edit.',
    'The sentence says "rewrite this paragraph". What does it mean?',
    'Never rephrase the quotation.',
    'Look at the chapter; no wording suggestions yet.',
  ])('does not invent wording permission from %j', (request) => {
    expect(craftProposalRequested(request)).toBe(false);
  });

  it.each([
    'Please rewrite this sentence.',
    'Could you rephrase this passage?',
    'Show me another version.',
    'Give me two alternatives.',
    'How would you word this?',
    'Try a revision.',
    'Keep my opening; then revise the ending.',
  ])('recognizes a direct bounded wording request: %j', (request) => {
    expect(craftProposalRequested(request)).toBe(true);
  });
});
