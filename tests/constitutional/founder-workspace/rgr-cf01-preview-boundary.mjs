import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {readEvidencePreview} from '../../../scripts/builder/founder-workspace/desktop-viewmodel.mjs';

function fixture(run) {
  const base=fs.mkdtempSync(path.join(os.tmpdir(),'rgr-cf01-preview-boundary-'));
  const root=path.join(base,'workspace');
  const ain=path.join(base,'ain');
  const allowed=path.join(root,'docs','programme');
  fs.mkdirSync(allowed,{recursive:true});
  fs.mkdirSync(ain,{recursive:true});
  const makeVm=(ref)=>({work:{units:[]},graph:{edges:[{evidence:{kind:'rgr-intake-source',ref}}]}});
  const read=(ref,vm=makeVm(ref))=>readEvidencePreview(vm,ref,{root,env:{AIN_DELEGATION_HOME:ain}});
  try { run({base,root,ain,allowed,makeVm,read}); }
  finally {fs.rmSync(base,{force:true,recursive:true});}
}

test('RGR preview: an admitted ordinary file under the bound workspace remains readable',()=>fixture(x=>{
  const ref=path.join(x.allowed,'ordinary.md');
  fs.writeFileSync(ref,'# Synthetic authorized intake\nNo member material.\n');
  const result=x.read(ref);
  assert.equal(result.ok,true,JSON.stringify(result));
  assert.match(result.text,/Synthetic authorized intake/);
  assert.equal(result.source_kind,'bound workspace');
}));

test('RGR preview: replacing an already admitted source with a symlink to outside the workspace is refused',()=>fixture(x=>{
  const ref=path.join(x.allowed,'cached-intake.md');
  fs.writeFileSync(ref,'# Original admitted source\n');
  const vm=x.makeVm(ref); // snapshot was assembled before the file swap
  const target=path.join(x.base,'synthetic-outside-source.md');
  fs.writeFileSync(target,'SYNTHETIC_OUTSIDE_ROOT_CANNOT_BE_PREVIEWED\n');
  fs.unlinkSync(ref);fs.symlinkSync(target,ref);
  const result=x.read(ref,vm);
  assert.equal(result.ok,false,'no outside-root symlink may be previewed');
  assert.doesNotMatch(JSON.stringify(result),/SYNTHETIC_OUTSIDE_ROOT_CANNOT_BE_PREVIEWED/);
}));

test('RGR preview: a symlinked parent directory leading outside the workspace is refused',()=>fixture(x=>{
  const outside=path.join(x.base,'foreign-programme');
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside,'source.md'),'SYNTHETIC_PARENT_SYMLINK_MARKER\n');
  const alias=path.join(x.allowed,'alias-dir');
  fs.symlinkSync(outside,alias);
  const ref=path.join(alias,'source.md');
  const result=x.read(ref);
  assert.equal(result.ok,false,'no symlink path segment may redirect preview outside the allowed root');
  assert.doesNotMatch(JSON.stringify(result),/SYNTHETIC_PARENT_SYMLINK_MARKER/);
}));

test('RGR preview: refs absent from the live model remain refused',()=>fixture(x=>{
  const ref=path.join(x.allowed,'other.md');
  fs.writeFileSync(ref,'# Unlisted\n');
  const other=path.join(x.allowed,'admitted.md');
  assert.equal(x.read(ref,x.makeVm(other)).ok,false);
}));

test('RGR preview: direct absolute refs outside bound repo and AIN are refused',()=>fixture(x=>{
  const target=path.join(x.base,'secret-but-synthetic.txt');
  fs.writeFileSync(target,'SYNTHETIC_OUTSIDE_ONLY\n');
  assert.equal(x.read(target).ok,false);
}));
