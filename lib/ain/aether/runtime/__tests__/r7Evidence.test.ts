import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-RUNTIME-01/r7/r7-summary.json'),'utf8'
));

describe('AIN-AETHER-RUNTIME-01R7 generated evidence',()=>{
  test('is bound to exact runtime R6 parent',()=>{
    expect(summary.parentRuntimeR6).toBe('deabeaf103c8436fcb8546e19e19d078398f7336');
  });
  test('synthetic handoff token is consumed by no-op sink',()=>{
    expect(summary.simulated).toBe(true);
    expect(summary.receiptCreated).toBe(true);
    expect(summary.simulationKind).toBe('no_op_sink');
    expect(summary.tokenRef).toBeTruthy();
    expect(summary.candidateRef).toBeTruthy();
  });
  test('no member-facing or notification effect occurs',()=>{
    expect(summary.memberFacingContacted).toBe(false);
    expect(summary.deliveryExecuted).toBe(false);
    expect(summary.notificationSent).toBe(false);
  });
  test('no persistence, MAIA mutation, or network effect occurs',()=>{
    expect(summary.persisted).toBe(false);
    expect(summary.maiaPromptMutated).toBe(false);
    expect(summary.networkSideEffect).toBe(false);
  });
  test('production authority remains false',()=>{
    expect(summary.productionAuthority).toBe(false);
  });
});