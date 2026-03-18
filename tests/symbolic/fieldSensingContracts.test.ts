/**
 * FIELD SENSING CONTRACTS TESTS — Phase 14
 *
 * Covers:
 *   1. detectFieldClaimTypes — field-specific claim detection
 *   2. isAssertivelyFramed / isPossibilityFramed — framing detection
 *   3. validateFieldInference — all validation rules:
 *      a. intent attribution always blocked
 *      b. relative time always blocked
 *      c. assertive framing on emotional claims blocked
 *      d. emotional attribution needs reported state OR ≥2 signals
 *      e. shift claims need ≥2 timestamps
 *      f. relational inference needs relational evidence
 *      g. low confidence blocked
 *      h. clean inference passes
 *   4. buildFieldSensingAuthoritySummary — health metrics
 */

import {
  detectFieldClaimTypes,
  isAssertivelyFramed,
  isPossibilityFramed,
  validateFieldInference,
  buildFieldSensingAuthoritySummary,
  FIELD_SENSING_GUARDRAILS,
} from '@/lib/symbolic/fieldSensingContracts';

import type {
  FieldSensingPayload,
  FieldReportedState,
  FieldObservedSignal,
  FieldInference,
} from '@/lib/symbolic/fieldSensingContracts';

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

const emptyPayload: FieldSensingPayload = {
  domain: 'field',
  generatedAt: new Date().toISOString(),
  reportedStates: [],
  observedSignals: [],
  inferences: [],
  projectionRisks: [],
  guardrails: FIELD_SENSING_GUARDRAILS,
};

const reportedEmotion: FieldReportedState = {
  id: 'r1',
  kind: 'emotion',
  text: 'I feel anxious and tight in my chest.',
  sourceId: 'msg-001',
  timestamp: '2026-01-15T10:00:00Z',
};

const reportedEmotionLater: FieldReportedState = {
  id: 'r2',
  kind: 'emotion',
  text: 'I feel more settled now.',
  sourceId: 'msg-020',
  timestamp: '2026-01-15T11:30:00Z',
};

const reportedRelational: FieldReportedState = {
  id: 'r3',
  kind: 'relational',
  text: 'With my partner I always end up pulling back.',
  sourceId: 'msg-005',
};

const highConfidenceSignal: FieldObservedSignal = {
  id: 's1',
  kind: 'tone',
  description: 'Tone shifted to shorter, hedged sentences midway through session.',
  occurrenceCount: 4,
  confidence: 'high',
  sourceIds: ['msg-003', 'msg-005', 'msg-007', 'msg-009'],
};

const mediumConfidenceSignal: FieldObservedSignal = {
  id: 's2',
  kind: 'contraction',
  description: 'Language became more contracted around discussion of family.',
  occurrenceCount: 2,
  confidence: 'medium',
  sourceIds: ['msg-010', 'msg-012'],
};

const lowConfidenceSignal: FieldObservedSignal = {
  id: 's3',
  kind: 'deflection',
  description: 'Possible deflection when asked about work.',
  occurrenceCount: 1,
  confidence: 'low',
  sourceIds: ['msg-015'],
};

function makePayload(overrides: Partial<FieldSensingPayload>): FieldSensingPayload {
  return { ...emptyPayload, ...overrides };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. detectFieldClaimTypes
// ─────────────────────────────────────────────────────────────────────────────

describe('detectFieldClaimTypes', () => {
  test('clean text: no claim types', () => {
    expect(detectFieldClaimTypes('Fire energy is present in this field.')).toHaveLength(0);
  });

  test('relative_time: "tomorrow" detected', () => {
    expect(detectFieldClaimTypes('This will ease tomorrow.')).toContain('relative_time');
  });

  test('intent_attribution: "the reason you" detected', () => {
    expect(detectFieldClaimTypes('The reason you avoid closeness is fear.')).toContain('intent_attribution');
  });

  test('intent_attribution: "why you did" detected', () => {
    expect(detectFieldClaimTypes('This is why you did that.')).toContain('intent_attribution');
  });

  test('emotional_attribution: "you are feeling" detected', () => {
    expect(detectFieldClaimTypes('You are feeling overwhelmed right now.')).toContain('emotional_attribution');
  });

  test('emotional_attribution: "you feel" detected', () => {
    expect(detectFieldClaimTypes('You feel unseen in this dynamic.')).toContain('emotional_attribution');
  });

  test('"you feel free" does NOT trigger emotional_attribution', () => {
    expect(detectFieldClaimTypes('You feel free to move forward.')).not.toContain('emotional_attribution');
  });

  test('shift_claim: "something has shifted" detected', () => {
    expect(detectFieldClaimTypes('Something has shifted in your field.')).toContain('shift_claim');
  });

  test('relational_inference: "in how you relate" detected', () => {
    expect(detectFieldClaimTypes('In how you relate to others, withdrawal appears.')).toContain('relational_inference');
  });

  test('recurring_pattern: "pattern" detected', () => {
    expect(detectFieldClaimTypes('A pattern of contraction appears across the exchange.')).toContain('recurring_pattern');
  });

  test('calendar_date: ISO date detected', () => {
    expect(detectFieldClaimTypes('Observed on 2026-01-15.')).toContain('calendar_date');
  });

  test('multiple claim types in one text', () => {
    const types = detectFieldClaimTypes('You are feeling shut down because of past patterns in your relationships.');
    expect(types).toContain('emotional_attribution');
    expect(types).toContain('relational_inference');
    expect(types).toContain('recurring_pattern');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. isAssertivelyFramed / isPossibilityFramed
// ─────────────────────────────────────────────────────────────────────────────

describe('isAssertivelyFramed', () => {
  test('assertive: "you are feeling"', () => {
    expect(isAssertivelyFramed('You are feeling grief here.')).toBe(true);
  });

  test('assertive: "you feel"', () => {
    expect(isAssertivelyFramed('You feel resistance to this.')).toBe(true);
  });

  test('assertive: "you need to"', () => {
    expect(isAssertivelyFramed('You need to slow down.')).toBe(true);
  });

  test('assertive: "the truth is"', () => {
    expect(isAssertivelyFramed('The truth is you are afraid.')).toBe(true);
  });

  test('not assertive: possibility-framed text', () => {
    expect(isAssertivelyFramed('There may be a sense of grief here.')).toBe(false);
  });

  test('not assertive: observational text', () => {
    expect(isAssertivelyFramed('Fire energy surfaces in this exchange.')).toBe(false);
  });
});

describe('isPossibilityFramed', () => {
  test('"there may be" is possibility-framed', () => {
    expect(isPossibilityFramed('There may be a quality of grief present.')).toBe(true);
  });

  test('"this might indicate" is possibility-framed', () => {
    expect(isPossibilityFramed('This might indicate some contraction.')).toBe(true);
  });

  test('"perhaps" is possibility-framed', () => {
    expect(isPossibilityFramed('Perhaps there is some weight here.')).toBe(true);
  });

  test('"you are feeling" is NOT possibility-framed', () => {
    expect(isPossibilityFramed('You are feeling grief right now.')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3a. validateFieldInference — intent attribution always blocked
// ─────────────────────────────────────────────────────────────────────────────

describe('validateFieldInference — intent attribution', () => {
  test('blocked regardless of evidence', () => {
    const payload = makePayload({
      reportedStates: [reportedEmotion, reportedEmotionLater],
      observedSignals: [highConfidenceSignal],
    });
    const result = validateFieldInference(
      'The reason you pull back is that you fear being seen.',
      ['intent_attribution'],
      payload
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('intent_attribution');
  });

  test('blocked even with high-confidence signals', () => {
    const payload = makePayload({ observedSignals: [highConfidenceSignal, mediumConfidenceSignal] });
    const result = validateFieldInference(
      'Why you deflected is clear from the pattern.',
      ['intent_attribution'],
      payload
    );
    expect(result.ok).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3b. validateFieldInference — relative time always blocked
// ─────────────────────────────────────────────────────────────────────────────

describe('validateFieldInference — relative time', () => {
  test('blocked regardless of evidence', () => {
    const payload = makePayload({ reportedStates: [reportedEmotion] });
    const result = validateFieldInference('This will ease tomorrow.', ['relative_time'], payload);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('relative_time_not_allowed');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3c. validateFieldInference — assertive framing blocked on emotional claims
// ─────────────────────────────────────────────────────────────────────────────

describe('validateFieldInference — assertive framing', () => {
  test('blocked when emotional attribution uses assertive language', () => {
    const payload = makePayload({ reportedStates: [reportedEmotion] });
    const result = validateFieldInference(
      'You are feeling grief and loss.',
      ['emotional_attribution'],
      payload
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('assertive_framing');
  });

  test('passes when same claim is possibility-framed', () => {
    const payload = makePayload({ reportedStates: [reportedEmotion] });
    const result = validateFieldInference(
      'There may be a sense of grief present here.',
      ['emotional_attribution'],
      payload
    );
    expect(result.ok).toBe(true);
  });

  test('assertive framing on shift claim is also blocked', () => {
    const payload = makePayload({
      reportedStates: [reportedEmotion, reportedEmotionLater],
    });
    const result = validateFieldInference(
      'You are in a shift right now.',
      ['shift_claim'],
      payload
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('assertive_framing');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3d. validateFieldInference — emotional attribution needs reported state or ≥2 signals
// ─────────────────────────────────────────────────────────────────────────────

describe('validateFieldInference — emotional attribution grounding', () => {
  test('blocked when no reported states and fewer than 2 qualifying signals', () => {
    const payload = makePayload({ observedSignals: [highConfidenceSignal] }); // only 1
    const result = validateFieldInference(
      'There may be a sense of anxiety present.',
      ['emotional_attribution'],
      payload
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('emotional_attribution_ungrounded');
  });

  test('blocked with 0 reported states and 0 signals', () => {
    const result = validateFieldInference(
      'There may be some grief here.',
      ['emotional_attribution'],
      emptyPayload
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('emotional_attribution_ungrounded');
  });

  test('passes when reported state is present', () => {
    const payload = makePayload({ reportedStates: [reportedEmotion] });
    const result = validateFieldInference(
      'There may be anxiety present — you named something like this earlier.',
      ['emotional_attribution'],
      payload
    );
    expect(result.ok).toBe(true);
  });

  test('passes with ≥2 medium/high confidence signals (no reported state)', () => {
    const payload = makePayload({ observedSignals: [highConfidenceSignal, mediumConfidenceSignal] });
    const result = validateFieldInference(
      'There may be some contraction present here.',
      ['emotional_attribution'],
      payload
    );
    expect(result.ok).toBe(true);
  });

  test('low confidence signals do not count toward the ≥2 requirement', () => {
    const payload = makePayload({ observedSignals: [highConfidenceSignal, lowConfidenceSignal] });
    const result = validateFieldInference(
      'There may be a sense of withdrawal here.',
      ['emotional_attribution'],
      payload
    );
    // Only 1 qualifying signal (high), 1 low (excluded)
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('emotional_attribution_ungrounded');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3e. validateFieldInference — shift claims need ≥2 timestamps
// ─────────────────────────────────────────────────────────────────────────────

describe('validateFieldInference — shift claims', () => {
  test('blocked when no reported states at all', () => {
    const result = validateFieldInference(
      'There may be a shift occurring.',
      ['shift_claim'],
      emptyPayload
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('shift_claim_no_contrast');
  });

  test('blocked when only one timestamp present', () => {
    const payload = makePayload({ reportedStates: [reportedEmotion] }); // one timestamp
    const result = validateFieldInference(
      'There may be a shift occurring.',
      ['shift_claim'],
      payload
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('shift_claim_no_contrast');
  });

  test('blocked when reported states have no timestamps', () => {
    const noTimeState = { ...reportedEmotion, timestamp: undefined };
    const payload = makePayload({ reportedStates: [noTimeState, { ...reportedRelational }] });
    const result = validateFieldInference(
      'There may be a shift occurring.',
      ['shift_claim'],
      payload
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('shift_claim_no_contrast');
  });

  test('passes with ≥2 distinct timestamps', () => {
    const payload = makePayload({ reportedStates: [reportedEmotion, reportedEmotionLater] });
    const result = validateFieldInference(
      'There may be some movement here — the quality seems to have shifted.',
      ['shift_claim'],
      payload
    );
    expect(result.ok).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3f. validateFieldInference — relational inference needs relational evidence
// ─────────────────────────────────────────────────────────────────────────────

describe('validateFieldInference — relational inference', () => {
  test('blocked when no relational reported state or signal', () => {
    const payload = makePayload({ reportedStates: [reportedEmotion] }); // emotion, not relational
    const result = validateFieldInference(
      'In how you relate, a pattern of withdrawal may be present.',
      ['relational_inference'],
      payload
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('relational_inference_no_data');
  });

  test('passes when relational reported state is present', () => {
    const payload = makePayload({ reportedStates: [reportedRelational] });
    const result = validateFieldInference(
      'In how you relate, something like withdrawal may surface.',
      ['relational_inference'],
      payload
    );
    expect(result.ok).toBe(true);
  });

  test('passes when tone signal is present (proxy for relational context)', () => {
    const payload = makePayload({ observedSignals: [highConfidenceSignal] }); // tone signal
    const result = validateFieldInference(
      'In how you relate, something like contraction may surface.',
      ['relational_inference'],
      payload
    );
    expect(result.ok).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3g. validateFieldInference — low confidence blocked
// ─────────────────────────────────────────────────────────────────────────────

describe('validateFieldInference — low confidence', () => {
  test('blocked when actualConfidence is low', () => {
    const payload = makePayload({ reportedStates: [reportedEmotion] });
    const result = validateFieldInference(
      'There may be some anxiety present.',
      ['emotional_attribution'],
      payload,
      { actualConfidence: 'low', minimumConfidence: 'medium' }
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('low_confidence_inference');
  });

  test('passes when actualConfidence is medium', () => {
    const payload = makePayload({ reportedStates: [reportedEmotion] });
    const result = validateFieldInference(
      'There may be some anxiety present.',
      ['emotional_attribution'],
      payload,
      { actualConfidence: 'medium', minimumConfidence: 'medium' }
    );
    expect(result.ok).toBe(true);
  });

  test('passes when no confidence specified (caller trusts the inference)', () => {
    const payload = makePayload({ reportedStates: [reportedEmotion] });
    const result = validateFieldInference(
      'There may be some anxiety present.',
      ['emotional_attribution'],
      payload
      // no inference confidence param
    );
    expect(result.ok).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3h. validateFieldInference — clean inference always passes
// ─────────────────────────────────────────────────────────────────────────────

describe('validateFieldInference — clean inference', () => {
  test('elemental observation with no claim types passes without backing', () => {
    const result = validateFieldInference(
      'Fire energy moves through this exchange.',
      [],
      emptyPayload
    );
    expect(result.ok).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. buildFieldSensingAuthoritySummary
// ─────────────────────────────────────────────────────────────────────────────

describe('buildFieldSensingAuthoritySummary', () => {
  test('empty payload: all zeros, domain is field', () => {
    const summary = buildFieldSensingAuthoritySummary(emptyPayload);
    expect(summary.domain).toBe('field');
    expect(summary.totalItems).toBe(0);
    expect(summary.totalReportedStates).toBe(0);
    expect(summary.totalObservedSignals).toBe(0);
    expect(summary.projectionRisksCount).toBe(0);
    expect(summary.guardrailCount).toBe(FIELD_SENSING_GUARDRAILS.length);
  });

  test('confirmed states counted correctly', () => {
    const confirmedState = { ...reportedEmotion, confirmed: true };
    const payload = makePayload({ reportedStates: [confirmedState, reportedRelational] });
    const summary = buildFieldSensingAuthoritySummary(payload);
    expect(summary.totalReportedStates).toBe(2);
    expect(summary.confirmedStates).toBe(1);
  });

  test('signal confidence counts correct', () => {
    const payload = makePayload({
      observedSignals: [highConfidenceSignal, mediumConfidenceSignal, lowConfidenceSignal],
    });
    const summary = buildFieldSensingAuthoritySummary(payload);
    expect(summary.totalObservedSignals).toBe(3);
    expect(summary.highConfidenceSignals).toBe(1);
    expect(summary.lowConfidenceSignals).toBe(1);
  });

  test('blocked inferences counted correctly', () => {
    const payload = makePayload({
      inferences: [
        {
          id: 'i1', kind: 'emotional_state', text: 'There may be anxiety here.',
          authority: 'derived', claimTypes: [], supportingIds: ['r1'],
          minimumConfidence: 'medium', actualConfidence: 'medium',
          renderBlocked: false, traceId: 'field:emotion:1',
        } as FieldInference,
        {
          id: 'i2', kind: 'elemental_quality', text: 'You feel grief.',
          authority: 'fallback', claimTypes: ['emotional_attribution'],
          supportingIds: [], minimumConfidence: 'medium', actualConfidence: 'low',
          renderBlocked: true, blockReason: 'assertive_framing', traceId: 'field:emotion:2',
        } as FieldInference,
      ],
      projectionRisks: [
        { id: 'p1', originalText: 'You feel grief.', claimTypes: ['emotional_attribution'],
          blockReason: 'emotional_attribution_ungrounded', inferenceId: 'i2' },
      ],
    });
    const summary = buildFieldSensingAuthoritySummary(payload);
    expect(summary.totalInferences).toBe(2);
    expect(summary.blockedInferences).toBe(1);
    expect(summary.projectionRisksCount).toBe(1);
    expect(summary.derivedItems).toBe(1);
    expect(summary.fallbackItems).toBe(1);
  });
});
