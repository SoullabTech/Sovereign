import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-RUNTIME-01/r6/r6-summary.json'),'utf8'
));

describe('AIN-AETHER-RUNTIME-01R6 generated evidence',()=>{
  test('is bound to exact runtime R5 parent',()=>{
    expect(summary.parentRuntimeR5).toBe('9aedafed3762e98b12f48b811cb37beb12cfb793');
  });
  test('candidate alone does not pass delivery gate',()=>{
    expect(summary.noAuthorizationPassed).toBe(false);
    expect(summary.noAuthorizationErrors).toContain('explicit_human_authorization_required');
  });
  test('explicit human authorization creates synthetic handoff eligibility only',()=>{
    expect(summary.humanAuthorizationPassed).toBe(true);
    expect(summary.tokenCreated).toBe(true);
    expect(summary.tokenScope).toBe('synthetic_handoff_only');
  });
  test('candidate validity never self-authorizes delivery',()=>{
    expect(summary.candidateValiditySelfAuthorized).toBe(false);
  });
  test('handoff gate grants no member-facing, persistence, or production authority',()=>{
    expect(summary.memberFacingDeliveryAuthorized).toBe(false);
    expect(summary.deliveryExecuted).toBe(false);
    expect(summary.persistenceAuthorized).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});