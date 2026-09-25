import { evaluate } from './laws';
import { referenceDesign } from './design';
import { ASK_THREAD_AS_PARENT, GENERIC_EVENT_GRAPH, SESSION_AS_PARENT } from './badArchitectures';
import { defeatCandidates, mutant } from './candidates';

function summary(name:string, design:ReturnType<typeof referenceDesign>) {
  const r=evaluate(design);
  const pass=r.filter(x=>x.pass).length;
  console.log(name+' '+pass+'/'+r.length);
  return {r,pass};
}

const ref=summary('REFERENCE', referenceDesign());
let failures=ref.r.filter(x=>!x.pass).length;
summary('OPTION_A_ASK_THREAD', ASK_THREAD_AS_PARENT);
summary('OPTION_C_GENERIC_GRAPH', GENERIC_EVENT_GRAPH);
summary('OPTION_SESSION', SESSION_AS_PARENT);

let dead=0;
for(const [name,law,mutate] of defeatCandidates){
  const r=evaluate(mutant(mutate as any));
  const killed=r.some(x=>x.id===law&&!x.pass);
  console.log((killed?'DEAD':'SURVIVES')+' '+name+' -> '+law);
  if(killed) dead++; else failures++;
}
console.log('DEFEATS '+dead+'/'+defeatCandidates.length);
process.exitCode=failures?1:0;
