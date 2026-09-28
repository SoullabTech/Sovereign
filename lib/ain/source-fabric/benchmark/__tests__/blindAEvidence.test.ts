import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root=resolve(__dirname,'../../../../..');
const result=JSON.parse(readFileSync(
  resolve(root,'docs/programme/AIN-SOURCE-FABRIC-02/r4-blind/blind-results.json'),
  'utf8',
));
const summary=result.summary;

describe('AIN-SOURCE-FABRIC-02R4 blind validation A evidence',()=>{
  it('is anchored to the frozen rule and blind-set commits',()=>{
    expect(summary.frozenRuleBase).toBe('c8332853c9ef4222faf4754832f3bacc91ca7a0e');
    expect(summary.frozenBlindSetBase).toBe('84816958f8a044b9296c4b49161deafbb3c00b0c');
  });

  it('records the blind answerability result exactly',()=>{
    expect(summary.queryCount).toBe(24);
    expect(summary.supportedCount).toBe(16);
    expect(summary.unsupportedCount).toBe(8);
    expect(summary.answerabilityAccuracy).toBeCloseTo(.875,12);
    expect(summary.supportedFalseAbstentions).toEqual([]);
    expect(summary.unsupportedFalseAnswers).toEqual(['BN3','BN4','BN6']);
  });

  it('records the supported retrieval generalization result',()=>{
    expect(summary.supportedMustRecall).toBeCloseTo(.8645833333333333,12);
    expect(summary.fullSupportedMustCoverage).toBe(12);
  });

  it('does not misrepresent the partial blind result as a pass',()=>{
    expect(summary.unsupportedFalseAnswers.length).toBeGreaterThan(0);
  });
});
