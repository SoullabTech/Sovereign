/**
 * SYMBOLIC AUTHORITY CONTRACTS TESTS — Phase 12
 *
 * Covers:
 *   1. buildSymbolicRenderBatchAudit — counts across domains
 *   2. astrologyAuditToSymbolic — maps RenderAuditMeta → SymbolicAuditMeta
 *   3. astrologyRenderItemToSymbolic — full item wrapper
 *   4. detectJournalClaimTypes — journal-specific claim detection
 *   5. validateJournalClaim — backing requirements enforced
 *   6. buildJournalAuthoritySummary — payload health metrics
 */

import {
  buildSymbolicRenderBatchAudit,
  astrologyAuditToSymbolic,
  astrologyRenderItemToSymbolic,
} from '@/lib/symbolic/symbolicAuthorityContracts';

import {
  detectJournalClaimTypes,
  validateJournalClaim,
  buildJournalAuthoritySummary,
  JOURNAL_GUARDRAILS,
} from '@/lib/symbolic/journalInterpretationContracts';

import type { SymbolicAuditMeta } from '@/lib/symbolic/symbolicAuthorityContracts';
import type {
  JournalInterpretationPayload,
  JournalInterpretation,
} from '@/lib/symbolic/journalInterpretationContracts';
import type { RenderAuditMeta } from '@/lib/astrology/transitRenderContracts';

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

const cleanAudit: SymbolicAuditMeta = {
  traceId: 'fire:water/threshold',
  domain: 'astrology',
  authority: 'derived',
  supportingIds: ['fact:retrograde:0'],
  renderBlocked: false,
  detectedClaimTypes: [],
  passthrough: false,
};

const blockedAudit: SymbolicAuditMeta = {
  traceId: 'moon:neptune/conjunction',
  domain: 'astrology',
  authority: 'fallback',
  supportingIds: [],
  renderBlocked: true,
  blockReason: 'relative_time_not_allowed',
  detectedClaimTypes: ['relative_time'],
  passthrough: false,
};

const passthroughAudit: SymbolicAuditMeta = {
  traceId: 'mars:saturn/opposition',
  domain: 'journal',
  authority: 'derived',
  supportingIds: [],
  renderBlocked: false,
  detectedClaimTypes: [],
  passthrough: true,
};

const astrologyRenderAudit: RenderAuditMeta = {
  traceId: 'mars:saturn/opposition',
  authority: 'derived',
  supportingIds: [],
  renderBlocked: false,
  rendererMode: 'maia',
  passthrough: false,
};

const emptyJournalPayload: JournalInterpretationPayload = {
  generatedAt: new Date().toISOString(),
  sourceFragments: [],
  extractedSymbols: [],
  interpretations: [],
  blockedClaims: [],
  guardrails: JOURNAL_GUARDRAILS,
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. buildSymbolicRenderBatchAudit
// ─────────────────────────────────────────────────────────────────────────────

describe('buildSymbolicRenderBatchAudit', () => {
  test('counts blocked, authoritative, derived, fallback correctly', () => {
    const items = [
      { audit: cleanAudit },
      { audit: blockedAudit },
    ];
    const summary = buildSymbolicRenderBatchAudit(items, 'astrology');

    expect(summary.domain).toBe('astrology');
    expect(summary.totalItems).toBe(2);
    expect(summary.blockedItems).toBe(1);
    expect(summary.derivedItems).toBe(1);
    expect(summary.fallbackItems).toBe(1);
    expect(summary.authoritativeItems).toBe(0);
    expect(summary.passthroughMode).toBe(false);
  });

  test('passthroughMode true when any item has passthrough: true', () => {
    const items = [{ audit: cleanAudit }, { audit: passthroughAudit }];
    const summary = buildSymbolicRenderBatchAudit(items, 'journal');
    expect(summary.passthroughMode).toBe(true);
  });

  test('empty items: all counts zero', () => {
    const summary = buildSymbolicRenderBatchAudit([], 'journal');
    expect(summary.totalItems).toBe(0);
    expect(summary.blockedItems).toBe(0);
    expect(summary.passthroughMode).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. astrologyAuditToSymbolic
// ─────────────────────────────────────────────────────────────────────────────

describe('astrologyAuditToSymbolic', () => {
  test('maps domain to astrology', () => {
    const result = astrologyAuditToSymbolic(astrologyRenderAudit);
    expect(result.domain).toBe('astrology');
  });

  test('preserves traceId, authority, supportingIds, renderBlocked, passthrough', () => {
    const result = astrologyAuditToSymbolic(astrologyRenderAudit);
    expect(result.traceId).toBe('mars:saturn/opposition');
    expect(result.authority).toBe('derived');
    expect(result.renderBlocked).toBe(false);
    expect(result.passthrough).toBe(false);
  });

  test('detectedClaimTypes is empty array (not present in RenderAuditMeta)', () => {
    const result = astrologyAuditToSymbolic(astrologyRenderAudit);
    expect(result.detectedClaimTypes).toEqual([]);
  });

  test('blocked audit preserves blockReason', () => {
    const blocked: RenderAuditMeta = {
      ...astrologyRenderAudit,
      renderBlocked: true,
      blockReason: 'relative_time_not_allowed',
    };
    const result = astrologyAuditToSymbolic(blocked);
    expect(result.renderBlocked).toBe(true);
    expect(result.blockReason).toBe('relative_time_not_allowed');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. astrologyRenderItemToSymbolic
// ─────────────────────────────────────────────────────────────────────────────

describe('astrologyRenderItemToSymbolic', () => {
  test('wraps text and audit into SymbolicRenderItem', () => {
    const item = {
      text: 'Your Fire is trying to act.',
      audit: astrologyRenderAudit,
    };
    const result = astrologyRenderItemToSymbolic(item);
    expect(result.text).toBe('Your Fire is trying to act.');
    expect(result.audit.domain).toBe('astrology');
    expect(result.audit.traceId).toBe('mars:saturn/opposition');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. detectJournalClaimTypes
// ─────────────────────────────────────────────────────────────────────────────

describe('detectJournalClaimTypes', () => {
  test('clean text: no claim types detected', () => {
    const types = detectJournalClaimTypes('There is movement in your elemental field.');
    expect(types).toHaveLength(0);
  });

  test('relative_time: "tomorrow" detected', () => {
    const types = detectJournalClaimTypes('This will clarify tomorrow.');
    expect(types).toContain('relative_time');
  });

  test('relative_time: "today" detected', () => {
    const types = detectJournalClaimTypes('You are feeling this today.');
    expect(types).toContain('relative_time');
  });

  test('recurring_pattern: "you always" detected', () => {
    const types = detectJournalClaimTypes('You always deflect when someone gets close.');
    expect(types).toContain('recurring_pattern');
  });

  test('causation_claim: "because you" pattern detected', () => {
    const types = detectJournalClaimTypes('Because you fear rejection, you pull back.');
    expect(types).toContain('causation_claim');
  });

  test('identity_claim: "you are a" detected', () => {
    const types = detectJournalClaimTypes('You are a deeply empathic person.');
    expect(types).toContain('identity_claim');
  });

  test('trend_assertion: "there is a pattern" detected', () => {
    const types = detectJournalClaimTypes('There is a pattern of avoidance in these entries.');
    expect(types).toContain('trend_assertion');
  });

  test('relational_claim: "in your relationships" detected', () => {
    const types = detectJournalClaimTypes('In your relationships, you tend to over-give.');
    expect(types).toContain('relational_claim');
  });

  test('calendar_date: ISO date detected', () => {
    const types = detectJournalClaimTypes('This entry was written on 2026-03-15.');
    expect(types).toContain('calendar_date');
  });

  test('multiple claim types can be detected in one text', () => {
    const types = detectJournalClaimTypes('You always fear tomorrow because of past rejection.');
    expect(types).toContain('recurring_pattern');
    expect(types).toContain('relative_time');
    expect(types).toContain('causation_claim');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. validateJournalClaim
// ─────────────────────────────────────────────────────────────────────────────

describe('validateJournalClaim', () => {
  test('identity_claim: always blocked regardless of backing', () => {
    const payload = {
      ...emptyJournalPayload,
      sourceFragments: [
        { id: 'f1', text: 'text', entryId: 'e1', timestamp: '2026-01-01' },
        { id: 'f2', text: 'text', entryId: 'e2', timestamp: '2026-01-02' },
        { id: 'f3', text: 'text', entryId: 'e3', timestamp: '2026-01-03' },
      ],
    };
    const result = validateJournalClaim('You are a wounded healer.', ['identity_claim'], payload);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('unsupported_claim_type');
  });

  test('relative_time: always blocked', () => {
    const result = validateJournalClaim('This resolves tomorrow.', ['relative_time'], emptyJournalPayload);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('relative_time_not_allowed');
  });

  test('recurring_pattern: blocked when only 1 source fragment', () => {
    const payload = {
      ...emptyJournalPayload,
      sourceFragments: [{ id: 'f1', text: 'text', entryId: 'e1', timestamp: '2026-01-01' }],
    };
    const result = validateJournalClaim('You always retreat.', ['recurring_pattern'], payload);
    expect(result.ok).toBe(false);
    expect(result.actualBackingCount).toBe(1);
    expect(result.requiredBackingCount).toBe(2);
  });

  test('recurring_pattern: passes with 2+ source fragments', () => {
    const payload = {
      ...emptyJournalPayload,
      sourceFragments: [
        { id: 'f1', text: 'text', entryId: 'e1', timestamp: '2026-01-01' },
        { id: 'f2', text: 'text', entryId: 'e2', timestamp: '2026-01-02' },
      ],
    };
    const result = validateJournalClaim('You always retreat.', ['recurring_pattern'], payload);
    expect(result.ok).toBe(true);
    expect(result.supportingIds).toHaveLength(2);
  });

  test('causation_claim: blocked when fewer than 3 source fragments', () => {
    const payload = {
      ...emptyJournalPayload,
      sourceFragments: [
        { id: 'f1', text: 'text', entryId: 'e1', timestamp: '2026-01-01' },
        { id: 'f2', text: 'text', entryId: 'e2', timestamp: '2026-01-02' },
      ],
    };
    const result = validateJournalClaim('Because you fear loss, you isolate.', ['causation_claim'], payload);
    expect(result.ok).toBe(false);
    expect(result.requiredBackingCount).toBe(3);
  });

  test('clean text (no claim types): passes without backing', () => {
    const result = validateJournalClaim('Fire energy is present here.', [], emptyJournalPayload);
    expect(result.ok).toBe(true);
    expect(result.reason).toBe('source_backed');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. buildJournalAuthoritySummary
// ─────────────────────────────────────────────────────────────────────────────

describe('buildJournalAuthoritySummary', () => {
  test('empty payload: all zeros', () => {
    const summary = buildJournalAuthoritySummary(emptyJournalPayload);
    expect(summary.domain).toBe('journal');
    expect(summary.totalItems).toBe(0);
    expect(summary.blockedItems).toBe(0);
    expect(summary.totalSourceFragments).toBe(0);
    expect(summary.totalExtractedSymbols).toBe(0);
    expect(summary.recurringSymbols).toBe(0);
    expect(summary.guardrailCount).toBe(JOURNAL_GUARDRAILS.length);
  });

  test('counts blocked interpretations correctly', () => {
    const payload: JournalInterpretationPayload = {
      ...emptyJournalPayload,
      sourceFragments: [
        { id: 'f1', text: 'I always feel anxious', entryId: 'e1', timestamp: '2026-01-01' },
      ],
      interpretations: [
        {
          id: 'i1',
          kind: 'elemental_synthesis',
          text: 'Fire is moving through your field.',
          authority: 'derived',
          claimTypes: [],
          supportingIds: ['f1'],
          renderBlocked: false,
          confidence: 'possible',
          traceId: 'journal:fire',
        } as JournalInterpretation,
        {
          id: 'i2',
          kind: 'pattern_observation',
          text: 'You always avoid confrontation.',
          authority: 'fallback',
          claimTypes: ['recurring_pattern'],
          supportingIds: [],
          renderBlocked: true,
          blockReason: 'missing_support',
          confidence: 'speculative',
          traceId: 'journal:pattern',
        } as JournalInterpretation,
      ],
      blockedClaims: [],
    };

    const summary = buildJournalAuthoritySummary(payload);
    expect(summary.totalInterpretations).toBe(2);
    expect(summary.blockedInterpretations).toBe(1);
    expect(summary.derivedItems).toBe(1);
    expect(summary.fallbackItems).toBe(1);
    expect(summary.totalSourceFragments).toBe(1);
  });

  test('recurringSymbols counts symbols with isRecurring: true', () => {
    const payload: JournalInterpretationPayload = {
      ...emptyJournalPayload,
      extractedSymbols: [
        { id: 's1', symbol: 'fire', kind: 'element', sourceIds: ['f1', 'f2'], backingCount: 2, isRecurring: true },
        { id: 's2', symbol: 'water', kind: 'element', sourceIds: ['f1'], backingCount: 1, isRecurring: false },
      ],
      interpretations: [],
      blockedClaims: [],
    };

    const summary = buildJournalAuthoritySummary(payload);
    expect(summary.totalExtractedSymbols).toBe(2);
    expect(summary.recurringSymbols).toBe(1);
  });
});
