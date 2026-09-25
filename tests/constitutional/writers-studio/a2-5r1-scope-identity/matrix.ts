import { evaluate } from './laws';
import { referenceContract } from './contract';
import { defeatCandidates, mutant } from './candidates';

const ref=evaluate(referenceContract());
let failures=0;
for(const x of ref){
  console.log((x.pass?'PASS':'FAIL')+' A2-5R1-'+x.id+' — '+x.detail);
  if(!x.pass) failures++;
}
console.log('REFERENCE '+ref.filter(x=>x.pass).length+'/'+ref.length);

let dead=0;
for(const [name,law,mutate] of defeatCandidates){
  const r=evaluate(mutant(mutate as any));
  const killed=r.some(x=>x.id===law&&!x.pass);
  console.log((killed?'DEAD':'SURVIVES')+' '+name+' -> '+law);
  if(killed) dead++; else failures++;
}
console.log('DEFEATS '+dead+'/'+defeatCandidates.length);
process.exitCode=failures?1:0;
