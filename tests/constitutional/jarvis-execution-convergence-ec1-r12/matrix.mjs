#!/usr/bin/env node
import {REFERENCE,FALSIFIERS,CANDIDATES} from './verifier-boundary.mjs';
const ids=Object.keys(FALSIFIERS);let bad=0;const killed=new Set();
console.log('EC1-R12 · verifier effect-boundary matrix');
for(const id of ids){const r=FALSIFIERS[id](REFERENCE);console.log('  '+id+' '+(r.pass?'PASS':'FAIL '+r.failures.join(' | ')));if(!r.pass)bad++;}
for(const c of CANDIDATES){const changed=Object.keys(REFERENCE).filter(k=>c.decisions[k]!==REFERENCE[k]);if(changed.length!==1){bad++;console.log(c.id+' DEFECT changed='+changed);continue;}const deaths=ids.filter(id=>!FALSIFIERS[id](c.decisions).pass);const named=deaths.includes(c.named);if(named)killed.add(c.named);const extra=deaths.filter(x=>x!==c.named);const un=extra.filter(x=>!(x in c.collateral));const stale=Object.keys(c.collateral).filter(x=>!deaths.includes(x));const ok=named&&!un.length&&!stale.length;if(!ok)bad++;console.log('  '+c.id+' → '+(ok?'KILLED':'DEFECT')+' on '+c.named);for(const x of extra)console.log('       + '+x+' '+(x in c.collateral?'CLASSIFIED: '+c.collateral[x]:'UNCLASSIFIED'));for(const x of stale)console.log('       ! stale '+x);}
const orphan=ids.filter(x=>!killed.has(x));if(orphan.length){bad++;console.log('unproven laws: '+orphan.join(','));}
console.log(bad===0?'MATRIX LETHAL + DISCRIMINATING':'MATRIX DEFECT ('+bad+')');process.exit(bad?1:0);
