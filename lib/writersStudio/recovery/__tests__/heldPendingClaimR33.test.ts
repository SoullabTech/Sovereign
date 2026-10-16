/** R33 route isolation + default-off. No database, vault or real model calls. */
import path from 'node:path';
import {readFileSync,readdirSync} from 'node:fs';
jest.mock('@/lib/db/postgres',()=>({
 query:jest.fn(()=>{throw Error('r33_unit_must_not_connect_database');}),
 transaction:jest.fn(()=>{throw Error('r33_unit_must_not_open_transaction');}),
}));
jest.mock('@/lib/storage/fileVault',()=>({
 readVaultBytes:jest.fn(()=>{throw Error('r33_unit_must_not_read_vault');}),
 writeDurableVaultBytes:jest.fn(()=>{throw Error('r33_unit_must_not_write_vault');}),
}));
import {query,transaction} from '@/lib/db/postgres';
import {readVaultBytes,writeDurableVaultBytes} from '@/lib/storage/fileVault';
import {
 persistHeldPendingR33,readHeldPendingR33,commitHeldPendingClaimR33,
 promoteHeldClaimToWorkR33,R33_REAL_MEMBER_PENDING_CLAIM_ENABLED,
} from '../heldPendingClaimR33';
const MEMBER='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const ARRIVAL='4c0782ca-9074-43ee-9f3c-5f8500026784';
const WORK='4c0782ca-9074-43ee-9f3c-5f8500026780';
const subject={memberId:MEMBER,assertedBy:'server_verified_member_session' as const};
const source={kind:'supplied_text' as const,sourceText:'fictional confirmed paste',
 originalBytes:null,originalFilename:null,mimeType:null,extractorId:null};
const invalidTrust={key:null as never,signedDeletion:null,
 trustedSigner:null,independent:null};
const priorR33=process.env.R33_PENDING_CLAIM_FIXTURE;
const priorR32=process.env.R32_HELD_SOURCE_FIXTURE;
const restore=()=>{
 if(priorR33===undefined)delete process.env.R33_PENDING_CLAIM_FIXTURE;
 else process.env.R33_PENDING_CLAIM_FIXTURE=priorR33;
 if(priorR32===undefined)delete process.env.R32_HELD_SOURCE_FIXTURE;
 else process.env.R32_HELD_SOURCE_FIXTURE=priorR32;
};
const noIO=()=>{
 expect(query).not.toHaveBeenCalled();
 expect(transaction).not.toHaveBeenCalled();
 expect(readVaultBytes).not.toHaveBeenCalled();
 expect(writeDurableVaultBytes).not.toHaveBeenCalled();
};
function apiRouteFiles(dir:string):string[]{
 return readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  const p=path.join(dir,e.name);
  return e.isDirectory()?apiRouteFiles(p):e.isFile()&&/^route\.(ts|tsx)$/.test(e.name)?[p]:[];
 });
}
beforeEach(()=>{jest.clearAllMocks();restore();});
afterAll(restore);

describe('R33 pending-original source never creates a live route/grant',()=>{
 it('has zero real member import activation',()=>{
  expect(R33_REAL_MEMBER_PENDING_CLAIM_ENABLED).toBe(false);
 });
 it('refuses pending seal when BOTH exact fictional-only flags are absent',async()=>{
  delete process.env.R33_PENDING_CLAIM_FIXTURE;
  delete process.env.R32_HELD_SOURCE_FIXTURE;
  await expect(persistHeldPendingR33({subject,arrivalId:ARRIVAL,
   generation:1,source,authority:invalidTrust})).rejects
    .toHaveProperty('code','r33_real_pending_claim_disabled');
  noIO();
 });
 it('refuses trying to claim pending Source when fixture not enabled',async()=>{
  delete process.env.R33_PENDING_CLAIM_FIXTURE;
  await expect(commitHeldPendingClaimR33({subject,arrivalId:ARRIVAL,
   pendingGeneration:1,workId:WORK,workGeneration:1,claimEpoch:20,
   authority:invalidTrust})).rejects
    .toHaveProperty('code','r33_real_pending_claim_disabled');
  noIO();
 });
 it('refuses forged browser member assertion BEFORE decrypt or SQL',async()=>{
  process.env.R33_PENDING_CLAIM_FIXTURE='fictional-only';
  process.env.R32_HELD_SOURCE_FIXTURE='fictional-only';
  await expect(persistHeldPendingR33({
   subject:{...subject,assertedBy:'client_claim'} as never,
   arrivalId:ARRIVAL,generation:1,source,authority:invalidTrust,
  })).rejects.toHaveProperty('code','r33_verified_server_session_required');
  noIO();
 });
 it('refuses unknown arrival UUID or generation before even checking trust',async()=>{
  process.env.R33_PENDING_CLAIM_FIXTURE='fictional-only';
  process.env.R32_HELD_SOURCE_FIXTURE='fictional-only';
  await expect(readHeldPendingR33({
   subject,arrivalId:'untrusted',generation:1,authority:invalidTrust,
  })).rejects.toHaveProperty('code','r33_invalid_identity');
  await expect(readHeldPendingR33({
   subject,arrivalId:ARRIVAL,generation:0,authority:invalidTrust,
  })).rejects.toHaveProperty('code','r33_invalid_generation');
  noIO();
 });
 it('refuses missing independently signed pending deletion authority',async()=>{
  process.env.R33_PENDING_CLAIM_FIXTURE='fictional-only';
  process.env.R32_HELD_SOURCE_FIXTURE='fictional-only';
  await expect(persistHeldPendingR33({
   subject,arrivalId:ARRIVAL,generation:1,source,
   authority:{...invalidTrust,key:{keyId:WORK,
      keyBytes:Buffer.alloc(32)}},
  })).rejects.toHaveProperty('code',
    'r33_independent_pending_deletion_witness_required');
  noIO();
 });
 it('no active Next API route imports R33 held claims or R32 sealed originals',()=>{
  const match=apiRouteFiles(path.join(process.cwd(),'app/api'))
   .filter(p=>/heldPendingClaimR33|persistHeldPendingR33|commitHeldPendingClaimR33|promoteHeldClaimToWorkR33|heldOriginalSourceR32/.test(readFileSync(p,'utf8')));
  expect(match).toEqual([]);
 });
});
