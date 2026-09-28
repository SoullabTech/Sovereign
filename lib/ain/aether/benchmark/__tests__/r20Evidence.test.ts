import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r20/r20-summary.json'),'utf8'
));

describe('AIN-AETHER-01R20 generated evidence',()=>{
  test('is bound to exact R19 parent',()=>{
    expect(summary.parentR19).toBe('420e250383409f17ff33b43c25938330ecef43a4');
  });
  test('ambiguous when becomes clarification',()=>{
    expect(summary.ambiguityKind).toBe('clarification');
    expect(summary.ambiguityText).toMatch(/Do you mean when the system recorded it/i);
  });
  test('question-scoped sources remain correct',()=>{
    expect(summary.systemSelected).toBe('clock:1');
    expect(summary.rememberedSelected).toBe('memory:1');
    expect(summary.documentSelected).toBe('journal:1');
    expect(summary.periodSelected).toBe('period:1');
    expect(summary.sequenceSelected).toBe('sequence:1');
  });
  test('member-facing dialogue exposes no internal taxonomy',()=>{
    expect(summary.allNaturalLanguage).toBe(true);
  });
  test('no universal temporal winner is introduced',()=>{
    expect(summary.noUniversalWinner).toBe(true);
    expect(summary.allValid).toBe(true);
  });
});