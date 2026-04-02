/**
 * Voice World Navigation Tests
 *
 * Verifies that voice commands for world navigation:
 * 1. Match when the "MAIA" prefix is present (positive cases)
 * 2. Do NOT match during natural conversation (false-positive prevention)
 *
 * This is a production gate: if false positives fire, users will be
 * involuntarily navigated away during conversation. That breaks trust.
 */

import { matchVoiceCommand } from '../lib/voice/voiceCommands';

// --- POSITIVE CASES: should match ---

describe('Voice world navigation — positive matches', () => {
  const positives: [string, string][] = [
    // Return to center
    ['MAIA, back to center', 'world-navigate-maia'],
    ['MAIA, come back', 'world-navigate-maia'],
    ['MAIA, go home', 'world-navigate-maia'],
    ['maia back to maia', 'world-navigate-maia'],

    // Journal
    ['MAIA, open journal', 'world-navigate-journal'],
    ['maia, show journal', 'world-navigate-journal'],
    ['MAIA, go to journal', 'world-navigate-journal'],
    ["MAIA, let's journal this", 'world-navigate-journal'],

    // Patterns
    ['MAIA, show patterns', 'world-navigate-patterns'],
    ['MAIA, show my patterns', 'world-navigate-patterns'],
    ['maia, open patterns', 'world-navigate-patterns'],

    // Depth
    ['maia, take this to depth', 'world-navigate-depth'],
    ['MAIA, open depth', 'world-navigate-depth'],
    ['MAIA, enter depth', 'world-navigate-depth'],

    // Wisdom
    ['MAIA, open wisdom', 'world-navigate-wisdom'],
    ['maia, sacred texts', 'world-navigate-wisdom'],
    ['MAIA, show me wisdom', 'world-navigate-wisdom'],

    // Studio
    ['MAIA, move to studio', 'world-navigate-studio'],
    ['maia, open studio', 'world-navigate-studio'],
    ['MAIA, this is studio work', 'world-navigate-studio'],
  ];

  test.each(positives)('"%s" should match %s', (transcript, expectedCommand) => {
    const result = matchVoiceCommand(transcript);
    expect(result.matched).toBe(true);
    expect(result.command).toBe(expectedCommand);
    expect(result.action).toBe('world-navigate');
  });
});

// --- NEGATIVE CASES: must NOT match ---

describe('Voice world navigation — false positive prevention', () => {
  const negatives: string[] = [
    // Natural conversation mentioning world names without MAIA prefix
    'I was thinking about writing in my journal today',
    'the patterns in my life are becoming clearer',
    'I want to go deeper into this feeling',
    'there is so much wisdom in what you said',
    'I need to get back to my studio later',
    'open the journal on my desk',
    'show me the patterns on the wall',

    // Ambiguous phrases
    'I journal every morning',
    'the depth of this conversation is incredible',
    'I feel a deep sense of wisdom here',
    'my studio apartment is small',
    'let me open my journal app',

    // Partial prefix (not quite "MAIA")
    'maya, open journal',
    'my, open patterns',

    // Commands for non-navigation actions (should not trigger world-navigate)
    'I want to save this thought',
    'can you capture this?',
    'schedule a session',
    'show me my chart',

    // Empty / garbage
    '',
    '   ',
    'hello',
    'yes',
    'no',
  ];

  test.each(negatives)('"%s" should NOT trigger world navigation', (transcript) => {
    const result = matchVoiceCommand(transcript);
    if (result.matched) {
      // If it matched something, it must NOT be a world-navigate action
      expect(result.action).not.toBe('world-navigate');
    }
  });
});

// --- EDGE CASES ---

describe('Voice world navigation — edge cases', () => {
  test('MAIA prefix is case-insensitive', () => {
    const result = matchVoiceCommand('maia, open journal');
    expect(result.matched).toBe(true);
    expect(result.command).toBe('world-navigate-journal');
  });

  test('comma after MAIA is optional', () => {
    const result = matchVoiceCommand('maia open journal');
    expect(result.matched).toBe(true);
    expect(result.command).toBe('world-navigate-journal');
  });

  test('worldNavigationTarget is set correctly', () => {
    const result = matchVoiceCommand('MAIA, open wisdom');
    expect(result.worldNavigationTarget).toBe('wisdom');
  });

  test('studio navigation sets correct target', () => {
    const result = matchVoiceCommand('MAIA, move to studio');
    expect(result.worldNavigationTarget).toBe('studio');
  });
});
