import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-EXECUTOR-01/r2/r2-summary.json'),'utf8'
));

describe('AIN-AETHER-EXECUTOR-01R2 generated evidence',()=>{
  test('is bound to exact executor R1 parent',()=>{
    expect(summary.parentExecutorR1).toBe('ead4b3325e56c24f45b3a5a6e4f4aa1b49e1bfea');
  });

  test('one fixture record crosses into frozen live-shadow admission',()=>{
    expect(summary.fixtureExecuted).toBe(true);
    expect(summary.fixtureRecordRef).toBe('fixture-record:r2:witness');
    expect(summary.adapted).toBe(true);
    expect(summary.shadowAdmitted).toBe(true);
  });

  test('record and binding values survive translation exactly',()=>{
    expect(summary.memberRefPreserved).toBe(true);
    expect(summary.domainPreserved).toBe(true);
    expect(summary.observationPreserved).toBe(true);
    expect(summary.sourceStandingPreserved).toBe(true);
    expect(summary.temporalStandingPreserved).toBe(true);
    expect(summary.confidencePreserved).toBe(true);
    expect(summary.consentRefPreserved).toBe(true);
  });

  test('adapter creates no downstream authority or side effect',()=>{
    expect(summary.persisted).toBe(false);
    expect(summary.memberFacingDelivery).toBe(false);
    expect(summary.maiaPromptMutated).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});