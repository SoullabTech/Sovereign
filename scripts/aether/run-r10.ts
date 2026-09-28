import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AetherTrajectory, TrajectoryPattern } from '../../lib/ain/aether/benchmark/fieldTrajectory';
import { buildMultiSpiralField } from '../../lib/ain/aether/benchmark/multiSpiral';
import { deriveAethericGestalt } from '../../lib/ain/aether/benchmark/fieldOfFields';
import {
  buildEvidenceBoundUtterance,
  validateDialogueSemanticFidelity,
} from '../../lib/ain/aether/benchmark/dialogueSemanticFidelity';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r10');
mkdirSync(OUT,{recursive:true});

function trajectory(ref:string,classification:TrajectoryPattern):AetherTrajectory{
  return {
    trajectoryRef:ref,
    moments:[
      {index:0,fieldRef:ref+':1',motifRefs:[],relationRefs:[]},
      {index:1,fieldRef:ref+':2',motifRefs:[],relationRefs:[]},
      {index:2,fieldRef:ref+':3',motifRefs:[],relationRefs:[]},
    ],
    deltas:[],
    classification,
    supportingSignals:['r10-semantic-fidelity-witness'],
    confidence:.7,
    predictiveAuthority:false,
    destinyAuthority:false,
    developmentalRankAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

const field=buildMultiSpiralField('r10:field',[
  {spiralRef:'work',domain:'work',trajectory:trajectory('work','phase_change')},
  {spiralRef:'creative',domain:'creative',trajectory:trajectory('creative','sustained_convergence')},
  {spiralRef:'relationship',domain:'relationship',trajectory:trajectory('relationship','phase_change')},
  {spiralRef:'family',domain:'family',trajectory:trajectory('family','recurrence')},
  {spiralRef:'body',domain:'body',trajectory:trajectory('body','ordinary_fluctuation')},
  {spiralRef:'spiritual',domain:'spiritual',trajectory:trajectory('spiritual','dissolution')},
]);
const gestalt=deriveAethericGestalt(field);

const admitted=[
  buildEvidenceBoundUtterance(field,gestalt,'spirals_related',['work','creative']),
  buildEvidenceBoundUtterance(field,gestalt,'spirals_more_independent',['family','body']),
  buildEvidenceBoundUtterance(field,gestalt,'trajectory_pair',['spiritual','creative']),
  buildEvidenceBoundUtterance(field,gestalt,'gestalt_partiality',gestalt.participatingSpiralRefs),
].map(utterance=>validateDialogueSemanticFidelity(field,gestalt,utterance));

const unsupported=validateDialogueSemanticFidelity(
  field,
  gestalt,
  buildEvidenceBoundUtterance(field,gestalt,'spirals_related',['family','body']),
);

const evidence={
  generatedAt:new Date().toISOString(),
  parentR9:'9bcb670dc287e460b37a9caed8bff1ef7f7c6f86',
  field,
  gestalt,
  admitted,
  unsupported,
};

writeFileSync(OUT+'/r10-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r10-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR9:evidence.parentR9,
  admittedCount:evidence.admitted.filter(x=>x.valid).length,
  admittedTotal:evidence.admitted.length,
  allAdmittedHaveProvenance:evidence.admitted.every(x=>x.valid&&x.provenance!==null),
  unsupportedRefused:evidence.unsupported.valid===false,
  unsupportedErrors:evidence.unsupported.errors,
  provenanceIncludesWhy:evidence.admitted.every(x=>Boolean(x.provenance?.whyThisReflection)),
  provenanceIncludesUncertainty:evidence.admitted.every(x=>Boolean(x.provenance?.uncertainty)),
  provenanceIncludesMemberCheck:evidence.admitted.every(x=>Boolean(x.provenance?.memberCheck)),
  nonfitPreserved:evidence.admitted
    .filter(x=>x.utterance.claimKind==='gestalt_partiality')
    .every(x=>JSON.stringify(x.provenance?.nonfitSpiralRefs)===JSON.stringify(gestalt.excludedSpiralRefs)),
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r10-summary.json','utf8')),null,2));
