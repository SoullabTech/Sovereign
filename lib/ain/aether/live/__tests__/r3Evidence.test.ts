import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(resolve(ROOT,'docs/programme/AIN-AETHER-LIVE-ADAPTER-01/r3/r3-summary.json'),'utf8'));

describe('AIN-AETHER-LIVE-ADAPTER-01R3 generated evidence',()=>{
  test('is bound to exact live-adapter R2 parent',()=>{
    expect(summary.parentLiveR2).toBe('07c666b980923c6b783d6b62041feb9d300b3182');
  });
  test('successful transaction creates shadow and consumes read-once consent',()=>{
    expect(summary.successCommitted).toBe(true);
    expect(summary.successShadowCreated).toBe(true);
    expect(summary.successConsentConsumed).toBe(true);
    expect(summary.successConsumedAt).toBe('2026-09-28T16:30:00-04:00');
  });
  test('failed transaction has no shadow and no partial consumption',()=>{
    expect(summary.failureCommitted).toBe(false);
    expect(summary.failureShadowCreated).toBe(false);
    expect(summary.failureConsentConsumed).toBe(false);
    expect(summary.failureLifecycleUnchanged).toBe(true);
  });
  test('transaction grants no side-effect authority',()=>{
    expect(summary.persistenceAuthorized).toBe(false);
    expect(summary.memberFacingDeliveryAuthorized).toBe(false);
    expect(summary.maiaPromptMutationAuthorized).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});