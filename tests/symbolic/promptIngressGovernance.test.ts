/**
 * PROMPT INGRESS GOVERNANCE TESTS — Phase 16
 *
 * Covers:
 *   1. resolvePromptRole — role assignment by authority and block status
 *   2. resolveEligibility — eligibility matrix for all four surfaces
 *      a. authoritative → all surfaces allowed
 *      b. derived → prompt + practitioner + user (unless assertive) + memory (unless speculative)
 *      c. fallback → prompt only (as question_seed); excluded from practitioner/user/memory
 *      d. renderBlocked → excluded from all surfaces
 *      e. absolute exclusion claims (identity, intent, relative_time) → excluded everywhere
 *   3. buildPromptIngressItem — full item construction
 *   4. filter helpers — filterForPrompt, filterForPractitionerView, etc.
 *   5. assemblePromptBlock — grouped text assembly
 *   6. buildPromptIngressAuditSummary — batch metrics
 */

import {
  resolvePromptRole,
  resolveEligibility,
  buildPromptIngressItem,
  filterForPrompt,
  filterForPractitionerView,
  filterForUserView,
  filterForMemory,
  assemblePromptBlock,
  buildPromptIngressAuditSummary,
} from '@/lib/symbolic/promptIngressGovernance';

import type { PromptIngressItem, PromptIngressInput } from '@/lib/symbolic/promptIngressGovernance';

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

function makeInput(overrides: Partial<PromptIngressInput> = {}): PromptIngressInput {
  return {
    traceId: 'test:trace',
    domain: 'astrology',
    text: 'Saturn opposing Mars brings contraction.',
    authority: 'derived',
    renderBlocked: false,
    claimTypes: [],
    ...overrides,
  };
}

const authoritativeInput = makeInput({ authority: 'authoritative' });
const derivedInput = makeInput({ authority: 'derived' });
const fallbackInput = makeInput({ authority: 'fallback' });
const blockedInput = makeInput({ renderBlocked: true, blockReason: 'relative_time_not_allowed' });
const identityInput = makeInput({ claimTypes: ['identity_claim' as any] });
const intentInput = makeInput({ claimTypes: ['intent_attribution' as any] });
const relativeTimeInput = makeInput({ claimTypes: ['relative_time'] });
const assertiveDerived = makeInput({ authority: 'derived', assertivelyFramed: true });
const speculativeDerived = makeInput({ authority: 'derived', speculative: true });

// ─────────────────────────────────────────────────────────────────────────────
// 1. resolvePromptRole
// ─────────────────────────────────────────────────────────────────────────────

describe('resolvePromptRole', () => {
  test('authoritative, not blocked → fact', () => {
    expect(resolvePromptRole('authoritative', false, [])).toBe('fact');
  });

  test('derived, not blocked → interpretation', () => {
    expect(resolvePromptRole('derived', false, [])).toBe('interpretation');
  });

  test('fallback, not blocked → question_seed', () => {
    expect(resolvePromptRole('fallback', false, [])).toBe('question_seed');
  });

  test('any authority, renderBlocked → excluded', () => {
    expect(resolvePromptRole('authoritative', true, [])).toBe('excluded');
    expect(resolvePromptRole('derived', true, [])).toBe('excluded');
    expect(resolvePromptRole('fallback', true, [])).toBe('excluded');
  });

  test('identity_claim → excluded regardless of authority', () => {
    expect(resolvePromptRole('authoritative', false, ['identity_claim' as any])).toBe('excluded');
    expect(resolvePromptRole('derived', false, ['identity_claim' as any])).toBe('excluded');
  });

  test('relative_time → excluded', () => {
    expect(resolvePromptRole('derived', false, ['relative_time'])).toBe('excluded');
  });

  test('intent_attribution → excluded', () => {
    expect(resolvePromptRole('derived', false, ['intent_attribution' as any])).toBe('excluded');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2a. resolveEligibility — authoritative
// ─────────────────────────────────────────────────────────────────────────────

describe('resolveEligibility — authoritative', () => {
  test('allows all four surfaces', () => {
    const e = resolveEligibility('authoritative', false, []);
    expect(e.allowedInPrompt).toBe(true);
    expect(e.allowedInPractitionerView).toBe(true);
    expect(e.allowedInUserView).toBe(true);
    expect(e.allowedInMemory).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2b. resolveEligibility — derived
// ─────────────────────────────────────────────────────────────────────────────

describe('resolveEligibility — derived', () => {
  test('standard derived: allowed in prompt, practitioner, user, memory', () => {
    const e = resolveEligibility('derived', false, []);
    expect(e.allowedInPrompt).toBe(true);
    expect(e.allowedInPractitionerView).toBe(true);
    expect(e.allowedInUserView).toBe(true);
    expect(e.allowedInMemory).toBe(true);
  });

  test('assertively framed: excluded from user view', () => {
    const e = resolveEligibility('derived', false, [], { assertivelyFramed: true });
    expect(e.allowedInPrompt).toBe(true);
    expect(e.allowedInPractitionerView).toBe(true);
    expect(e.allowedInUserView).toBe(false);
    expect(e.allowedInMemory).toBe(true);
  });

  test('speculative: excluded from memory', () => {
    const e = resolveEligibility('derived', false, [], { speculative: true });
    expect(e.allowedInPrompt).toBe(true);
    expect(e.allowedInPractitionerView).toBe(true);
    expect(e.allowedInUserView).toBe(true);
    expect(e.allowedInMemory).toBe(false);
  });

  test('assertive + speculative: excluded from user view AND memory', () => {
    const e = resolveEligibility('derived', false, [], { assertivelyFramed: true, speculative: true });
    expect(e.allowedInUserView).toBe(false);
    expect(e.allowedInMemory).toBe(false);
    expect(e.allowedInPrompt).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2c. resolveEligibility — fallback
// ─────────────────────────────────────────────────────────────────────────────

describe('resolveEligibility — fallback', () => {
  test('fallback allowed in prompt only (as question_seed)', () => {
    const e = resolveEligibility('fallback', false, []);
    expect(e.allowedInPrompt).toBe(true);
    expect(e.allowedInPractitionerView).toBe(false);
    expect(e.allowedInUserView).toBe(false);
    expect(e.allowedInMemory).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2d. resolveEligibility — renderBlocked
// ─────────────────────────────────────────────────────────────────────────────

describe('resolveEligibility — renderBlocked', () => {
  test('blocked item excluded from all surfaces', () => {
    const e = resolveEligibility('authoritative', true, []);
    expect(e.allowedInPrompt).toBe(false);
    expect(e.allowedInPractitionerView).toBe(false);
    expect(e.allowedInUserView).toBe(false);
    expect(e.allowedInMemory).toBe(false);
  });

  test('blocked derived also excluded from all', () => {
    const e = resolveEligibility('derived', true, []);
    expect(e.allowedInPrompt).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2e. resolveEligibility — absolute exclusion claims
// ─────────────────────────────────────────────────────────────────────────────

describe('resolveEligibility — absolute exclusion claims', () => {
  test('identity_claim: excluded from all surfaces regardless of authority', () => {
    const e = resolveEligibility('authoritative', false, ['identity_claim' as any]);
    expect(e.allowedInPrompt).toBe(false);
    expect(e.allowedInPractitionerView).toBe(false);
    expect(e.allowedInUserView).toBe(false);
    expect(e.allowedInMemory).toBe(false);
  });

  test('relative_time: excluded from all surfaces', () => {
    const e = resolveEligibility('derived', false, ['relative_time']);
    expect(e.allowedInPrompt).toBe(false);
    expect(e.allowedInUserView).toBe(false);
    expect(e.allowedInMemory).toBe(false);
  });

  test('intent_attribution: excluded from user view and memory', () => {
    const e = resolveEligibility('derived', false, ['intent_attribution' as any]);
    // intent is strictly excluded from memory/user but classified same as absolute
    expect(e.allowedInUserView).toBe(false);
    expect(e.allowedInMemory).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. buildPromptIngressItem
// ─────────────────────────────────────────────────────────────────────────────

describe('buildPromptIngressItem', () => {
  test('authoritative: role=fact, all surfaces allowed', () => {
    const item = buildPromptIngressItem(authoritativeInput);
    expect(item.promptRole).toBe('fact');
    expect(item.allowedInPrompt).toBe(true);
    expect(item.allowedInUserView).toBe(true);
    expect(item.allowedInMemory).toBe(true);
  });

  test('derived: role=interpretation, standard eligibility', () => {
    const item = buildPromptIngressItem(derivedInput);
    expect(item.promptRole).toBe('interpretation');
    expect(item.allowedInPractitionerView).toBe(true);
    expect(item.allowedInUserView).toBe(true);
  });

  test('fallback: role=question_seed, prompt only', () => {
    const item = buildPromptIngressItem(fallbackInput);
    expect(item.promptRole).toBe('question_seed');
    expect(item.allowedInPrompt).toBe(true);
    expect(item.allowedInPractitionerView).toBe(false);
    expect(item.allowedInUserView).toBe(false);
    expect(item.allowedInMemory).toBe(false);
  });

  test('blocked: role=excluded, no surfaces', () => {
    const item = buildPromptIngressItem(blockedInput);
    expect(item.promptRole).toBe('excluded');
    expect(item.allowedInPrompt).toBe(false);
    expect(item.allowedInMemory).toBe(false);
  });

  test('identity_claim: role=excluded, all surfaces false', () => {
    const item = buildPromptIngressItem(identityInput);
    expect(item.promptRole).toBe('excluded');
    expect(item.allowedInPrompt).toBe(false);
    expect(item.allowedInUserView).toBe(false);
    expect(item.allowedInMemory).toBe(false);
  });

  test('relative_time: role=excluded', () => {
    const item = buildPromptIngressItem(relativeTimeInput);
    expect(item.promptRole).toBe('excluded');
    expect(item.allowedInPrompt).toBe(false);
  });

  test('assertively framed derived: excluded from user view', () => {
    const item = buildPromptIngressItem(assertiveDerived);
    expect(item.promptRole).toBe('interpretation');
    expect(item.allowedInPrompt).toBe(true);
    expect(item.allowedInUserView).toBe(false);
  });

  test('speculative derived: excluded from memory', () => {
    const item = buildPromptIngressItem(speculativeDerived);
    expect(item.promptRole).toBe('interpretation');
    expect(item.allowedInMemory).toBe(false);
    expect(item.allowedInPrompt).toBe(true);
  });

  test('preserves traceId, domain, text, blockReason', () => {
    const item = buildPromptIngressItem(blockedInput);
    expect(item.traceId).toBe('test:trace');
    expect(item.domain).toBe('astrology');
    expect(item.blockReason).toBe('relative_time_not_allowed');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. filter helpers
// ─────────────────────────────────────────────────────────────────────────────

describe('filter helpers', () => {
  const items: PromptIngressItem[] = [
    buildPromptIngressItem(authoritativeInput),
    buildPromptIngressItem(derivedInput),
    buildPromptIngressItem(fallbackInput),
    buildPromptIngressItem(blockedInput),
    buildPromptIngressItem(identityInput),
  ];

  test('filterForPrompt: excludes blocked and identity, includes fallback', () => {
    const filtered = filterForPrompt(items);
    const roles = filtered.map(i => i.promptRole);
    expect(roles).toContain('fact');
    expect(roles).toContain('interpretation');
    expect(roles).toContain('question_seed');
    expect(roles).not.toContain('excluded');
  });

  test('filterForPractitionerView: excludes fallback and blocked', () => {
    const filtered = filterForPractitionerView(items);
    expect(filtered.every(i => i.authority !== 'fallback')).toBe(true);
    expect(filtered.every(i => !i.renderBlocked)).toBe(true);
  });

  test('filterForUserView: only authoritative and non-assertive derived', () => {
    const filtered = filterForUserView(items);
    expect(filtered.some(i => i.authority === 'fallback')).toBe(false);
    expect(filtered.some(i => i.renderBlocked)).toBe(false);
  });

  test('filterForMemory: same as user view baseline (non-speculative)', () => {
    const filtered = filterForMemory(items);
    expect(filtered.some(i => i.authority === 'fallback')).toBe(false);
    expect(filtered.some(i => i.renderBlocked)).toBe(false);
  });

  test('filterForMemory: stricter — speculative derived excluded', () => {
    const withSpeculative = [
      buildPromptIngressItem(derivedInput),
      buildPromptIngressItem(speculativeDerived),
    ];
    const filtered = filterForMemory(withSpeculative);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].allowedInMemory).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. assemblePromptBlock
// ─────────────────────────────────────────────────────────────────────────────

describe('assemblePromptBlock', () => {
  test('groups items by promptRole correctly', () => {
    const items = [
      buildPromptIngressItem(authoritativeInput),
      buildPromptIngressItem(derivedInput),
      buildPromptIngressItem(fallbackInput),
      buildPromptIngressItem(blockedInput),
    ];
    const block = assemblePromptBlock(items);
    expect(block.facts).toHaveLength(1);
    expect(block.interpretations).toHaveLength(1);
    expect(block.questionSeeds).toHaveLength(1);
    expect(block.excludedCount).toBe(1);
    expect(block.uncertainties).toHaveLength(0);
  });

  test('excluded items never appear in text arrays', () => {
    const items = [
      buildPromptIngressItem(identityInput),
      buildPromptIngressItem(blockedInput),
      buildPromptIngressItem(relativeTimeInput),
    ];
    const block = assemblePromptBlock(items);
    expect(block.facts).toHaveLength(0);
    expect(block.interpretations).toHaveLength(0);
    expect(block.questionSeeds).toHaveLength(0);
    expect(block.excludedCount).toBe(3);
  });

  test('uncertainty role items go into uncertainties array', () => {
    const uncertaintyItem: PromptIngressItem = {
      ...buildPromptIngressItem(derivedInput),
      promptRole: 'uncertainty',
      text: 'Multiple signals present but point in different directions.',
    };
    const block = assemblePromptBlock([uncertaintyItem]);
    expect(block.uncertainties).toHaveLength(1);
    expect(block.uncertainties[0]).toContain('different directions');
  });

  test('empty items: all arrays empty, excludedCount zero', () => {
    const block = assemblePromptBlock([]);
    expect(block.facts).toHaveLength(0);
    expect(block.excludedCount).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. buildPromptIngressAuditSummary
// ─────────────────────────────────────────────────────────────────────────────

describe('buildPromptIngressAuditSummary', () => {
  const items = [
    buildPromptIngressItem(authoritativeInput),
    buildPromptIngressItem(derivedInput),
    buildPromptIngressItem(fallbackInput),
    buildPromptIngressItem(blockedInput),
    buildPromptIngressItem(identityInput),
  ];

  test('totalItems correct', () => {
    const summary = buildPromptIngressAuditSummary(items);
    expect(summary.totalItems).toBe(5);
  });

  test('byRole counts correct', () => {
    const summary = buildPromptIngressAuditSummary(items);
    expect(summary.byRole.fact).toBe(1);
    expect(summary.byRole.interpretation).toBe(1);
    expect(summary.byRole.question_seed).toBe(1);
    expect(summary.byRole.excluded).toBe(2); // blocked + identity
  });

  test('byAuthority counts correct', () => {
    const summary = buildPromptIngressAuditSummary(items);
    expect(summary.byAuthority.authoritative).toBe(1);
    expect(summary.byAuthority.derived).toBe(3); // derived + blocked(derived) + identity(derived)
    expect(summary.byAuthority.fallback).toBe(1);
  });

  test('excludedFromAll counts items blocked from every surface', () => {
    const summary = buildPromptIngressAuditSummary(items);
    // blocked + identity → both excluded from all surfaces
    expect(summary.excludedFromAll).toBe(2);
  });

  test('surface counts consistent with eligibility', () => {
    const summary = buildPromptIngressAuditSummary(items);
    // authoritative + derived + fallback = 3 in prompt
    expect(summary.allowedInPrompt).toBe(3);
    // authoritative + derived = 2 in practitioner
    expect(summary.allowedInPractitionerView).toBe(2);
    // authoritative + derived = 2 in user view
    expect(summary.allowedInUserView).toBe(2);
    // authoritative + derived = 2 in memory
    expect(summary.allowedInMemory).toBe(2);
  });

  test('empty: all zeros', () => {
    const summary = buildPromptIngressAuditSummary([]);
    expect(summary.totalItems).toBe(0);
    expect(summary.excludedFromAll).toBe(0);
  });
});
