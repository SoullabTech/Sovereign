import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { deriveMemberAetherField, type MemberFieldObservation } from '../../lib/ain/aether/benchmark/memberField';
import { generateSyntheticReflectionCandidate } from '../../lib/ain/aether/runtime/syntheticReflectionCandidate';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-RUNTIME-01/r5');
mkdirSync(OUT,{recursive:true});

const observations:MemberFieldObservation[]=[
  {
    observationRef:'r5:o:work',
    facetRef:'work',
    motif:'A shared movement toward greater openness.',
    temporalStanding:'is_being',
    standing:'member_named',
    qualities:[],
    note:'Work feels more open.',
  },
  {
    observationRef:'r5:o:creative',
    facetRef:'creative',
    motif:'A shared movement toward greater openness.',
    temporalStanding:'is_being',
    standing:'source_observed',
    qualities:[],
    note:'Creative activity also looks more open.',
  },
  {
    observationRef:'r5:o:relationship',
    facetRef:'relationship',
    motif:'Relationship feels unsettled but present.',
    temporalStanding:'is_being',
    standing:'member_named',
    qualities:[],
    note:'Relationship feels unsettled.',
  },
];

const field=deriveMemberAetherField('synthetic:r5:field',observations);
const result=generateSyntheticReflectionCandidate(field);

const evidence={
  generatedAt:new Date().toISOString(),
  parentRuntimeR4:'b05465b40d852dc2f947152ffbc86a9fa0820e5a',
  field,
  result,
};

writeFileSync(OUT+'/r5-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r5-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentRuntimeR4:evidence.parentRuntimeR4,
  generated:evidence.result.generated,
  candidateText:evidence.result.candidate?.text??null,
  referencedFacetRefs:evidence.result.candidate?.referencedFacetRefs??[],
  referencedObservationRefs:evidence.result.candidate?.referencedObservationRefs??[],
  uncertainty:evidence.result.candidate?.provenance.uncertainty??null,
  correctionInvited:evidence.result.candidate?.correctionInvited??null,
  provisional:evidence.result.candidate?.provisional??null,
  finalMeaningAuthority:evidence.result.candidate?.finalMeaningAuthority??null,
  identityAuthority:evidence.result.candidate?.identityAuthority??null,
  diagnosticAuthority:evidence.result.candidate?.diagnosticAuthority??null,
  predictiveAuthority:evidence.result.candidate?.predictiveAuthority??null,
  destinyAuthority:evidence.result.candidate?.destinyAuthority??null,
  soulRepresentationAuthority:evidence.result.candidate?.soulRepresentationAuthority??null,
  deliverable:evidence.result.candidate?.deliverable??null,
  memberFacingDelivered:evidence.result.candidate?.memberFacingDelivered??null,
  maiaPromptMutated:evidence.result.candidate?.maiaPromptMutated??null,
  persisted:evidence.result.candidate?.persisted??null,
  productionAuthority:evidence.result.candidate?.productionAuthority??null,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r5-summary.json','utf8')),null,2));