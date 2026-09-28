import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-RUNTIME-01/r1/r1-summary.json'),'utf8'
));

describe('AIN-AETHER-RUNTIME-01R1 generated evidence',()=>{
  test('is pinned to exact R23 Aether closure',()=>{
    expect(summary.parentAetherClosure).toBe('297edbade3d1deab9311b93023852961797e23b2');
    expect(summary.constitutionSourceCommit).toBe(summary.parentAetherClosure);
  });
  test('read-only constitutional use is allowed',()=>{
    expect(summary.readOnlyAllowed).toBe(true);
  });
  test('all live mutation paths remain refused',()=>{
    expect(summary.forbiddenRefused).toBe(true);
    expect(summary.liveBindingAuthorized).toBe(false);
    expect(summary.benchmarkMutationAuthorized).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
  test('constitutional authority remains member-owned and runtime-closed',()=>{
    expect(summary.finalMeaningAuthority).toBe('member');
    expect(summary.runtimeAuthority).toBe(false);
  });
});