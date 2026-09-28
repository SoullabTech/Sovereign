import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root=resolve(__dirname,'../../../../..');
const result=JSON.parse(readFileSync(
  resolve(root,'docs/programme/AIN-SOURCE-FABRIC-02/r4-blind-b/blind-b-results.json'),
  'utf8',
));
const summary=result.summary;

describe('AIN-SOURCE-FABRIC-02R4 blind validation B evidence',()=>{
  it('is anchored to the frozen repair and blind-set commits',()=>{
    expect(summary.frozenRuleBase).toBe('920927b34f7cbb1f9ca7400c76e5feaacf9a2c4f');
    expect(summary.frozenBlindSetBase).toBe('9036d252f2a840bbb28f72a8d674208606dffce5');
  });

  it('records the answerability result exactly',()=>{
    expect(summary.queryCount).toBe(20);
    expect(summary.answerabilityAccuracy).toBeCloseTo(.9,12);
    expect(summary.supportedFalseAbstentions).toEqual([]);
    expect(summary.unsupportedFalseAnswers).toEqual(['BU2','BU10']);
  });

  it('records strong supported retrieval generalization',()=>{
    expect(summary.supportedMustRecall).toBeCloseTo(.95,12);
    expect(summary.fullSupportedMustCoverage).toBe(9);
  });
});
