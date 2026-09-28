import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { adjudicateCandidateAetherEvent } from '../../lib/ain/aether/runtime/candidateEventEnvelope';
import { adaptSyntheticEventToBenchmarkObservation } from '../../lib/ain/aether/runtime/benchmarkObservationAdapter';
import { deriveSyntheticMemberField } from '../../lib/ain/aether/runtime/syntheticFieldDerivation';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-RUNTIME-01/r4');
mkdirSync(OUT,{recursive:true});

function adapted(
  eventRef:string,
  domain:string,
  observation:string,
  source:'synthetic_member_authored'|'synthetic_system_observed',
  confidence:number,
){
  const admitted=adjudicateCandidateAetherEvent({
    eventRef,
    synthetic:true,
    source,
    domain,
    observation,
    temporalStanding:'is_being',
    confidence,
    consent:'explicit_synthetic_consent',
  });
  if(!admitted.event) throw new Error('R4_EVENT_NOT_ADMITTED:'+eventRef);
  const converted=adaptSyntheticEventToBenchmarkObservation(admitted.event);
  if(!converted.result) throw new Error('R4_EVENT_NOT_ADAPTED:'+eventRef);
  return converted.result;
}

const batch=[
  adapted('r4:e1','work','A shared movement toward greater openness.','synthetic_member_authored',.82),
  adapted('r4:e2','creative','A shared movement toward greater openness.','synthetic_system_observed',.64),
  adapted('r4:e3','relationship','Relationship feels unsettled but present.','synthetic_member_authored',.77),
];

const result=deriveSyntheticMemberField('synthetic:r4:field',batch);
const sharedPattern=result.field?.patterns.find(p=>p.contributingFacetRefs.length===2)??null;

const evidence={
  generatedAt:new Date().toISOString(),
  parentRuntimeR3:'2031daf5c7f1df04aab520ff28079995b00480f0',
  result,
  sharedPattern,
};

writeFileSync(OUT+'/r4-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r4-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentRuntimeR3:evidence.parentRuntimeR3,
  derived:evidence.result.derived,
  observationCount:evidence.result.field?.observations.length??0,
  patternCount:evidence.result.field?.patterns.length??0,
  sharedPatternFacets:evidence.sharedPattern?.contributingFacetRefs??[],
  sharedPatternMovements:evidence.sharedPattern?.movements??[],
  sharedPatternProvisional:evidence.sharedPattern?.provisional??null,
  sharedPatternIdentityAuthority:evidence.sharedPattern?.identityAuthority??null,
  sharedPatternDiagnosticAuthority:evidence.sharedPattern?.diagnosticAuthority??null,
  sharedPatternPredictiveAuthority:evidence.sharedPattern?.predictiveAuthority??null,
  sharedPatternSoulAuthority:evidence.sharedPattern?.soulRepresentationAuthority??null,
  finalMeaningAuthority:evidence.result.field?.finalMeaningAuthority??null,
  persistenceAuthority:evidence.result.field?.persistenceAuthority??null,
  persisted:evidence.result.persisted,
  liveMemberDataBound:evidence.result.liveMemberDataBound,
  productionAuthority:evidence.result.productionAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r4-summary.json','utf8')),null,2));