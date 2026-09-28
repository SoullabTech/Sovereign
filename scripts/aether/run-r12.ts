import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buildHumanSemanticReviewPacket,
  validateHumanSemanticReviewPacket,
} from '../../lib/ain/aether/benchmark/humanSemanticReview';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r12');
mkdirSync(OUT,{recursive:true});

const packet=buildHumanSemanticReviewPacket();
const validation=validateHumanSemanticReviewPacket(packet);

writeFileSync(OUT+'/r12-review-packet.json',JSON.stringify({
  generatedAt:new Date().toISOString(),
  packet,
  validation,
},null,2)+'\n');

const md:string[]=[];
md.push('# AIN-AETHER-01R12 — Human Semantic Review Packet');
md.push('');
md.push('Parent R11: 45b88f9c71dc72be113416a1d74b303c8e1ca532');
md.push('');
md.push('Frozen machine witness: docs/programme/AIN-AETHER-01/r11/r11-evidence.json');
md.push('');
md.push('**Status: HUMAN REVIEW PENDING**');md.push('');
md.push('Human notes append new evidence and do not mutate the frozen R11 machine witness.');
md.push('');

for(const card of packet.cards){
  md.push('---');
  md.push('');
  md.push('## '+card.caseRef+' — '+card.description);
  md.push('');
  md.push('### Represented field');
  md.push('');
  for(const s of card.representedField){
    md.push('- **'+s.domain+'** — '+s.trajectory);
  }
  md.push('');
  md.push('### Relevant field relations');
  md.push('');
  for(const r of card.relationSummary){
    md.push('- '+r.pair+' — '+r.kind);
  }
  md.push('');
  md.push('### Gestalt');
  md.push('');
  md.push('- standing: '+card.gestalt.standing);
  md.push('- participating: '+(card.gestalt.participatingSpiralRefs.join(', ')||'none'));
  md.push('- outside gestalt: '+(card.gestalt.excludedSpiralRefs.join(', ')||'none'));
  md.push('');  md.push('### Machine decision');
  md.push('');
  md.push('**'+card.machineDecision.toUpperCase()+'**');
  md.push('');
  md.push('> '+card.utterance);
  md.push('');
  if(card.whyThisReflection){
    md.push('### Why this reflection');
    md.push('');
    md.push(card.whyThisReflection);
    md.push('');
    md.push('**Uncertainty:** '+card.uncertainty);
    md.push('');
    md.push('**Member check:** '+card.memberCheck);
  } else {
    md.push('### Why no provenance was produced');
    md.push('');
    md.push(card.machineErrors.join(', '));
  }
  md.push('');
  md.push('### Human adjudication');
  md.push('');
  md.push('Choose one:');
  for(const option of card.adjudicationOptions){
    md.push('- [ ] '+option);
  }  md.push('');
  md.push('Review questions:');
  for(const q of card.reviewQuestions){
    md.push('- '+q);
  }
  md.push('');
  md.push('**Correction note:**');
  md.push('');
  md.push('____________________________________________');
  md.push('');
  md.push('**Corrected reflection, if needed:**');
  md.push('');
  md.push('____________________________________________');
  md.push('');
}

writeFileSync(OUT+'/R12_HUMAN_REVIEW_PACKET.md',md.join('\n').trimEnd()+'\n');

writeFileSync(OUT+'/r12-summary.json',JSON.stringify({
  generatedAt:new Date().toISOString(),
  parentR11:packet.parentR11,
  cardCount:packet.cards.length,
  humanReviewStatus:packet.humanReviewStatus,
  sourceMachineEvidenceMutable:packet.sourceMachineEvidenceMutable,
  frozenMachineWitnessRef:packet.frozenMachineWitnessRef,  admittedCards:packet.cards.filter(c=>c.machineDecision==='admit').length,
  refusedCards:packet.cards.filter(c=>c.machineDecision==='refuse').length,
  allCardsHaveReviewQuestions:packet.cards.every(c=>c.reviewQuestions.length>0),
  allCardsHaveAdjudicationOptions:packet.cards.every(c=>c.adjudicationOptions.length>0),
  valid:validation.valid,
},null,2)+'\n');

console.log(JSON.stringify(
  JSON.parse(require('node:fs').readFileSync(OUT+'/r12-summary.json','utf8')),
  null,
  2,
));