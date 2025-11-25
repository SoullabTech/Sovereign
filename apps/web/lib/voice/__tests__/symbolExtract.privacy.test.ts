// lib/voice/__tests__/symbolExtract.privacy.test.ts
// Golden tests for privacy boundary - no PII shall pass

import { symbolExtractor } from '../symbolExtract';
import { assertSymbolSafe, sanitizeUtterance } from '../guardrails';
import { PersonalUtterance } from '../types';

describe('Symbol Extraction Privacy Boundary', () => {
  const createUtterance = (text: string): PersonalUtterance => ({
    id: 'test-utt-001',
    userId: 'test-user',
    ts: Date.now(),
    mode: 'conversation',
    text,
    elementBlend: { water: 0.5, earth: 0.5 },
    intents: ['general'],
    silenceMsBefore: 1000
  });

  describe('PII Filtering', () => {
    test('should not leak phone numbers', () => {
      const utterance = createUtterance('My phone number is 415-555-1234, please call me');
      const symbolic = symbolExtractor.toSymbolic(utterance);

      const json = JSON.stringify(symbolic);
      expect(json).not.toContain('415');
      expect(json).not.toContain('555');
      expect(json).not.toContain('1234');

      assertSymbolSafe(symbolic); // Should pass
    });

    test('should not leak email addresses', () => {
      const utterance = createUtterance('Email me at john.doe@example.com about this');
      const symbolic = symbolExtractor.toSymbolic(utterance);

      const json = JSON.stringify(symbolic);
      expect(json).not.toContain('john');
      expect(json).not.toContain('doe');
      expect(json).not.toContain('@');
      expect(json).not.toContain('example.com');

      assertSymbolSafe(symbolic);
    });

    test('should not leak SSN-like patterns', () => {
      const utterance = createUtterance('My social is 123-45-6789, I need help');
      const symbolic = symbolExtractor.toSymbolic(utterance);

      const json = JSON.stringify(symbolic);
      expect(json).not.toContain('123');
      expect(json).not.toContain('45');
      expect(json).not.toContain('6789');
      expect(json).not.toContain('social');

      assertSymbolSafe(symbolic);
    });

    test('should not leak personal names', () => {
      const utterance = createUtterance('My name is Jennifer Smith and I am feeling lost');
      const symbolic = symbolExtractor.toSymbolic(utterance);

      const json = JSON.stringify(symbolic);
      expect(json).not.toContain('Jennifer');
      expect(json).not.toContain('Smith');

      assertSymbolSafe(symbolic);
    });

    test('should not leak addresses', () => {
      const utterance = createUtterance('I live at 123 Main Street, apartment 4B');
      const symbolic = symbolExtractor.toSymbolic(utterance);

      const json = JSON.stringify(symbolic);
      expect(json).not.toContain('123');
      expect(json).not.toContain('Main');
      expect(json).not.toContain('Street');
      expect(json).not.toContain('4B');

      assertSymbolSafe(symbolic);
    });

    test('should not leak credit card numbers', () => {
      const utterance = createUtterance('My visa is 4111-1111-1111-1111, charge failed');
      const symbolic = symbolExtractor.toSymbolic(utterance);

      const json = JSON.stringify(symbolic);
      expect(json).not.toContain('4111');
      expect(json).not.toContain('visa');

      assertSymbolSafe(symbolic);
    });
  });

  describe('Edge Phrase Handling', () => {
    test('should handle "my social is..." safely', () => {
      const utterance = createUtterance('My social is really overwhelming right now');
      const symbolic = symbolExtractor.toSymbolic(utterance);

      // Should still extract emotional content
      expect(symbolic.motifs).toEqual(expect.arrayContaining([])); // No direct motif match
      expect(symbolic.affect.valence).toBeLessThanOrEqual(0);

      assertSymbolSafe(symbolic);
    });

    test('should handle "call me at..." safely', () => {
      const utterance = createUtterance('Call me at my lowest point, I need guidance');
      const symbolic = symbolExtractor.toSymbolic(utterance);

      // Should extract the need for guidance
      expect(symbolic.motifs).toContain('ground');

      assertSymbolSafe(symbolic);
    });

    test('should handle medical information safely', () => {
      const utterance = createUtterance('My diagnosis is depression and anxiety disorder');
      const symbolic = symbolExtractor.toSymbolic(utterance);

      const json = JSON.stringify(symbolic);
      expect(json).not.toContain('diagnosis');
      expect(json).not.toContain('depression');
      expect(json).not.toContain('anxiety');

      assertSymbolSafe(symbolic);
    });
  });

  describe('Controlled Vocabulary', () => {
    test('should only extract allowed motifs', () => {
      const utterance = createUtterance('I am transforming through this threshold of grief and release');
      const symbolic = symbolExtractor.toSymbolic(utterance);

      // Should contain only controlled vocab
      expect(symbolic.motifs).toContain('transform');
      expect(symbolic.motifs).toContain('threshold');
      expect(symbolic.motifs).toContain('grief');
      expect(symbolic.motifs).toContain('release');

      // Should not contain raw words
      expect(symbolic.motifs).not.toContain('through');
      expect(symbolic.motifs).not.toContain('this');
    });

    test('should limit motif count', () => {
      const utterance = createUtterance(
        'I question and transform and release and spiral and return and ' +
        'integrate and witness and hold and explore and celebrate'
      );
      const symbolic = symbolExtractor.toSymbolic(utterance);

      // Should be limited to 5 motifs
      expect(symbolic.motifs.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Fuzzing Tests', () => {
    const generatePII = () => {
      const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Michael', 'Sarah'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
      const streets = ['Main', 'Oak', 'Elm', 'Park', 'First'];

      const templates = [
        () => `My phone is ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        () => `Email me at ${firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase()}@example.com`,
        () => `I am ${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        () => `I live at ${Math.floor(Math.random() * 9999)} ${streets[Math.floor(Math.random() * streets.length)]} Street`,
        () => `My SSN is ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`,
      ];

      return templates[Math.floor(Math.random() * templates.length)]();
    };

    test('should handle 1000 utterances with PII patterns without leaking', () => {
      for (let i = 0; i < 1000; i++) {
        const piiText = generatePII();
        const utterance = createUtterance(piiText);
        const symbolic = symbolExtractor.toSymbolic(utterance);

        // Should not throw
        expect(() => assertSymbolSafe(symbolic)).not.toThrow();

        // Verify no raw PII
        const json = JSON.stringify(symbolic).toLowerCase();

        // No phone pattern
        expect(json).not.toMatch(/\d{3}[-.]?\d{3}[-.]?\d{4}/);

        // No email pattern
        expect(json).not.toMatch(/[a-z]+@[a-z]+\.[a-z]+/);

        // No SSN pattern
        expect(json).not.toMatch(/\d{3}-\d{2}-\d{4}/);
      }
    });
  });

  describe('Sanitization Helper', () => {
    test('should sanitize various PII patterns', () => {
      const dirty = 'Call me at 415-555-1234 or email john@example.com. My SSN is 123-45-6789.';
      const clean = sanitizeUtterance(dirty);

      expect(clean).toBe('Call me at [PHONE] or email [EMAIL]. My SSN is [ID].');
    });

    test('should sanitize personal introductions', () => {
      const dirty = 'My name is Alice Cooper and I live at 123 Main Street';
      const clean = sanitizeUtterance(dirty);

      expect(clean).toContain('[NAME]');
      expect(clean).toContain('[ADDRESS]');
      expect(clean).not.toContain('Alice');
      expect(clean).not.toContain('Cooper');
    });
  });

  describe('Snapshot Guard', () => {
    const knownGoodOutputs = [
      {
        input: 'I am feeling transformative energy today',
        expectedMotifs: ['transform'],
        expectedElements: expect.arrayContaining([
          expect.objectContaining({ name: 'fire' })
        ])
      },
      {
        input: 'Questioning everything and spiraling back',
        expectedMotifs: ['question', 'spiral'],
        expectedElements: expect.anything()
      }
    ];

    test('should match known good outputs (regression guard)', () => {
      for (const testCase of knownGoodOutputs) {
        const utterance = createUtterance(testCase.input);
        const symbolic = symbolExtractor.toSymbolic(utterance);

        expect(symbolic.motifs).toEqual(testCase.expectedMotifs);
        expect(symbolic.elements).toEqual(testCase.expectedElements);
      }
    });
  });
});

describe('Collective Floor Tests', () => {
  test('should suppress low-confidence insights', () => {
    const { floorCollective } = require('../guardrails');

    const weakSnapshot = {
      teamId: 'test-team',
      window: { from: Date.now() - 30000, to: Date.now() },
      topMotifs: [{ key: 'transform', count: 2 }],
      elements: [{ name: 'fire' as const, avg: 0.3 }],
      trustBreath: { in: 1, out: 1, hold: 0 },
      resonanceField: {
        coherence: 0.3,
        emergence: false,
        tension: undefined
      },
      _meta: { sessionCount: 3 }
    };

    const result = floorCollective(weakSnapshot, { minSessions: 5, minConfidence: 0.6 });
    expect(result).toBeNull(); // Should suppress
  });

  test('should allow high-confidence insights', () => {
    const { floorCollective } = require('../guardrails');

    const strongSnapshot = {
      teamId: 'test-team',
      window: { from: Date.now() - 30000, to: Date.now() },
      topMotifs: [{ key: 'transform', count: 8 }],
      elements: [{ name: 'fire' as const, avg: 0.8 }],
      trustBreath: { in: 5, out: 2, hold: 1 },
      resonanceField: {
        coherence: 0.75,
        emergence: true,
        tension: undefined
      },
      _meta: { sessionCount: 8 }
    };

    const result = floorCollective(strongSnapshot, { minSessions: 5, minConfidence: 0.6 });
    expect(result).toBe(strongSnapshot); // Should pass through
  });
});