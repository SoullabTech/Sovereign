/**
 * CROSS-DOMAIN GOVERNANCE TESTS — Phase 15
 *
 * Covers:
 *   1. resolveAuthority — weakest-wins rule
 *   2. assessDomainAgreement — convergence/divergence detection
 *   3. validateCrossDomainSynthesis — all blocking rules
 *      a. insufficient domains (<2)
 *      b. contributing domain blocked
 *      c. relative time in any domain
 *      d. identity claim in any domain
 *      e. all contributions fallback
 *      f. domain disagreement
 *      g. valid synthesis permitted
 *   4. buildCrossDomainSynthesisItem — item construction
 *   5. buildUncertaintyStatement — disagreement text
 *   6. buildCrossDomainAuditSummary — batch metrics
 */

import {
  resolveAuthority,
  assessDomainAgreement,
  validateCrossDomainSynthesis,
  buildCrossDomainSynthesisItem,
  buildUncertaintyStatement,
  buildCrossDomainAuditSummary,
} from '@/lib/symbolic/crossDomainGovernance';

import type {
  DomainContribution,
  CrossDomainSynthesisItem,
} from '@/lib/symbolic/crossDomainGovernance';

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

const astrologyDerived: DomainContribution = {
  domain: 'astrology',
  traceId: 'mars:saturn/opposition',
  authority: 'derived',
  renderBlocked: false,
  claimTypes: [],
  contributionSummary: 'Saturn opposing Mars suggests contraction and resistance to forward movement.',
};

const journalDerived: DomainContribution = {
  domain: 'journal',
  traceId: 'journal:fire',
  authority: 'derived',
  renderBlocked: false,
  claimTypes: [],
  contributionSummary: 'Journal entries show repeated contraction around action and initiation.',
};

const fieldDerived: DomainContribution = {
  domain: 'field',
  traceId: 'field:tone',
  authority: 'derived',
  renderBlocked: false,
  claimTypes: [],
  contributionSummary: 'Tone signals indicate contraction and withdrawal in the current exchange.',
};

const patternDerived: DomainContribution = {
  domain: 'pattern_ledger',
  traceId: 'pattern:c1',
  authority: 'derived',
  renderBlocked: false,
  claimTypes: [],
  contributionSummary: 'Pattern candidate shows recurring contraction around high-stakes decisions.',
};

const astrologyAuthoritative: DomainContribution = {
  ...astrologyDerived,
  authority: 'authoritative',
};

const astrologyFallback: DomainContribution = {
  ...astrologyDerived,
  authority: 'fallback',
};

const journalFallback: DomainContribution = {
  ...journalDerived,
  authority: 'fallback',
};

const blockedContribution: DomainContribution = {
  ...journalDerived,
  renderBlocked: true,
  blockReason: 'relative_time_not_allowed',
};

const identityContribution: DomainContribution = {
  ...fieldDerived,
  claimTypes: ['identity_claim'],
  contributionSummary: 'Field signals suggest you are an avoidant person.',
};

const relativeTimeContribution: DomainContribution = {
  ...astrologyDerived,
  claimTypes: ['relative_time'],
  contributionSummary: 'Tomorrow brings a shift in the transiting field.',
};

const expandingContribution: DomainContribution = {
  domain: 'field',
  traceId: 'field:expansion',
  authority: 'derived',
  renderBlocked: false,
  claimTypes: [],
  contributionSummary: 'Field shows expansion and warmth emerging in the exchange.',
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. resolveAuthority — weakest wins
// ─────────────────────────────────────────────────────────────────────────────

describe('resolveAuthority', () => {
  test('all derived → derived', () => {
    expect(resolveAuthority([astrologyDerived, journalDerived])).toBe('derived');
  });

  test('one authoritative + one derived → derived (weakest wins)', () => {
    expect(resolveAuthority([astrologyAuthoritative, journalDerived])).toBe('derived');
  });

  test('one fallback + one derived → fallback', () => {
    expect(resolveAuthority([astrologyFallback, journalDerived])).toBe('fallback');
  });

  test('all authoritative → authoritative', () => {
    expect(resolveAuthority([astrologyAuthoritative, { ...journalDerived, authority: 'authoritative' }])).toBe('authoritative');
  });

  test('all fallback → fallback', () => {
    expect(resolveAuthority([astrologyFallback, journalFallback])).toBe('fallback');
  });

  test('empty contributions → fallback', () => {
    expect(resolveAuthority([])).toBe('fallback');
  });

  test('THREE derived domains: does NOT produce authoritative', () => {
    expect(resolveAuthority([astrologyDerived, journalDerived, patternDerived])).toBe('derived');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. assessDomainAgreement
// ─────────────────────────────────────────────────────────────────────────────

describe('assessDomainAgreement', () => {
  test('all contracting → converging', () => {
    const result = assessDomainAgreement([astrologyDerived, journalDerived, fieldDerived]);
    expect(result).toBe('converging');
  });

  test('contracting + expanding → diverging', () => {
    const result = assessDomainAgreement([astrologyDerived, expandingContribution]);
    expect(result).toBe('diverging');
  });

  test('neutral summaries → uncertain', () => {
    const neutral: DomainContribution = {
      ...astrologyDerived,
      contributionSummary: 'Some elemental quality is present.',
    };
    const result = assessDomainAgreement([neutral, { ...journalDerived, contributionSummary: 'Something is here.' }]);
    expect(result).toBe('uncertain');
  });

  test('single contribution → uncertain', () => {
    expect(assessDomainAgreement([astrologyDerived])).toBe('uncertain');
  });

  test('empty → uncertain', () => {
    expect(assessDomainAgreement([])).toBe('uncertain');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3a. validateCrossDomainSynthesis — insufficient domains
// ─────────────────────────────────────────────────────────────────────────────

describe('validateCrossDomainSynthesis — insufficient domains', () => {
  test('single contribution: blocked', () => {
    const result = validateCrossDomainSynthesis([astrologyDerived]);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('insufficient_domains');
  });

  test('two contributions from same domain: blocked', () => {
    const astro2 = { ...astrologyDerived, traceId: 'mars:jupiter/trine' };
    const result = validateCrossDomainSynthesis([astrologyDerived, astro2]);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('insufficient_domains');
  });

  test('empty: blocked', () => {
    const result = validateCrossDomainSynthesis([]);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('insufficient_domains');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3b. validateCrossDomainSynthesis — blocked contributing domain
// ─────────────────────────────────────────────────────────────────────────────

describe('validateCrossDomainSynthesis — contributing domain blocked', () => {
  test('blocked regardless of other contributions', () => {
    const result = validateCrossDomainSynthesis([astrologyDerived, blockedContribution]);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('contributing_domain_blocked');
  });

  test('blocked even when blocked item is just one of three domains', () => {
    const result = validateCrossDomainSynthesis([astrologyDerived, fieldDerived, blockedContribution]);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('contributing_domain_blocked');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3c. validateCrossDomainSynthesis — relative time in any domain
// ─────────────────────────────────────────────────────────────────────────────

describe('validateCrossDomainSynthesis — relative time', () => {
  test('blocked when one contribution has relative_time claim', () => {
    const result = validateCrossDomainSynthesis([relativeTimeContribution, journalDerived]);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('relative_time_in_any_domain');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3d. validateCrossDomainSynthesis — identity claim in any domain
// ─────────────────────────────────────────────────────────────────────────────

describe('validateCrossDomainSynthesis — identity claim', () => {
  test('blocked when one contribution has identity_claim', () => {
    const result = validateCrossDomainSynthesis([astrologyDerived, identityContribution]);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('identity_claim_multi_domain');
  });

  test('blocked even when all four domains weakly suggest it', () => {
    const identityInEachDomain = [
      { ...astrologyDerived, claimTypes: ['identity_claim'] as any },
      { ...journalDerived, claimTypes: ['identity_claim'] as any },
      { ...fieldDerived, claimTypes: ['identity_claim'] as any },
      { ...patternDerived, claimTypes: ['identity_claim'] as any },
    ];
    const result = validateCrossDomainSynthesis(identityInEachDomain);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('identity_claim_multi_domain');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3e. validateCrossDomainSynthesis — all contributions fallback
// ─────────────────────────────────────────────────────────────────────────────

describe('validateCrossDomainSynthesis — all fallback', () => {
  test('blocked when every contribution is fallback authority', () => {
    const result = validateCrossDomainSynthesis([astrologyFallback, journalFallback]);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('all_contributions_fallback');
  });

  test('passes when at least one contribution is derived', () => {
    const result = validateCrossDomainSynthesis([astrologyDerived, journalFallback]);
    // Should not fail on all_contributions_fallback (may still fail on other rules)
    expect(result.reason).not.toBe('all_contributions_fallback');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3f. validateCrossDomainSynthesis — domain disagreement
// ─────────────────────────────────────────────────────────────────────────────

describe('validateCrossDomainSynthesis — domain disagreement', () => {
  test('blocked when contributions diverge (contraction vs expansion)', () => {
    const result = validateCrossDomainSynthesis([astrologyDerived, expandingContribution]);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('domain_disagreement');
    expect(result.domainAgreement).toBe('diverging');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3g. validateCrossDomainSynthesis — valid synthesis permitted
// ─────────────────────────────────────────────────────────────────────────────

describe('validateCrossDomainSynthesis — valid synthesis', () => {
  test('two derived converging contributions: permitted', () => {
    const result = validateCrossDomainSynthesis([astrologyDerived, journalDerived]);
    expect(result.ok).toBe(true);
    expect(result.reason).toBe('synthesis_permitted');
    expect(result.resolvedAuthority).toBe('derived');
  });

  test('three converging domains: permitted with derived authority', () => {
    const result = validateCrossDomainSynthesis([astrologyDerived, journalDerived, fieldDerived]);
    expect(result.ok).toBe(true);
    expect(result.resolvedAuthority).toBe('derived');
  });

  test('one authoritative + one derived: permitted but authority resolves to derived', () => {
    const result = validateCrossDomainSynthesis([astrologyAuthoritative, journalDerived]);
    expect(result.ok).toBe(true);
    expect(result.resolvedAuthority).toBe('derived');
  });

  test('converging uncertain (neutral text): permitted', () => {
    const neutral1 = { ...astrologyDerived, contributionSummary: 'Something is present.' };
    const neutral2 = { ...journalDerived, contributionSummary: 'A quality appears here.' };
    const result = validateCrossDomainSynthesis([neutral1, neutral2]);
    expect(result.ok).toBe(true);
    expect(result.domainAgreement).toBe('uncertain');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. buildCrossDomainSynthesisItem
// ─────────────────────────────────────────────────────────────────────────────

describe('buildCrossDomainSynthesisItem', () => {
  test('valid synthesis: text preserved, renderBlocked false', () => {
    const item = buildCrossDomainSynthesisItem(
      'synth-1',
      'There may be a pattern of contraction across multiple domains.',
      [astrologyDerived, journalDerived],
      'cross:contraction:1'
    );
    expect(item.renderBlocked).toBe(false);
    expect(item.text).toContain('contraction');
    expect(item.authority).toBe('derived');
    expect(item.supportingDomains).toContain('astrology');
    expect(item.supportingDomains).toContain('journal');
  });

  test('supportingIds use domain:traceId format', () => {
    const item = buildCrossDomainSynthesisItem(
      'synth-2',
      'Contraction across domains.',
      [astrologyDerived, journalDerived],
      'cross:contraction:2'
    );
    expect(item.supportingIds).toContain('astrology:mars:saturn/opposition');
    expect(item.supportingIds).toContain('journal:journal:fire');
  });

  test('blocked synthesis: text cleared, blockReason set', () => {
    const item = buildCrossDomainSynthesisItem(
      'synth-3',
      'You are a withdrawn person across all domains.',
      [astrologyDerived, identityContribution],
      'cross:identity:blocked'
    );
    expect(item.renderBlocked).toBe(true);
    expect(item.text).toBe('');
    expect(item.blockReason).toBe('identity_claim_multi_domain');
  });

  test('deduplicates supportingDomains', () => {
    const astro2 = { ...astrologyDerived, traceId: 'moon:venus/trine' };
    const item = buildCrossDomainSynthesisItem(
      'synth-4',
      'Some text.',
      [astrologyDerived, astro2, journalDerived],
      'cross:dedup'
    );
    const astrologyCount = item.supportingDomains.filter(d => d === 'astrology').length;
    expect(astrologyCount).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. buildUncertaintyStatement
// ─────────────────────────────────────────────────────────────────────────────

describe('buildUncertaintyStatement', () => {
  test('domain_disagreement: mentions domains, does not assert', () => {
    const text = buildUncertaintyStatement([astrologyDerived, expandingContribution], 'domain_disagreement');
    expect(text).toMatch(/different directions|clarify/i);
    expect(text).not.toMatch(/you are|you feel/i);
  });

  test('identity_claim_multi_domain: explicitly declines identity claim', () => {
    const text = buildUncertaintyStatement([astrologyDerived, identityContribution], 'identity_claim_multi_domain');
    expect(text).toMatch(/who you are/i);
  });

  test('all_contributions_fallback: notes grounding insufficiency', () => {
    const text = buildUncertaintyStatement([astrologyFallback, journalFallback], 'all_contributions_fallback');
    expect(text).toMatch(/not yet grounded/i);
  });

  test('relative_time_in_any_domain: notes timing uncertainty', () => {
    const text = buildUncertaintyStatement([relativeTimeContribution, journalDerived], 'relative_time_in_any_domain');
    expect(text).toMatch(/timing/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. buildCrossDomainAuditSummary
// ─────────────────────────────────────────────────────────────────────────────

describe('buildCrossDomainAuditSummary', () => {
  const permitted: CrossDomainSynthesisItem = {
    id: 's1', text: 'Contraction across domains.', supportingDomains: ['astrology', 'journal'],
    supportingIds: [], authority: 'derived', renderBlocked: false, traceId: 'c:1', domainAgreement: 'converging',
  };
  const blockedByDivergence: CrossDomainSynthesisItem = {
    id: 's2', text: '', supportingDomains: ['astrology', 'field'],
    supportingIds: [], authority: 'derived', renderBlocked: true,
    blockReason: 'domain_disagreement', traceId: 'c:2', domainAgreement: 'diverging',
  };
  const blockedByIdentity: CrossDomainSynthesisItem = {
    id: 's3', text: '', supportingDomains: ['journal', 'pattern_ledger'],
    supportingIds: [], authority: 'fallback', renderBlocked: true,
    blockReason: 'identity_claim_multi_domain', traceId: 'c:3', domainAgreement: 'uncertain',
  };

  test('counts permitted and blocked correctly', () => {
    const summary = buildCrossDomainAuditSummary([permitted, blockedByDivergence, blockedByIdentity]);
    expect(summary.totalSynthesisAttempts).toBe(3);
    expect(summary.permittedSyntheses).toBe(1);
    expect(summary.blockedSyntheses).toBe(2);
  });

  test('blockReasonCounts tallied by reason', () => {
    const summary = buildCrossDomainAuditSummary([permitted, blockedByDivergence, blockedByIdentity]);
    expect(summary.blockReasonCounts['domain_disagreement']).toBe(1);
    expect(summary.blockReasonCounts['identity_claim_multi_domain']).toBe(1);
  });

  test('domainsRepresented aggregates all domains without duplication', () => {
    const summary = buildCrossDomainAuditSummary([permitted, blockedByDivergence, blockedByIdentity]);
    expect(summary.domainsRepresented).toContain('astrology');
    expect(summary.domainsRepresented).toContain('journal');
    expect(summary.domainsRepresented).toContain('field');
    expect(summary.domainsRepresented).toContain('pattern_ledger');
    // No duplicates
    const astrologyCount = summary.domainsRepresented.filter(d => d === 'astrology').length;
    expect(astrologyCount).toBe(1);
  });

  test('empty items: all zeros', () => {
    const summary = buildCrossDomainAuditSummary([]);
    expect(summary.totalSynthesisAttempts).toBe(0);
    expect(summary.permittedSyntheses).toBe(0);
    expect(summary.domainsRepresented).toHaveLength(0);
  });
});
