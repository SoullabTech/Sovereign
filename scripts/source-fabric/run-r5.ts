import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ablateAetherSource,
  applyAetherCorrections,
  validateAetherInput,
  validateCriticalAblations,
  type AetherInput,
} from '../../lib/ain/source-fabric/benchmark/aetherInput';
import { buildAetherInputFromField } from '../../lib/ain/source-fabric/benchmark/aetherBuilder';
import {
  BENCHMARK_TEMPORAL_EDGES,
  temporalDisposition,
} from '../../lib/ain/source-fabric/benchmark/temporalGraph';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-SOURCE-FABRIC-02/r5');
mkdirSync(OUT,{recursive:true});

const r4g=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-SOURCE-FABRIC-02/r4g/r4g-results.json'),
  'utf8',
));

function refsFor(id:string):string[]{
  const row=r4g.methods.final_with_abstention.rows.find((r:any)=>r.id===id);
  if(!row)throw new Error('R4G_QUERY_NOT_FOUND:'+id);
  return row.retrieved.map((x:any)=>x.sourceRef);
}

function ablationMatrix(input:AetherInput){
  return input.relations.map(relation=>({
    relationRef:relation.relationRef,
    status:relation.status,
    criticalSupportRefs:relation.criticalSupportRefs,
    tests:relation.criticalSupportRefs.map(sourceRef=>{
      const result=ablateAetherSource(input,sourceRef);
      return {
        sourceRef,
        invalidates:result.invalidatedRelations.includes(relation.relationRef),
        invalidatedRelations:result.invalidatedRelations,
      };
    }),
  }));
}
const p4=buildAetherInputFromField('P4',refsFor('P4'),'mixed');
const t5=buildAetherInputFromField('T5',refsFor('T5'),'current');
const t1=buildAetherInputFromField('T1',refsFor('T1'),'current');

const correctionTarget=p4.relations.find(r=>r.introducedBy==='aether_candidate');
const corrected:AetherInput=structuredClone(p4);
if(correctionTarget){
  corrected.corrections.push({
    correctionRef:'r5-member-correction-demo',
    targetRelationRef:correctionTarget.relationRef,
    effect:'reject',
    introducedBy:'member',
  });
}
const correctedApplied=applyAetherCorrections(corrected);

const evidence={
  generatedAt:new Date().toISOString(),
  parentR4G:'b7c1982dc67c004afef8c21ca09d647c207172a2',
  temporalGraph:{
    edgeCount:BENCHMARK_TEMPORAL_EDGES.length,
    j9:temporalDisposition('j9-adjudication'),
    libraryAdr:temporalDisposition('library-adr'),
    indraComposer:temporalDisposition('indra-composer'),
  },
  p4:{
    refs:refsFor('P4'),
    relationCount:p4.relations.length,
    validation:validateAetherInput(p4),
    criticalAblationValidation:validateCriticalAblations(p4),
    ablationMatrix:ablationMatrix(p4),
  },
  t5:{
    refs:refsFor('T5'),
    validation:validateAetherInput(t5),
    j9:t5.sources.find(s=>s.sourceRef==='j9-adjudication')??null,
    j9Relations:t5.relations.filter(r=>r.endpointRefs.includes('j9-adjudication')),
  },
  t1:{
    refs:refsFor('T1'),
    validation:validateAetherInput(t1),
    j9:t1.sources.find(s=>s.sourceRef==='j9-adjudication')??null,
  },
  correction:{
    targetRelationRef:correctionTarget?.relationRef??null,
    before:correctionTarget?.status??null,
    after:correctedApplied.relations.find(r=>r.relationRef===correctionTarget?.relationRef)?.status??null,
    sourcesUnchanged:JSON.stringify(correctedApplied.sources)===JSON.stringify(p4.sources),
  },
};

writeFileSync(OUT+'/p4-aether-input.json',JSON.stringify(p4,null,2)+'\n');
writeFileSync(OUT+'/t5-current-aether-input.json',JSON.stringify(t5,null,2)+'\n');
writeFileSync(OUT+'/r5-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r5-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR4G:evidence.parentR4G,
  temporalEdgeCount:evidence.temporalGraph.edgeCount,
  p4RelationCount:evidence.p4.relationCount,
  p4Valid:evidence.p4.validation.valid,
  p4AblationValid:evidence.p4.criticalAblationValidation.valid,
  t5Valid:evidence.t5.validation.valid,
  t5J9Status:evidence.t5.j9?.status??null,
  t5J9ReliedUpon:evidence.t5.j9?.reliedUpon??null,
  t5J9RelationsHistorical:evidence.t5.j9Relations.every(r=>r.claimTemporalNeed==='historical'),
  correctionTarget:evidence.correction.targetRelationRef,
  correctionBefore:evidence.correction.before,
  correctionAfter:evidence.correction.after,
  correctionSourcesUnchanged:evidence.correction.sourcesUnchanged,
},null,2)+'\n');

console.log(readFileSync(OUT+'/r5-summary.json','utf8'));
