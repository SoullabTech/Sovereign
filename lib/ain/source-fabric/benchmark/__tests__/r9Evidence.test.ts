import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-SOURCE-FABRIC-02/r9/r9-summary.json'),'utf8'
));

describe('R9 generated evidence',()=>{
  test('is bound to the exact R8 parent',()=>{
    expect(summary.parentR8).toBe('bb3f99aad04660b64f261136e89a6cdd5abc5b95');
  });

  test('all positive constellations generalize',()=>{
    expect(summary.positiveConstellationsPassed).toBe(summary.positiveConstellationsTotal);
    expect(summary.positiveConstellationsTotal).toBeGreaterThanOrEqual(3);
  });

  test('distractors do not become effective support',()=>{
    expect(summary.distractorExcludedFromEffectiveSupport).toBe(true);
    expect(summary.distractorInvariant).toBe(true);
  });

  test('disconnected sparse fields refuse fake emergence',()=>{
    expect(summary.sparseCandidatePresent).toBe(false);
    expect(summary.sparseValid).toBe(false);
  });

  test('bridge removal destroys emergence',()=>{
    expect(summary.bridgeBeforeValid).toBe(true);
    expect(summary.bridgeCandidateAfterRemoval).toBe(false);
    expect(summary.bridgeAfterValid).toBe(false);
  });
});
