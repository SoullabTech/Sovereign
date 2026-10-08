import { parseCraftKeptSpans, verifiedCraftKeptSpans, sameCraftKeptSpans } from '../craftSettledChoicesR1';
import { parseCraftSaveRequest } from '../craftSaveContractR1';
const original = '🜂 We become present. We listen.';
const kept = [{ start: 5, end: 11, text: 'become' }];
it('uses exact code-point offsets while allowing unrelated edits', () => {
  expect(verifiedCraftKeptSpans(original, original.replace('listen', 'listen closely'), kept)).toEqual(kept);
  expect(verifiedCraftKeptSpans(original, original.replace('become', 'be'), kept)).toBeNull();
  expect(verifiedCraftKeptSpans(original, original, [{ ...kept[0]!, text: 'notice' }])).toBeNull();
});
it.each([null, {}, [{ start: -1, end: 0, text: 'a' }], [...kept, ...kept], [{ ...kept[0]!, author: 'maia' }]])('refuses malformed, foreign, or overlapping decisions: %j', value => {
  expect(parseCraftKeptSpans(value)).toBeNull();
});
it('absent legacy metadata is distinct from inferred decisions, but compares as empty', () => {
  expect(sameCraftKeptSpans(undefined, [])).toBe(true);
  expect(sameCraftKeptSpans(kept, [])).toBe(false);
});
it('closed Save accepts only structurally valid decision metadata', () => {
  const uuid = '11111111-1111-4111-8111-111111111111';
  const request = { sectionId: uuid, range: { start: 0, end: 31 }, revisionNumber: 1, threadId: null, supersedes: null, replacementText: original, sanctuary: false, kept };
  expect(parseCraftSaveRequest(request).ok).toBe(true);
  expect(parseCraftSaveRequest({ ...request, kept: [{ start: 1, end: 5, text: 'wrong' }] }).ok).toBe(false);
});

it('can save a rejected insertion as an unchanged empty boundary, not as an inserted word', () => {
  const absence = [{ start: 0, end: 0, text: '' }];
  expect(verifiedCraftKeptSpans(original, original, absence)).toEqual(absence);
  expect(verifiedCraftKeptSpans(original, 'Extra ' + original, absence)).toBeNull();
  expect(parseCraftKeptSpans([...absence, ...absence])).toBeNull();
});
