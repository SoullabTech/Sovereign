import { describe, expect, it } from '@jest/globals';

import {
  detectMaiaCommands,
  type CommandDisposition,
  type MaiaCommand,
} from '../VoiceCommandDetector';

type Case = {
  input: string;
  disposition?: CommandDisposition;
};

describe('TII-03 member-authorship preservation', () => {
  const nonCommands: Case[] = [
    { input: 'Can I use Astrology Reading?', disposition: 'DO_NOT_EXECUTE' },
    { input: 'Can I use CBT for this?', disposition: 'DO_NOT_EXECUTE' },
    { input: 'Do I have access to the Jungian lens?', disposition: 'DO_NOT_EXECUTE' },
    { input: 'Is somatic mode available?', disposition: 'DO_NOT_EXECUTE' },
    { input: 'What is Care mode?', disposition: 'DO_NOT_EXECUTE' },
    { input: 'What does it mean to use a Jungian lens?', disposition: 'DO_NOT_EXECUTE' },
    { input: 'How do people use CBT?', disposition: 'DO_NOT_EXECUTE' },
    { input: 'Would you ever try somatic work here?', disposition: 'CLARIFY' },
    { input: 'Could we use astrology later?', disposition: 'CLARIFY' },
    { input: 'What if we went Jungian?', disposition: 'CLARIFY' },
    { input: 'My therapist said, "try CBT."', disposition: 'DO_NOT_EXECUTE' },
    { input: 'She told me to use a somatic approach.', disposition: 'DO_NOT_EXECUTE' },
    { input: 'The book says "follow my lead."', disposition: 'DO_NOT_EXECUTE' },
    { input: 'I used astrology when I was younger.', disposition: 'DO_NOT_EXECUTE' },
    { input: 'I tried CBT before.', disposition: 'DO_NOT_EXECUTE' },
    { input: 'I go to Jungian analysis.', disposition: 'DO_NOT_EXECUTE' },
  ];

  it.each(nonCommands)('$input preserves exact authorship without execution', ({ input, disposition }) => {
    const result = detectMaiaCommands(input);

    expect(result.authoredText).toBe(input);
    expect(result.conversationalText).toBe(input);
    expect(result.cleanedText).toBe(input);
    expect(result.disposition).toBe(disposition);
    expect(result.commands).toEqual([]);
    expect(result.commandSpans).toEqual([]);
    expect(result.onlyCommands).toBe(false);
  });

  it('reproduces and defeats the exact production mutation', () => {
    const input = 'Can I use Astrology Reading?';
    const result = detectMaiaCommands(input);

    expect(result.authoredText).toBe(input);
    expect(result.conversationalText).toBe(input);
    expect(result.conversationalText).not.toBe('Can I Reading?');
    expect(result.commands).toHaveLength(0);
  });
});
describe('TII-03 explicit command speech acts', () => {
  const commands: Array<{ input: string; command: MaiaCommand }> = [
    { input: 'Switch to Care mode.', command: { type: 'mode', mode: 'care' } },
    { input: 'Care mode.', command: { type: 'mode', mode: 'care' } },
    { input: 'Go to Talk mode.', command: { type: 'mode', mode: 'talk' } },
    { input: 'Talk mode.', command: { type: 'mode', mode: 'talk' } },
    { input: 'Enter Scribe mode.', command: { type: 'mode', mode: 'scribe' } },
    { input: 'Enter Sanctuary mode.', command: { type: 'mode', mode: 'sanctuary' } },
    { input: 'Leave Sanctuary mode.', command: { type: 'mode', mode: 'talk' } },
    { input: 'Disable Sanctuary mode.', command: { type: 'mode', mode: 'talk' } },
    { input: 'Use the Jungian lens.', command: { type: 'lens', lens: 'jungian' } },
    { input: 'Use CBT.', command: { type: 'lens', lens: 'cbt' } },
    { input: 'Try a somatic lens.', command: { type: 'lens', lens: 'somatic' } },
    { input: 'Use IFS.', command: { type: 'lens', lens: 'ifs' } },
    { input: 'Use a relational lens.', command: { type: 'lens', lens: 'relational' } },
    { input: 'Use astrology for this.', command: { type: 'lens', lens: 'archetypal' } },
    { input: 'Use TCM.', command: { type: 'lens', lens: 'tcm' } },
    { input: 'Clear the lens.', command: { type: 'lens', lens: 'auto' } },
    { input: 'Switch to walking mode.', command: { type: 'style', style: 'walking' } },
    { input: 'Keep it brief.', command: { type: 'style', style: 'walking' } },
    { input: "Let's go deeper.", command: { type: 'style', style: 'classic' } },
    { input: 'Match my style.', command: { type: 'style', style: 'adaptive' } },
  ];

  it.each(commands)('$input executes without rewriting the authored turn', ({ input, command }) => {
    const result = detectMaiaCommands(input);

    expect(result.authoredText).toBe(input);
    expect(result.disposition).toBe('EXECUTE');
    expect(result.commands).toEqual([command]);
    expect(result.onlyCommands).toBe(true);
    expect(result.conversationalText).toBe('');
    expect(result.commandSpans).toHaveLength(1);
    expect(result.commandSpans[0].text.length).toBeGreaterThan(0);
    expect(input.slice(result.commandSpans[0].start, result.commandSpans[0].end))
      .toBe(result.commandSpans[0].text);
  });

  it('orders Sanctuary exit ahead of generic Sanctuary entry semantics', () => {
    expect(detectMaiaCommands('Leave Sanctuary mode.').commands)
      .toEqual([{ type: 'mode', mode: 'talk' }]);
    expect(detectMaiaCommands('Turn off Sanctuary mode.').commands)
      .toEqual([{ type: 'mode', mode: 'talk' }]);
  });
});
describe('TII-03 mixed command and conversation provenance', () => {
  it('keeps the full authored turn while deriving conversational content', () => {
    const input = 'Use a Jungian lens. I keep dreaming about my father.';
    const result = detectMaiaCommands(input);

    expect(result.authoredText).toBe(input);
    expect(result.disposition).toBe('EXECUTE');
    expect(result.commands).toEqual([{ type: 'lens', lens: 'jungian' }]);
    expect(result.onlyCommands).toBe(false);
    expect(result.conversationalText).toBe('I keep dreaming about my father.');
    expect(result.commandSpans).toHaveLength(1);
  });

  it('can recognize an explicit leading command chain without claiming the remainder', () => {
    const input = 'MAIA switch to Care mode and use the Jungian lens. I feel stuck.';
    const result = detectMaiaCommands(input);

    expect(result.authoredText).toBe(input);
    expect(result.commands).toEqual([
      { type: 'mode', mode: 'care' },
      { type: 'lens', lens: 'jungian' },
    ]);
    expect(result.conversationalText).toBe('I feel stuck.');
    expect(result.onlyCommands).toBe(false);
    expect(result.commandSpans).toHaveLength(2);
  });

  it('does not execute a command-shaped phrase appearing later in ordinary speech', () => {
    const input = 'I have been wondering whether to use the Jungian lens.';
    const result = detectMaiaCommands(input);

    expect(result.disposition).toBe('DO_NOT_EXECUTE');
    expect(result.commands).toEqual([]);
    expect(result.authoredText).toBe(input);
    expect(result.conversationalText).toBe(input);
  });
});
