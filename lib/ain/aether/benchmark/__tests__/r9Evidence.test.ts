import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r9/r9-summary.json'),'utf8'
));

describe('AIN-AETHER-01R9 generated evidence',()=>{
  test('is bound to the exact R8 parent',()=>{
    expect(summary.parentR8).toBe('84b2e85187f3fa7498d2a50d3865829e8b4f6b03');
  });
  test('both frozen blind sets classify perfectly',()=>{
    expect(summary.blindA.correct).toBe(summary.blindA.total);
    expect(summary.blindB.correct).toBe(summary.blindB.total);
    expect(summary.combinedAccuracy).toBe(1);
  });
  test('admit, overreach, and underreach recall all remain perfect',()=>{
    for(const blind of [summary.blindA,summary.blindB]){
      expect(blind.admitRecall).toBe(1);
      expect(blind.overreachRecall).toBe(1);
      expect(blind.underreachRecall).toBe(1);
    }
  });
});
