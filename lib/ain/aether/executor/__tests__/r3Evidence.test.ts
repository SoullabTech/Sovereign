import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-EXECUTOR-01/r3/r3-summary.json'),'utf8'
));

describe('AIN-AETHER-EXECUTOR-01R3 generated evidence',()=>{
  test('is bound to exact executor R2 parent',()=>{
    expect(summary.parentExecutorR2).toBe('6d4787355ba3a60ad0b841bf9e3fc401ac32d976');
  });
  test('two executor-origin shadows traverse frozen runtime',()=>{
    expect(summary.replayed).toBe(true);
    expect(summary.executorOriginCount).toBe(2);
    expect(summary.projectedCount).toBe(2);
    expect(summary.adaptedCount).toBe(2);
    expect(summary.fieldDerived).toBe(true);
    expect(summary.reflectionGenerated).toBe(true);
    expect(summary.humanGatePassed).toBe(true);
    expect(summary.noOpSimulationPassed).toBe(true);
  });
  test('executor provenance survives replay',()=>{
    expect(summary.originRecordsPreserved).toEqual(['record:r3:work','record:r3:creative']);
    expect(summary.originReceiptsPreserved).toHaveLength(2);
    expect(summary.originTransportsPreserved).toEqual(['transport:work','transport:creative']);
  });
  test('replay creates zero external effect',()=>{
    expect(summary.externalNetworkCall).toBe(false);
    expect(summary.persisted).toBe(false);
    expect(summary.memberFacingContacted).toBe(false);
    expect(summary.deliveryExecuted).toBe(false);
    expect(summary.maiaPromptMutated).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});