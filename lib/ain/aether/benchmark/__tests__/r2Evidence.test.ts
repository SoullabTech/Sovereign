import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r2/r2-summary.json'),'utf8'
));

describe('AIN-AETHER-01R2 generated evidence',()=>{
  test('is bound to the exact R1 parent',()=>{
    expect(summary.parentR1).toBe('44c3d9fe67a2d6b0d5cec28fd167443c1f7b6efd');
  });
  test('persistent grief changes field role rather than merely disappearing',()=>{
    expect(summary.griefKind).toBe('intensified');
    expect(summary.griefAddedFacets).toContain('creative');
  });
  test('field geometry materially reorganizes',()=>{
    expect(summary.changed).toBe(true);
    expect(summary.addedRelations).toBeGreaterThan(0);
    expect(summary.removedRelations).toBeGreaterThan(0);
  });
  test('new motifs appear while older organizing motifs can recede',()=>{
    expect(summary.appearedMotifs).toEqual(expect.arrayContaining(['Love','Memory','Creativity']));
    expect(summary.disappearedMotifs).toEqual(expect.arrayContaining(['Fear','Isolation']));
  });
  test('delta remains provisional and member-owned in final meaning',()=>{
    expect(summary.provisional).toBe(true);
    expect(summary.memberOwnsFinalMeaning).toBe(true);
  });
});
