import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-RUNTIME-01/r4/r4-summary.json'),'utf8'
));

describe('AIN-AETHER-RUNTIME-01R4 generated evidence',()=>{
  test('is bound to exact runtime R3 parent',()=>{
    expect(summary.parentRuntimeR3).toBe('2031daf5c7f1df04aab520ff28079995b00480f0');
  });
  test('derives a bounded synthetic field',()=>{
    expect(summary.derived).toBe(true);
    expect(summary.observationCount).toBe(3);
    expect(summary.patternCount).toBeGreaterThan(0);
  });
  test('shared cross-facet pattern remains provisional and non-authoritative',()=>{
    expect(summary.sharedPatternFacets).toEqual(expect.arrayContaining(['work','creative']));
    expect(summary.sharedPatternMovements).toContain('converging');
    expect(summary.sharedPatternProvisional).toBe(true);
    expect(summary.sharedPatternIdentityAuthority).toBe(false);
    expect(summary.sharedPatternDiagnosticAuthority).toBe(false);
    expect(summary.sharedPatternPredictiveAuthority).toBe(false);
    expect(summary.sharedPatternSoulAuthority).toBe(false);
  });
  test('member meaning remains sovereign and persistence remains absent',()=>{
    expect(summary.finalMeaningAuthority).toBe('member');
    expect(summary.persistenceAuthority).toBe(false);
    expect(summary.persisted).toBe(false);
  });
  test('no live binding or production authority is introduced',()=>{
    expect(summary.liveMemberDataBound).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});