import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-RUNTIME-01/r5/r5-summary.json'),'utf8'
));

describe('AIN-AETHER-RUNTIME-01R5 generated evidence',()=>{
  test('is bound to exact runtime R4 parent',()=>{
    expect(summary.parentRuntimeR4).toBe('b05465b40d852dc2f947152ffbc86a9fa0820e5a');
  });
  test('generates an evidence-bound candidate from the shared Work/Creative pattern',()=>{
    expect(summary.generated).toBe(true);
    expect(summary.referencedFacetRefs).toEqual(['work','creative']);
    expect(summary.referencedObservationRefs).toEqual(['r5:o:work','r5:o:creative']);
    expect(summary.candidateText).toMatch(/Work and Creative/i);
  });
  test('candidate remains provisional, corrigible, and member-owned',()=>{
    expect(summary.uncertainty).toBe(.35);
    expect(summary.correctionInvited).toBe(true);
    expect(summary.provisional).toBe(true);
    expect(summary.finalMeaningAuthority).toBe('member');
  });
  test('candidate carries no person, diagnosis, prediction, destiny, or Soul authority',()=>{
    expect(summary.identityAuthority).toBe(false);
    expect(summary.diagnosticAuthority).toBe(false);
    expect(summary.predictiveAuthority).toBe(false);
    expect(summary.destinyAuthority).toBe(false);
    expect(summary.soulRepresentationAuthority).toBe(false);
  });
  test('candidate remains non-deliverable and non-persistent',()=>{
    expect(summary.deliverable).toBe(false);
    expect(summary.memberFacingDelivered).toBe(false);
    expect(summary.maiaPromptMutated).toBe(false);
    expect(summary.persisted).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});