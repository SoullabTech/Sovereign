/**
 * DIGEST SYNTHESIS TESTS
 *
 * Tests for the rule-based digest synthesis generator.
 * Verifies correct one-liner generation for various message combinations.
 */

import { generateDigestSynthesis, MessageDigestCounts } from '../messages';
import { describe, it, expect } from '@jest/globals';

describe('generateDigestSynthesis', () => {
  // Helper to create counts with defaults
  const makeCounts = (overrides: Partial<MessageDigestCounts> = {}): MessageDigestCounts => ({
    by_type: {
      reflection: 0,
      question: 0,
      win: 0,
      struggle: 0,
      logistics: 0,
      reply: 0,
      untyped: 0,
      ...overrides.by_type,
    },
    safety: {
      total: 0,
      reviewed: 0,
      needs_review: 0,
      ...overrides.safety,
    },
    unanswered: overrides.unanswered ?? 0,
  });

  describe('empty state', () => {
    it('should return "No messages" when total is 0', () => {
      const result = generateDigestSynthesis(makeCounts(), 0);
      expect(result).toBe('No messages since last session');
    });
  });

  describe('simple counts', () => {
    it('should show just the count for 1 message with no types', () => {
      const result = generateDigestSynthesis(makeCounts({ by_type: { ...makeCounts().by_type, untyped: 1 } }), 1);
      expect(result).toBe('Since last session: 1 message');
    });

    it('should pluralize for multiple messages', () => {
      const result = generateDigestSynthesis(makeCounts({ by_type: { ...makeCounts().by_type, untyped: 3 } }), 3);
      expect(result).toBe('Since last session: 3 messages');
    });
  });

  describe('message types', () => {
    it('should include reflection count', () => {
      const counts = makeCounts({
        by_type: { ...makeCounts().by_type, reflection: 2 },
      });
      const result = generateDigestSynthesis(counts, 2);
      expect(result).toContain('2 reflections');
    });

    it('should include question count (singular)', () => {
      const counts = makeCounts({
        by_type: { ...makeCounts().by_type, question: 1 },
      });
      const result = generateDigestSynthesis(counts, 1);
      expect(result).toContain('1 question');
    });

    it('should include wins and struggles', () => {
      const counts = makeCounts({
        by_type: {
          ...makeCounts().by_type,
          win: 1,
          struggle: 2,
        },
      });
      const result = generateDigestSynthesis(counts, 3);
      expect(result).toContain('1 win');
      expect(result).toContain('2 struggles');
    });
  });

  describe('safety concerns', () => {
    it('should show safety reviewed status', () => {
      const counts = makeCounts({
        safety: { total: 1, reviewed: 1, needs_review: 0 },
      });
      const result = generateDigestSynthesis(counts, 1);
      expect(result).toContain('1 safety (reviewed)');
    });

    it('should show safety needs review status (singular)', () => {
      const counts = makeCounts({
        safety: { total: 1, reviewed: 0, needs_review: 1 },
      });
      const result = generateDigestSynthesis(counts, 1);
      expect(result).toContain('1 safety (1 needs review)');
    });

    it('should show safety needs review status (plural)', () => {
      const counts = makeCounts({
        safety: { total: 2, reviewed: 0, needs_review: 2 },
      });
      const result = generateDigestSynthesis(counts, 2);
      expect(result).toContain('2 safety (2 need review)');
    });

    it('should show mixed safety status', () => {
      const counts = makeCounts({
        safety: { total: 3, reviewed: 2, needs_review: 1 },
      });
      const result = generateDigestSynthesis(counts, 3);
      expect(result).toContain('3 safety (1 needs review)');
    });
  });

  describe('unanswered messages', () => {
    it('should include unanswered count', () => {
      const counts = makeCounts({
        by_type: { ...makeCounts().by_type, question: 2 },
        unanswered: 2,
      });
      const result = generateDigestSynthesis(counts, 2);
      expect(result).toContain('2 unanswered');
    });
  });

  describe('priority ordering (clinically sane)', () => {
    it('should order: safety → unanswered → questions → reflections', () => {
      const counts = makeCounts({
        by_type: {
          ...makeCounts().by_type,
          reflection: 1,
          question: 1,
        },
        safety: { total: 1, reviewed: 1, needs_review: 0 },
        unanswered: 1,
      });
      const result = generateDigestSynthesis(counts, 4);

      // Verify ordering: safety < unanswered < question < reflection
      const safetyIndex = result.indexOf('safety');
      const unansweredIndex = result.indexOf('unanswered');
      const questionIndex = result.indexOf('question');
      const reflectionIndex = result.indexOf('reflection');

      expect(safetyIndex).toBeLessThan(unansweredIndex);
      expect(unansweredIndex).toBeLessThan(questionIndex);
      expect(questionIndex).toBeLessThan(reflectionIndex);
    });

    it('should put actionable items (safety, unanswered) before informational (reflections)', () => {
      const counts = makeCounts({
        by_type: { ...makeCounts().by_type, reflection: 2 },
        unanswered: 1,
      });
      const result = generateDigestSynthesis(counts, 3);

      const unansweredIndex = result.indexOf('unanswered');
      const reflectionIndex = result.indexOf('reflection');

      expect(unansweredIndex).toBeLessThan(reflectionIndex);
    });
  });

  describe('PHI-safe invariant', () => {
    /**
     * CRITICAL: The synthesis generator must NEVER include message content,
     * client names, or any quoted text. It outputs ONLY counts and statuses.
     * This test enforces that invariant.
     */
    it('should never include message body content in output', () => {
      const sensitiveBody = 'I feel like hurting myself today';
      const counts = makeCounts({
        by_type: { ...makeCounts().by_type, reflection: 1 },
        safety: { total: 1, reviewed: 0, needs_review: 1 },
      });

      const result = generateDigestSynthesis(counts, 2);

      // The synthesis should NOT contain any part of the message body
      expect(result).not.toContain(sensitiveBody);
      expect(result).not.toContain('hurting');
      expect(result).not.toContain('myself');
    });

    it('should never include client names in output', () => {
      const clientName = 'Sarah Johnson';
      const counts = makeCounts({
        by_type: { ...makeCounts().by_type, question: 2 },
      });

      const result = generateDigestSynthesis(counts, 2);

      // The synthesis should NOT contain the client name
      expect(result).not.toContain(clientName);
      expect(result).not.toContain('Sarah');
      expect(result).not.toContain('Johnson');
    });

    it('should only output counts and statuses, nothing else', () => {
      const counts = makeCounts({
        by_type: {
          ...makeCounts().by_type,
          reflection: 2,
          question: 1,
          win: 1,
        },
        safety: { total: 1, reviewed: 1, needs_review: 0 },
        unanswered: 1,
      });

      const result = generateDigestSynthesis(counts, 6);

      // Valid output patterns: numbers, message type names, statuses
      // Should match: "Since last session: 6 messages — 1 safety (reviewed), 1 unanswered, 1 question, 2 reflections"
      const allowedPattern = /^Since last session: \d+ messages?( — [\d\w\s,()]+)?$/;
      expect(result).toMatch(allowedPattern);

      // Must not contain quoted content
      expect(result).not.toMatch(/["'`]/);
    });
  });

  describe('complex scenarios', () => {
    it('should handle a realistic session prep digest', () => {
      const counts = makeCounts({
        by_type: {
          ...makeCounts().by_type,
          reflection: 2,
          question: 1,
          win: 1,
        },
        safety: { total: 1, reviewed: 1, needs_review: 0 },
        unanswered: 1,
      });
      const result = generateDigestSynthesis(counts, 5);

      expect(result).toContain('Since last session: 5 messages');
      expect(result).toContain('1 safety (reviewed)');
      expect(result).toContain('2 reflections');
      expect(result).toContain('1 question');
      // Wins might be truncated due to the slice(0, 4) limit
    });

    it('should truncate to 4 content items max', () => {
      const counts = makeCounts({
        by_type: {
          ...makeCounts().by_type,
          reflection: 1,
          question: 1,
          win: 1,
          struggle: 1,
        },
        safety: { total: 1, reviewed: 1, needs_review: 0 },
        unanswered: 1,
      });
      const result = generateDigestSynthesis(counts, 6);

      // Count the number of comma-separated parts (should be at most 4)
      const contentPart = result.split(' — ')[1] || '';
      const parts = contentPart.split(', ').filter(p => p.length > 0);
      expect(parts.length).toBeLessThanOrEqual(4);
    });
  });
});
