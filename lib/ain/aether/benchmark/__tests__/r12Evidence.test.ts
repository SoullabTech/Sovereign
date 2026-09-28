import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r12/r12-summary.json'),'utf8'
));

describe('AIN-AETHER-01R12 generated evidence',()=>{
  test('is bound to the exact R11 parent',()=>{
    expect(summary.parentR11).toBe('45b88f9c71dc72be113416a1d74b303c8e1ca532');
  });
  test('builds all five human review cards',()=>{
    expect(summary.cardCount).toBe(5);
    expect(summary.admittedCards).toBe(4);
    expect(summary.refusedCards).toBe(1);
  });  test('review remains pending and machine witness immutable',()=>{
    expect(summary.humanReviewStatus).toBe('pending');
    expect(summary.sourceMachineEvidenceMutable).toBe(false);
  });
  test('all cards expose questions and adjudication choices',()=>{
    expect(summary.allCardsHaveReviewQuestions).toBe(true);
    expect(summary.allCardsHaveAdjudicationOptions).toBe(true);
  });
  test('packet validates',()=>{
    expect(summary.valid).toBe(true);
  });
});