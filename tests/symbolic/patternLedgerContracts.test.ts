/**
 * PATTERN LEDGER CONTRACTS TESTS — Phase 13
 *
 * Covers:
 *   1. detectPatternClaimTypes — pattern-specific claim detection
 *   2. containsStrongWording — strong assertion detection
 *   3. validatePatternClaim — all validation rules
 *      a. identity claims always blocked
 *      b. relative time always blocked
 *      c. strong wording blocked unless high confidence
 *      d. causation needs ≥3 fragments across ≥2 timestamps
 *      e. recurring pattern needs recurrence count ≥ 2
 *      f. relational claims need relational-tagged evidence
 *      g. clean text passes without backing
 *   4. buildPatternLedgerAuthoritySummary — health metrics
 */

import {
  detectPatternClaimTypes,
  containsStrongWording,
  validatePatternClaim,
  buildPatternLedgerAuthoritySummary,
  PATTERN_LEDGER_GUARDRAILS,
} from '@/lib/symbolic/patternLedgerContracts';

import type {
  PatternLedgerPayload,
  PatternEvidenceFragment,
  PatternCandidate,
  PatternInterpretation,
} from '@/lib/symbolic/patternLedgerContracts';

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

const singleEvidence: PatternEvidenceFragment[] = [
  { id: 'e1', sourceId: 'j1', text: 'I pulled back again.', timestamp: '2026-01-01' },
];

const threeEvidenceMultiTime: PatternEvidenceFragment[] = [
  { id: 'e1', sourceId: 'j1', text: 'I pulled back again.', timestamp: '2026-01-01' },
  { id: 'e2', sourceId: 'j2', text: 'I retreated when it got close.', timestamp: '2026-01-15' },
  { id: 'e3', sourceId: 'j3', text: 'I went quiet instead of speaking.', timestamp: '2026-02-01' },
];

const threeEvidenceSameTime: PatternEvidenceFragment[] = [
  { id: 'e1', sourceId: 'j1', text: 'Pulled back.', timestamp: '2026-01-01' },
  { id: 'e2', sourceId: 'j2', text: 'Retreated.', timestamp: '2026-01-01' },
  { id: 'e3', sourceId: 'j3', text: 'Went quiet.', timestamp: '2026-01-01' },
];

const relationalEvidence: PatternEvidenceFragment[] = [
  { id: 'e1', sourceId: 'j1', text: 'With my partner I held back.', tags: ['relational'] },
  { id: 'e2', sourceId: 'j2', text: 'Same pattern with friends.', tags: ['relational'] },
];

const highConfidenceCandidate: PatternCandidate = {
  id: 'c1',
  label: 'withdrawal under pressure',
  evidenceIds: ['e1', 'e2', 'e3'],
  recurrenceCount: 3,
  confidence: 'high',
  multipleTimestamps: true,
};

const lowConfidenceCandidate: PatternCandidate = {
  id: 'c2',
  label: 'possible withdrawal',
  evidenceIds: ['e1'],
  recurrenceCount: 1,
  confidence: 'low',
  multipleTimestamps: false,
};

const emptyPayload: PatternLedgerPayload = {
  domain: 'pattern_ledger',
  generatedAt: new Date().toISOString(),
  evidence: [],
  candidates: [],
  interpretations: [],
  blockedClaims: [],
  guardrails: PATTERN_LEDGER_GUARDRAILS,
};

function makePayload(
  overrides: Partial<PatternLedgerPayload>
): PatternLedgerPayload {
  return { ...emptyPayload, ...overrides };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. detectPatternClaimTypes
// ─────────────────────────────────────────────────────────────────────────────

describe('detectPatternClaimTypes', () => {
  test('clean text: no claim types', () => {
    expect(detectPatternClaimTypes('Fire energy surfaces here.')).toHaveLength(0);
  });

  test('relative_time: "tomorrow" detected', () => {
    expect(detectPatternClaimTypes('This will resolve tomorrow.')).toContain('relative_time');
  });

  test('relative_time: "yesterday" detected', () => {
    expect(detectPatternClaimTypes('Yesterday this showed up.')).toContain('relative_time');
  });

  test('identity_claim: "you are" detected', () => {
    expect(detectPatternClaimTypes('You are someone who avoids conflict.')).toContain('identity_claim');
  });

  test('identity_claim: "this is who you are" detected', () => {
    expect(detectPatternClaimTypes('This is who you are at your core.')).toContain('identity_claim');
  });

  test('causation_claim: "because" detected', () => {
    expect(detectPatternClaimTypes('Because you fear loss, you withdraw.')).toContain('causation_claim');
  });

  test('causation_claim: "this leads to" detected', () => {
    expect(detectPatternClaimTypes('This tension leads to isolation.')).toContain('causation_claim');
  });

  test('recurring_pattern: "pattern" detected', () => {
    expect(detectPatternClaimTypes('There is a pattern of avoidance here.')).toContain('recurring_pattern');
  });

  test('recurring_pattern: "keeps coming up" detected', () => {
    expect(detectPatternClaimTypes('This keeps coming up across entries.')).toContain('recurring_pattern');
  });

  test('relational_claim: "in your relationships" detected', () => {
    expect(detectPatternClaimTypes('In your relationships, you tend to over-give.')).toContain('relational_claim');
  });

  test('calendar_date: ISO date detected', () => {
    expect(detectPatternClaimTypes('Observed on 2026-01-15.')).toContain('calendar_date');
  });

  test('multiple types in one text', () => {
    const types = detectPatternClaimTypes('You are always withdrawing because of past patterns tomorrow.');
    expect(types).toContain('identity_claim');
    expect(types).toContain('causation_claim');
    expect(types).toContain('recurring_pattern');
    expect(types).toContain('relative_time');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. containsStrongWording
// ─────────────────────────────────────────────────────────────────────────────

describe('containsStrongWording', () => {
  test('"you always" is strong wording', () => {
    expect(containsStrongWording('You always retreat when pressed.')).toBe(true);
  });

  test('"you never" is strong wording', () => {
    expect(containsStrongWording('You never let people in.')).toBe(true);
  });

  test('"core pattern" is strong wording', () => {
    expect(containsStrongWording('This is a core pattern for you.')).toBe(true);
  });

  test('"fundamentally" is strong wording', () => {
    expect(containsStrongWording('You are fundamentally avoidant.')).toBe(true);
  });

  test('mild language is not strong wording', () => {
    expect(containsStrongWording('This may suggest a tendency toward withdrawal.')).toBe(false);
  });

  test('qualified language is not strong wording', () => {
    expect(containsStrongWording('A recurring signal of avoidance appears here.')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3a. validatePatternClaim — identity claims always blocked
// ─────────────────────────────────────────────────────────────────────────────

describe('validatePatternClaim — identity claims', () => {
  test('blocked regardless of evidence count', () => {
    const payload = makePayload({ evidence: threeEvidenceMultiTime, candidates: [highConfidenceCandidate] });
    const result = validatePatternClaim('You are an avoidant person.', ['identity_claim'], payload, 'c1');
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('unsupported_claim_type');
  });

  test('blocked even with high confidence candidate', () => {
    const payload = makePayload({ evidence: threeEvidenceMultiTime, candidates: [highConfidenceCandidate] });
    const result = validatePatternClaim('You are someone who withdraws.', ['identity_claim'], payload, 'c1');
    expect(result.ok).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3b. validatePatternClaim — relative time always blocked
// ─────────────────────────────────────────────────────────────────────────────

describe('validatePatternClaim — relative time', () => {
  test('blocked regardless of evidence', () => {
    const payload = makePayload({ evidence: threeEvidenceMultiTime });
    const result = validatePatternClaim('This resolves tomorrow.', ['relative_time'], payload);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('relative_time_not_allowed');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3c. validatePatternClaim — strong wording needs high confidence
// ─────────────────────────────────────────────────────────────────────────────

describe('validatePatternClaim — strong wording', () => {
  test('blocked when candidate confidence is low', () => {
    const payload = makePayload({ evidence: singleEvidence, candidates: [lowConfidenceCandidate] });
    const result = validatePatternClaim('You always pull back.', [], payload, 'c2');
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('strong_wording_low_confidence');
  });

  test('blocked when no candidate present', () => {
    const payload = makePayload({ evidence: threeEvidenceMultiTime, candidates: [] });
    const result = validatePatternClaim('You always withdraw.', [], payload);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('strong_wording_low_confidence');
  });

  test('passes when candidate confidence is high', () => {
    const payload = makePayload({ evidence: threeEvidenceMultiTime, candidates: [highConfidenceCandidate] });
    const result = validatePatternClaim('You always retreat under pressure.', [], payload, 'c1');
    expect(result.ok).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3d. validatePatternClaim — causation claims
// ─────────────────────────────────────────────────────────────────────────────

describe('validatePatternClaim — causation claims', () => {
  test('blocked with fewer than 3 fragments', () => {
    const payload = makePayload({ evidence: singleEvidence });
    const result = validatePatternClaim('Because you fear loss, you isolate.', ['causation_claim'], payload);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('missing_support');
  });

  test('blocked with 3 fragments but only 1 timestamp', () => {
    const payload = makePayload({ evidence: threeEvidenceSameTime });
    const result = validatePatternClaim('Because of fear, this keeps occurring.', ['causation_claim'], payload);
    expect(result.ok).toBe(false);
    expect(result.details).toMatch(/timestamps/);
  });

  test('passes with 3 fragments across 2+ timestamps', () => {
    const payload = makePayload({ evidence: threeEvidenceMultiTime });
    const result = validatePatternClaim('Because of past loss, withdrawal occurs.', ['causation_claim'], payload);
    expect(result.ok).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3e. validatePatternClaim — recurring pattern claims
// ─────────────────────────────────────────────────────────────────────────────

describe('validatePatternClaim — recurring pattern claims', () => {
  test('blocked when candidate recurrence count is 1', () => {
    const payload = makePayload({ evidence: singleEvidence, candidates: [lowConfidenceCandidate] });
    const result = validatePatternClaim('There is a recurring pattern here.', ['recurring_pattern'], payload, 'c2');
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('weak_recurrence');
  });

  test('blocked when no candidate has recurrence ≥ 2', () => {
    const payload = makePayload({ evidence: singleEvidence, candidates: [lowConfidenceCandidate] });
    const result = validatePatternClaim('A pattern is forming.', ['recurring_pattern'], payload);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('weak_recurrence');
  });

  test('passes when candidate recurrence count is ≥ 2', () => {
    const medCandidate: PatternCandidate = { ...highConfidenceCandidate, recurrenceCount: 2, confidence: 'medium' };
    const payload = makePayload({ evidence: threeEvidenceMultiTime, candidates: [medCandidate] });
    const result = validatePatternClaim('A recurring pattern of withdrawal.', ['recurring_pattern'], payload, medCandidate.id);
    expect(result.ok).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3f. validatePatternClaim — relational claims
// ─────────────────────────────────────────────────────────────────────────────

describe('validatePatternClaim — relational claims', () => {
  test('blocked when no relational-tagged evidence', () => {
    const payload = makePayload({ evidence: singleEvidence }); // no relational tag
    const result = validatePatternClaim('In your relationships, you over-give.', ['relational_claim'], payload);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('missing_support');
  });

  test('passes when relational-tagged evidence is present', () => {
    const payload = makePayload({ evidence: relationalEvidence });
    const result = validatePatternClaim('In your relationships, over-giving appears.', ['relational_claim'], payload);
    expect(result.ok).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3g. validatePatternClaim — clean text always passes
// ─────────────────────────────────────────────────────────────────────────────

describe('validatePatternClaim — clean text', () => {
  test('passes without backing', () => {
    const result = validatePatternClaim('Fire energy surfaces in multiple entries.', [], emptyPayload);
    expect(result.ok).toBe(true);
    expect(result.reason).toBe('source_backed');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. buildPatternLedgerAuthoritySummary
// ─────────────────────────────────────────────────────────────────────────────

describe('buildPatternLedgerAuthoritySummary', () => {
  test('empty payload: all zeros, domain is pattern_ledger', () => {
    const summary = buildPatternLedgerAuthoritySummary(emptyPayload);
    expect(summary.domain).toBe('pattern_ledger');
    expect(summary.totalItems).toBe(0);
    expect(summary.totalEvidence).toBe(0);
    expect(summary.totalCandidates).toBe(0);
    expect(summary.blockedInterpretations).toBe(0);
    expect(summary.guardrailCount).toBe(PATTERN_LEDGER_GUARDRAILS.length);
  });

  test('counts high/low confidence candidates correctly', () => {
    const payload = makePayload({
      evidence: threeEvidenceMultiTime,
      candidates: [highConfidenceCandidate, lowConfidenceCandidate],
    });
    const summary = buildPatternLedgerAuthoritySummary(payload);
    expect(summary.totalCandidates).toBe(2);
    expect(summary.highConfidenceCandidates).toBe(1);
    expect(summary.lowConfidenceCandidates).toBe(1);
  });

  test('counts blocked interpretations correctly', () => {
    const payload = makePayload({
      evidence: threeEvidenceMultiTime,
      interpretations: [
        {
          id: 'i1',
          text: 'A withdrawal pattern is observable.',
          authority: 'derived',
          claimTypes: [],
          supportingIds: ['e1'],
          renderBlocked: false,
          traceId: 'pattern:c1',
          source: 'derived',
        } as PatternInterpretation,
        {
          id: 'i2',
          text: 'You are fundamentally avoidant.',
          authority: 'fallback',
          claimTypes: ['identity_claim'],
          supportingIds: [],
          renderBlocked: true,
          blockReason: 'unsupported_claim_type',
          traceId: 'pattern:c1:blocked',
          source: 'fallback',
        } as PatternInterpretation,
      ],
    });
    const summary = buildPatternLedgerAuthoritySummary(payload);
    expect(summary.totalInterpretations).toBe(2);
    expect(summary.blockedInterpretations).toBe(1);
    expect(summary.derivedItems).toBe(1);
    expect(summary.fallbackItems).toBe(1);
    expect(summary.totalEvidence).toBe(3);
  });
});
