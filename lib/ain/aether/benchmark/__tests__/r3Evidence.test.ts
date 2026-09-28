import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r3/r3-summary.json'),'utf8'
));

describe('AIN-AETHER-01R3 generated evidence',()=>{
  test('is bound to the exact R2 parent',()=>{
    expect(summary.parentR2).toBe('23c83ccc895af27037a43d405ce80a32db0649a6');
  });
  test('uses a multi-moment trajectory',()=>{
    expect(summary.momentCount).toBeGreaterThanOrEqual(3);
    expect(summary.valid).toBe(true);
  });
  test('classifies sustained movement without prediction',()=>{
    expect(['sustained_convergence','phase_change']).toContain(summary.classification);
    expect(summary.predictiveAuthority).toBe(false);
    expect(summary.destinyAuthority).toBe(false);
  });
  test('recurrence remains distinct from simple persistence',()=>{
    expect(summary.recurrenceClassification).toBe('recurrence');
  });
  test('trajectory grants no developmental rank and final meaning stays member-owned',()=>{
    expect(summary.developmentalRankAuthority).toBe(false);
    expect(summary.memberOwnsFinalMeaning).toBe(true);
  });
});
