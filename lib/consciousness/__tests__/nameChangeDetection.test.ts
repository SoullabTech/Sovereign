/**
 * "Call me when you're ready" renamed a member to "When you" (2026-11-02): the capture takes up
 * to two words and the excluded-word check looked at the whole phrase, never the first word.
 */
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

import { detectNameChangeIntent } from '../nameChangeDetection';

describe('name change detection', () => {
  it.each([
    "Call me when you're ready",
    'call me when you can',
    'Call me if you need anything',
    'call me later',
    'Call me maybe',
    'call me back when you have a moment',
    'please call me when you are free',
    'Call me you know who',
    'call me now',
  ])('does not treat "%s" as a name', (message) => {
    expect(detectNameChangeIntent(message).detected).toBe(false);
  });

  it.each([
    ['Call me Eric', 'Eric'],
    ['my name is Cathryn', 'Cathryn'],
    ['please call me Kel', 'Kel'],
    ['Call me Mary Ann', 'Mary ann'],
    ['you can call me Sam', 'Sam'],
  ])('still detects a real request: "%s"', (message, expected) => {
    expect(detectNameChangeIntent(message)).toEqual({ detected: true, newName: expected });
  });
});
