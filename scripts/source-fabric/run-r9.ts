import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildAetherInputFromField } from '../../lib/ain/source-fabric/benchmark/aetherBuilder';
import { generateAetherCandidates } from '../../lib/ain/source-fabric/benchmark/aetherSynthesis';
import { buildCrystalCenterField } from '../../lib/ain/source-fabric/benchmark/crystalCenter';
import {
  buildParallelPathways,
  exchangeCallosalSignals,
  generateFifthElementCandidate,
} from '../../lib/ain/source-fabric/benchmark/callosalEmergence';
import {
  bridgeAblation,
  distractorInvariant,
  evaluateEmergenceQuality,
} from '../../lib/ain/source-fabric/benchmark/emergenceQuality';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-SOURCE-FABRIC-02/r9');
mkdirSync(OUT,{recursive:true});

function makeField(ref:string,refs:string[]){
  const input=buildAetherInputFromField(ref,refs,'mixed');
  input.absences.push({
    absenceRef:'r9:member-owned-final-meaning:'+ref,
    subject:'member-owned final meaning',
    reason:'no_support',
  });
  return buildCrystalCenterField(input,generateAetherCandidates(input));
}

function witness(ref:string,refs:string[]){
  const field=makeField(ref,refs);
  const {analytic,associative}=buildParallelPathways(field);
  const exchange=exchangeCallosalSignals(analytic,associative);
  const candidate=generateFifthElementCandidate(field,analytic,associative,exchange);
  const quality=evaluateEmergenceQuality(field,candidate);
  return {ref,refs,candidatePresent:!!candidate,quality};
}

const governance=witness('R9-governance',[
  'authority-law','source-fabric','direction-authority','teaching-constitution','writers-studio',
]);
const relational=witness('R9-relational',[
  'rgr-note','rgr-constitution','indra-grammar','indra-permeability','indra-composer','indra-validation',
]);
const retrieval=witness('R9-retrieval',[
  'source-fabric','library-adr','source-fabric-census','benchmark-contract','j11-reconciliation',
]);

const distractorField=makeField('R9-distractor',[
  'rgr-note','rgr-constitution','indra-grammar','ea-manuscript',
]);
const distractorCandidate=(()=>{
  const {analytic,associative}=buildParallelPathways(distractorField);
  return generateFifthElementCandidate(
    distractorField,analytic,associative,exchangeCallosalSignals(analytic,associative),
  );
})();

const sparse=witness('R9-sparse',['ea-manuscript','library-adr']);
const bridgeField=makeField('R9-single-bridge',['rgr-note','indra-grammar']);
const bridgeBefore=(()=>{
  const {analytic,associative}=buildParallelPathways(bridgeField);
  const candidate=generateFifthElementCandidate(
    bridgeField,analytic,associative,exchangeCallosalSignals(analytic,associative),
  );
  return evaluateEmergenceQuality(bridgeField,candidate);
})();
const bridgeAfter=bridgeAblation(bridgeField,['indra-grammar']);

const evidence={
  generatedAt:new Date().toISOString(),
  parentR8:'bb3f99aad04660b64f261136e89a6cdd5abc5b95',
  positiveConstellations:[governance,relational,retrieval],
  distractor:{
    quality:evaluateEmergenceQuality(distractorField,distractorCandidate),
    invariant:distractorInvariant(distractorField,'ea-manuscript'),
  },
  sparse,
  bridge:{
    before:bridgeBefore,
    candidateAfter:!!bridgeAfter.candidateAfter,
    after:bridgeAfter.qualityAfter,
  },
};

writeFileSync(OUT+'/r9-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r9-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR8:evidence.parentR8,
  positiveConstellationsPassed:evidence.positiveConstellations.filter(x=>x.quality.valid).length,
  positiveConstellationsTotal:evidence.positiveConstellations.length,
  distractorExcludedFromEffectiveSupport:
    !evidence.distractor.quality.effectiveSupportRefs.includes('ea-manuscript'),
  distractorInvariant:evidence.distractor.invariant.valid,
  sparseCandidatePresent:evidence.sparse.candidatePresent,
  sparseValid:evidence.sparse.quality.valid,
  bridgeBeforeValid:evidence.bridge.before.valid,
  bridgeCandidateAfterRemoval:evidence.bridge.candidateAfter,
  bridgeAfterValid:evidence.bridge.after.valid,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r9-summary.json','utf8')),null,2));
