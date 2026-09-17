import v2 from '@/config/governance/account-erasure-registry.v2.json';
import v3 from '@/config/governance/account-erasure-registry.v3.json';
import { groupedActivationForeignKeys } from '../accountErasureActivationRegistry';

describe('F5 P5-D activation-registry succession', () => {
  it('does not rewrite the historical shadow registry', () => {
    expect(v2.activationProhibited).toBe(true);
    expect(v2.version).toBe('account-erasure-registry-v2-shadow');
  });

  it('names P5-D as the authority for activation', () => {
    expect(v3.activationProhibited).toBe(false);
    expect(v3.coverageOnly).toBe(true);
    expect(v3.activationAuthority).toMatch(/P5-D/);
  });

  it('keeps all classifications stable while adding S5 to the Circle lifecycle', () => {
    const a = new Map(v2.memberBoundLoci.map((x) => [x.table, x]));
    const b = new Map(v3.memberBoundLoci.map((x) => [x.table, x]));
    expect([...b.keys()]).toEqual([...a.keys()]);
    for (const [table, before] of a) {
      const after = b.get(table)!;
      expect(after.disposition).toBe(before.disposition);
      expect(after.adapterKey).toBe(before.adapterKey);
      expect(after.verificationRule).toBe(before.verificationRule);
    }
    for (const table of ['circle_memberships', 'circle_inquiry_responses']) {
      expect(b.get(table)?.requiresS5).toBe(true);
    }
  });

  it('collapses 289 source declarations into 264 disposition-consistent runtime effect groups', () => {
    const groups = groupedActivationForeignKeys();
    expect(groups.size).toBe(264);
    for (const declarations of groups.values()) {
      expect(new Set(declarations.map((x) => x.disposition)).size).toBe(1);
    }
  });

  it('leaves 313 direct loci refuse-by-default', () => {
    expect(v3.memberBoundLoci.filter((x) => x.disposition === 'refuse')).toHaveLength(313);
  });
});
