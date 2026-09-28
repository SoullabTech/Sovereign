import { callosalMetrics, coordinateLanes, type LaneCandidate } from '../coordination';

const analytic: LaneCandidate[] = [
  { sourceRef:'canon:authority', lane:'analytic', rank:1, reasons:['exact phrase'], useful:true, labels:['must_retrieve'] },
  { sourceRef:'temporal:current', lane:'analytic', rank:2, reasons:['current correction'], useful:true, labels:['counterevidence'] },
  { sourceRef:'shared:crystal', lane:'analytic', rank:3, reasons:['exact terminology'], useful:true, labels:['helpful'] },
];

const associative: LaneCandidate[] = [
  { sourceRef:'shared:crystal', lane:'associative', rank:1, reasons:['semantic resonance'], useful:true, labels:['helpful'] },
  { sourceRef:'bridge:huayan', lane:'associative', rank:2, reasons:['graph bridge','conceptual analogy'], useful:true, labels:['bridge'] },
  { sourceRef:'research:gestalt', lane:'associative', rank:3, reasons:['distant semantic relation'], useful:true, labels:['helpful'] },
];

describe('corpus-callosum coordination', () => {
  it('preserves distinct lane reasons when the same jewel is found twice', () => {
    const merged=coordinateLanes(analytic,associative);
    const shared=merged.find(c=>c.sourceRef==='shared:crystal');
    expect(shared?.lanes.sort()).toEqual(['analytic','associative']);
    expect(shared?.reasons).toEqual(expect.arrayContaining(['exact terminology','semantic resonance']));
  });

  it('creates complementarity when each lane contributes useful unique jewels', () => {
    const m=callosalMetrics(analytic,associative);
    expect(m.analyticUniqueYield).toBe(2);
    expect(m.associativeUniqueYield).toBe(2);
    expect(m.sharedUseful).toBe(1);
    expect(m.coordinatedUseful).toBe(5);
    expect(m.complementarityGain).toBeGreaterThan(0);
    expect(m.counterevidencePresent).toBe(true);
    expect(m.bridgePresent).toBe(true);
  });

  it('does not hide forbidden associative expansion inside the merge', () => {
    const wild: LaneCandidate[]=[...associative,{
      sourceRef:'private:dream',
      lane:'associative',
      rank:4,
      reasons:['graph proximity'],
      useful:true,
      forbidden:true,
      labels:['forbidden'],
    }];
    const m=callosalMetrics(analytic,wild);
    expect(m.forbiddenLeakage).toBe(1);
  });
});
