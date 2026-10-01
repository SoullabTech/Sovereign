#!/usr/bin/env node
import * as REF from './reference.mjs';
import { FALSIFIERS } from './falsifiers.mjs';
import { CANDIDATES } from './candidates.mjs';

let defects=0;
console.log('JARVIS O5-R4 · evidence return · pre-implementation matrix');
for(const f of FALSIFIERS){const failures=f.run(REF);if(failures.length){defects++;console.log(`REFERENCE ${f.id} FAIL: ${failures.join('; ')}`)}else console.log(`REFERENCE ${f.id} PASS`)}
for(const c of CANDIDATES){const named=FALSIFIERS.find(f=>f.id===c.kills);const failures=named.run(c.decision);if(!failures.length){defects++;console.log(`${c.id} SURVIVED ${c.kills}: ${c.description}`)}else console.log(`${c.id} -> KILLED on ${c.kills}: ${failures[0]}`)}
if(defects){console.error(`MATRIX DEFECT ${defects}`);process.exit(1)}
console.log('MATRIX LETHAL + DISCRIMINATING');
