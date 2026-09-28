import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { deriveMemberAetherField } from '../../lib/ain/aether/benchmark/memberField';
import { generateSyntheticReflectionCandidate } from '../../lib/ain/aether/runtime/syntheticReflectionCandidate';
import { authorizeSyntheticReflectionHandoff } from '../../lib/ain/aether/runtime/reflectionDeliveryGate';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-RUNTIME-01/r6');
mkdirSync(OUT,{recursive:true});

const field=deriveMemberAetherField('synthetic:r6:field',[
  {
    observationRef:'r6:o:work',
    facetRef:'work',
    motif:'A shared movement toward greater openness.',
    temporalStanding:'is_being',
    standing:'member_named',
    qualities:[],
    note:'Work feels more open.',
  },
  {
    observationRef:'r6:o:creative',
    facetRef:'creative',
    motif:'A shared movement toward greater openness.',
    temporalStanding:'is_being',
    standing:'source_observed',
    qualities:[],
    note:'Creative activity looks more open.',
  },
]);

const generated=generateSyntheticReflectionCandidate(field);
if(!generated.candidate) throw new Error('R6_CANDIDATE_NOT_GENERATED');

const noAuthorization=authorizeSyntheticReflectionHandoff(generated.candidate,null);
const humanAuthorization=authorizeSyntheticReflectionHandoff(
  generated.candidate,
  {
    authorizationRef:'human-auth:r6:witness',
    candidateRef:generated.candidate.candidateRef,
    actor:'human',
    authorized:true,
    scope:'synthetic_handoff_only',
    note:'Authorize synthetic handoff witness only.',
  },
);

const evidence={
  generatedAt:new Date().toISOString(),
  parentRuntimeR5:'9aedafed3762e98b12f48b811cb37beb12cfb793',
  noAuthorization,
  humanAuthorization,
};

writeFileSync(OUT+'/r6-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r6-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentRuntimeR5:evidence.parentRuntimeR5,
  noAuthorizationPassed:evidence.noAuthorization.gatePassed,
  noAuthorizationErrors:evidence.noAuthorization.errors,
  humanAuthorizationPassed:evidence.humanAuthorization.gatePassed,
  tokenCreated:Boolean(evidence.humanAuthorization.token),
  tokenScope:evidence.humanAuthorization.token?.scope??null,
  candidateValiditySelfAuthorized:evidence.humanAuthorization.candidateValiditySelfAuthorized,
  memberFacingDeliveryAuthorized:evidence.humanAuthorization.memberFacingDeliveryAuthorized,
  deliveryExecuted:evidence.humanAuthorization.deliveryExecuted,
  persistenceAuthorized:evidence.humanAuthorization.persistenceAuthorized,
  productionAuthority:evidence.humanAuthorization.productionAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r6-summary.json','utf8')),null,2));