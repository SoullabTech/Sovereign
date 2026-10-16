/**
 * R34 exact old-route transport and idempotency refusals.
 * No real member, database, file-vault or key issuer is contacted.
 */
import {readdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {payloadHash} from '@/lib/manuscript/draftConcurrency';
import {R34_REAL_DRAFT_ROUTE_ENABLED,reviewLegacyDraftOperationR34} from '../draftRouteParityR34';

const base={
 version:'4',
 sectionAddressable:false,
 sectionIds:[] as string[],
 last_idempotency_key:null as string|null,
 last_idempotency_op:null as string|null,
 last_idempotency_payload_hash:null as string|null,
 last_idempotency_response:null as unknown,
};
const save=(overrides:Record<string,unknown>={},state=base)=>reviewLegacyDraftOperationR34({
 kind:'save',state,body:{content:'invented manuscript text',
  baseRevisionId:4,idempotencyKey:'request-a',...overrides},
});
const converted={...base,sectionAddressable:true,sectionIds:['section-a','section-b']};
const sections=[
 {id:'section-a',text:'fictional first section'},
 {id:'section-b',text:'fictional second section'},
];
function routeFiles(folder:string):string[]{
 const found:string[]=[];
 for(const entry of readdirSync(folder,{withFileTypes:true})){
  const file=path.join(folder,entry.name);
  if(entry.isDirectory())found.push(...routeFiles(file));
  if(entry.isFile()&&/^route\.tsx?$/.test(entry.name))found.push(file);
 }
 return found;
}
describe('R34 protected draft route-migration parity, all decisions REVIEW ONLY',()=>{
 it('does not turn on a real encrypted draft endpoint',()=>{
  expect(R34_REAL_DRAFT_ROUTE_ENABLED).toBe(false);
 });
 it('preserves the unconverted draft PUT shape but holds until encrypted ack is atomic',()=>{
  const x=save();
  expect(x).toMatchObject({kind:'VALIDATED_BUT_UNMIGRATED',
    code:423,canWrite:false});
  if(x.kind==='VALIDATED_BUT_UNMIGRATED'){
    expect(x.requirements).toContain('atomic_encrypted_autosave_and_idempotency_ack');
  }
 });
 it('preserves explicit checkpoint on ordinary draft, without silently discarding note',()=>{
  const x=save({checkpoint:true,note:' author revision rationale '});
  expect(x.kind).toBe('VALIDATED_BUT_UNMIGRATED');
  if(x.kind==='VALIDATED_BUT_UNMIGRATED'){
   expect(x.requirements).toContain('encrypted_checkpoint_notes_and_revision_count');
  }
 });
 it('rejects malformed save body, bad note and missing concurrency guard',()=>{
  const empty=reviewLegacyDraftOperationR34({kind:'save',state:base,body:null});
  expect(empty).toMatchObject({kind:'REFUSED',code:400});
  expect(save({note:23})).toMatchObject({kind:'REFUSED',code:400});
  expect(save({baseRevisionId:undefined})).toMatchObject({
    kind:'REFUSED',code:400,reason:'baseRevisionId must be a positive integer'});
  expect(save({idempotencyKey:' '})).toMatchObject({kind:'REFUSED',code:400});
 });
 it('normalizes PostgreSQL bigint version strings before idempotency comparison',()=>{
  expect(save({baseRevisionId:4},{...base,version:'4'}).kind)
    .toBe('VALIDATED_BUT_UNMIGRATED');
  expect(save({baseRevisionId:4},{...base,version:'not-an-integer'}))
    .toMatchObject({kind:'REFUSED',code:503,reason:'untrusted_revision_state'});
 });
 it('refuses a stale base revision instead of replacing author text',()=>{
  expect(save({baseRevisionId:3})).toMatchObject({
    kind:'REFUSED',code:409,reason:'stale_base'});
 });
 it('replayed idempotency metadata must not expose cached author content',()=>{
  const content='PRIVATE_R34_AUTHOR_PHRASE';
  const key='same-request';
  const payload={content,checkpoint:false,note:null};
  const prior={...base,last_idempotency_key:key,last_idempotency_op:'save',
   last_idempotency_payload_hash:payloadHash('save',payload),
   last_idempotency_response:{content,revisionId:5}};
  const result=reviewLegacyDraftOperationR34({
   kind:'save',state:prior,
   body:{content,baseRevisionId:4,idempotencyKey:key}});
  expect(result).toMatchObject({kind:'REPLAY_REQUIRES_ENCRYPTED_LEDGER',
    canWrite:false,code:200});
  expect(JSON.stringify(result)).not.toContain(content);
 });
 it('rejects a reused key with a different draft body',()=>{
  const old={...base,last_idempotency_key:'collision',
   last_idempotency_op:'save',
   last_idempotency_payload_hash:payloadHash('save',{
    content:'version A',checkpoint:false,note:null}),
   last_idempotency_response:{revisionId:5}};
  expect(reviewLegacyDraftOperationR34({kind:'save',state:old,
    body:{content:'version B',baseRevisionId:4,idempotencyKey:'collision'}}))
    .toMatchObject({kind:'REFUSED',code:409,reason:'idempotency_key_reuse'});
 });
 it('requires complete, ordered section identities on section-addressable drafts',()=>{
  const result=reviewLegacyDraftOperationR34({kind:'save',state:converted,
   body:{sections,baseRevisionId:4,idempotencyKey:'section-save'}});
  expect(result.kind).toBe('VALIDATED_BUT_UNMIGRATED');
  if(result.kind==='VALIDATED_BUT_UNMIGRATED')
   expect(result.requirements).toContain('encrypted_section_identity_order_and_derived_content');
 });
 it('refuses ambiguous section and whole-text authority before any write',()=>{
  const x=reviewLegacyDraftOperationR34({kind:'save',state:converted,
   body:{sections,content:'other prose',baseRevisionId:4,idempotencyKey:'same'}});
  expect(x).toMatchObject({kind:'REFUSED',code:409,reason:'ambiguous_write_authority'});
 });
 it('refuses an unknown, reordered or missing section without inferring new boundaries',()=>{
  for(const bad of [
   [{...sections[0],id:'unowned-section'},sections[1]],
   [sections[1],sections[0]],
   [sections[0]],
  ]){
   const x=reviewLegacyDraftOperationR34({kind:'save',state:converted,
    body:{sections:bad,baseRevisionId:4,idempotencyKey:'same'}});
   expect(x).toMatchObject({kind:'REFUSED',code:409,canWrite:false});
  }
 });
 it('refuses section payload against an unconverted draft',()=>{
  expect(save({sections,content:undefined})).toMatchObject({
   kind:'REFUSED',code:409,reason:'unconverted_draft_does_not_accept_sections'});
 });
 it('keeps checkpoint header-only and requires encrypted server-frozen section partition',()=>{
  const ok=reviewLegacyDraftOperationR34({kind:'checkpoint',state:converted,
    headers:{baseRevision:'4',idempotencyKey:'ckp-1'}});
  expect(ok.kind).toBe('VALIDATED_BUT_UNMIGRATED');
  if(ok.kind==='VALIDATED_BUT_UNMIGRATED')
   expect(ok.requirements).toContain('server_read_frozen_sections_and_encrypted_partition_checkpoint');
  expect(reviewLegacyDraftOperationR34({kind:'checkpoint',state:converted,
    headers:{baseRevision:'4',idempotencyKey:'ckp-1'},
    body:{content:'private text'}})).toMatchObject({kind:'REFUSED',code:400});
  expect(reviewLegacyDraftOperationR34({kind:'checkpoint',state:base,
    headers:{baseRevision:'4',idempotencyKey:'ckp-1'}}))
    .toMatchObject({kind:'REFUSED',code:409});
 });
 it('refuses restoring an old converted revision without the frozen section partition',()=>{
  const body={revisionNumber:2,baseRevisionId:4,idempotencyKey:'restore-2'};
  expect(reviewLegacyDraftOperationR34({kind:'restore',state:converted,
    body,revisionHasPartition:false})).toMatchObject({
      kind:'REFUSED',code:409,reason:'revision_partition_unavailable'});
  const allowed=reviewLegacyDraftOperationR34({kind:'restore',state:converted,
    body,revisionHasPartition:true});
  expect(allowed).toMatchObject({kind:'VALIDATED_BUT_UNMIGRATED',canWrite:false});
  if(allowed.kind==='VALIDATED_BUT_UNMIGRATED')
    expect(allowed.requirements).toContain('restore_exact_prior_section_ids_without_inference');
 });
 it('requires a positive integer revisionNumber rather than guessing',()=>{
  for(const revisionNumber of [undefined,0,-1,1.2,'2']){
    const out=reviewLegacyDraftOperationR34({kind:'restore',state:base,
      body:{revisionNumber,baseRevisionId:4,idempotencyKey:'rest'},revisionHasPartition:true});
    expect(out).toMatchObject({kind:'REFUSED',code:400});
  }
 });
 it('never exports author prose, notes or recorded replay response',()=>{
  const secret='PRIVATE_R34_WRITER_MATERIAL_DO_NOT_ECHO';
  const x=save({content:secret,note:secret});
  expect(JSON.stringify(x)).not.toContain(secret);
  expect(x.canWrite).toBe(false);
 });
 it('has no live Next.js endpoint that imports the unmounted review gate',()=>{
  const found=routeFiles(path.join(process.cwd(),'app/api')).filter(f=>
   readFileSync(f,'utf8').includes('draftRouteParityR34'));
  expect(found).toEqual([]);
 });
});
