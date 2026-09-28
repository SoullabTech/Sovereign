import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ablateSemanticSource,
  buildHumanLegibleProvenance,
  composeRetrievalSemanticProposition,
  validateSemanticFidelity,
} from '../../lib/ain/source-fabric/benchmark/semanticFidelity';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-SOURCE-FABRIC-02/r10');
mkdirSync(OUT,{recursive:true});

const refs=['library-adr','source-fabric-census','source-fabric','j11-reconciliation'];
const proposition=composeRetrievalSemanticProposition(refs);
if(!proposition) throw new Error('R10_PROPOSITION_NOT_COMPOSED');
const provenance=buildHumanLegibleProvenance(proposition);
const validation=validateSemanticFidelity(proposition);
const ablations=refs.map(sourceRef=>{
  const after=ablateSemanticSource(proposition,sourceRef);
  return {
    sourceRef,
    candidateAfter:!!after,
    propositionAfter:after?.proposition??null,
  };
});

const evidence={
  generatedAt:new Date().toISOString(),
  parentR9:'990fe23d91d9dec8b4f913cd5f98cd783a54095d',
  proposition,
  provenance,
  validation,
  ablations,
};

writeFileSync(OUT+'/r10-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r10-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR9:evidence.parentR9,
  valid:evidence.validation.valid,
  sourceCount:evidence.provenance.sources.length,
  counterfactualCount:evidence.provenance.counterfactuals.length,
  humanReviewRequired:evidence.provenance.humanReview.required,
  coreAblationsRemove:evidence.ablations
    .filter(x=>['library-adr','source-fabric-census','source-fabric'].includes(x.sourceRef))
    .every(x=>x.candidateAfter===false),
  historicalAblationPreservesCore:evidence.ablations
    .find(x=>x.sourceRef==='j11-reconciliation')?.candidateAfter===true,
  contradictionVisible:!!evidence.provenance.contradiction,
  absenceVisible:!!evidence.provenance.absence,
  uncertaintyVisible:!!evidence.provenance.uncertainty,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r10-summary.json','utf8')),null,2));
