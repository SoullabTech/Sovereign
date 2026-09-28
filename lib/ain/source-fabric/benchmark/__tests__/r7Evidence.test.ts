import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-SOURCE-FABRIC-02/r7/r7-summary.json'),'utf8'
));

describe('R7 generated evidence',()=>{
  test('is bound to the exact R6 parent',()=>{
    expect(summary.parentR6).toBe('de6d5bb5e39391fb1f7df342f3a2e9c49d7c6fb1');
  });

  test('composite witness holds all seven differentiated modes',()=>{
    expect(summary.compositeModes).toEqual([
      'absence','analytic','associative','contradiction','imaginal','temporal','uncertainty',
    ]);
    expect(summary.compositeValid).toBe(true);
  });

  test('mode ablations preserve differentiation',()=>{
    expect(summary.compositeModeAblationsValid).toBe(true);
  });

  test('the witness contains real contradiction, absence, temporal and imaginal material',()=>{
    expect(summary.compositeContradictions).toBeGreaterThan(0);
    expect(summary.compositeAbsences).toBeGreaterThan(0);
    expect(summary.compositeTemporal).toBeGreaterThan(0);
    expect(summary.compositeImaginal).toBeGreaterThan(0);
  });

  test('integration cannot collapse, erase, fill, promote, conclude, or persist',()=>{
    const p=summary.permissions;
    expect(p.allowModeCollapse).toBe(false);
    expect(p.allowContradictionErasure).toBe(false);
    expect(p.allowAbsenceFilling).toBe(false);
    expect(p.allowImaginalPromotion).toBe(false);
    expect(p.allowWholePersonConclusion).toBe(false);
    expect(p.allowPersistence).toBe(false);
  });
});
