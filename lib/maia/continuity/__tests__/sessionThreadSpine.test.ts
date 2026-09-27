import {
  buildSessionThreadSpine,
  continuityExcerpt,
  formatSessionThreadSpine,
} from '../sessionThreadSpine';
import type { DisplacedExchange } from '../sessionRecovery';

const ex = (index: number, userMessage: string, maiaResponse: string): DisplacedExchange => ({
  exchangeKey: `e${index}`,
  index,
  timestamp: new Date(2026, 0, index + 1).toISOString(),
  userMessage,
  maiaResponse,
});

const session = [
  ex(0, 'I want to understand what happened with Karen and stay close to what matters.', 'We can keep that relationship as the center of the conversation.'),
  ex(1, 'I keep thinking about the hospital room.', 'There is a lot held in that image.'),
  ex(2, 'The word rootedness keeps coming back.', 'Rootedness may be a useful thread to keep in view.'),
  ex(3, 'I am also thinking about work tomorrow.', 'We can hold that without losing the larger thread.'),
  ex(4, 'I feel tired tonight.', 'Then we do not need to force anything.'),
  ex(5, 'What should I do next?', 'Stay close to what is actually here.'),
];

describe('LONG-SESSION-CONTINUITY-01 thread spine', () => {
  it('carries opening + bridge while leaving the recent aperture untouched', () => {
    const spine = buildSessionThreadSpine({
      utterance: 'I feel a little lost in the conversation now',
      allSessionExchanges: session,
      apertureCount: 2,
    });
    expect(spine.map((a) => [a.index, a.kind])).toEqual([
      [0, 'opening'],
      [3, 'bridge'],
    ]);
  });

  it('adds one relevant middle anchor without requiring remember-language', () => {
    const spine = buildSessionThreadSpine({
      utterance: 'The rootedness part still feels important',
      allSessionExchanges: session,
      apertureCount: 2,
    });
    expect(spine.some((a) => a.index === 2 && a.kind === 'relevant')).toBe(true);
  });

  it('carries one earlier continuity anchor when a theme survives into the recent aperture', () => {
    const longSession = [
      ex(0, 'I want to stay with the question of belonging.', 'We can keep belonging as an orienting thread.'),
      ex(1, 'Work has been chaotic.', 'There is a lot of movement around work.'),
      ex(2, 'Belonging feels tied to whether I can be myself.', 'That connects belonging with authenticity.'),
      ex(3, 'I need groceries tomorrow.', 'We can keep that practical detail nearby.'),
      ex(4, 'I am noticing the belonging question again.', 'Then belonging is still alive in the recent thread.'),
      ex(5, 'It feels quieter now.', 'We can stay with the quieter edge of it.'),
    ];

    const spine = buildSessionThreadSpine({
      utterance: 'I am not sure what comes next',
      allSessionExchanges: longSession,
      apertureCount: 2,
    });

    expect(spine.some((a) => a.index === 2 && a.kind === 'continuity')).toBe(true);
  });

  it('keeps a live thread across a sixty-exchange conversation without widening the recent aperture', () => {
    const longSession = Array.from({ length: 60 }, (_, index) =>
      ex(
        index,
        index === 10
          ? 'The ceremony question is really about belonging and whether I can stay present.'
          : index === 58
            ? 'I keep coming back to ceremony and belonging.'
            : `Ordinary exchange ${index} about the day.`,
        index === 10
          ? 'We can keep ceremony, belonging, and presence as one connected thread.'
          : index === 58
            ? 'That thread is still active here.'
            : `Response ${index} stays with the immediate exchange.`,
      ),
    );

    const spine = buildSessionThreadSpine({
      utterance: 'I want to stay with this a little longer',
      allSessionExchanges: longSession,
      apertureCount: 5,
    });

    expect(spine.some((a) => a.index === 10 && a.kind === 'continuity')).toBe(true);
    expect(spine.some((a) => a.index === 0 && a.kind === 'opening')).toBe(true);
    expect(spine.some((a) => a.index === 54 && a.kind === 'bridge')).toBe(true);
    expect(spine.length).toBeLessThanOrEqual(4);
  });

  it('never duplicates an exchange already recovered by explicit recall', () => {
    const spine = buildSessionThreadSpine({
      utterance: 'rootedness',
      allSessionExchanges: session,
      apertureCount: 2,
      excludeKeys: new Set(['e2']),
    });
    expect(spine.some((a) => a.exchangeKey === 'e2')).toBe(false);
  });

  it('preserves both the beginning and ending of long recent replies', () => {
    const long = `BEGIN-${'x'.repeat(700)}-END`;
    const out = continuityExcerpt(long, 120);
    expect(out.startsWith('BEGIN-')).toBe(true);
    expect(out.endsWith('-END')).toBe(true);
    expect(out).toContain(' … ');
  });

  it('frames the spine as current-session primary record, not inferred memory', () => {
    const spine = buildSessionThreadSpine({
      utterance: 'rootedness',
      allSessionExchanges: session,
      apertureCount: 2,
    });
    const block = formatSessionThreadSpine(spine);
    expect(block).toContain('CURRENT-SESSION THREAD SPINE');
    expect(block).toContain('verbatim excerpts from this conversation');
    expect(block).toContain("The member's current words and the most recent exchanges outrank earlier material");
  });
});
