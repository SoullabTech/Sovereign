import { evaluate } from './laws';
import { referenceCarry } from './contract';
import { defeatCandidates, mutant } from './candidates';
const base=referenceCarry();
const rows=evaluate(base); let failures=0;
for(const r of rows){console.log((r.pass?'PASS':'FAIL')+' A2-8-'+r.id+' — '+r.detail);if(!r.pass)failures++;}
console.log('REFERENCE '+rows.filter(r=>r.pass).length+'/'+rows.length);
let dead=0;
for(const [name,law,mutate] of defeatCandidates){
  const result=evaluate(mutant(base,mutate));
  const killed=result.some(r=>r.id===law&&!r.pass);
  console.log((killed?'DEAD':'SURVIVES')+' '+name+' -> '+law);
  if(killed)dead++; else failures++;
}
console.log('DEFEATS '+dead+'/'+defeatCandidates.length);
process.exitCode=failures?1:0;
