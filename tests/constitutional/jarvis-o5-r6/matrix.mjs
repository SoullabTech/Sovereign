#!/usr/bin/env node
import * as REF from './reference.mjs';
import {FALSIFIERS} from './falsifiers.mjs';
import {CANDIDATES} from './candidates.mjs';
let defects=0;
console.log('JARVIS O5-R6 · dispatch admission · pre-implementation matrix');
for(const f of FALSIFIERS){const e=f.run(REF); if(e.length){defects++;console.log('REFERENCE '+f.id+' FAIL: '+e.join('; '));} else console.log('REFERENCE '+f.id+' PASS');}
for(const c of CANDIDATES){const f=FALSIFIERS.find(x=>x.id===c.kills),e=f.run(c.decision); if(!e.length){defects++;console.log(c.id+' SURVIVED '+c.kills);} else console.log(c.id+' -> KILLED on '+c.kills+': '+e[0]);}
if(defects){console.error('MATRIX DEFECT '+defects);process.exit(1)}
console.log('MATRIX LETHAL + DISCRIMINATING');
