import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildAetherInputFromField } from '../../lib/ain/source-fabric/benchmark/aetherBuilder';
import { generateAetherCandidates } from '../../lib/ain/source-fabric/benchmark/aetherSynthesis';
import { buildCrystalCenterField } from '../../lib/ain/source-fabric/benchmark/crystalCenter';
import {
  ablateEmergencePathway,
  buildParallelPathways,
  exchangeCallosalSignals,
  generateFifthElementCandidate,
  validateFifthElementEmergence,
} from '../../lib/ain/source-fabric/benchmark/callosalEmergence';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-SOURCE-FABRIC-02/r8');
mkdirSync(OUT,{recursive:true});

const refs=[
  'library-adr','source-fabric-census','source-fabric','facet-crossings',
  'j9-adjudication','j11-reconciliation','rgr-note','rgr-constitution',
];
const input=buildAetherInputFromField('R8-COMPOSITE',refs,'mixed');
input.absences.push({
  absenceRef:'r8:member-owned-final-meaning',
  subject:'member-owned final meaning',
  reason:'no_support',
});
const field=buildCrystalCenterField(input,generateAetherCandidates(input));
const {analytic,associative}=buildParallelPathways(field);
const exchange=exchangeCallosalSignals(analytic,associative);
const candidate=generateFifthElementCandidate(field,analytic,associative,exchange);
const validation=validateFifthElementEmergence(
  field,analytic,associative,exchange,candidate,
);

const evidence={
  generatedAt:new Date().toISOString(),
  parentR7:'1b8a468f51f95f5fec1a6dffc76722c4cd5f2c44',
  sourceRefs:refs,
  analytic:{
    facetCount:analytic.facetRefs.length,
    signalCount:analytic.signals.length,
    independentCandidateCount:analytic.independentCandidateRefs.length,
  },
  associative:{
    facetCount:associative.facetRefs.length,
    signalCount:associative.signals.length,
    independentCandidateCount:associative.independentCandidateRefs.length,
  },
  exchange,
  candidate,
  validation,
  ablations:candidate ? [
    ablateEmergencePathway(candidate,'analytic_pathway'),
    ablateEmergencePathway(candidate,'associative_pathway'),
  ] : [],
};

writeFileSync(OUT+'/r8-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r8-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR7:evidence.parentR7,
  analyticSignalCount:evidence.analytic.signalCount,
  associativeSignalCount:evidence.associative.signalCount,
  boundedExchange:evidence.exchange.bounded,
  rawContextExchange:evidence.exchange.rawContextExchange,
  candidatePresent:!!evidence.candidate,
  candidateNovel:evidence.candidate?.novelRelativeToIndependentPaths??false,
  candidateProvisional:evidence.candidate?.provisional??false,
  persistenceAuthority:evidence.candidate?.persistenceAuthority??true,
  wholePersonAuthority:evidence.candidate?.wholePersonAuthority??true,
  contradictionPreserved:(evidence.candidate?.preservedContradictionFacetRefs.length??0)>0,
  absencePreserved:(evidence.candidate?.preservedAbsenceFacetRefs.length??0)>0,
  analyticAblationRemoves:evidence.ablations.find(x=>x.removedPathway==='analytic_pathway')?.candidateAfter==='absent',
  associativeAblationRemoves:evidence.ablations.find(x=>x.removedPathway==='associative_pathway')?.candidateAfter==='absent',
  valid:evidence.validation.valid,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r8-summary.json','utf8')),null,2));
