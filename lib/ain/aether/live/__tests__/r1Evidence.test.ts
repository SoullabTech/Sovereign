import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-LIVE-ADAPTER-01/r1/r1-summary.json'),'utf8'
));

describe('AIN-AETHER-LIVE-ADAPTER-01R1 generated evidence',()=>{
  test('is bound to exact synthetic runtime closure',()=>{
    expect(summary.parentSyntheticClosure).toBe('170c0b00a1467423a1f426a7ca0e23ea68929ba9');
  });
  test('consent-bound live-shaped fixture is read-only',()=>{
    expect(summary.admitted).toBe(true);
    expect(summary.readOnly).toBe(true);
    expect(summary.persisted).toBe(false);
    expect(summary.delivered).toBe(false);
    expect(summary.maiaPromptMutated).toBe(false);
    expect(summary.finalMeaningAuthority).toBe('member');
  });
  test('missing consent and authority smuggling are refused',()=>{
    expect(summary.noConsentRefused).toBe(true);
    expect(summary.authoritySmuggleRefused).toBe(true);
  });
  test('admission grants no persistence, delivery, prompt mutation, or production authority',()=>{
    expect(summary.persistenceAuthorized).toBe(false);
    expect(summary.memberFacingDeliveryAuthorized).toBe(false);
    expect(summary.maiaPromptMutationAuthorized).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});