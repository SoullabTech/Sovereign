import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-CONNECTOR-01/r7/r7-summary.json'),'utf8'
));

describe('AIN-AETHER-CONNECTOR-01R7 generated evidence',()=>{
  test('is bound to exact connector R6 parent',()=>{
    expect(summary.parentR6).toBe('1565cf0526834822b65875b2c4b617ff5ff2a835');
  });
  test('all pre-execution connector invariants pass',()=>{
    expect(summary.passingInvariants).toBe(summary.invariantCount);
    expect(summary.allPass).toBe(true);
    expect(summary.contradictionRefs).toEqual([]);
  });
  test('closure standing is pre-execution connector scope only',()=>{
    expect(summary.standing).toBe('closed_for_pre_execution_connector_scope');
  });
  test('no executable IO or side-effect authority exists at closure',()=>{
    expect(summary.realRecordReadCapability).toBe(false);
    expect(summary.connectorExecutorImplemented).toBe(false);
    expect(summary.externalIoAuthorized).toBe(false);
    expect(summary.persistenceAuthorized).toBe(false);
    expect(summary.memberFacingDeliveryAuthorized).toBe(false);
    expect(summary.maiaPromptMutationAuthorized).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});