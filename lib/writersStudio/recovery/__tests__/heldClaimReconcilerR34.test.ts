/** R34 local fixture cannot be reached by ordinary member routes. */
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
jest.mock('@/lib/db/postgres',()=>({
  query:jest.fn(()=>{throw Error('r34_unit_disallows_db_query');}),
  transaction:jest.fn(()=>{throw Error('r34_unit_disallows_db_transaction');}),
}));
jest.mock('@/lib/storage/fileVault',()=>({
  readVaultBytes:jest.fn(()=>{throw Error('r34_unit_disallows_vault_read');}),
  writeDurableVaultBytes:jest.fn(()=>{throw Error('r34_unit_disallows_vault_write');}),
}));
import {query,transaction} from '@/lib/db/postgres';
import {readVaultBytes,writeDurableVaultBytes} from '@/lib/storage/fileVault';
import {
  reconcileHeldInterruptedClaimR34,R34_REAL_SOURCE_RECOVERY_ENABLED,
} from '../heldClaimReconcilerR34';
import {R33_REAL_MEMBER_PENDING_CLAIM_ENABLED} from '../heldPendingClaimR33';
import {R32_REAL_WRITER_SOURCE_IMPORT_ENABLED} from '../heldOriginalSourceR32';

const MEMBER='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const WORK='4c0782ca-9074-43ee-9f3c-5f8500026780';
const ARRIVAL='4c0782ca-9074-43ee-9f3c-5f8500026784';
const KEY='9f8746d1-76c3-4217-8d2c-115056189df7';
const OTHER='9f8746d1-76c3-4217-8d2c-115056189df8';
const input={
  subject:{memberId:MEMBER,assertedBy:'server_verified_member_session' as const},
  arrivalId:ARRIVAL,pendingGeneration:1,
  pendingAuthority:{key:{keyId:KEY,keyBytes:Buffer.alloc(32,0x31)},
    signedDeletion:null,trustedSigner:null,independent:null},
  workAuthority:{key:{keyId:OTHER,keyBytes:Buffer.alloc(32,0x32)},
    signedDeletion:null,trustedSigner:null,independent:null},
  signedClaim:null as never,trustedClaimSigner:null,
  minimumClaimEpoch:null,
};
const envs=[
 'R34_CLAIM_RECONCILE_FIXTURE',
 'R33_PENDING_CLAIM_FIXTURE',
 'R32_HELD_SOURCE_FIXTURE',
] as const;
const original=envs.map(x=>process.env[x]);
const noIO=()=>{
  expect(query).not.toHaveBeenCalled();
  expect(transaction).not.toHaveBeenCalled();
  expect(readVaultBytes).not.toHaveBeenCalled();
  expect(writeDurableVaultBytes).not.toHaveBeenCalled();
};
function apiRoutes(dir:string):string[]{
 return readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  const f=path.join(dir,e.name);
  return e.isDirectory()?apiRoutes(f):
    e.isFile() && /^route\.(tsx|ts)$/.test(e.name)?[f]:[];
 });
}
beforeEach(()=>{jest.clearAllMocks();envs.forEach(x=>delete process.env[x]);});
afterAll(()=>envs.forEach((x,i)=>{
  if(original[i]===undefined)delete process.env[x];else process.env[x]=original[i];
}));
describe('R34 default-off, no auto-delete/re-upload recovery contract',()=>{
  it('never activates real protected Source import or recovery',()=>{
    expect(R34_REAL_SOURCE_RECOVERY_ENABLED).toBe(false);
    expect(R33_REAL_MEMBER_PENDING_CLAIM_ENABLED).toBe(false);
    expect(R32_REAL_WRITER_SOURCE_IMPORT_ENABLED).toBe(false);
  });
  it('refuses absent fictional gate BEFORE touching any db or vault',async()=>{
    await expect(reconcileHeldInterruptedClaimR34(input))
      .rejects.toHaveProperty('code','r34_real_reconciler_disabled');
    noIO();
  });
  it('requires all three exact fixture-only flags',async()=>{
    process.env[envs[0]]='fictional-only';
    for(const active of [1,2]){
      process.env[envs[active]]='not-approved';
      await expect(reconcileHeldInterruptedClaimR34(input))
        .rejects.toHaveProperty('code','r34_real_reconciler_disabled');
      noIO();
    }
  });
  it('rejects browser assertion of verified identity without IO',async()=>{
    envs.forEach(e=>process.env[e]='fictional-only');
    await expect(reconcileHeldInterruptedClaimR34({
      ...input,subject:{memberId:MEMBER,assertedBy:'client_claim'} as never,
    })).rejects.toHaveProperty('code','r34_server_verified_identity_required');
    noIO();
  });
  it('refuses malformed Work arrival UUID and missing separate Work key',async()=>{
    envs.forEach(e=>process.env[e]='fictional-only');
    await expect(reconcileHeldInterruptedClaimR34({
      ...input,arrivalId:'not-a-uuid',
    })).rejects.toHaveProperty('code','r34_server_verified_identity_required');
    await expect(reconcileHeldInterruptedClaimR34({
      ...input,workAuthority:{...input.workAuthority,key:input.pendingAuthority.key},
    })).rejects.toHaveProperty('code','r34_separate_pending_and_work_key_required');
    noIO();
  });
  it('refuses equal pending and Work secret bytes despite different key IDs',async()=>{
    envs.forEach(e=>process.env[e]='fictional-only');
    await expect(reconcileHeldInterruptedClaimR34({
      ...input,workAuthority:{...input.workAuthority,
        key:{keyId:OTHER,keyBytes:Buffer.alloc(32,0x31)}},
    })).rejects.toHaveProperty('code','r34_separate_pending_and_work_key_required');
    noIO();
  });
  it('no active API route imports this held reconciler or predecessor fixture',()=>{
    const routes=apiRoutes(path.join(process.cwd(),'app/api'));
    const active=routes.filter(f=>/reconcileHeldInterruptedClaimR34|heldClaimReconcilerR34/
      .test(readFileSync(f,'utf8')));
    expect(active).toEqual([]);
  });
  it('reconciler cannot be used to delete, write vault files or persist a second Work',()=>{
    const body=readFileSync(path.join(process.cwd(),
      'lib/writersStudio/recovery/heldClaimReconcilerR34.ts'),'utf8');
    for(const bad of ['writeDurableVaultBytes(', 'destroyVaultBytes(', 'deleteVaultBytes(',
      'persistHeldOriginalR32(', 'INSERT INTO writers_studio_r32_held_originals',
      'DELETE FROM writers_studio_r33_held_pending'])
      expect(body).not.toContain(bad);
  });
});
