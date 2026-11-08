import { CANDIDATES } from './candidates';
import { REFERENCE } from './contract';
import { LAWS } from './laws';

/** Lethality first: the reference passes every law; each defeat candidate dies on its named law and,
 *  beyond it, only on CLASSIFIED collateral. Part B has no implementation; these are test doubles. */
describe('WS-WORK-CONTINUITY Part B · read-scope laws', () => {
  it('the conforming reference satisfies every law', () => {
    expect(LAWS.filter((l) => !l.run(REFERENCE)).map((l) => l.id)).toEqual([]);
  });
  for (const c of CANDIDATES) {
    it(`${c.id} dies on ${c.named}`, () => {
      const failed = LAWS.filter((l) => !l.run(c.build)).map((l) => l.id);
      expect(failed).toContain(c.named);
      const unclassified = failed.filter((id) => id !== c.named && !(id in c.classifiedCollateral));
      expect(unclassified).toEqual([]);
    });
  }
  it('every law is the named target of at least one candidate', () => {
    const named = new Set(CANDIDATES.map((c) => c.named));
    expect(LAWS.map((l) => l.id).filter((id) => !named.has(id))).toEqual([]);
  });
});
