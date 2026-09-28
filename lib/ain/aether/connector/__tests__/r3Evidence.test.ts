import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-CONNECTOR-01/r3/r3-summary.json'),'utf8'
));

describe('AIN-AETHER-CONNECTOR-01R3 generated evidence',()=>{
  test('is bound to exact connector R2 parent',()=>{
    expect(summary.parentConnectorR2).toBe('20f5d4c754c126da39f90d0585f55f06853fa996');
  });
  test('bounded query plan is fully inspectable and zero-execution',()=>{
    expect(summary.boundedAllowed).toBe(true);
    expect(summary.boundedPlan.connectorRef).toBe('connector:r3:witness');
    expect(summary.boundedPlan.memberRef).toBe('member:fixture');
    expect(summary.boundedPlan.maxRecords).toBe(25);
    expect(summary.boundedPlan.wildcard).toBe(false);
    expect(summary.boundedPlan.paginationAllowed).toBe(false);
    expect(summary.boundedPlan.execute).toBe(false);
    expect(summary.zeroExecution).toBe(true);
    expect(summary.recordReadExecuted).toBe(false);
    expect(summary.recordCountRead).toBe(0);
  });
  test('unbounded or overreaching plan is refused',()=>{
    expect(summary.unboundedAllowed).toBe(false);
    expect(summary.unboundedErrors).toEqual(expect.arrayContaining([
      'wildcard_forbidden',
      'pagination_forbidden_in_r3',
      'query_execution_forbidden_in_r3',
      'max_records_exceeds_r3_ceiling',
      'time_window_invalid',
      'field_manifest:field_not_allowlisted:email',
    ]));
  });
  test('query planning grants no side-effect authority',()=>{
    expect(summary.persistenceAuthorized).toBe(false);
    expect(summary.memberFacingDeliveryAuthorized).toBe(false);
    expect(summary.maiaPromptMutationAuthorized).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});