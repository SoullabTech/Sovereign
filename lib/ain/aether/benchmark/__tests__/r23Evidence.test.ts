import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r23/r23-summary.json'),'utf8'
));

describe('AIN-AETHER-01R23 generated evidence',()=>{
  test('is bound to exact R22 parent',()=>{
    expect(summary.parentR22).toBe('ecd5f3d4f03383fac5eefaa16af511714269e4c9');
  });
  test('all constitutional invariants pass',()=>{
    expect(summary.passingInvariants).toBe(summary.invariantCount);
    expect(summary.allPass).toBe(true);
    expect(summary.contradictionRefs).toEqual([]);
  });
  test('closure remains benchmark-scoped only',()=>{
    expect(summary.programmeStanding).toBe('closed_for_benchmark_scope');
    expect(summary.runtimeAuthority).toBe(false);
  });
  test('no person-definition or Soul-representation authority is granted',()=>{
    expect(summary.personDefinitionAuthority).toBe(false);
    expect(summary.soulRepresentationAuthority).toBe(false);
  });
  test('final meaning remains member-owned',()=>{
    expect(summary.finalMeaningAuthority).toBe('member');
  });
});