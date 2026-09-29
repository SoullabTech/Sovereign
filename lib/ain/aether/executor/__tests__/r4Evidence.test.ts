import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-EXECUTOR-01/r4/r4-summary.json'),'utf8'
));

describe('AIN-AETHER-EXECUTOR-01R4 generated evidence',()=>{
  test('is bound to exact executor R3 parent',()=>{
    expect(summary.parentR3).toBe('f51e8c08c1579de71bc0ad561e0a84bc94df059d');
  });
  test('all isolated executor closure invariants pass',()=>{
    expect(summary.passingInvariants).toBe(summary.invariantCount);
    expect(summary.allPass).toBe(true);
    expect(summary.contradictionRefs).toEqual([]);
  });
  test('closure standing is isolated-executor scoped only',()=>{
    expect(summary.standing).toBe('closed_for_isolated_executor_scope');
  });
  test('production isolation and zero downstream authority remain closed',()=>{
    expect(summary.productionReachable).toBe(false);
    expect(summary.externalNetworkCall).toBe(false);
    expect(summary.persistenceAuthorized).toBe(false);
    expect(summary.memberFacingDeliveryAuthorized).toBe(false);
    expect(summary.maiaPromptMutationAuthorized).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});