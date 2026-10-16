/**
 * R49 ciphertext/manifest reconciliation: no author prose, automatic repairs
 * or release promotion. Physical PG16 + fsync vault is tested separately.
 */
import {randomUUID} from 'node:crypto';
jest.mock('@/lib/db/postgres',()=>({
 transaction:jest.fn(()=>{throw Error('R49_BLOCK_TEST_REACHED_DB');}),
}));
import {transaction} from '@/lib/db/postgres';
import {R35_VAULT_NAMESPACE} from '../heldProtectedDraftR35';
import {
 classifyHeldCiphertextR49,inspectHeldVaultR49,
 R49_REAL_ORPHAN_REPAIR_ENABLED,
} from '../heldVaultInventoryR49';
const W='11111111-1111-4111-8111-111111111111';
const A='22222222-2222-4222-8222-222222222222';
const B='33333333-3333-4333-8333-333333333333';
const SHA1='a'.repeat(64),SHA2='b'.repeat(64);
const ref=(id:string)=>R35_VAULT_NAMESPACE+'/'+id+'.enc';
const f1=ref('44444444-4444-4444-8444-444444444441');
const f2=ref('44444444-4444-4444-8444-444444444442');
const f3=ref('44444444-4444-4444-8444-444444444443');
const initial={
 manifests:[{work_id:W,member_id:A,generation:1,
  cipher_ref:f1,cipher_sha256:SHA1,previous_sha256:null,
  checkpoint_count:0,action:'start'}],
 heads:[{work_id:W,member_id:A,generation:1,checkpoint_count:0}],
 files:[{ref:f1,sha256:SHA1,regular:true}],
};
const env=[
 'R49_VAULT_INVENTORY_FIXTURE','R35_PROTECTED_DRAFT_FIXTURE',
 'R35_PHYSICAL_PG16_FIXTURE','DATABASE_URL','FILE_STORAGE_PATH',
] as const;
const previous=Object.fromEntries(env.map(name=>[name,process.env[name]]));
afterAll(()=>{for(const k of env)
 if(previous[k]===undefined)delete process.env[k];
 else process.env[k]=previous[k];
});
describe('R49 read-only manifest/cipher vault metadata classification',()=>{
 it('never enables real orphan deletion/relink/publication',()=>{
  expect(R49_REAL_ORPHAN_REPAIR_ENABLED).toBe(false);
  const x=classifyHeldCiphertextR49(initial);
  expect(x).toMatchObject({
    kind:'FICTIONAL_CONSISTENT_SNAPSHOT_HOLD',
    releaseApproved:false,canDelete:false,canRelink:false,
    canPublish:false,canAdmitRealWriter:false,
  });
  expect(x.counts).toMatchObject({referencedValid:1,unreferencedCiphertext:0});
 });
 it('classifies one encrypted orphan without deleting or inventing a Source owner',()=>{
  const x=classifyHeldCiphertextR49({...initial,
   files:[...initial.files,{ref:f2,sha256:SHA2,regular:true}]});
  expect(x.kind).toBe('FICTIONAL_CUSTODY_REVIEW_REQUIRED');
  expect(x.counts).toMatchObject({
   referencedValid:1,unreferencedCiphertext:1,missingCiphertext:0});
  expect(JSON.stringify(x)).not.toContain(f2);
  expect(JSON.stringify(x)).not.toContain(W);
 });
 it('distinguishes missing referenced ciphertext from an orphan',()=>{
  const x=classifyHeldCiphertextR49({...initial,files:[]});
  expect(x.counts).toMatchObject({
   missingCiphertext:1,unreferencedCiphertext:0,referencedValid:0});
 });
 it('distinguishes corrupted referenced ciphertext digest from missing bytes',()=>{
  const x=classifyHeldCiphertextR49({...initial,
   files:[{ref:f1,sha256:SHA2,regular:true}]});
  expect(x.counts).toMatchObject({
   corruptCiphertext:1,missingCiphertext:0,referencedValid:0});
 });
 it('refuses malformed or traversing manifest paths without reading outside vault',()=>{
  const x=classifyHeldCiphertextR49({...initial,
   manifests:[{...initial.manifests[0],cipher_ref:'../../private.env'}]});
  expect(x.counts).toMatchObject({invalidManifest:1,unreferencedCiphertext:1});
  expect(x.kind).toBe('FICTIONAL_CUSTODY_REVIEW_REQUIRED');
 });
 it('marks unexpected or unreadable filesystem objects for manual review',()=>{
  const x=classifyHeldCiphertextR49({...initial,
   files:[...initial.files,{ref:f2,regular:false,sha256:null}],
   unsafeCount:2});
  expect(x.counts.unsafeOrUnreadableFiles).toBe(3);
  expect(x.counts.unreferencedCiphertext).toBe(0);
 });
 it('detects a broken predecessor SHA and a gap in immutable versions',()=>{
  const x=classifyHeldCiphertextR49({
   ...initial,heads:[{...initial.heads[0],generation:3}],
   manifests:[...initial.manifests,
    {...initial.manifests[0],generation:3,cipher_ref:f2,
      cipher_sha256:SHA2,previous_sha256:'f'.repeat(64),action:'save'}],
   files:[...initial.files,{ref:f2,sha256:SHA2,regular:true}],
  });
  expect(x.counts).toMatchObject({brokenChains:1,headDisagreements:0});
 });
 it('detects heads pointing to missing revisions without treating it as erasure',()=>{
  const x=classifyHeldCiphertextR49({
   ...initial,heads:[{...initial.heads[0],generation:9}]});
  expect(x.counts.headDisagreements).toBe(1);
  expect(x.canDelete).toBe(false);
 });
 it('detects a change of member/owner halfway through a ciphertext history',()=>{
  const x=classifyHeldCiphertextR49({
   ...initial,heads:[{...initial.heads[0],generation:2,member_id:B}],
   manifests:[...initial.manifests,
    {...initial.manifests[0],generation:2,member_id:B,cipher_ref:f2,
      cipher_sha256:SHA2,previous_sha256:SHA1,action:'save'}],
   files:[...initial.files,{ref:f2,sha256:SHA2,regular:true}],
  });
  expect(x.counts.brokenChains).toBe(1);
 });
 it('marks a head with zero committed ciphertext generations for review',()=>{
  const x=classifyHeldCiphertextR49({
   manifests:[],heads:initial.heads,files:[]});
  expect(x.counts).toMatchObject({headDisagreements:1,versionRows:0});
 });
 it('no records does not certify real release or global vault privacy',()=>{
  const x=classifyHeldCiphertextR49({manifests:[],heads:[],files:[]});
  expect(x.kind).toBe('FICTIONAL_CONSISTENT_SNAPSHOT_HOLD');
  expect(x.releaseApproved).toBe(false);
 });
 it('rejects all calls with missing exact fictional-scoped runtime before DB access',async()=>{
  for(const k of env)delete process.env[k];
  await expect(inspectHeldVaultR49()).rejects.toMatchObject({
    code:'r49_fictional_only_scope_required'});
  expect(transaction).not.toHaveBeenCalled();
 });
 it('rejects a fake production DB even when every test flag is set',async()=>{
  for(const k of env.slice(0,3))process.env[k]='fictional-only';
  process.env.DATABASE_URL='postgresql://soullab@production-host/maia';
  process.env.FILE_STORAGE_PATH='/private/tmp/ws-r35-physical-r49-test/vault';
  await expect(inspectHeldVaultR49()).rejects.toMatchObject({
    code:'r49_fictional_only_scope_required'});
  expect(transaction).not.toHaveBeenCalled();
 });
 it('rejects a real vault path even against the exact fictitious database URL',async()=>{
  process.env.DATABASE_URL='postgresql://fict@127.0.0.1:55341/r35_draft';
  process.env.FILE_STORAGE_PATH='/app/data/vault';
  await expect(inspectHeldVaultR49()).rejects.toMatchObject({
    code:'r49_unsafe_vault_root'});
  expect(transaction).not.toHaveBeenCalled();
 });
 it('returns only metadata counts, never test prose, IDs, refs, or token hashes',()=>{
  const x=classifyHeldCiphertextR49(initial);
  const s=JSON.stringify(x);
  for(const word of ['private lantern','R49_FICTIONAL_SECRET',W,A,f1,SHA1]){
   expect(s).not.toContain(word);
  }
 });
});
