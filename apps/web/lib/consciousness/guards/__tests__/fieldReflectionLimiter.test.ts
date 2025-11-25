/**
 * Field Reflection Limiter Tests
 *
 * Ensures rate limiting prevents stacking meta-reflections
 */

import {
  FieldReflectionLimiter,
  isFieldReflection,
  stripReflection,
  applyReflectionRateLimit
} from '../fieldReflectionLimiter';

describe('Field Reflection Rate Limiter', () => {
  describe('FieldReflectionLimiter', () => {
    it('allows first reflection immediately', () => {
      const limiter = new FieldReflectionLimiter();
      expect(limiter.canReflect(0)).toBe(true);
    });

    it('blocks second reflection within window', () => {
      const limiter = new FieldReflectionLimiter();
      limiter.markReflected(0);
      expect(limiter.canReflect(30_000)).toBe(false); // 30s later
      expect(limiter.canReflect(59_999)).toBe(false); // Just before window
    });

    it('allows reflection after window expires', () => {
      const limiter = new FieldReflectionLimiter();
      limiter.markReflected(0);
      expect(limiter.canReflect(60_000)).toBe(true); // Exactly 60s
      expect(limiter.canReflect(60_001)).toBe(true); // Just after 60s
    });

    it('tracks multiple reflections correctly', () => {
      const limiter = new FieldReflectionLimiter();

      limiter.markReflected(0);
      expect(limiter.canReflect(0)).toBe(false);

      expect(limiter.canReflect(60_001)).toBe(true);
      limiter.markReflected(60_001);

      expect(limiter.canReflect(90_000)).toBe(false); // 30s after second
      expect(limiter.canReflect(120_002)).toBe(true); // 60s after second
    });

    it('calculates time until next reflection', () => {
      const limiter = new FieldReflectionLimiter();
      limiter.markReflected(0);

      expect(limiter.timeUntilNextReflection(0)).toBe(60_000);
      expect(limiter.timeUntilNextReflection(30_000)).toBe(30_000);
      expect(limiter.timeUntilNextReflection(59_000)).toBe(1_000);
      expect(limiter.timeUntilNextReflection(60_000)).toBe(0);
      expect(limiter.timeUntilNextReflection(70_000)).toBe(0);
    });

    it('preserves and restores state', () => {
      const limiter1 = new FieldReflectionLimiter();
      limiter1.markReflected(1000);

      const state = limiter1.getState();
      expect(state.lastReflectionAt).toBe(1000);

      const limiter2 = new FieldReflectionLimiter(state);
      expect(limiter2.canReflect(30_000)).toBe(false);
      expect(limiter2.canReflect(61_001)).toBe(true);
    });
  });

  describe('isFieldReflection', () => {
    it('detects "field feels" reflection', () => {
      expect(isFieldReflection('The field feels steadier now.')).toBe(true);
      expect(isFieldReflection('The field feels different.')).toBe(true);
    });

    it('detects rhythm reflection', () => {
      expect(isFieldReflection('I notice the rhythm shifted.')).toBe(true);
      expect(isFieldReflection('Our rhythm feels aligned.')).toBe(true);
    });

    it('detects coherence reflection', () => {
      expect(isFieldReflection('There\'s more coherence between us.')).toBe(true);
    });

    it('detects pause reflection', () => {
      expect(isFieldReflection('That pause felt alive.')).toBe(true);
      expect(isFieldReflection('The pause speaks volumes.')).toBe(true);
    });

    it('detects space/pace reflections', () => {
      expect(isFieldReflection('The space feels more open.')).toBe(true);
      expect(isFieldReflection('The pace quickened.')).toBe(true);
      expect(isFieldReflection('Something shifted in the space between us.')).toBe(true);
    });

    it('does not detect non-reflections', () => {
      expect(isFieldReflection('Tell me more about that.')).toBe(false);
      expect(isFieldReflection('What happened next?')).toBe(false);
      expect(isFieldReflection('I\'m listening.')).toBe(false);
      expect(isFieldReflection('That sounds difficult.')).toBe(false);
    });
  });

  describe('stripReflection', () => {
    it('removes reflection sentence, keeps content', () => {
      const input = 'That\'s interesting. The field feels steadier now.';
      const output = stripReflection(input);
      expect(output).toBe('That\'s interesting.');
    });

    it('keeps first sentence when all are reflections', () => {
      const input = 'The field feels steady. The rhythm is aligned.';
      const output = stripReflection(input);
      expect(output).toBe('The field feels steady.');
    });

    it('handles single sentence reflection', () => {
      const input = 'The field feels steadier now.';
      const output = stripReflection(input);
      expect(output).toBe('The field feels steadier now.');
    });

    it('preserves non-reflection text', () => {
      const input = 'Tell me more. What happened?';
      const output = stripReflection(input);
      expect(output).toBe('Tell me more.');
    });
  });

  describe('applyReflectionRateLimit', () => {
    it('allows first reflection', () => {
      const limiter = new FieldReflectionLimiter();
      const input = 'That sounds hard. The field feels tense.';
      const output = applyReflectionRateLimit(input, limiter, 0);

      expect(output).toBe(input);
      expect(limiter.canReflect(0)).toBe(false); // Marked as reflected
    });

    it('blocks second reflection within window', () => {
      const limiter = new FieldReflectionLimiter();
      limiter.markReflected(0);

      const input = 'I understand. The rhythm shifted.';
      const output = applyReflectionRateLimit(input, limiter, 30_000);

      expect(output).toBe('I understand.');
      expect(output).not.toContain('rhythm');
    });

    it('allows reflection after window', () => {
      const limiter = new FieldReflectionLimiter();
      limiter.markReflected(0);

      const input = 'That makes sense. The field feels clearer.';
      const output = applyReflectionRateLimit(input, limiter, 60_001);

      expect(output).toBe(input);
    });

    it('passes through non-reflections unchanged', () => {
      const limiter = new FieldReflectionLimiter();
      limiter.markReflected(0);

      const input = 'Tell me more about that.';
      const output = applyReflectionRateLimit(input, limiter, 10_000);

      expect(output).toBe(input);
    });

    it('handles complex reflection patterns', () => {
      const limiter = new FieldReflectionLimiter();
      limiter.markReflected(0);

      const testCases = [
        {
          input: 'Interesting. I notice the pace quickened.',
          expected: 'Interesting.'
        },
        {
          input: 'That resonates. Something shifted in the space between us.',
          expected: 'That resonates.'
        },
        {
          input: 'Mm-hmm. The pause felt alive.',
          expected: 'Mm-hmm.'
        }
      ];

      testCases.forEach(({ input, expected }) => {
        const output = applyReflectionRateLimit(input, limiter, 30_000);
        expect(output).toBe(expected);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty state initialization', () => {
      const limiter = new FieldReflectionLimiter();
      expect(limiter.canReflect()).toBe(true);
      expect(limiter.timeUntilNextReflection()).toBe(0);
    });

    it('handles undefined state', () => {
      const limiter = new FieldReflectionLimiter(undefined);
      expect(limiter.canReflect()).toBe(true);
    });

    it('handles text without periods', () => {
      const input = 'The field feels steady';
      const output = stripReflection(input);
      expect(output).toBe(input);
    });

    it('handles multiple reflection patterns in one sentence', () => {
      const input = 'The field rhythm feels more coherent.';
      expect(isFieldReflection(input)).toBe(true);
    });
  });

  describe('Integration Scenario', () => {
    it('simulates conversation with rate limiting', () => {
      const limiter = new FieldReflectionLimiter();
      let now = 0;

      // Turn 1: User shares, MAIA reflects
      const response1 = 'That sounds difficult. The field feels tense.';
      const output1 = applyReflectionRateLimit(response1, limiter, now);
      expect(output1).toContain('field feels'); // Allowed
      now += 30_000; // 30s later

      // Turn 2: User shares more, MAIA tries to reflect again
      const response2 = 'I hear you. The rhythm shifted.';
      const output2 = applyReflectionRateLimit(response2, limiter, now);
      expect(output2).toBe('I hear you.'); // Blocked
      now += 35_000; // 35s more (65s total from first)

      // Turn 3: Window expired, reflection allowed again
      const response3 = 'That makes sense. The space feels more open.';
      const output3 = applyReflectionRateLimit(response3, limiter, now);
      expect(output3).toContain('space feels'); // Allowed
    });
  });
});
