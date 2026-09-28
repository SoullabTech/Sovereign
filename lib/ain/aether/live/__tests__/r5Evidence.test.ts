import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-LIVE-ADAPTER-01/r5/r5-summary.json'),'utf8'
));

describe('AIN-AETHER-LIVE-ADAPTER-01R5 generated evidence',()=>{
  test('is bound to exact live-adapter R4 parent',()=>{
    expect(summary.parentLiveR4).toBe('3f07a8c40aee030fd354157a5cc3385d52da0d1a');
  });
  test('full fixture-backed replay completes through no-op simulation',()=>{
    expect(summary.replayed).toBe(true);
    expect(summary.shadowCount).toBe(2);
    expect(summary.projectedCount).toBe(2);
    expect(summary.adaptedCount).toBe(2);
    expect(summary.fieldDerived).toBe(true);
    expect(summary.reflectionGenerated).toBe(true);
    expect(summary.humanGatePassed).toBe(true);
    expect(summary.noOpSimulationPassed).toBe(true);
  });
  test('session consent lifecycle remains unchanged during valid replay',()=>{
    expect(summary.sessionLifecycleUnchanged).toBe(true);
  });
  test('replay produces zero live external effect',()=>{
    expect(summary.liveSourceConnected).toBe(false);
    expect(summary.realMemberDataRead).toBe(false);
    expect(summary.persisted).toBe(false);
    expect(summary.memberFacingContacted).toBe(false);
    expect(summary.deliveryExecuted).toBe(false);
    expect(summary.maiaPromptMutated).toBe(false);
    expect(summary.networkSideEffect).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});