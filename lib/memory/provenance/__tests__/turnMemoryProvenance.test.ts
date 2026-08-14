/**
 * CC-A — per-turn memory provenance telemetry.
 *
 * The load-bearing assertion in this file is the absent / present-but-empty split. The
 * production fork tests `!memoryContext`, which is true for BOTH `undefined` and `''`, so
 * the two conditions are indistinguishable there. An absent bundle is what opens a second
 * authority path; an empty bundle may be legitimate retrieval that found nothing. These
 * tests pin the distinction so it cannot silently collapse again.
 */

import {
  MEMORY_PROVENANCE_CONTRACT_VERSION,
  buildTurnMemoryProvenance,
  classifyBundleState,
  digest,
  emitTurnMemoryProvenance,
  fallbackReasonFor,
  type MemoryBundleState,
} from '../turnMemoryProvenance';

describe('classifyBundleState — the decisive distinction', () => {
  it('separates an absent bundle from a present-but-empty one', () => {
    expect(classifyBundleState(undefined)).toBe('absent');
    expect(classifyBundleState(null)).toBe('absent');
    expect(classifyBundleState('')).toBe('present_empty');
    expect(classifyBundleState('   \n  ')).toBe('present_empty');
    expect(classifyBundleState('relationship: 4 encounters')).toBe('present_nonempty');
  });

  it('does not reproduce the production fork\'s falsy collapse', () => {
    // Both of these are `!memoryContext === true` at the fork, yet they are different facts.
    const absent = classifyBundleState(undefined);
    const empty = classifyBundleState('');
    expect(absent).not.toBe(empty);
  });

  it('reports sanctuary suppression as its own state, not as absence', () => {
    expect(classifyBundleState(undefined, { sanctuary: true })).toBe('suppressed_sanctuary');
    expect(classifyBundleState('material', { sanctuary: true })).toBe('suppressed_sanctuary');
  });
});

describe('fallbackReasonFor', () => {
  it('attributes the two failure modes distinctly', () => {
    expect(fallbackReasonFor('absent', { hasMemberIdentity: true })).toBe('bundle_absent');
    expect(fallbackReasonFor('present_empty', { hasMemberIdentity: true })).toBe(
      'bundle_present_empty'
    );
  });

  it('reports no attempt when the canonical bundle supplied material', () => {
    expect(fallbackReasonFor('present_nonempty', { hasMemberIdentity: true })).toBe('not_attempted');
  });

  it('lets identity and sanctuary outrank bundle state', () => {
    expect(fallbackReasonFor('absent', { hasMemberIdentity: false })).toBe('no_member_identity');
    expect(fallbackReasonFor('suppressed_sanctuary', { hasMemberIdentity: true })).toBe(
      'suppressed_sanctuary'
    );
  });
});

describe('privacy contract', () => {
  it('digest never returns the input and is stable', () => {
    const secret = 'the member said something private';
    const d = digest(secret)!;
    expect(d).not.toContain('member');
    expect(d).toHaveLength(12);
    expect(digest(secret)).toBe(d);
    expect(digest('different')).not.toBe(d);
  });

  it('digest passes undefined through rather than hashing a placeholder', () => {
    expect(digest(undefined)).toBeUndefined();
    expect(digest(null)).toBeUndefined();
  });

  it('a built record carries no free text beyond declared enums and identifiers', () => {
    const record = buildTurnMemoryProvenance({
      route: 'api/sovereign/app/maia/list',
      tier: 'FAST',
      sanctuary: false,
      bundleState: 'absent',
      bundleConsulted: true,
      fallbackInvoked: true,
      fallbackReason: 'bundle_absent',
      memoryOrchestratorDirect: true,
      contextOrigin: 'fallback',
      sources: [{ sourceClass: 'memory_orchestrator_recall', requested: true, returnedMaterial: true, itemCount: 3 }],
      contextDigest: digest('some assembled memory context'),
      contextChars: 29,
      buildSha: 'abc1234',
    });

    const serialized = JSON.stringify(record);
    expect(serialized).not.toContain('some assembled memory context');
    expect(record.contextChars).toBe(29);
    expect(record.contractVersion).toBe(MEMORY_PROVENANCE_CONTRACT_VERSION);
  });
});

describe('provenanceId', () => {
  it('is stable for identical provenance and differs when the fork outcome differs', () => {
    const base = {
      route: 'api/sovereign/app/maia/list',
      tier: 'FAST' as const,
      sanctuary: false,
      bundleConsulted: true,
      memoryOrchestratorDirect: false,
      sources: [],
      contextChars: 0,
      buildSha: 'abc1234',
    };

    const canonical = buildTurnMemoryProvenance({
      ...base,
      bundleState: 'present_nonempty' as MemoryBundleState,
      fallbackInvoked: false,
      fallbackReason: 'not_attempted',
      contextOrigin: 'canonical_bundle',
    });
    const canonicalAgain = buildTurnMemoryProvenance({
      ...base,
      bundleState: 'present_nonempty' as MemoryBundleState,
      fallbackInvoked: false,
      fallbackReason: 'not_attempted',
      contextOrigin: 'canonical_bundle',
    });
    const viaFallback = buildTurnMemoryProvenance({
      ...base,
      bundleState: 'absent' as MemoryBundleState,
      fallbackInvoked: true,
      fallbackReason: 'bundle_absent',
      memoryOrchestratorDirect: true,
      contextOrigin: 'fallback',
    });

    expect(canonical.provenanceId).toBe(canonicalAgain.provenanceId);
    expect(canonical.provenanceId).not.toBe(viaFallback.provenanceId);
  });

  it('falls back to "unknown" build sha rather than inventing provenance', () => {
    const prior = process.env.GIT_COMMIT;
    delete process.env.GIT_COMMIT;
    try {
      const record = buildTurnMemoryProvenance({
        route: 'r',
        tier: 'FAST',
        sanctuary: false,
        bundleState: 'absent',
        bundleConsulted: true,
        fallbackInvoked: false,
        fallbackReason: 'not_attempted',
        memoryOrchestratorDirect: false,
        contextOrigin: 'none',
        sources: [],
        contextChars: 0,
      });
      expect(record.buildSha).toBe('unknown');
    } finally {
      if (prior !== undefined) process.env.GIT_COMMIT = prior;
    }
  });
});

describe('emission is never able to fail a turn', () => {
  it('returns the record even when the logger throws', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {
      throw new Error('stdout gone');
    });
    try {
      const record = buildTurnMemoryProvenance({
        route: 'r',
        tier: 'FAST',
        sanctuary: false,
        bundleState: 'absent',
        bundleConsulted: true,
        fallbackInvoked: false,
        fallbackReason: 'not_attempted',
        memoryOrchestratorDirect: false,
        contextOrigin: 'none',
        sources: [],
        contextChars: 0,
      });
      expect(() => emitTurnMemoryProvenance(record)).not.toThrow();
      expect(emitTurnMemoryProvenance(record)).toBe(record);
    } finally {
      spy.mockRestore();
    }
  });
});
