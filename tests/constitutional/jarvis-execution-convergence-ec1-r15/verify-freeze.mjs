#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const here=import.meta.dirname;
const freeze=JSON.parse(fs.readFileSync(path.join(here,'FREEZE.json'),'utf8'));
let bad=0;
for(const [name,expected] of Object.entries(freeze.files)){
  let got='<unreadable>';
  try{got=execFileSync('git',['hash-object',path.join(here,name)],{encoding:'utf8'}).trim();}catch{}
  const ok=got===expected;
  console.log((ok?'INTACT':'DRIFT')+' '+name+(ok?'':' expected='+expected+' got='+got));
  if(!ok)bad++;
}
console.log(bad===0?'FREEZE INTACT':'FREEZE DRIFT ('+bad+')');
process.exit(bad?1:0);
