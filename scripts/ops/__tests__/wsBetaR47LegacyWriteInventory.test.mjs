import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {inspect,KNOWN_WRITERS} from '../wsBetaR47LegacyWriteInventory.mjs';
const current=process.cwd();
const mk=()=>mkdtempSync(join(tmpdir(),'ws-r47-fictional-inventory-'));
const write=(root,path,text)=>{
 const name=join(root,path);mkdirSync(dirname(name),{recursive:true});
 writeFileSync(name,text,{mode:0o600});
};
const one=[{path:'app/api/sovereign/manuscripts/test/route.ts',
 label:'invented writer',marker:'INSERT INTO manuscript_test',class:'direct_sql'}];
test('fabricated current writer is classified as a HOLD with source-hash only',()=>{
 const root=mk();try{
  write(root,one[0].path,
   'export async function POST(request) { const query = "INSERT INTO manuscript_test"; return query; }\n');
  const r=inspect(root,one,{skipDiscovery:true});
  assert.equal(r.status,'LEGACY_WRITERS_PRESENT_HOLD');
  assert.equal(r.knownRouteCount,1);
  assert.equal(r.knownRoutes[0].markerLine,1);
  assert.match(r.knownRoutes[0].sha256,/^[a-f0-9]{64}$/);
  assert.equal(r.memberDataTouched,false);
  assert.equal(r.releaseApproved,false);
  assert.equal(r.activeLegacyWritingResolved,false);
  assert.equal(JSON.stringify(r).includes('request) {'),false);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('missing expected route is drift, never interpreted as safe',()=>{
 const root=mk();try{
  const r=inspect(root,one,{skipDiscovery:true});
  assert.equal(r.status,'INVENTORY_DRIFT_HOLD');
  assert.deepEqual(r.missing,[one[0].path]);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('changed marker or removed POST is drift, not automatic passing',()=>{
 const root=mk();try{
  write(root,one[0].path,
    'export async function POST() { return "INSERT INTO other"; }\n');
  assert.deepEqual(inspect(root,one,{skipDiscovery:true}).drift,[one[0].path]);
  write(root,one[0].path,
    'export async function GET() { return "INSERT INTO manuscript_test"; }\n');
  assert.deepEqual(inspect(root,one,{skipDiscovery:true}).drift,[one[0].path]);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('unlisted new SQL writer forces inventory drift',()=>{
 const root=mk();try{
  write(root,one[0].path,
   'export async function POST() { return "INSERT INTO manuscript_test"; }\n');
  write(root,'app/api/sovereign/manuscripts/unknown/route.ts',
   'export async function POST() { return "INSERT INTO manuscript_other"; }\n');
  const r=inspect(root,one);
  assert.equal(r.status,'INVENTORY_DRIFT_HOLD');
  assert.equal(r.unlisted.length,1);
  assert.equal(r.unlisted[0].path,'app/api/sovereign/manuscripts/unknown/route.ts');
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('live protected-module import cannot establish beta GO',()=>{
 const root=mk();try{
  write(root,one[0].path,
   'export async function POST() { return "INSERT INTO manuscript_test"; }\n');
  write(root,'app/api/new/route.ts',
   'import {composeHeldOriginalR36} from "heldSourceComposerR36"; export async function POST(){}\n');
  const r=inspect(root,one);
  assert.equal(r.heldPrototypeMountedRoutes.length,1);
  assert.equal(r.activeLegacyWritingResolved,false);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('actual checked-out Writer routes remain documented HOLD; release gate refuses',()=>{
 const report=inspect(current);
 assert.equal(report.knownRouteCount,KNOWN_WRITERS.length);
 assert.equal(report.releaseApproved,false);
 assert.equal(report.memberDataTouched,false);
 assert.equal(report.activeLegacyWritingResolved,false);
 assert.ok(report.knownRouteCount>=12);
 const cli='scripts/ops/wsBetaR47LegacyWriteInventory.mjs';
 const check=spawnSync(process.execPath,[cli,'--release-gate'],
   {cwd:current,encoding:'utf8',maxBuffer:1024*1024});
 assert.equal(check.status,2);
 assert.match(check.stdout,/LEGACY_WRITERS_PRESENT_HOLD/);
});
