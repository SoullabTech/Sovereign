import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r19/r19-summary.json'),'utf8'
));

describe('AIN-AETHER-01R19 generated evidence',()=>{
  test('is bound to exact R18 parent',()=>{
    expect(summary.parentR18).toBe('05ae99fcc6578f51cc9430bb8a548947804c7215');
  });
  test('question-specific sources are selected',()=>{
    expect(summary.systemSelected).toBe('clock:1');
    expect(summary.documentSelected).toBe('journal:1');
    expect(summary.rememberedSelected).toBe('memory:1');
    expect(summary.periodSelected).toBe('period:1');
    expect(summary.sequenceSelected).toBe('sequence:1');
  });
  test('ambiguous when-question does not choose a winner',()=>{
    expect(summary.ambiguousSelected).toBeNull();
    expect(summary.ambiguityRequiresClarification).toBe(true);
  });
  test('no source gains universal authority',()=>{
    expect(summary.noUniversalWinner).toBe(true);
  });
  test('all authority decisions validate',()=>{
    expect(summary.allValid).toBe(true);
  });
});