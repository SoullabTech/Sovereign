import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  BLIND_DIALOGUE_SET_A,
  BLIND_DIALOGUE_SET_B,
  scoreBlindDialogueSet,
} from '../../lib/ain/aether/benchmark/fieldDialogueFalsification';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r9');
mkdirSync(OUT,{recursive:true});

const a=scoreBlindDialogueSet(BLIND_DIALOGUE_SET_A);
const b=scoreBlindDialogueSet(BLIND_DIALOGUE_SET_B);

const evidence={
  generatedAt:new Date().toISOString(),
  parentR8:'84b2e85187f3fa7498d2a50d3865829e8b4f6b03',
  blindA:a,
  blindB:b,
};

writeFileSync(OUT+'/r9-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r9-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR8:evidence.parentR8,
  blindA:{
    total:a.total,
    correct:a.correct,
    accuracy:a.accuracy,
    admitRecall:a.admitRecall,
    overreachRecall:a.overreachRecall,
    underreachRecall:a.underreachRecall,
  },
  blindB:{
    total:b.total,
    correct:b.correct,
    accuracy:b.accuracy,
    admitRecall:b.admitRecall,
    overreachRecall:b.overreachRecall,
    underreachRecall:b.underreachRecall,
  },
  combinedCorrect:a.correct+b.correct,
  combinedTotal:a.total+b.total,
  combinedAccuracy:(a.correct+b.correct)/(a.total+b.total),
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r9-summary.json','utf8')),null,2));
