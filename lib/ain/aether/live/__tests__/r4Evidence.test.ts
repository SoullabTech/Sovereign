import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-LIVE-ADAPTER-01/r4/r4-summary.json'),'utf8'
));

describe('AIN-AETHER-LIVE-ADAPTER-01R4 generated evidence',()=>{
  test('is bound to exact live-adapter R3 parent',()=>{
    expect(summary.parentLiveR3).toBe('24706ae0d7e693c41ce3a9ae5218a1e96b7a4982');
  });
  test('fixture shadow projects into frozen synthetic runtime without standing gain',()=>{
    expect(summary.projected).toBe(true);
    expect(summary.runtimeSource).toBe('synthetic_member_authored');
    expect(summary.runtimeConfidence).toBe(.81);
    expect(summary.runtimeTemporalStanding).toBe('is_being');
  });
  test('projection provenance proves fixture-only compatibility',()=>{
    expect(summary.fixtureOnly).toBe(true);
    expect(summary.liveDataProjected).toBe(false);
    expect(summary.confidenceIncreased).toBe(false);
    expect(summary.temporalStandingStrengthened).toBe(false);
    expect(summary.authorityEscalated).toBe(false);
  });
  test('projection grants no side-effect authority',()=>{
    expect(summary.persistenceAuthority).toBe(false);
    expect(summary.deliveryAuthority).toBe(false);
    expect(summary.promptMutationAuthority).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
  test('unattested genuine live projection path remains refused',()=>{
    expect(summary.genuineLiveProjectionRefused).toBe(true);
    expect(summary.genuineLiveProjectionErrors).toContain('fixture_attestation_required');
  });
});