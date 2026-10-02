#!/usr/bin/env tsx
import {FALSIFIERS,STRICT_PREFIX_COMPATIBILITY} from "./falsifiers";
import {CANDIDATES} from "./candidates";
const run=(d:Parameters<(typeof FALSIFIERS)[number]["run"]>[0])=>
 new Map(FALSIFIERS.map(f=>{try{return[f.id,f.run(d)]as const}catch(e){return[f.id,{pass:false as const,why:"threw: "+(e as Error).message}]as const}}));
let failures=0;
console.log("MIGRATION FAILURE-PREFIX COMPATIBILITY — EXECUTION MATRIX");
console.log("  "+FALSIFIERS.length+" falsifiers · "+CANDIDATES.length+" defeat candidates\n");
const ref=run(STRICT_PREFIX_COMPATIBILITY);
for(const f of FALSIFIERS){const r=ref.get(f.id);if(!r?.pass){failures++;console.error("STRICT failed "+f.id+": "+(r&&!r.pass?r.why:"no result"));}}
if(failures===0)console.log("REFERENCE  STRICT_PREFIX_COMPATIBILITY satisfies "+FALSIFIERS.length+"/"+FALSIFIERS.length+"\n");
for(const c of CANDIDATES){const r=run(c.decisions).get(c.kills),died=r!==undefined&&!r.pass;
 console.log(c.id+" · "+c.name+"\n  must die on "+c.kills+" → "+(died?"DEAD":"SURVIVED")+"\n");if(!died)failures++;}
if(failures===0){console.log("PREFIX MATRIX: LETHAL + DISCRIMINATING");console.log("  "+CANDIDATES.length+"/"+CANDIDATES.length+" candidates died");console.log("  STRICT_PREFIX_COMPATIBILITY satisfies "+FALSIFIERS.length+"/"+FALSIFIERS.length+" laws");process.exit(0)}
console.error("PREFIX MATRIX FAILED — "+failures+" defect(s)");process.exit(1);
