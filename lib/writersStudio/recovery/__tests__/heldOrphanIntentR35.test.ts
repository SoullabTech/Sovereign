/** R35 source isolation: no API, SQL, vault, cloud or deletion without GO. */
import path from 'node:path';
import {readFileSync,readdirSync} from 'node:fs';
jest.mock('@/lib/db/postgres',()=>({
 query:jest.fn(()=>{throw Error('r35_offline_test_disallows_db_read');}),
 transaction:jest.fn(()=>{throw Error('r35_offline_test_disallows_db_write');}),
}));
jest.mock('@/lib/storage/fileVault',()=>({
 writeDurableVaultBytes:jest.fn(()=>{throw Error('r35_offline_test_disallows_vault_write');}),
 readVaultBytes:jest.fn(()=>{throw Error('r35_offline_test_disallows_vault_read');}),
}));
import {query,transaction} from '@/lib/db/postgres';
import {readVaultBytes,writeDurableVaultBytes} from '@/lib/storage/fileVault';
import {
 beginHeldOriginalWriteIntentR35,observeHeldExistingOriginalR35,
 assessPendingKeyRetirementR35,
 R35_REAL_ORPHAN_REGISTRY_ENABLED,R35_REAL_PENDING_KEY_RETIREMENT_ENABLED,
 type R35Intent,
} from '../heldOrphanIntentR35';
const OWNER='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const ID='4c0782ca-9074-43ee-9f3c-5f8500026780';
const PKEY='b6c7a41a-6295-4a54-93c3-e6611796a700';
const WKEY='b6c7a41a-6295-4a54-93c3-e6611796a701';
const signed={
 subject:{memberId:OWNER,assertedBy:'server_verified_member_session' as const},
 arrivalId:ID,pendingGeneration:1,
 pendingAuthority:{key:{keyId:PKEY,keyBytes:Buffer.alloc(32,0x32)},
  signedDeletion:null,trustedSigner:null,independent:null},
 workAuthority:{key:{keyId:WKEY,keyBytes:Buffer.alloc(32,0x55)},
  signedDeletion:null,trustedSigner:null,independent:null},
 signedClaim:null as never,trustedClaimSigner:null,minimumClaimEpoch:null,
};
const FLAGS=[
 'R35_INTENT_FIXTURE','R34_CLAIM_RECONCILE_FIXTURE',
 'R33_PENDING_CLAIM_FIXTURE','R32_HELD_SOURCE_FIXTURE',
] as const;
const old=FLAGS.map(x=>process.env[x]);
const enabled=()=>FLAGS.forEach(x=>{process.env[x]='fictional-only';});
const noIO=()=>{
 expect(query).not.toHaveBeenCalled();
 expect(transaction).not.toHaveBeenCalled();
 expect(readVaultBytes).not.toHaveBeenCalled();
 expect(writeDurableVaultBytes).not.toHaveBeenCalled();
};
function routes(dir:string):string[]{
 return readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
   const p=path.join(dir,e.name);
   return e.isDirectory()?routes(p):
     e.isFile()&&/^route\.(ts|tsx)$/.test(e.name)?[p]:[];
 });
}
beforeEach(()=>{
 jest.clearAllMocks();
 FLAGS.forEach(k=>{delete process.env[k];});
});
afterAll(()=>FLAGS.forEach((k,i)=>{
 if(old[i]===undefined)delete process.env[k];
 else process.env[k]=old[i];
}));
describe('R35 prepare-only orphan intent fence',()=>{
 it('does not permit real source access or automatic key retirement',()=>{
  expect(R35_REAL_ORPHAN_REGISTRY_ENABLED).toBe(false);
  expect(R35_REAL_PENDING_KEY_RETIREMENT_ENABLED).toBe(false);
 });
 it('refuses real client requests before even reading SQL or vault',async()=>{
  await expect(beginHeldOriginalWriteIntentR35(signed))
    .rejects.toHaveProperty('code','r35_real_orphan_registry_disabled');
  await expect(observeHeldExistingOriginalR35({
    ...signed,intentId:ID,
  })).rejects.toHaveProperty('code','r35_real_orphan_registry_disabled');
  noIO();
 });
 it('needs all four exact fictional-only flags',async()=>{
  enabled();
  for(const flag of FLAGS){
    process.env[flag]='not-approved';
    await expect(beginHeldOriginalWriteIntentR35(signed))
      .rejects.toHaveProperty('code','r35_real_orphan_registry_disabled');
    noIO();
    process.env[flag]='fictional-only';
  }
 });
 it('refuses reusing pending Work key ID without any DB call',async()=>{
  enabled();
  await expect(beginHeldOriginalWriteIntentR35({
    ...signed,workAuthority:{...signed.workAuthority,key:signed.pendingAuthority.key},
  })).rejects.toHaveProperty('code','r35_separate_valid_authority_keys_required');
  noIO();
 });
 it('refuses identical raw pending and Work key bytes under separate UUIDs',async()=>{
  enabled();
  await expect(beginHeldOriginalWriteIntentR35({
    ...signed,workAuthority:{...signed.workAuthority,
      key:{keyId:WKEY,keyBytes:signed.pendingAuthority.key.keyBytes}},
  })).rejects.toHaveProperty('code','r35_separate_valid_authority_keys_required');
  noIO();
 });
 it('rejects a malformed non-opaque journal ID before accessing SQL',async()=>{
  enabled();
  await expect(observeHeldExistingOriginalR35({...signed,intentId:'R35_fake_member_name'}))
    .rejects.toHaveProperty('code','r35_invalid_intention_id');
  noIO();
 });
 it('an intent alone can never support a claim of retired keys or deleted files',()=>{
  const intent:R35Intent={
    intentId:ID,memberId:OWNER,arrivalId:ID,claimId:ID,workId:ID,
    pendingGeneration:1,workGeneration:1,
    pendingKeyId:PKEY,workKeyId:WKEY,
    sourceBindingHmac:'b'.repeat(64),state:'held_intent',
  };
  expect(assessPendingKeyRetirementR35(intent)).toEqual({
    status:'RETIREMENT_HOLD_EXTERNAL_WITNESS_REQUIRED',
    workId:ID,claimId:ID,
    keyRetired:false,ciphertextErased:false,releaseApproved:false,
  });
 });
 it('no member-facing API route invokes the R35 fixture',()=>{
  const matches=routes(path.join(process.cwd(),'app/api')).filter(file=>
    /heldOrphanIntentR35|beginHeldOriginalWriteIntentR35|observeHeldExistingOriginalR35/
      .test(readFileSync(file,'utf8')));
  expect(matches).toEqual([]);
 });
 it('R35 code has no path to publishing or deleting any vault ciphertext',()=>{
  const src=readFileSync(path.join(process.cwd(),
    'lib/writersStudio/recovery/heldOrphanIntentR35.ts'),'utf8');
  for(const forbidden of [
    'writeDurableVaultBytes(', 'destroyVaultBytes(', 'deleteVaultBytes(',
    'persistHeldOriginalR32(', 'INSERT INTO writers_studio_r32_held_originals',
    'DELETE FROM writers_studio_r33_held_pending',
  ])expect(src).not.toContain(forbidden);
 });
});
