/**
 * SYMBOLIC TELEMETRY TESTS — Phase 17
 *
 * Covers:
 *   1. telemetryFromIngressItem — event shape from PromptIngressItem
 *   2. telemetryFromIngressBatch — batch conversion
 *   3. buildDomainSummaries — per-domain counts
 *   4. buildAuthoritySummaries — per-authority counts and role breakdown
 *   5. buildRoleSummaries — per-role counts with domain breakdown
 *   6. buildBlockSummary — block rate and reason/domain tallies
 *   7. buildSurfaceSummary — surface eligibility counts and yield rates
 *   8. buildTelemetrySummary — full summary composition
 *   9. detectTelemetryAnomalies — operational heuristics
 */

import {
  telemetryFromIngressItem,
  telemetryFromIngressBatch,
  buildDomainSummaries,
  buildAuthoritySummaries,
  buildRoleSummaries,
  buildBlockSummary,
  buildSurfaceSummary,
  buildTelemetrySummary,
  detectTelemetryAnomalies,
} from '@/lib/symbolic/symbolicTelemetry';

import { buildPromptIngressItem } from '@/lib/symbolic/promptIngressGovernance';

import type { SymbolicTelemetryEvent } from '@/lib/symbolic/symbolicTelemetry';
import type { PromptIngressInput } from '@/lib/symbolic/promptIngressGovernance';

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

function makeIngress(overrides: Partial<PromptIngressInput> = {}) {
  return buildPromptIngressItem({
    traceId: 'test:trace',
    domain: 'astrology',
    text: 'Saturn opposes Mars.',
    authority: 'derived',
    renderBlocked: false,
    claimTypes: [],
    ...overrides,
  });
}

function makeEvent(overrides: Partial<SymbolicTelemetryEvent> = {}): SymbolicTelemetryEvent {
  return {
    traceId: 'test:trace',
    domain: 'astrology',
    authority: 'derived',
    promptRole: 'interpretation',
    renderBlocked: false,
    allowedInPrompt: true,
    allowedInPractitionerView: true,
    allowedInUserView: true,
    allowedInMemory: true,
    timestamp: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}

// A realistic batch covering all authorities and roles
const mixedBatch: SymbolicTelemetryEvent[] = [
  makeEvent({ domain: 'astrology', authority: 'authoritative', promptRole: 'fact',
    allowedInPrompt: true, allowedInPractitionerView: true, allowedInUserView: true, allowedInMemory: true }),
  makeEvent({ domain: 'journal', authority: 'derived', promptRole: 'interpretation',
    allowedInPrompt: true, allowedInPractitionerView: true, allowedInUserView: true, allowedInMemory: true }),
  makeEvent({ domain: 'pattern_ledger', authority: 'derived', promptRole: 'interpretation',
    allowedInPrompt: true, allowedInPractitionerView: true, allowedInUserView: false, allowedInMemory: false,
    renderBlocked: false }),
  makeEvent({ domain: 'field', authority: 'fallback', promptRole: 'question_seed',
    allowedInPrompt: true, allowedInPractitionerView: false, allowedInUserView: false, allowedInMemory: false }),
  makeEvent({ domain: 'astrology', authority: 'derived', promptRole: 'excluded',
    renderBlocked: true, blockReason: 'relative_time_not_allowed',
    allowedInPrompt: false, allowedInPractitionerView: false, allowedInUserView: false, allowedInMemory: false }),
  makeEvent({ domain: 'cross_domain', authority: 'derived', promptRole: 'excluded',
    renderBlocked: true, blockReason: 'identity_claim_multi_domain',
    allowedInPrompt: false, allowedInPractitionerView: false, allowedInUserView: false, allowedInMemory: false }),
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. telemetryFromIngressItem
// ─────────────────────────────────────────────────────────────────────────────

describe('telemetryFromIngressItem', () => {
  test('copies all eligibility fields from PromptIngressItem', () => {
    const item = makeIngress({ authority: 'authoritative' });
    const event = telemetryFromIngressItem(item);
    expect(event.traceId).toBe(item.traceId);
    expect(event.domain).toBe(item.domain);
    expect(event.authority).toBe(item.authority);
    expect(event.promptRole).toBe(item.promptRole);
    expect(event.renderBlocked).toBe(item.renderBlocked);
    expect(event.allowedInPrompt).toBe(item.allowedInPrompt);
    expect(event.allowedInPractitionerView).toBe(item.allowedInPractitionerView);
    expect(event.allowedInUserView).toBe(item.allowedInUserView);
    expect(event.allowedInMemory).toBe(item.allowedInMemory);
  });

  test('timestamp is set', () => {
    const event = telemetryFromIngressItem(makeIngress());
    expect(event.timestamp).toBeDefined();
    expect(new Date(event.timestamp!).getTime()).not.toBeNaN();
  });

  test('sessionId propagated when provided', () => {
    const event = telemetryFromIngressItem(makeIngress(), 'session-abc');
    expect(event.sessionId).toBe('session-abc');
  });

  test('sessionId absent when not provided', () => {
    const event = telemetryFromIngressItem(makeIngress());
    expect(event.sessionId).toBeUndefined();
  });

  test('blocked item: promptRole=excluded, allowedInPrompt=false', () => {
    const item = makeIngress({ renderBlocked: true, blockReason: 'relative_time_not_allowed' });
    const event = telemetryFromIngressItem(item);
    expect(event.promptRole).toBe('excluded');
    expect(event.allowedInPrompt).toBe(false);
    expect(event.blockReason).toBe('relative_time_not_allowed');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. telemetryFromIngressBatch
// ─────────────────────────────────────────────────────────────────────────────

describe('telemetryFromIngressBatch', () => {
  test('returns one event per item', () => {
    const items = [makeIngress(), makeIngress({ authority: 'authoritative' })];
    const events = telemetryFromIngressBatch(items);
    expect(events).toHaveLength(2);
  });

  test('empty batch returns empty array', () => {
    expect(telemetryFromIngressBatch([])).toHaveLength(0);
  });

  test('sessionId applied to all events', () => {
    const items = [makeIngress(), makeIngress()];
    const events = telemetryFromIngressBatch(items, 'session-xyz');
    expect(events.every(e => e.sessionId === 'session-xyz')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. buildDomainSummaries
// ─────────────────────────────────────────────────────────────────────────────

describe('buildDomainSummaries', () => {
  test('produces one summary per unique domain', () => {
    const summaries = buildDomainSummaries(mixedBatch);
    const domains = summaries.map(s => s.domain);
    expect(domains).toContain('astrology');
    expect(domains).toContain('journal');
    expect(domains).toContain('pattern_ledger');
    expect(domains).toContain('field');
    expect(domains).toContain('cross_domain');
  });

  test('astrology summary: 2 total, 1 blocked', () => {
    const summaries = buildDomainSummaries(mixedBatch);
    const astro = summaries.find(s => s.domain === 'astrology')!;
    expect(astro.totalItems).toBe(2);
    expect(astro.blockedCount).toBe(1);
  });

  test('blocked item: blockReason in blockReasonBreakdown', () => {
    const summaries = buildDomainSummaries(mixedBatch);
    const astro = summaries.find(s => s.domain === 'astrology')!;
    expect(astro.blockReasonBreakdown['relative_time_not_allowed']).toBe(1);
  });

  test('field summary: fallback, not in practitioner/user/memory', () => {
    const summaries = buildDomainSummaries(mixedBatch);
    const field = summaries.find(s => s.domain === 'field')!;
    expect(field.fallbackCount).toBe(1);
    expect(field.allowedInUserViewCount).toBe(0);
    expect(field.allowedInMemoryCount).toBe(0);
  });

  test('empty events: empty array', () => {
    expect(buildDomainSummaries([])).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. buildAuthoritySummaries
// ─────────────────────────────────────────────────────────────────────────────

describe('buildAuthoritySummaries', () => {
  test('always returns three summaries (authoritative, derived, fallback)', () => {
    const summaries = buildAuthoritySummaries(mixedBatch);
    expect(summaries).toHaveLength(3);
    expect(summaries.map(s => s.authority)).toContain('authoritative');
    expect(summaries.map(s => s.authority)).toContain('derived');
    expect(summaries.map(s => s.authority)).toContain('fallback');
  });

  test('authoritative: 1 item, promptRole fact, allowed in prompt and memory', () => {
    const summaries = buildAuthoritySummaries(mixedBatch);
    const auth = summaries.find(s => s.authority === 'authoritative')!;
    expect(auth.totalItems).toBe(1);
    expect(auth.promptRoleBreakdown.fact).toBe(1);
    expect(auth.allowedInPromptCount).toBe(1);
    expect(auth.allowedInMemoryCount).toBe(1);
  });

  test('derived: 4 items (journal + pattern_ledger + astrology-blocked + cross_domain-blocked)', () => {
    const summaries = buildAuthoritySummaries(mixedBatch);
    const derived = summaries.find(s => s.authority === 'derived')!;
    expect(derived.totalItems).toBe(4);
    expect(derived.promptRoleBreakdown.interpretation).toBe(2);
    expect(derived.promptRoleBreakdown.excluded).toBe(2);
  });

  test('fallback: 1 item, question_seed role, not allowed in memory', () => {
    const summaries = buildAuthoritySummaries(mixedBatch);
    const fallback = summaries.find(s => s.authority === 'fallback')!;
    expect(fallback.totalItems).toBe(1);
    expect(fallback.promptRoleBreakdown.question_seed).toBe(1);
    expect(fallback.allowedInMemoryCount).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. buildRoleSummaries
// ─────────────────────────────────────────────────────────────────────────────

describe('buildRoleSummaries', () => {
  test('always returns five summaries (all roles)', () => {
    const summaries = buildRoleSummaries(mixedBatch);
    expect(summaries).toHaveLength(5);
    const roles = summaries.map(s => s.role);
    expect(roles).toContain('fact');
    expect(roles).toContain('interpretation');
    expect(roles).toContain('uncertainty');
    expect(roles).toContain('question_seed');
    expect(roles).toContain('excluded');
  });

  test('excluded: 2 items from astrology and cross_domain', () => {
    const summaries = buildRoleSummaries(mixedBatch);
    const excluded = summaries.find(s => s.role === 'excluded')!;
    expect(excluded.count).toBe(2);
    expect(excluded.domains['astrology']).toBe(1);
    expect(excluded.domains['cross_domain']).toBe(1);
  });

  test('uncertainty: 0 items in this batch', () => {
    const summaries = buildRoleSummaries(mixedBatch);
    const uncertainty = summaries.find(s => s.role === 'uncertainty')!;
    expect(uncertainty.count).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. buildBlockSummary
// ─────────────────────────────────────────────────────────────────────────────

describe('buildBlockSummary', () => {
  test('counts blocked events correctly', () => {
    const summary = buildBlockSummary(mixedBatch);
    expect(summary.totalBlocked).toBe(2);
  });

  test('byReason tallied correctly', () => {
    const summary = buildBlockSummary(mixedBatch);
    expect(summary.byReason['relative_time_not_allowed']).toBe(1);
    expect(summary.byReason['identity_claim_multi_domain']).toBe(1);
  });

  test('byDomain tallied correctly', () => {
    const summary = buildBlockSummary(mixedBatch);
    expect(summary.byDomain['astrology']).toBe(1);
    expect(summary.byDomain['cross_domain']).toBe(1);
  });

  test('blockRate correct (2/6 ≈ 33.3%)', () => {
    const summary = buildBlockSummary(mixedBatch);
    expect(summary.blockRate).toBeCloseTo(33.33, 1);
  });

  test('blockRate is 0 for empty events', () => {
    expect(buildBlockSummary([]).blockRate).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. buildSurfaceSummary
// ─────────────────────────────────────────────────────────────────────────────

describe('buildSurfaceSummary', () => {
  test('totalEvents is 6', () => {
    expect(buildSurfaceSummary(mixedBatch).totalEvents).toBe(6);
  });

  test('allowedInPrompt: 4 (authoritative + 2 derived interpretation + fallback)', () => {
    expect(buildSurfaceSummary(mixedBatch).allowedInPrompt).toBe(4);
  });

  test('allowedInUserView: 2 (authoritative + journal derived)', () => {
    expect(buildSurfaceSummary(mixedBatch).allowedInUserView).toBe(2);
  });

  test('allowedInMemory: 2 (authoritative + journal derived)', () => {
    expect(buildSurfaceSummary(mixedBatch).allowedInMemory).toBe(2);
  });

  test('excludedFromAll: 2 (both blocked items)', () => {
    expect(buildSurfaceSummary(mixedBatch).excludedFromAll).toBe(2);
  });

  test('memoryYieldRate: 2/6 ≈ 0.333', () => {
    expect(buildSurfaceSummary(mixedBatch).memoryYieldRate).toBeCloseTo(0.333, 2);
  });

  test('userViewYieldRate: 2/6 ≈ 0.333', () => {
    expect(buildSurfaceSummary(mixedBatch).userViewYieldRate).toBeCloseTo(0.333, 2);
  });

  test('yield rates are 0 for empty events', () => {
    const s = buildSurfaceSummary([]);
    expect(s.memoryYieldRate).toBe(0);
    expect(s.userViewYieldRate).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. buildTelemetrySummary
// ─────────────────────────────────────────────────────────────────────────────

describe('buildTelemetrySummary', () => {
  test('composes all sub-summaries', () => {
    const summary = buildTelemetrySummary(mixedBatch, 'session-test');
    expect(summary.totalEvents).toBe(6);
    expect(summary.sessionId).toBe('session-test');
    expect(summary.generatedAt).toBeDefined();
    expect(summary.byDomain).toHaveLength(5);
    expect(summary.byAuthority).toHaveLength(3);
    expect(summary.byRole).toHaveLength(5);
    expect(summary.blocks.totalBlocked).toBe(2);
    expect(summary.surfaces.totalEvents).toBe(6);
  });

  test('empty events: all zeros', () => {
    const summary = buildTelemetrySummary([]);
    expect(summary.totalEvents).toBe(0);
    expect(summary.blocks.totalBlocked).toBe(0);
    expect(summary.surfaces.excludedFromAll).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. detectTelemetryAnomalies
// ─────────────────────────────────────────────────────────────────────────────

describe('detectTelemetryAnomalies', () => {
  test('no anomalies for healthy summary', () => {
    const healthyEvents: SymbolicTelemetryEvent[] = [
      makeEvent({ authority: 'authoritative', promptRole: 'fact',
        allowedInPrompt: true, allowedInPractitionerView: true, allowedInUserView: true, allowedInMemory: true }),
      makeEvent({ authority: 'derived', promptRole: 'interpretation',
        allowedInPrompt: true, allowedInPractitionerView: true, allowedInUserView: true, allowedInMemory: true }),
      makeEvent({ authority: 'derived', promptRole: 'interpretation',
        allowedInPrompt: true, allowedInPractitionerView: true, allowedInUserView: true, allowedInMemory: true }),
    ];
    const summary = buildTelemetrySummary(healthyEvents);
    const anomalies = detectTelemetryAnomalies(summary);
    expect(anomalies).toHaveLength(0);
  });

  test('high_block_rate: >30% blocked', () => {
    const events: SymbolicTelemetryEvent[] = [
      makeEvent({ renderBlocked: true, promptRole: 'excluded', blockReason: 'identity_claim_multi_domain',
        allowedInPrompt: false, allowedInPractitionerView: false, allowedInUserView: false, allowedInMemory: false }),
      makeEvent({ renderBlocked: true, promptRole: 'excluded', blockReason: 'relative_time_not_allowed',
        allowedInPrompt: false, allowedInPractitionerView: false, allowedInUserView: false, allowedInMemory: false }),
      makeEvent({ authority: 'derived', promptRole: 'interpretation',
        allowedInPrompt: true, allowedInPractitionerView: true, allowedInUserView: true, allowedInMemory: true }),
    ];
    const summary = buildTelemetrySummary(events);
    const anomalies = detectTelemetryAnomalies(summary);
    expect(anomalies.some(a => a.kind === 'high_block_rate')).toBe(true);
  });

  test('fallback_dominance: >50% fallback', () => {
    const events: SymbolicTelemetryEvent[] = [
      makeEvent({ authority: 'fallback', promptRole: 'question_seed',
        allowedInPrompt: true, allowedInPractitionerView: false, allowedInUserView: false, allowedInMemory: false }),
      makeEvent({ authority: 'fallback', promptRole: 'question_seed',
        allowedInPrompt: true, allowedInPractitionerView: false, allowedInUserView: false, allowedInMemory: false }),
      makeEvent({ authority: 'fallback', promptRole: 'question_seed',
        allowedInPrompt: true, allowedInPractitionerView: false, allowedInUserView: false, allowedInMemory: false }),
      makeEvent({ authority: 'derived', promptRole: 'interpretation',
        allowedInPrompt: true, allowedInPractitionerView: true, allowedInUserView: true, allowedInMemory: true }),
    ];
    const summary = buildTelemetrySummary(events);
    const anomalies = detectTelemetryAnomalies(summary);
    expect(anomalies.some(a => a.kind === 'fallback_dominance')).toBe(true);
  });

  test('no_authoritative_items: zero authoritative with ≥3 events', () => {
    const events = [
      makeEvent({ authority: 'derived', promptRole: 'interpretation',
        allowedInPrompt: true, allowedInPractitionerView: true, allowedInUserView: true, allowedInMemory: true }),
      makeEvent({ authority: 'derived', promptRole: 'interpretation',
        allowedInPrompt: true, allowedInPractitionerView: true, allowedInUserView: true, allowedInMemory: true }),
      makeEvent({ authority: 'fallback', promptRole: 'question_seed',
        allowedInPrompt: true, allowedInPractitionerView: false, allowedInUserView: false, allowedInMemory: false }),
    ];
    const summary = buildTelemetrySummary(events);
    const anomalies = detectTelemetryAnomalies(summary);
    expect(anomalies.some(a => a.kind === 'no_authoritative_items')).toBe(true);
    expect(anomalies.find(a => a.kind === 'no_authoritative_items')?.severity).toBe('info');
  });

  test('no anomalies for empty events (no false positives on zero data)', () => {
    const summary = buildTelemetrySummary([]);
    expect(detectTelemetryAnomalies(summary)).toHaveLength(0);
  });

  test('cross_domain_mostly_blocked when >50% of cross_domain blocked', () => {
    const events: SymbolicTelemetryEvent[] = [
      makeEvent({ domain: 'cross_domain', renderBlocked: true, promptRole: 'excluded',
        blockReason: 'domain_disagreement',
        allowedInPrompt: false, allowedInPractitionerView: false, allowedInUserView: false, allowedInMemory: false }),
      makeEvent({ domain: 'cross_domain', renderBlocked: true, promptRole: 'excluded',
        blockReason: 'all_contributions_fallback',
        allowedInPrompt: false, allowedInPractitionerView: false, allowedInUserView: false, allowedInMemory: false }),
      makeEvent({ domain: 'cross_domain', authority: 'derived', promptRole: 'interpretation',
        allowedInPrompt: true, allowedInPractitionerView: true, allowedInUserView: true, allowedInMemory: true }),
      makeEvent({ domain: 'astrology', authority: 'authoritative', promptRole: 'fact',
        allowedInPrompt: true, allowedInPractitionerView: true, allowedInUserView: true, allowedInMemory: true }),
    ];
    const summary = buildTelemetrySummary(events);
    const anomalies = detectTelemetryAnomalies(summary);
    expect(anomalies.some(a => a.kind === 'cross_domain_mostly_blocked')).toBe(true);
  });
});
