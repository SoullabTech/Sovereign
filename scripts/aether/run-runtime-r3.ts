import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { adjudicateCandidateAetherEvent } from '../../lib/ain/aether/runtime/candidateEventEnvelope';
import { adaptSyntheticEventToBenchmarkObservation } from '../../lib/ain/aether/runtime/benchmarkObservationAdapter';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-RUNTIME-01/r3');
mkdirSync(OUT,{recursive:true});

function admitted(input:any){
  const result=adjudicateCandidateAetherEvent(input);
  if(!result.event) throw new Error('R3_WITNESS_EVENT_NOT_ADMITTED');
  return result.event;
}

const memberEvent=admitted({
  eventRef:'synthetic:event:r3:member',
  synthetic:true,
  source:'synthetic_member_authored',
  domain:'work',
  observation:'Work feels more open and experimental this week.',
  temporalStanding:'is_being',
  confidence:.8,
  consent:'explicit_synthetic_consent',
});

const importedEvent=admitted({
  eventRef:'synthetic:event:r3:imported',
  synthetic:true,
  source:'synthetic_imported',
  domain:'creative',
  observation:'Creative activity recurred across several synthetic notes.',
  temporalStanding:'has_been',
  confidence:.61,
  consent:'explicit_synthetic_consent',
});

const unknownEvent=admitted({
  eventRef:'synthetic:event:r3:unknown',
  synthetic:true,
  source:'synthetic_member_authored',
  domain:'relationship',
  observation:'The timing of this synthetic observation is not known.',
  temporalStanding:'unknown',
  confidence:.5,
  consent:'explicit_synthetic_consent',
});

const memberAdaptation=adaptSyntheticEventToBenchmarkObservation(memberEvent);
const importedAdaptation=adaptSyntheticEventToBenchmarkObservation(importedEvent);
const unknownAdaptation=adaptSyntheticEventToBenchmarkObservation(unknownEvent);

const evidence={
  generatedAt:new Date().toISOString(),
  parentRuntimeR2:'8a6286cce0953b60af9689ad755212b57c1c5463',
  memberAdaptation,
  importedAdaptation,
  unknownAdaptation,
};

writeFileSync(OUT+'/r3-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r3-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentRuntimeR2:evidence.parentRuntimeR2,
  memberAdapted:evidence.memberAdaptation.adapted,
  memberStanding:evidence.memberAdaptation.result?.observation.standing??null,
  importedAdapted:evidence.importedAdaptation.adapted,
  importedStanding:evidence.importedAdaptation.result?.observation.standing??null,
  memberConfidencePreserved:evidence.memberAdaptation.result?.provenance.sourceConfidence===.8,
  importedConfidencePreserved:evidence.importedAdaptation.result?.provenance.sourceConfidence===.61,
  unknownTemporalRefused:evidence.unknownAdaptation.adapted===false,
  unknownTemporalErrors:evidence.unknownAdaptation.errors,
  authorityEscalated:[
    evidence.memberAdaptation.result?.authorityEscalated,
    evidence.importedAdaptation.result?.authorityEscalated,
  ].some(Boolean),
  confidenceIncreased:[
    evidence.memberAdaptation.result?.confidenceIncreased,
    evidence.importedAdaptation.result?.confidenceIncreased,
  ].some(Boolean),
  persistenceAuthority:[
    evidence.memberAdaptation.result?.persistenceAuthority,
    evidence.importedAdaptation.result?.persistenceAuthority,
  ].some(Boolean),
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r3-summary.json','utf8')),null,2));