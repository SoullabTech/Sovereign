import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r4/r4-summary.json'),'utf8'
));

describe('AIN-AETHER-01R4 generated evidence',()=>{
  test('is bound to the exact R3 parent',()=>{
    expect(summary.parentR3).toBe('499fc344b9cccb8d96757a4497e1a9407adf5deb');
  });
  test('preserves multiple simultaneous domain trajectories',()=>{
    expect(summary.spiralCount).toBe(6);
    const classifications=summary.domainStates.map((x:any)=>x.classification);
    expect(classifications).toEqual(expect.arrayContaining(['oscillation','phase_change','recurrence','sustained_convergence','ordinary_fluctuation','dissolution']));
  });
  test('cross-spiral relations include both relation and independence',()=>{
    expect(summary.coConvergenceCount).toBeGreaterThan(0);
    expect(summary.timingMismatchCount).toBeGreaterThan(0);
    expect(summary.independentMovementCount).toBeGreaterThan(0);
  });
  test('member is not reduced to one stage or developmental rank',()=>{
    expect(summary.singleStageAuthority).toBe(false);
    expect(summary.developmentalRankAuthority).toBe(false);
    expect(summary.predictiveAuthority).toBe(false);
  });
  test('final meaning remains member-owned',()=>{
    expect(summary.memberOwnsFinalMeaning).toBe(true);
    expect(summary.valid).toBe(true);
  });
});
