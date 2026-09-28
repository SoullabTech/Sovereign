import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { adjudicateCandidateAetherEvent } from '../../lib/ain/aether/runtime/candidateEventEnvelope';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-RUNTIME-01/r2');
mkdirSync(OUT,{recursive:true});

const admitted=adjudicateCandidateAetherEvent({
  eventRef:'synthetic:event:1',
  synthetic:true,
  source:'synthetic_member_authored',
  domain:'work',
  observation:'Work feels more open and experimental this week.',
  temporalStanding:'is_being',
  confidence:.8,
  consent:'explicit_synthetic_consent',
});

const nonSynthetic=adjudicateCandidateAetherEvent({
  eventRef:'candidate:non-synthetic',
  synthetic:false,
  source:'synthetic_system_observed',
  domain:'relationship',
  observation:'A relation was observed.',
  temporalStanding:'is_being',
  confidence:.6,
  consent:'absent',
});

const authoritySmuggle=adjudicateCandidateAetherEvent({
  eventRef:'synthetic:event:authority',
  synthetic:true,
  source:'synthetic_system_observed',
  domain:'creative',
  observation:'Your soul wants you to follow this destiny.',
  temporalStanding:'may_become',
  confidence:.9,
  consent:'explicit_synthetic_consent',
  predictiveAuthority:true,
  destinyAuthority:true,
  soulRepresentationAuthority:true,
  persistenceAuthority:true,
  finalMeaningAuthority:'system',
});

const evidence={
  generatedAt:new Date().toISOString(),
  parentRuntimeR1:'34827027cc3db4247eea3be720a48149ac282349',
  admitted,
  nonSynthetic,
  authoritySmuggle,
};

writeFileSync(OUT+'/r2-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r2-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentRuntimeR1:evidence.parentRuntimeR1,
  admittedSyntheticObservation:evidence.admitted.admitted,
  admittedFinalMeaningAuthority:evidence.admitted.event?.finalMeaningAuthority??null,
  liveMemberDataAuthorized:evidence.admitted.liveMemberDataAuthorized,
  persistenceAuthorized:evidence.admitted.persistenceAuthorized,
  nonSyntheticRefused:evidence.nonSynthetic.admitted===false,
  absentConsentRefused:evidence.nonSynthetic.errors.includes('consent_absent'),
  authoritySmuggleRefused:evidence.authoritySmuggle.admitted===false,
  authoritySmuggleErrors:evidence.authoritySmuggle.errors,
  productionAuthority:[
    evidence.admitted.productionAuthority,
    evidence.nonSynthetic.productionAuthority,
    evidence.authoritySmuggle.productionAuthority,
  ].some(Boolean),
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r2-summary.json','utf8')),null,2));