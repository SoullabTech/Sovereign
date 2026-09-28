import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-CONNECTOR-01/r1/r1-summary.json'),'utf8'
));

describe('AIN-AETHER-CONNECTOR-01R1 generated evidence',()=>{
  test('is bound to exact fixture live-adapter closure',()=>{
    expect(summary.parentFixtureClosure).toBe('e775aed82695fc11fa7928071b6a89d5e6f87221');
  });
  test('connector declares capabilities without implementing record reads',()=>{
    expect(summary.declaredSourceClasses).toEqual(expect.arrayContaining([
      'member_authored_text',
      'system_observed_event',
    ]));
    expect(summary.recordReadImplemented).toBe(false);
  });
  test('dry-run succeeds with zero record reads',()=>{
    expect(summary.dryRunAllowed).toBe(true);
    expect(summary.dryRunOnly).toBe(true);
    expect(summary.recordReadExecuted).toBe(false);
    expect(summary.recordCountRead).toBe(0);
  });
  test('attempted record-read execution is refused',()=>{
    expect(summary.forbiddenReadAllowed).toBe(false);
    expect(summary.forbiddenReadErrors).toContain('record_read_execution_forbidden_in_r1');
  });
  test('dry-run grants no side-effect authority',()=>{
    expect(summary.persistenceAuthorized).toBe(false);
    expect(summary.memberFacingDeliveryAuthorized).toBe(false);
    expect(summary.maiaPromptMutationAuthorized).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});