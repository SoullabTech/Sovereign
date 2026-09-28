import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r5/r5-summary.json'),'utf8'
));

describe('AIN-AETHER-01R5 generated evidence',()=>{
  test('is bound to the exact R4 parent',()=>{
    expect(summary.parentR4).toBe('a2fbafb88c7e33af0082895266d95b1bfa40608c');
  });
  test('detects newly related and newly independent spiral pairs',()=>{
    expect(summary.newlyRelatedPairs).toContain('creative::work');
    expect(summary.newlyIndependentPairs).toContain('family::relationship');
  });
  test('cross-spiral emergence stays non-causal and non-predictive',()=>{
    expect(summary.causalAuthority).toBe(false);
    expect(summary.predictiveAuthority).toBe(false);
    expect(summary.destinyAuthority).toBe(false);
  });
  test('member retains final meaning authority',()=>{
    expect(summary.memberOwnsFinalMeaning).toBe(true);
    expect(summary.valid).toBe(true);
  });
});
