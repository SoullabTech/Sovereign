import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r22/r22-summary.json'),'utf8'
));

describe('AIN-AETHER-01R22 generated evidence',()=>{
  test('is bound to exact R21 parent',()=>{
    expect(summary.parentR21).toBe('9a5bddf9035451f07d32b900f25ede6e3832ae28');
  });
  test('all temporal closure invariants pass',()=>{
    expect(summary.passingInvariants).toBe(summary.invariantCount);
    expect(summary.allPass).toBe(true);
    expect(summary.contradictionRefs).toEqual([]);
  });
  test('closure is benchmark-scoped only',()=>{
    expect(summary.temporalProgrammeStanding).toBe('closed_for_benchmark_scope');
    expect(summary.runtimeAuthority).toBe(false);
  });
});