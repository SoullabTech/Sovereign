/**
 * CMT-01 Participation Disposition Contract — pinned.
 *
 * These tests pin the CONTRACT, not any adjudication behaviour: the closed disposition set,
 * HELD ≠ EXCLUDED as a structural (disjoint reason sets) fact, HELD outside the speaking set,
 * AVAILABLE never final, and the manifest entry shape carrying class/count/reason only.
 * Governing document: docs/programme/CMT-01_PARTICIPATION_DISPOSITION_CONTRACT.md
 */
import {
  PARTICIPATION_CONTRACT_VERSION,
  PARTICIPATION_DISPOSITIONS,
  FINAL_DISPOSITIONS,
  SPEAKING_DISPOSITIONS,
  HELD_REASON_CODES,
  EXCLUDED_REASON_CODES,
  mayEnterSpeakingContext,
  assertManifestEntry,
  assertTurnDispositioned,
} from '../participationDisposition';

describe('CMT-01 participation disposition contract', () => {
  it('is the five-state closed set, in adjudication order', () => {
    expect(PARTICIPATION_CONTRACT_VERSION).toBe('pdc-1');
    expect([...PARTICIPATION_DISPOSITIONS]).toEqual(['AVAILABLE', 'HELD', 'OFFERED', 'ADMITTED', 'EXCLUDED']);
  });

  it('AVAILABLE is the only non-final disposition', () => {
    expect([...FINAL_DISPOSITIONS]).toEqual(['HELD', 'OFFERED', 'ADMITTED', 'EXCLUDED']);
    expect(FINAL_DISPOSITIONS as readonly string[]).not.toContain('AVAILABLE');
  });

  it('HELD content never enters the speaking context (invariant 1)', () => {
    expect([...SPEAKING_DISPOSITIONS]).toEqual(['OFFERED', 'ADMITTED']);
    expect(mayEnterSpeakingContext('HELD')).toBe(false);
    expect(mayEnterSpeakingContext('EXCLUDED')).toBe(false);
    expect(mayEnterSpeakingContext('AVAILABLE')).toBe(false);
    expect(mayEnterSpeakingContext('OFFERED')).toBe(true);
    expect(mayEnterSpeakingContext('ADMITTED')).toBe(true);
  });

  it('HELD ≠ EXCLUDED is structural: reason-code sets are disjoint and non-empty', () => {
    const held = new Set<string>(HELD_REASON_CODES);
    const excluded = new Set<string>(EXCLUDED_REASON_CODES);
    expect(held.size).toBeGreaterThan(0);
    expect(excluded.size).toBeGreaterThan(0);
    for (const code of held) expect(excluded.has(code)).toBe(false);
  });

  it('a HELD entry cannot be built with an eligibility reason, nor EXCLUDED with a judgment reason', () => {
    expect(() =>
      assertManifestEntry({ epistemicClass: 'cross_domain_hypothesis', disposition: 'HELD', count: 1, reasonCode: 'NO_PERMISSION' }),
    ).toThrow(/HELD entry requires a HELD reason code/);
    expect(() =>
      assertManifestEntry({ epistemicClass: 'x', disposition: 'EXCLUDED', count: 1, reasonCode: 'WITHHELD_BY_JUDGMENT' }),
    ).toThrow(/EXCLUDED entry requires an EXCLUDED reason code/);
  });

  it('the manifest carries class / count / reason only — a body under any key is refused (invariant 3)', () => {
    for (const bodyKey of ['body', 'content', 'text', 'hypothesis', 'summary', 'prompt']) {
      expect(() =>
        assertManifestEntry({ epistemicClass: 'x', disposition: 'HELD', count: 1, reasonCode: 'NO_SURFACING_WARRANT', [bodyKey]: 'threshold pattern' }),
      ).toThrow(/non-contract key/);
    }
  });

  it('accepts the CDPI Reading-B shape: HELD count + reason, no hypothesis body', () => {
    const entry = { epistemicClass: 'cross_domain_hypothesis', disposition: 'HELD', count: 1, reasonCode: 'NO_SURFACING_WARRANT' };
    expect(() => assertManifestEntry(entry)).not.toThrow();
    expect(Object.keys(entry).sort()).toEqual(['count', 'disposition', 'epistemicClass', 'reasonCode']);
  });

  it('OFFERED / ADMITTED entries carry no reason code', () => {
    expect(() => assertManifestEntry({ epistemicClass: 'x', disposition: 'ADMITTED', count: 2 })).not.toThrow();
    expect(() =>
      assertManifestEntry({ epistemicClass: 'x', disposition: 'OFFERED', count: 1, reasonCode: 'NO_RETURN_WARRANT' }),
    ).toThrow(/may not carry a reason code/);
  });

  it('a completed turn leaves nothing AVAILABLE', () => {
    expect(() =>
      assertTurnDispositioned([
        { epistemicClass: 'memory_bundle', disposition: 'ADMITTED', count: 3 },
        { epistemicClass: 'cross_domain_hypothesis', disposition: 'AVAILABLE', count: 1 },
      ]),
    ).toThrow(/left a candidate AVAILABLE/);
    expect(() =>
      assertTurnDispositioned([
        { epistemicClass: 'memory_bundle', disposition: 'ADMITTED', count: 3 },
        { epistemicClass: 'cross_domain_hypothesis', disposition: 'HELD', count: 1, reasonCode: 'NO_SURFACING_WARRANT' },
        { epistemicClass: 'sanctuary_material', disposition: 'EXCLUDED', count: 0, reasonCode: 'SANCTUARY' },
      ]),
    ).not.toThrow();
  });

  it('refuses malformed counts and empty classes', () => {
    expect(() => assertManifestEntry({ epistemicClass: '', disposition: 'ADMITTED', count: 1 })).toThrow(/epistemicClass/);
    expect(() => assertManifestEntry({ epistemicClass: 'x', disposition: 'ADMITTED', count: -1 })).toThrow(/count/);
    expect(() => assertManifestEntry({ epistemicClass: 'x', disposition: 'ADMITTED', count: 1.5 })).toThrow(/count/);
  });
});
