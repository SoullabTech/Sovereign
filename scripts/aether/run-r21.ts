import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runTemporalDialogueBlindSet } from '../../lib/ain/aether/benchmark/temporalDialogueFalsification';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r21');
mkdirSync(OUT,{recursive:true});

const run=runTemporalDialogueBlindSet();

const evidence={
  generatedAt:new Date().toISOString(),
  parentR20:'08c317a7eeca633c208180d7f9a03dd5dafb0bb4',
  run,
};

writeFileSync(OUT+'/r21-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r21-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR20:evidence.parentR20,
  blindTotal:run.total,
  blindCorrect:run.correct,
  allBlindCorrect:run.correct===run.total,
  noJargon:run.rows.every(r=>!r.validation.errors.includes('technical_temporal_jargon_in_member_text')),
  noSourceSubstitution:run.rows.every(r=>r.correct),
  noUniversalWinner:run.rows.every(r=>r.response.universalWinner===false),
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r21-summary.json','utf8')),null,2));
