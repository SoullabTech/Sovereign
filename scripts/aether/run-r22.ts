import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runTemporalProgrammeClosure } from '../../lib/ain/aether/benchmark/temporalProgrammeClosure';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r22');
mkdirSync(OUT,{recursive:true});

const closure=runTemporalProgrammeClosure();

const evidence={
  generatedAt:new Date().toISOString(),
  closure,
};

writeFileSync(OUT+'/r22-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r22-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR21:closure.parentR21,
  invariantCount:closure.invariants.length,
  passingInvariants:closure.invariants.filter(i=>i.pass).length,
  allPass:closure.allPass,
  contradictionRefs:closure.contradictionRefs,
  temporalProgrammeStanding:closure.temporalProgrammeStanding,
  runtimeAuthority:closure.runtimeAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r22-summary.json','utf8')),null,2));
