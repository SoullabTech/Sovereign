import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runAetherProgrammeClosure } from '../../lib/ain/aether/benchmark/aetherProgrammeClosure';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r23');
mkdirSync(OUT,{recursive:true});

const closure=runAetherProgrammeClosure();

const evidence={
  generatedAt:new Date().toISOString(),
  closure,
};

writeFileSync(OUT+'/r23-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r23-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR22:closure.parentR22,
  invariantCount:closure.invariants.length,
  passingInvariants:closure.invariants.filter(i=>i.pass).length,
  allPass:closure.allPass,
  contradictionRefs:closure.contradictionRefs,
  programmeStanding:closure.programmeStanding,
  runtimeAuthority:closure.runtimeAuthority,
  personDefinitionAuthority:closure.personDefinitionAuthority,
  soulRepresentationAuthority:closure.soulRepresentationAuthority,
  finalMeaningAuthority:closure.finalMeaningAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r23-summary.json','utf8')),null,2));
