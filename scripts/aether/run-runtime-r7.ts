import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { deriveMemberAetherField } from '../../lib/ain/aether/benchmark/memberField';
import { generateSyntheticReflectionCandidate } from '../../lib/ain/aether/runtime/syntheticReflectionCandidate';
import { authorizeSyntheticReflectionHandoff } from '../../lib/ain/aether/runtime/reflectionDeliveryGate';
import { simulateSyntheticDelivery } from '../../lib/ain/aether/runtime/syntheticDeliverySimulator';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-RUNTIME-01/r7');
mkdirSync(OUT,{recursive:true});

const field=deriveMemberAetherField('synthetic:r7:field',[
  {
    observationRef:'r7:o:work',
    facetRef:'work',
    motif:'A shared movement toward greater openness.',
    temporalStanding:'is_being',
    standing:'member_named',
    qualities:[],
    note:'Work feels more open.',
  },
  {
    observationRef:'r7:o:creative',
    facetRef:'creative',
    motif:'A shared movement toward greater openness.',
    temporalStanding:'is_being',
    standing:'source_observed',
    qualities:[],
    note:'Creative activity looks more open.',
  },
]);

const candidate=generateSyntheticReflectionCandidate(field).candidate;
if(!candidate) throw new Error('R7_CANDIDATE_NOT_GENERATED');

const gate=authorizeSyntheticReflectionHandoff(candidate,{
  authorizationRef:'human-auth:r7:witness',
  candidateRef:candidate.candidateRef,
  actor:'human',
  authorized:true,
  scope:'synthetic_handoff_only',
  note:'Authorize synthetic no-op delivery simulation only.',
});
if(!gate.token) throw new Error('R7_HANDOFF_TOKEN_MISSING');

const simulation=simulateSyntheticDelivery(gate.token);

const evidence={
  generatedAt:new Date().toISOString(),
  parentRuntimeR6:'deabeaf103c8436fcb8546e19e19d078398f7336',
  candidate,
  gate,
  simulation,
};

writeFileSync(OUT+'/r7-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r7-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentRuntimeR6:evidence.parentRuntimeR6,
  simulated:evidence.simulation.simulated,
  receiptCreated:Boolean(evidence.simulation.receipt),
  tokenRef:evidence.simulation.receipt?.tokenRef??null,
  candidateRef:evidence.simulation.receipt?.candidateRef??null,
  simulationKind:evidence.simulation.receipt?.simulation??null,
  memberFacingContacted:evidence.simulation.receipt?.memberFacingContacted??null,
  deliveryExecuted:evidence.simulation.receipt?.deliveryExecuted??null,
  notificationSent:evidence.simulation.receipt?.notificationSent??null,
  persisted:evidence.simulation.receipt?.persisted??null,
  maiaPromptMutated:evidence.simulation.receipt?.maiaPromptMutated??null,
  networkSideEffect:evidence.simulation.receipt?.networkSideEffect??null,
  productionAuthority:evidence.simulation.receipt?.productionAuthority??null,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r7-summary.json','utf8')),null,2));