/**
 * CMT-01 Participation Disposition Contract — pinned.
 * Pins the CONTRACT (shapes, closed sets, invariants), not adjudication behaviour.
 * Governing document: docs/programme/CMT-01_PARTICIPATION_DISPOSITION_CONTRACT.md
 */
import {
  PARTICIPATION_CONTRACT_VERSION, PARTICIPATION_DISPOSITIONS, FINAL_DISPOSITIONS, SPEAKING_DISPOSITIONS,
  AUTHORED_BY, PARTICIPATION_CLASS, AUTHORITY, LEGACY_EPISTEMIC_CLASS_TO_AXES,
  HELD_REASONS, OFFERED_REASONS, ADMITTED_REASONS, EXCLUDED_REASONS,
  mayEnterSpeakingContext, assertManifestEntry, assertTurnDispositioned,
} from '../participationDisposition';

const axes = { authoredBy: 'member', participationClass: 'placed', authority: 'situate' } as const;
const held = { producerId: 'inferred.cross_domain_hypothesis', authoredBy: 'system', participationClass: 'inferred', authority: 'infer', disposition: 'HELD', reason: 'no_surfacing_warrant' } as const;
const admitted = { producerId: 'member.atoms', ...axes, disposition: 'ADMITTED', reason: 'member_placed', chars: 412, blockDigest: 'ab12', itemCount: 3 } as const;

describe('CMT-01 participation disposition contract (pdc-1)', () => {
  it('five-state closed set in adjudication order; AVAILABLE is the only non-final state', () => {
    expect(PARTICIPATION_CONTRACT_VERSION).toBe('pdc-1');
    expect([...PARTICIPATION_DISPOSITIONS]).toEqual(['AVAILABLE', 'HELD', 'OFFERED', 'ADMITTED', 'EXCLUDED']);
    expect([...FINAL_DISPOSITIONS]).toEqual(['HELD', 'OFFERED', 'ADMITTED', 'EXCLUDED']);
  });

  it('provenance is three closed axes, and every legacy scalar class maps onto them', () => {
    expect([...AUTHORED_BY]).toEqual(['house', 'member', 'practitioner', 'system', 'collective']);
    expect([...PARTICIPATION_CLASS]).toEqual(['constitutional', 'authored', 'placed', 'marked', 'declared', 'retrieved', 'computed', 'inferred', 'collective']);
    expect([...AUTHORITY]).toEqual(['situate', 'compute', 'infer']);
    for (const v of Object.values(LEGACY_EPISTEMIC_CLASS_TO_AXES)) {
      expect(AUTHORED_BY).toContain(v.authoredBy);
      expect(PARTICIPATION_CLASS).toContain(v.participationClass);
      expect(AUTHORITY).toContain(v.authority);
    }
    expect(LEGACY_EPISTEMIC_CLASS_TO_AXES.system_inferred).toEqual({ authoredBy: 'system', participationClass: 'inferred', authority: 'infer' });
  });

  it('HELD content never enters the speaking context', () => {
    expect([...SPEAKING_DISPOSITIONS]).toEqual(['OFFERED', 'ADMITTED']);
    expect(mayEnterSpeakingContext('HELD')).toBe(false);
    expect(mayEnterSpeakingContext('EXCLUDED')).toBe(false);
    expect(mayEnterSpeakingContext('AVAILABLE')).toBe(false);
    expect(mayEnterSpeakingContext('OFFERED')).toBe(true);
    expect(mayEnterSpeakingContext('ADMITTED')).toBe(true);
  });

  it('reason families are non-empty and pairwise disjoint — HELD ≠ EXCLUDED is structural', () => {
    const fams = [HELD_REASONS, OFFERED_REASONS, ADMITTED_REASONS, EXCLUDED_REASONS].map((f) => new Set<string>(f));
    for (const f of fams) expect(f.size).toBeGreaterThan(0);
    for (let i = 0; i < fams.length; i++) for (let j = i + 1; j < fams.length; j++) for (const c of fams[i]) expect(fams[j].has(c)).toBe(false);
  });

  it('every final disposition requires a reason from its own family — OFFERED and ADMITTED included', () => {
    expect(() => assertManifestEntry({ ...held, reason: 'no_permission' })).toThrow(/HELD requires a reason from the HELD family/);
    expect(() => assertManifestEntry({ ...admitted, reason: undefined })).toThrow(/ADMITTED requires a reason/);
    expect(() => assertManifestEntry({ ...admitted, disposition: 'OFFERED', reason: 'eligible' })).toThrow(/OFFERED requires a reason from the OFFERED family/);
    expect(() => assertManifestEntry({ ...admitted, disposition: 'OFFERED', reason: 'member_contextual_doorway' })).not.toThrow();
    expect(() => assertManifestEntry({ producerId: 'x', ...axes, disposition: 'EXCLUDED', reason: 'restraint:inference_cap' })).toThrow(/EXCLUDED requires a reason/);
    expect(() => assertManifestEntry({ ...held, reason: 'restraint:inference_cap' })).not.toThrow();
    expect(() => assertManifestEntry({ ...held, reason: 'restraint:' })).toThrow(/HELD requires a reason/);
  });

  it('rows carry identity / disposition / basis / size / digest only — a body under any key is refused', () => {
    for (const k of ['body', 'content', 'text', 'block', 'hypothesis', 'because']) {
      expect(() => assertManifestEntry({ ...held, [k]: 'threshold pattern' })).toThrow(/non-contract key/);
    }
  });

  it('HELD/EXCLUDED rendered nothing and may not carry chars/blockDigest; OFFERED/ADMITTED must', () => {
    expect(() => assertManifestEntry({ ...held, chars: 100 })).toThrow(/rendered nothing/);
    expect(() => assertManifestEntry({ ...admitted, blockDigest: undefined })).toThrow(/requires blockDigest/);
    expect(() => assertManifestEntry(admitted)).not.toThrow();
    expect(() => assertManifestEntry(held)).not.toThrow();
  });

  it('the CDPI Reading-B row is representable: system/inferred/infer, HELD, no body', () => {
    expect(() => assertManifestEntry(held)).not.toThrow();
    expect(Object.keys(held).sort()).toEqual(['authoredBy', 'authority', 'disposition', 'participationClass', 'producerId', 'reason']);
  });

  it('a completed turn leaves nothing AVAILABLE', () => {
    expect(() => assertTurnDispositioned([admitted, { producerId: 'y', ...axes, disposition: 'AVAILABLE' }])).toThrow(/left a candidate AVAILABLE/);
    expect(() => assertTurnDispositioned([
      admitted, held,
      { producerId: 'floor.runtime_prompt', authoredBy: 'house', participationClass: 'constitutional', authority: 'situate', disposition: 'ADMITTED', reason: 'mandatory_floor', chars: 900, blockDigest: 'f1' },
      { producerId: 'member.atoms', ...axes, disposition: 'EXCLUDED', reason: 'no_verified_member' },
    ])).not.toThrow();
  });

  it('refuses a missing axis and malformed counts', () => {
    const { authority: _a, ...noAuthority } = admitted;
    expect(() => assertManifestEntry(noAuthority)).toThrow(/authority must be one of/);
    expect(() => assertManifestEntry({ ...admitted, itemCount: -1 })).toThrow(/itemCount/);
    expect(() => assertManifestEntry({ ...admitted, chars: 1.5 })).toThrow(/integer chars/);
  });
});
