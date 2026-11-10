import { REFERENCE } from './contract';
import { LAWS } from './laws';
import { CANDIDATES } from './candidates';

describe('WS-DECISION-CONTINUITY · laws are lethal and discriminating', () => {
  it('the conforming reference satisfies every law', () => {
    for (const l of LAWS) expect({ law: l.id, fail: l.check(REFERENCE) }).toEqual({ law: l.id, fail: null });
  });
  for (const c of CANDIDATES) {
    it(`${c.id} dies on ${c.mustFail}, and only classified collateral besides`, () => {
      const failed = LAWS.filter((l) => l.check(c.factory) !== null).map((l) => l.id);
      expect(failed).toContain(c.mustFail);
      const extra = failed.filter((id) => id !== c.mustFail && !(c.classifiedCollateral && id in c.classifiedCollateral));
      expect({ candidate: c.id, unclassified: extra }).toEqual({ candidate: c.id, unclassified: [] });
    });
  }
  it('every law is the named target of at least one candidate', () => {
    const named = new Set(CANDIDATES.map((c) => c.mustFail));
    for (const l of LAWS) expect({ law: l.id, named: named.has(l.id) }).toEqual({ law: l.id, named: true });
  });
});
