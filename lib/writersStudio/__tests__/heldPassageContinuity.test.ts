/** @jest-environment node */
import { reholdClearsConversation } from '../heldPassageContinuity';

/**
 * Defect found in the step 3 production witness (2026-11-03): after "Use this" applied
 * a change, the writer's live selection re-held the rewritten passage, the old passage
 * text no longer matched, and the conversation (with its Undo) was cleared.
 */

const base = {
  sameSection: true,
  hasThread: true,
  binding: null as { start: number; end: number } | null,
  start: 0,
  end: 10,
  actInFlight: false,
  appliedWording: null as string | null,
  heldText: 'New words.',
};

test('re-holding the same passage that the conversation is bound to keeps it', () => {
  expect(reholdClearsConversation({ ...base, binding: { start: 0, end: 10 } })).toBe(false);
});

test('a different passage still clears the conversation (the #2041 law holds)', () => {
  expect(reholdClearsConversation({ ...base, binding: { start: 20, end: 30 } })).toBe(true);
  expect(reholdClearsConversation(base)).toBe(true);
  expect(reholdClearsConversation({ ...base, sameSection: false, binding: { start: 0, end: 10 } })).toBe(true);
});

test('while an apply or save is in flight, a re-hold does not clear the conversation', () => {
  expect(reholdClearsConversation({ ...base, actInFlight: true })).toBe(false);
});

test('after an apply, holding exactly the applied wording keeps the conversation and its Undo', () => {
  expect(reholdClearsConversation({ ...base, appliedWording: 'New words.' })).toBe(false);
  expect(reholdClearsConversation({ ...base, appliedWording: 'Other words.' })).toBe(true);
});

test('another section always clears, even mid-act', () => {
  expect(reholdClearsConversation({ ...base, sameSection: false, actInFlight: true })).toBe(true);
});

test('with no conversation there is nothing to clear on the same section', () => {
  expect(reholdClearsConversation({ ...base, hasThread: false })).toBe(false);
});
