import { REFERENCE } from './contract';
import { LAWS } from './laws';
import { CANDIDATES } from './candidates';

describe('WS-DEVELOP-STUDIO · laws are lethal and discriminating', () => {
  it('the conforming reference satisfies every law', () => {
    for (const l of LAWS) expect({ law: l.id, fail: l.check(REFERENCE) }).toEqual({ law: l.id, fail: null });
  });
  for (const cand of CANDIDATES) {
    it(`${cand.id} dies on ${cand.mustFail}, and only classified collateral besides`, () => {
      const failed = LAWS.filter((l) => l.check(cand.factory) !== null).map((l) => l.id);
      expect(failed).toContain(cand.mustFail);
      const extra = failed.filter((id) => id !== cand.mustFail && !(cand.classifiedCollateral && id in cand.classifiedCollateral));
      expect({ candidate: cand.id, unclassified: extra }).toEqual({ candidate: cand.id, unclassified: [] });
    });
  }
  it('every law is the named target of at least one candidate (or is the shared basis noted below)', () => {
    const named = new Set(CANDIDATES.map((x) => x.mustFail));
    const SHARED = new Set(['D5b-plan-compares', 'D6b-apply-then-undo-exact']); // D5b: compare shown by construction in the reference
    for (const l of LAWS) if (!SHARED.has(l.id)) expect({ law: l.id, named: named.has(l.id) }).toEqual({ law: l.id, named: true });
  });
});
