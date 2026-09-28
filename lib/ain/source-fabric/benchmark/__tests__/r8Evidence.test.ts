import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-SOURCE-FABRIC-02/r8/r8-summary.json'),'utf8'
));

describe('R8 generated evidence',()=>{
  test('is bound to the exact R7 parent',()=>{
    expect(summary.parentR7).toBe('1b8a468f51f95f5fec1a6dffc76722c4cd5f2c44');
  });

  test('bounded callosal exchange occurs without raw context bleed',()=>{
    expect(summary.boundedExchange).toBe(true);
    expect(summary.rawContextExchange).toBe(false);
    expect(summary.analyticSignalCount).toBeGreaterThan(0);
    expect(summary.associativeSignalCount).toBeGreaterThan(0);
  });

  test('a fifth-element candidate is present and novel relative to independent pathways',()=>{
    expect(summary.candidatePresent).toBe(true);
    expect(summary.candidateNovel).toBe(true);
  });

  test('either pathway is necessary for the emergence',()=>{
    expect(summary.analyticAblationRemoves).toBe(true);
    expect(summary.associativeAblationRemoves).toBe(true);
  });

  test('contradiction and absence survive the emergence',()=>{
    expect(summary.contradictionPreserved).toBe(true);
    expect(summary.absencePreserved).toBe(true);
  });

  test('the emergence remains provisional and non-totalizing',()=>{
    expect(summary.candidateProvisional).toBe(true);
    expect(summary.persistenceAuthority).toBe(false);
    expect(summary.wholePersonAuthority).toBe(false);
    expect(summary.valid).toBe(true);
  });
});
