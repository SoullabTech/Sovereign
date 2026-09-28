import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-CONNECTOR-01/r5/r5-summary.json'),'utf8'
));

describe('AIN-AETHER-CONNECTOR-01R5 generated evidence',()=>{
  test('is bound to exact connector R4 parent',()=>{
    expect(summary.parentConnectorR4).toBe('11432108863db88231dfb036166a51057988b9d1');
  });

  test('one-shot token is bound to exact reviewed query and fingerprint',()=>{
    expect(summary.tokenIssued).toBe(true);
    expect(summary.tokenQueryRef).toBe('query:r5:witness');
    expect(summary.tokenFingerprint).toHaveLength(64);
    expect(summary.tokenOneShot).toBe(true);
    expect(summary.tokenConsumedInitially).toBe(false);
    expect(summary.tokenExecutionEligibleInitially).toBe(true);
  });

  test('token is usable before expiry but still does not execute',()=>{
    expect(summary.preExpiryUsable).toBe(true);
    expect(summary.executionAuthorized).toBe(false);
    expect(summary.recordReadExecuted).toBe(false);
    expect(summary.recordCountRead).toBe(0);
  });

  test('expiry fails closed',()=>{
    expect(summary.expiredUsable).toBe(false);
    expect(summary.expiredErrors).toContain('token_expired');
  });

  test('consumption makes token non-reusable without execution',()=>{
    expect(summary.consumed).toBe(true);
    expect(summary.executionEligibleAfterConsume).toBe(false);
    expect(summary.afterConsumeUsable).toBe(false);
    expect(summary.afterConsumeErrors).toEqual(expect.arrayContaining([
      'token_already_consumed',
      'token_not_execution_eligible',
    ]));
  });

  test('token design grants no side-effect authority',()=>{
    expect(summary.persistenceAuthorized).toBe(false);
    expect(summary.memberFacingDeliveryAuthorized).toBe(false);
    expect(summary.maiaPromptMutationAuthorized).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});