import fs from 'node:fs';
import path from 'node:path';

import { detectMaiaCommands } from '../../../../lib/voice/VoiceCommandDetector';
import { resolveExplicitCapabilityInquiry } from '../../../../lib/maia/explicitCapabilityInquiry';

describe('TII-03 whole-route O8 input integrity', () => {
  const exactAvailabilityFixture = 'Can I use Astrology Reading?';

  it('keeps the exact O8 availability fixture intact through command classification', () => {
    const commandResult = detectMaiaCommands(exactAvailabilityFixture);

    expect(commandResult.authoredText).toBe(exactAvailabilityFixture);
    expect(commandResult.conversationalText).toBe(exactAvailabilityFixture);
    expect(commandResult.commands).toEqual([]);
    expect(commandResult.disposition).toBe('DO_NOT_EXECUTE');

    expect(resolveExplicitCapabilityInquiry(commandResult.authoredText)).toEqual({
      kind: 'ABSTAIN',
      reason: 'AVAILABILITY_SHAPED',
    });
  });

  it('wires the exact authored text into the production serving request', () => {
    const oracle = fs.readFileSync(
      path.resolve(process.cwd(), 'components/OracleConversation.tsx'),
      'utf8',
    );

    expect(oracle).toContain('const authoredText = text;');
    expect(oracle).toContain('message: canonicalMemberText');
    expect(oracle).not.toContain('text = commandCleanedText');
  });
});
