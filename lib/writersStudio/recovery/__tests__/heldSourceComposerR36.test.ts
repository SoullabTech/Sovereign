/**
 * R36 default-off Source composer never admits real browser writing.
 * No database, file vault, KMS, external provider or active API route.
 */
import path from 'node:path';
import {readFileSync,readdirSync} from 'node:fs';
jest.mock('@/lib/db/postgres',()=>({
 query:jest.fn(()=>{throw Error('r36_no_test_database_query');}),
 transaction:jest.fn(()=>{throw Error('r36_no_test_transaction');}),
}));
jest.mock('@/lib/storage/fileVault',()=>({
 readVaultBytes:jest.fn(()=>{throw Error('r36_no_test_vault_read');}),
 writeDurableVaultBytes:jest.fn(()=>{throw Error('r36_no_test_vault_write');}),
}));
import {query,transaction} from '@/lib/db/postgres';
import {readVaultBytes,writeDurableVaultBytes} from '@/lib/storage/fileVault';
import {
 composeHeldOriginalR36,R36_REAL_SOURCE_COMPOSER_ENABLED,
} from '../heldSourceComposerR36';
import {R35_REAL_ORPHAN_REGISTRY_ENABLED,
 R35_REAL_PENDING_KEY_RETIREMENT_ENABLED} from '../heldOrphanIntentR35';
import {R34_REAL_SOURCE_RECOVERY_ENABLED} from '../heldClaimReconcilerR34';
import {R33_REAL_MEMBER_PENDING_CLAIM_ENABLED} from '../heldPendingClaimR33';
import {R32_REAL_WRITER_SOURCE_IMPORT_ENABLED} from '../heldOriginalSourceR32';

const M='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const W='4c0782ca-9074-43ee-9f3c-5f8500026780';
const A='4c0782ca-9074-43ee-9f3c-5f8500026784';
const K='b6c7a41a-6295-4a54-93c3-e6611796a700';
const WKEY='b6c7a41a-6295-4a54-93c3-e6611796a701';
const input={
 subject:{memberId:M,assertedBy:'server_verified_member_session' as const},
 arrivalId:A,pendingGeneration:1,
 pendingAuthority:{key:{keyId:K,keyBytes:Buffer.alloc(32,0x32)},
  signedDeletion:null,trustedSigner:null,independent:null},
 workAuthority:{key:{keyId:WKEY,keyBytes:Buffer.alloc(32,0x45)},
  signedDeletion:null,trustedSigner:null,independent:null},
 signedClaim:{claim:{
  protocol:'soullab.ws.pending-claim-transfer.v1' as const,
  status:'claim_committed' as const,
  claimId:A,memberId:M,arrivalId:A,manuscriptId:W,
  pendingGeneration:1,manuscriptGeneration:1,claimEpoch:48,
  sourceKind:'member_supplied_text' as const,
  sourceTextDigest:'a'.repeat(64),originalDigest:null,
 },signature:'invalid'},
 trustedClaimSigner:null,minimumClaimEpoch:null,
};
const FLAGS=[
 'R36_SOURCE_COMPOSER_FIXTURE','R35_INTENT_FIXTURE',
 'R34_CLAIM_RECONCILE_FIXTURE','R33_PENDING_CLAIM_FIXTURE',
 'R32_HELD_SOURCE_FIXTURE',
] as const;
const prior=FLAGS.map(f=>process.env[f]);
const noIO=()=>{
 expect(query).not.toHaveBeenCalled();
 expect(transaction).not.toHaveBeenCalled();
 expect(readVaultBytes).not.toHaveBeenCalled();
 expect(writeDurableVaultBytes).not.toHaveBeenCalled();
};
function routes(dir:string):string[]{
 return readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
   const f=path.join(dir,e.name);
   return e.isDirectory()?routes(f):
     e.isFile() && /^route\.(tsx|ts)$/.test(e.name)?[f]:[];
 });
}
beforeEach(()=>{jest.clearAllMocks();FLAGS.forEach(x=>delete process.env[x]);});
afterAll(()=>FLAGS.forEach((k,i)=>{
 if(prior[i]===undefined)delete process.env[k];
 else process.env[k]=prior[i];
}));
describe('R36 protected Source composer isolation',()=>{
 it('all live Source, recovery, intent and key retirement flags remain OFF',()=>{
  expect(R36_REAL_SOURCE_COMPOSER_ENABLED).toBe(false);
  expect(R35_REAL_ORPHAN_REGISTRY_ENABLED).toBe(false);
  expect(R35_REAL_PENDING_KEY_RETIREMENT_ENABLED).toBe(false);
  expect(R34_REAL_SOURCE_RECOVERY_ENABLED).toBe(false);
  expect(R33_REAL_MEMBER_PENDING_CLAIM_ENABLED).toBe(false);
  expect(R32_REAL_WRITER_SOURCE_IMPORT_ENABLED).toBe(false);
 });
 it('refuses ordinary requests before SQL/vault',async()=>{
  await expect(composeHeldOriginalR36(input))
   .rejects.toHaveProperty('code','r36_real_source_composition_disabled');
  noIO();
 });
 it('requires every exact and distinct fictional-only environment fence',async()=>{
  for(const k of FLAGS){
    FLAGS.forEach(f=>process.env[f]='fictional-only');
    process.env[k]='false';
    await expect(composeHeldOriginalR36(input))
      .rejects.toHaveProperty('code','r36_real_source_composition_disabled');
    noIO();
  }
 });
 it('refuses client-claimed identity before touching a database',async()=>{
  FLAGS.forEach(x=>process.env[x]='fictional-only');
  await expect(composeHeldOriginalR36({...input,
    subject:{memberId:M,assertedBy:'client_claim'} as never}))
    .rejects.toHaveProperty('code','r36_invalid_untrusted_composition_scope');
  noIO();
 });
 it('rejects malformed claim ID, invalid Work, zero version, untrusted arrival',async()=>{
  FLAGS.forEach(x=>process.env[x]='fictional-only');
  for(const args of [
    {...input,arrivalId:'not-a-uuid'},
    {...input,signedClaim:{...input.signedClaim,
       claim:{...input.signedClaim.claim,manuscriptId:'work-name'}}},
    {...input,signedClaim:{...input.signedClaim,
       claim:{...input.signedClaim.claim,claimId:'untrusted'}}},
    {...input,signedClaim:{...input.signedClaim,
       claim:{...input.signedClaim.claim,manuscriptGeneration:0}}},
  ]){
    await expect(composeHeldOriginalR36(args))
     .rejects.toHaveProperty('code','r36_invalid_untrusted_composition_scope');
    noIO();
  }
 });
 it('no live Next API route imports the isolated composer or fixture checkpoint',()=>{
  const paths=routes(path.join(process.cwd(),'app/api'));
  expect(paths.filter(f=>/heldSourceComposerR36|composeHeldOriginalR36|R36_SOURCE_COMPOSER_FIXTURE/
    .test(readFileSync(f,'utf8')))).toEqual([]);
 });
 it('source composer contains no direct plaintext SQL insert or file deletion',()=>{
  const file=readFileSync(path.join(process.cwd(),
    'lib/writersStudio/recovery/heldSourceComposerR36.ts'),'utf8');
  for(const forbidden of [
    'DELETE FROM writers_studio_r33_held_pending',
    'INSERT INTO manuscript_source_arrivals',
    'UPDATE manuscript_working_drafts',
    'deleteVaultBytes(', 'destroyVaultBytes(',
    'fs.unlink(', 'rmSync(',
  ])expect(file).not.toContain(forbidden);
 });
 it('a plain R36 caller can never provide extra user key or arbitrary provider endpoint',async()=>{
  FLAGS.forEach(x=>process.env[x]='fictional-only');
  await expect(composeHeldOriginalR36({...input,
     subject:{...input.subject,memberId:'untrusted-user-name'},
  })).rejects.toHaveProperty('code','r36_invalid_untrusted_composition_scope');
  noIO();
 });
});
