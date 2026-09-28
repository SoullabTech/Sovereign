import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildAetherInputFromField } from '../../lib/ain/source-fabric/benchmark/aetherBuilder';
import { generateAetherCandidates } from '../../lib/ain/source-fabric/benchmark/aetherSynthesis';
import {
  buildCrystalCenterField,
  modeInventory,
  validateModeAblations,
  validateNonCollapsingIntegration,
} from '../../lib/ain/source-fabric/benchmark/crystalCenter';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-SOURCE-FABRIC-02/r7');
mkdirSync(OUT,{recursive:true});

const r4g=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-SOURCE-FABRIC-02/r4g/r4g-results.json'),'utf8'
));

function refsFor(id:string):string[]{
  const row=r4g.methods.final_with_abstention.rows.find((x:any)=>x.id===id);
  if(!row) throw new Error('R4G_QUERY_NOT_FOUND:'+id);
  return row.retrieved.map((x:any)=>x.sourceRef);
}

function witness(id:string){
  const input=buildAetherInputFromField(id,refsFor(id),'mixed');
  input.absences.push({
    absenceRef:'r7:member-owned-final-meaning:'+id,
    subject:'member-owned final meaning',
    reason:'no_support',
  });
  const candidates=generateAetherCandidates(input);
  const field=buildCrystalCenterField(input,candidates);
  return {
    inquiryRef:id,
    sourceRefs:refsFor(id),
    modes:modeInventory(field),
    facetCount:field.facets.length,
    candidateCount:candidates.length,
    validation:validateNonCollapsingIntegration(field),
    contradictions:field.facets.filter(f=>f.mode==='contradiction').length,
    absences:field.facets.filter(f=>f.mode==='absence').length,
    imaginal:field.facets.filter(f=>f.mode==='imaginal').length,
    permissions:field.integrationPermissions,
  };
}

function compositeWitness(){
  const refs=[
    'library-adr',
    'source-fabric-census',
    'source-fabric',
    'facet-crossings',
    'j9-adjudication',
    'j11-reconciliation',
    'rgr-note',
    'rgr-constitution',
  ];
  const input=buildAetherInputFromField('R7-COMPOSITE',refs,'mixed');
  input.absences.push({
    absenceRef:'r7:member-owned-final-meaning:composite',
    subject:'member-owned final meaning',
    reason:'no_support',
  });
  const candidates=generateAetherCandidates(input);
  const field=buildCrystalCenterField(input,candidates);
  return {
    sourceRefs:refs,
    modes:modeInventory(field),
    facetCount:field.facets.length,
    validation:validateNonCollapsingIntegration(field),
    modeAblationValidation:validateModeAblations(field),
    contradictions:field.facets.filter(f=>f.mode==='contradiction').length,
    absences:field.facets.filter(f=>f.mode==='absence').length,
    temporal:field.facets.filter(f=>f.mode==='temporal').length,
    imaginal:field.facets.filter(f=>f.mode==='imaginal').length,
    permissions:field.integrationPermissions,
  };
}

const evidence={
  generatedAt:new Date().toISOString(),
  parentR6:'de6d5bb5e39391fb1f7df342f3a2e9c49d7c6fb1',
  p4:witness('P4'),
  t5:witness('T5'),
  composite:compositeWitness(),
};

writeFileSync(OUT+'/r7-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r7-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR6:evidence.parentR6,
  p4Modes:evidence.p4.modes,
  p4Valid:evidence.p4.validation.valid,
  p4Contradictions:evidence.p4.contradictions,
  p4Absences:evidence.p4.absences,
  p4Imaginal:evidence.p4.imaginal,
  t5Modes:evidence.t5.modes,
  t5Valid:evidence.t5.validation.valid,
  t5Contradictions:evidence.t5.contradictions,
  t5Absences:evidence.t5.absences,
  t5Imaginal:evidence.t5.imaginal,
  compositeModes:evidence.composite.modes,
  compositeValid:evidence.composite.validation.valid,
  compositeModeAblationsValid:evidence.composite.modeAblationValidation.valid,
  compositeContradictions:evidence.composite.contradictions,
  compositeAbsences:evidence.composite.absences,
  compositeTemporal:evidence.composite.temporal,
  compositeImaginal:evidence.composite.imaginal,
  permissions:evidence.composite.permissions,
},null,2)+'\n');
console.log(readFileSync(OUT+'/r7-summary.json','utf8'));
