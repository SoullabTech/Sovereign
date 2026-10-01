#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const spec=JSON.parse(readFileSync(new URL('../tests/constitutional/jarvis-o5-r5/FREEZE.json',import.meta.url),'utf8'));
let bad=0;
for(const [rel,expected] of Object.entries(spec.frozen_files)){
  const got=createHash('sha256').update(readFileSync(new URL('../'+rel,import.meta.url))).digest('hex');
  if(got!==expected){bad++;console.error(`DRIFT ${rel}\n  expected ${expected}\n  got      ${got}`)}else console.log(`INTACT ${rel}`);
}
if(bad){console.error(`FREEZE VIOLATED (${bad})`);process.exit(1)}
console.log('FREEZE INTACT');
