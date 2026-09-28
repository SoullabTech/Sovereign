import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-RUNTIME-01/r8/r8-summary.json'),'utf8'
));

describe('AIN-AETHER-RUNTIME-01R8 generated evidence',()=>{
  test('is bound to exact runtime R7 parent',()=>{
    expect(summary.parentR7).toBe('cb258f40b765c05e3e5b31871632add7fead21ca');
  });
  test('all runtime closure invariants pass',()=>{
    expect(summary.passingInvariants).toBe(summary.invariantCount);
    expect(summary.allPass).toBe(true);
    expect(summary.contradictionRefs).toEqual([]);
  });
  test('closure is synthetic-runtime scoped only',()=>{
    expect(summary.standing).toBe('closed_for_synthetic_runtime_scope');
  });
  test('no external authority or effect is opened',()=>{
    expect(summary.liveMemberDataAuthorized).toBe(false);
    expect(summary.persistenceAuthorized).toBe(false);
    expect(summary.memberFacingDeliveryAuthorized).toBe(false);
    expect(summary.deliveryExecuted).toBe(false);
    expect(summary.maiaPromptMutationAuthorized).toBe(false);
    expect(summary.networkSideEffect).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});