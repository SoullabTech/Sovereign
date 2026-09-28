import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  validateAetherInput,
  validateCriticalAblations,
} from '../aetherInput';
import { buildAetherInputFromField } from '../aetherBuilder';

const root=resolve(__dirname,'../../../../..');
const r4g=JSON.parse(readFileSync(
  resolve(root,'docs/programme/AIN-SOURCE-FABRIC-02/r4g/r4g-results.json'),
  'utf8',
));

function refsFor(id:string):string[]{
  const row=r4g.methods.final_with_abstention.rows.find((r:any)=>r.id===id);
  return row.retrieved.map((x:any)=>x.sourceRef);
}

describe('R5 real-field Aether input builder',()=>{
  it('builds a valid ablation-ready Aether input from the P4 relational-knowing field',()=>{
    const input=buildAetherInputFromField('P4',refsFor('P4'),'mixed');
    expect(validateAetherInput(input)).toEqual({valid:true,errors:[]});
    expect(validateCriticalAblations(input)).toEqual({valid:true,errors:[]});
    expect(input.relations.length).toBeGreaterThan(0);
    expect(input.relations.some(r=>r.introducedBy==='aether_candidate')).toBe(true);
    expect(input.synthesisPermissions.allowCreativeRelation).toBe(true);
    expect(input.synthesisPermissions.allowCausalClaim).toBe(false);
  });

  it('keeps a superseded historical source visible but non-relied-upon in a current field',()=>{
    const input=buildAetherInputFromField('T5',refsFor('T5'),'current');
    const j9=input.sources.find(s=>s.sourceRef==='j9-adjudication');
    expect(j9).toBeDefined();
    expect(j9?.status).toBe('superseded');
    expect(j9?.representedTime).toBe('has_been');
    expect(j9?.reliedUpon).toBe(false);
    expect(validateAetherInput(input)).toEqual({valid:true,errors:[]});
  });

  it('keeps temporal relations involving superseded material historical rather than current',()=>{
    const input=buildAetherInputFromField('T5',refsFor('T5'),'current');
    const j9Relations=input.relations.filter(r=>r.endpointRefs.includes('j9-adjudication'));
    expect(j9Relations.length).toBeGreaterThan(0);
    expect(j9Relations.every(r=>r.claimTemporalNeed==='historical')).toBe(true);
  });

  it('does not let the builder invent persistence, prediction, identity, or diagnosis authority',()=>{
    const input=buildAetherInputFromField('P4',refsFor('P4'),'mixed');
    expect(input.synthesisPermissions).toMatchObject({
      allowPrediction:false,
      allowIdentityClaim:false,
      allowDiagnosticClaim:false,
      allowThirdPartyInteriority:false,
      allowPersistence:false,
      requireAblation:true,
    });
  });
});
