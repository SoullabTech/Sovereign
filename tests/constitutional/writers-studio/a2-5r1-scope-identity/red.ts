import { evaluate } from './laws';
import { referenceContract } from './contract';
const r=evaluate(referenceContract());
for(const x of r) console.log((x.pass?'PASS':'FAIL')+' A2-5R1-'+x.id+' — '+x.detail);
console.log('REFERENCE '+r.filter(x=>x.pass).length+'/'+r.length);
process.exitCode=r.every(x=>x.pass)?0:1;
