import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r6/r6-summary.json'),'utf8'
));

describe('AIN-AETHER-01R6 generated evidence',()=>{
  test('is bound to the exact R5 parent',()=>{
    expect(summary.parentR5).toBe('496d185efcf111271de34a47361ef6be805c6e2a');
  });
  test('forms a candidate gestalt from a subset of spirals',()=>{
    expect(summary.standing).toBe('candidate_gestalt');
    expect(summary.participatingSpiralRefs.length).toBeGreaterThanOrEqual(3);
    expect(summary.excludedSpiralRefs.length).toBeGreaterThan(0);
    expect(summary.preservesNonfit).toBe(true);
  });
  test('gestalt does not totalize or acquire person authority',()=>{
    expect(summary.totalizingAuthority).toBe(false);
    expect(summary.identityAuthority).toBe(false);
    expect(summary.developmentalRankAuthority).toBe(false);
    expect(summary.soulRepresentationAuthority).toBe(false);
  });
  test('gestalt remains non-causal and non-predictive',()=>{
    expect(summary.causalAuthority).toBe(false);
    expect(summary.predictiveAuthority).toBe(false);
    expect(summary.destinyAuthority).toBe(false);
  });
  test('final meaning remains member-owned',()=>{
    expect(summary.memberOwnsFinalMeaning).toBe(true);
    expect(summary.valid).toBe(true);
  });
});
