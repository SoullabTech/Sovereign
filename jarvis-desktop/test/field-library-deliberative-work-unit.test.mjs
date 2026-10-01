import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require=createRequire(import.meta.url);
const C=require('../src/field-library-synthesis-contract.js');
const D=require('../src/field-library-deliberative-work-unit.js');
const SHA='0123456789abcdef0123456789abcdef01234567';

function packet(){
  return C.buildSourcePacket('capability authority',[
    {kind:'record',group:'JARVIS',score:20,matched:['capability','authority'],item:{
      title:'Authority census',path:'docs/programme/AUTHORITY.md',excerpt:'bounded',excerpt_start_line:3,excerpt_end_line:7,headings:[]
    }},
    {kind:'record',group:'JARVIS',score:18,matched:['authority'],item:{
      title:'Routing charter',path:'docs/programme/ROUTING.md',excerpt:'bounded',excerpt_start_line:11,excerpt_end_line:15,headings:[]
    }}
  ]);
}

test('R9 proposed Work Unit uses existing canonical vocabulary only',()=>{
  const spec=D.specForPacket(packet());
  assert.equal(spec.workClass,'RESEARCH');
  assert.equal(spec.taskShape,'EVIDENCE_SYNTHESIS');
  assert.equal(spec.evidenceClass,'E1_REPOSITORY_LOCAL');
  assert.equal(spec.requestedPosture,'local_only');
  assert.equal(spec.authorityRequest.networkExternal,false);
});

test('R9 falsifier catches W0.v2 stripping Grokker line ranges',()=>{
  const out=D.preview(packet(),SHA);
  assert.equal(out.ok,false);
  assert.equal(out.status,'WORK_UNIT_EVIDENCE_PRECISION_LOSS');
  assert.equal(out.losses.length,2);
  assert.deepEqual(out.canonical_input.scope.allowed_paths,[
    'docs/programme/AUTHORITY.md','docs/programme/ROUTING.md'
  ]);
  assert.equal(out.losses[0].expected,'docs/programme/AUTHORITY.md:3-7');
  assert.equal(out.losses[0].reason,'LINE_RANGE_STRIPPED');
});

test('R9 adapter refuses before creating or executing any Work Unit',()=>{
  const fs=require('node:fs');
  const src=fs.readFileSync(new URL('../src/field-library-deliberative-work-unit.js',import.meta.url),'utf8');
  assert.doesNotMatch(src,/createCanonicalV2\s*\(/);
  assert.doesNotMatch(src,/canonicalAuthorizeExecutionOnce|canonicalConfirmAuthorizedExecution/);
  assert.doesNotMatch(src,/fetch\s*\(|child_process|writeFile/);
});