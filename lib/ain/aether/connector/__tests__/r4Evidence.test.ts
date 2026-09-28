import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-CONNECTOR-01/r4/r4-summary.json'),'utf8'
));

describe('AIN-AETHER-CONNECTOR-01R4 generated evidence',()=>{
  test('is bound to exact connector R3 parent',()=>{
    expect(summary.parentConnectorR3).toBe('6ed9c1e998485f819bd35f9b33ac9f1aaa0fe326');
  });
  test('exact query plan is fingerprinted and review-bound',()=>{
    expect(summary.fingerprintAlgorithm).toBe('sha256');
    expect(summary.canonicalVersion).toBe('aether-query-plan-v1');
    expect(summary.fingerprintDigest).toHaveLength(64);
    expect(summary.reviewBound).toBe(true);
    expect(summary.approvedForFutureExecutionDesign).toBe(true);
  });
  test('approval still does not authorize execution',()=>{
    expect(summary.executionAuthorized).toBe(false);
    expect(summary.recordReadExecuted).toBe(false);
    expect(summary.recordCountRead).toBe(0);
  });
  test('post-review plan drift is refused',()=>{
    expect(summary.driftedReviewBound).toBe(false);
    expect(summary.driftedErrors).toContain('query_plan_fingerprint_mismatch');
  });
  test('review custody grants no side-effect authority',()=>{
    expect(summary.persistenceAuthorized).toBe(false);
    expect(summary.memberFacingDeliveryAuthorized).toBe(false);
    expect(summary.maiaPromptMutationAuthorized).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});