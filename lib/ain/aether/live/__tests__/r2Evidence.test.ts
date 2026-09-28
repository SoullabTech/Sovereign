import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-LIVE-ADAPTER-01/r2/r2-summary.json'),'utf8'
));

describe('AIN-AETHER-LIVE-ADAPTER-01R2 generated evidence',()=>{
  test('is bound to exact live-adapter R1 parent',()=>{
    expect(summary.parentLiveR1).toBe('73a59e9dec61173ee735ebaa134d2cc0fdfa0bc8');
  });
  test('read-once consent is one-use only',()=>{
    expect(summary.readOnceInitiallyValid).toBe(true);
    expect(summary.readOnceConsumeOnUse).toBe(true);
    expect(summary.readOnceReusable).toBe(false);
    expect(summary.readOnceAfterState).toBe('consumed');
  });
  test('session consent is reusable only in matching session',()=>{
    expect(summary.sessionValid).toBe(true);
    expect(summary.sessionReusable).toBe(true);
    expect(summary.wrongSessionRefused).toBe(true);
  });
  test('expiry and revocation fail closed',()=>{
    expect(summary.expiredState).toBe('expired');
    expect(summary.revokedState).toBe('revoked');
  });
});