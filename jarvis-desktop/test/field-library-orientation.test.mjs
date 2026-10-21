import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const O=require('../src/field-library-orientation.js');

test('R16 composes without changing source standing',()=>{
  const library={
    recoveryCandidates:[{programme_key:'p',title:'Thread',standing:'RECOVERY_CANDIDATE_UNREVIEWED',signal:'STATE_OPEN',evidence:'OPEN',path:'docs/p.md',evidence_line:4}],
    recentItems:[{title:'Recent',path:'docs/r.md'}],
    conceptGroups:[{title:'Memory',items:[{title:'Context release'}]}],
  };
  const governedWork={
    needs_kelly:[{work_unit_id:'n',objective:'Need',lifecycle:'EVIDENCE_READY',reason:'Needs adjudication'}],
    in_motion:[{work_unit_id:'i',objective:'Move',lifecycle:'DRAFT',reason:'Open'}],
    watching:[{work_unit_id:'w',objective:'Watch',lifecycle:'EXECUTING',reason:'Failed'}],
    historical:[],
  };
  const pins=[{kind:'field',key:'Memory/Context release',label:'Context release'}];
  const before=JSON.stringify({library,governedWork,pins});
  const out=O.compose({library,pins,governedWork});
  assert.equal(out.law,'ORIENTATION_DOES_NOT_CREATE_PRIORITY_OR_AUTHORITY');
  assert.deepEqual(out.counts,{keep_in_sight:1,needs_kelly:1,in_motion:1,watching:1,unfinished:1,recent:1});
  assert.equal(out.sections.find(s=>s.id==='unfinished').items[0].standing,'RECOVERY_CANDIDATE_UNREVIEWED');
  assert.equal(JSON.stringify({library,governedWork,pins}),before);
});

test('R16 recent activity explicitly refuses priority semantics',()=>{
  const out=O.compose({library:{recentItems:[{title:'R',path:'docs/r.md'}]},pins:[],governedWork:null});
  const recent=out.sections.find(s=>s.id==='recent');
  assert.match(recent.meaning,/Recency does not imply priority/);
  assert.match(recent.items[0].why,/Recency does not imply importance/);
});
