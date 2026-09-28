import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root=resolve(__dirname,'../../../../..');
const result=JSON.parse(readFileSync(
  resolve(root,'docs/programme/AIN-SOURCE-FABRIC-02/r4-blind-c/blind-c-results.json'),
  'utf8',
));
const summary=result.summary;

describe('AIN-SOURCE-FABRIC-02R4 Blind C evidence',()=>{
  it('is anchored to the frozen repair and blind-set commits',()=>{
    expect(summary.frozenRuleBase).toBe('46af35445407ec2afac5c9d198c3ee41a8441ce7');
    expect(summary.frozenBlindSetBase).toBe('b64a501fadd3a0219db6630365bbe4b236109e2e');
  });

  it('passes blind answerability without false abstention or unsupported answer',()=>{
    expect(summary.answerabilityAccuracy).toBe(1);
    expect(summary.supportedFalseAbstentions).toEqual([]);
    expect(summary.unsupportedFalseAnswers).toEqual([]);
  });

  it('retrieves every supported blind must-source',()=>{
    expect(summary.supportedMustRecall).toBe(1);
    expect(summary.fullSupportedMustCoverage).toBe(8);
  });
});
