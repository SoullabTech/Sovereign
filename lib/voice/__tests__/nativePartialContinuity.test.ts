/**
 * @jest-environment node
 *
 * IOS-VOICE-TRANSCRIPT-RESET-01. iOS can restart its cumulative partial mid-speech
 * with no listeningState stop. The member's earlier words must survive that restart.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { mergeNativePartial } from '../nativePartialContinuity';

type TurnState = { heldPrefix: string; accumulated: string };

function feed(partials: string[], start: TurnState = { heldPrefix: '', accumulated: '' }) {
  let state = start;
  let resets = 0;
  for (const incoming of partials) {
    const merged = mergeNativePartial({ ...state, incoming });
    state = { heldPrefix: merged.heldPrefix, accumulated: merged.accumulated };
    if (merged.segmentReset) resets += 1;
  }
  return { ...state, resets };
}

describe('mergeNativePartial', () => {
  it('keeps every segment when iOS restarts the partial three times in one turn', () => {
    const first = 'I have been thinking about the move and what it means for my family';
    const second = 'and honestly I do not know whether staying would be any easier';
    const third = 'so I wanted to talk it through with you';

    const result = feed([first, 'so', 'so honestly', second, 'so', third, 'so']);

    expect(result.accumulated).toContain(first);
    expect(result.accumulated).toContain(second);
    expect(result.accumulated).toContain(third);
    expect(result.resets).toBe(3);
  });

  it('preserves earlier speech even when the new segment starts with the same word', () => {
    const first = 'I went to the store this morning and saw an old friend';
    const result = feed([first, 'I']);

    expect(result.accumulated).toBe(`${first} I`);
    expect(result.resets).toBe(1);
  });

  it('treats a growing cumulative partial as one segment', () => {
    const result = feed(['I went', 'I went to the', 'I went to the store today']);

    expect(result.accumulated).toBe('I went to the store today');
    expect(result.heldPrefix).toBe('');
    expect(result.resets).toBe(0);
  });

  it('lets the recognizer revise its own words without duplicating them', () => {
    const before = 'we could meet there around four in the afternoon maybe';
    const revised = 'we could meet them around four in the afternoon';
    const result = feed([before, revised]);

    expect(result.accumulated).toBe(revised);
    expect(result.resets).toBe(0);
  });

  it('does not treat a short opening phrase changing as a restart', () => {
    const result = feed(['Hello there', 'Hello']);

    expect(result.accumulated).toBe('Hello');
    expect(result.resets).toBe(0);
  });

  it('continues a turn already held across a native stop without repeating it', () => {
    const held = 'this is everything I said before the recognizer stopped';
    const result = feed(['and', 'and then'], { heldPrefix: held, accumulated: held });

    expect(result.accumulated).toBe(`${held} and then`);
    expect(result.heldPrefix).toBe(held);
    expect(result.resets).toBe(0);
  });

  it('carries a held prefix through a later restart', () => {
    const held = 'this is what was held across the native stop';
    const segment = 'and this is the next long thought that I was saying';
    const result = feed([segment, 'then'], { heldPrefix: held, accumulated: held });

    expect(result.accumulated).toBe(`${held} ${segment} then`);
    expect(result.resets).toBe(1);
  });

  it('starts clean after a committed turn cleared the transcript', () => {
    const result = feed(['a brand new turn'], { heldPrefix: '', accumulated: '' });

    expect(result.accumulated).toBe('a brand new turn');
    expect(result.resets).toBe(0);
  });

  it('never carries words from a cleared turn into the next turn', () => {
    const result = feed(['a brand new turn'], {
      heldPrefix: 'words from a turn that was already cleared',
      accumulated: '',
    });

    expect(result.accumulated).toBe('a brand new turn');
    expect(result.heldPrefix).toBe('');
  });

  it('keeps the turn when the recognizer reports an empty partial', () => {
    const turn = 'everything the member has said so far in this turn';
    const result = feed([turn, '   ']);

    expect(result.accumulated).toBe(turn);
    expect(result.resets).toBe(0);
  });
});

describe('native partial listener', () => {
  const source = readFileSync(
    join(process.cwd(), 'components/voice/ContinuousConversation.tsx'),
    'utf8',
  );

  it('merges partials instead of overwriting the turn', () => {
    expect(source).toContain('mergeNativePartial({');
    expect(source).not.toContain(
      'accumulatedTranscript.current = heldPrefix ? `${heldPrefix} ${transcript}`.trim() : transcript;',
    );
  });

  it('reports a preserved restart with lengths only', () => {
    const start = source.indexOf("logVoiceEvent('ios_voice_segment_reset_preserved'");
    expect(start).toBeGreaterThan(-1);
    const call = source.slice(start, source.indexOf('});', start));
    expect(call).toContain('previousSegmentLength');
    expect(call).toContain('incomingLength');
    expect(call).not.toMatch(/\btranscript\s*[,:]/);
  });
});
