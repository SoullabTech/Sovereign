import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r21/r21-summary.json'),'utf8'
));

describe('AIN-AETHER-01R21 generated evidence',()=>{
  test('is bound to exact R20 parent',()=>{
    expect(summary.parentR20).toBe('08c317a7eeca633c208180d7f9a03dd5dafb0bb4');
  });
  test('all blind cases classify correctly',()=>{
    expect(summary.blindCorrect).toBe(summary.blindTotal);
    expect(summary.allBlindCorrect).toBe(true);
  });
  test('no jargon leaks into member dialogue',()=>{
    expect(summary.noJargon).toBe(true);
  });
  test('wrong-source substitution is absent',()=>{
    expect(summary.noSourceSubstitution).toBe(true);
  });
  test('no universal temporal winner is introduced',()=>{
    expect(summary.noUniversalWinner).toBe(true);
  });
});