import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-RUNTIME-01/r2/r2-summary.json'),'utf8'
));

describe('AIN-AETHER-RUNTIME-01R2 generated evidence',()=>{
  test('is bound to exact runtime R1 parent',()=>{
    expect(summary.parentRuntimeR1).toBe('34827027cc3db4247eea3be720a48149ac282349');
  });
  test('minimal synthetic observation is admitted without live authority',()=>{
    expect(summary.admittedSyntheticObservation).toBe(true);
    expect(summary.admittedFinalMeaningAuthority).toBe('member');
    expect(summary.liveMemberDataAuthorized).toBe(false);
    expect(summary.persistenceAuthorized).toBe(false);
  });
  test('non-synthetic and absent-consent event is refused',()=>{
    expect(summary.nonSyntheticRefused).toBe(true);
    expect(summary.absentConsentRefused).toBe(true);
  });
  test('authority-smuggling payload is refused',()=>{
    expect(summary.authoritySmuggleRefused).toBe(true);
    expect(summary.authoritySmuggleErrors).toEqual(expect.arrayContaining([
      'predictive_authority_forbidden',
      'destiny_authority_forbidden',
      'soul_representation_authority_forbidden',
      'persistence_authority_forbidden',
      'final_meaning_must_remain_member_owned',
      'destiny_language_forbidden',
      'soul_authority_language_forbidden',
    ]));
  });
  test('production authority remains false',()=>{
    expect(summary.productionAuthority).toBe(false);
  });
});