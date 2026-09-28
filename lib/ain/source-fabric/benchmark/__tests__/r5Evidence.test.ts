import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root=resolve(__dirname,'../../../../..');
const evidence=JSON.parse(readFileSync(
  resolve(root,'docs/programme/AIN-SOURCE-FABRIC-02/r5/r5-evidence.json'),
  'utf8',
));
const summary=JSON.parse(readFileSync(
  resolve(root,'docs/programme/AIN-SOURCE-FABRIC-02/r5/r5-summary.json'),
  'utf8',
));

describe('AIN-SOURCE-FABRIC-02R5 generated evidence',()=>{
  it('is anchored to the accepted R4G field',()=>{
    expect(summary.parentR4G).toBe('b7c1982dc67c004afef8c21ca09d647c207172a2');
    expect(summary.temporalEdgeCount).toBeGreaterThanOrEqual(5);
  });

  it('produces a valid ablation-ready real P4 Aether field',()=>{
    expect(summary.p4RelationCount).toBeGreaterThan(0);
    expect(summary.p4Valid).toBe(true);
    expect(summary.p4AblationValid).toBe(true);

    for(const relation of evidence.p4.ablationMatrix){
      for(const test of relation.tests){
        expect(test.invalidates).toBe(true);
      }
    }
  });

  it('keeps superseded J9 visible but non-relied-upon in current T5',()=>{
    expect(summary.t5Valid).toBe(true);
    expect(summary.t5J9Status).toBe('superseded');
    expect(summary.t5J9ReliedUpon).toBe(false);
    expect(summary.t5J9RelationsHistorical).toBe(true);
  });

  it('applies member correction to relation standing without changing sources',()=>{
    expect(summary.correctionBefore).toBe('active_candidate');
    expect(summary.correctionAfter).toBe('rejected');
    expect(summary.correctionSourcesUnchanged).toBe(true);
  });

  it('distinguishes evidence succession from supersession',()=>{
    expect(evidence.temporalGraph.libraryAdr.currentClaimEligible).toBe(true);
    expect(evidence.temporalGraph.indraComposer.currentClaimEligible).toBe(true);
    expect(evidence.temporalGraph.j9.currentClaimEligible).toBe(false);
  });
});
