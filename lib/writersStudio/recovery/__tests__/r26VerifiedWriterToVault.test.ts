/**
 * R26: real R17 source preflight + R23 composer + signed fictional key broker.
 * The final R23 vault backend is mocked: NO database, vault or production key.
 */
import {NextRequest} from 'next/server';
import {createHash,generateKeyPairSync,randomBytes,sign} from 'node:crypto';
jest.mock('@/lib/auth/getMemberFromRequest',()=>({getMemberIdFromRequest:jest.fn()}));
jest.mock('@/lib/writersStudio/betaAccessServer',()=>({writersStudioBetaAccess:jest.fn()}));
jest.mock('../heldVaultHistoryR23',()=>({
  persistHeldHistoryR23:jest.fn(), readHeldHistoryR23:jest.fn(),
}));
import {getMemberIdFromRequest} from '@/lib/auth/getMemberFromRequest';
import {writersStudioBetaAccess} from '@/lib/writersStudio/betaAccessServer';
import {persistHeldHistoryR23} from '../heldVaultHistoryR23';
import {saveHeldWriterRevisionR23,R23_REVIEW_PATH,type R23Scope} from '../reviewVaultHistoryServiceR23';
import {createHeldFixtureCustodianR26} from '../heldExternalCustodyAdapterR26';
import {canonicalKeyLeaseR26,canonicalFreshnessR26,
 type R26Lease,type R26Freshness} from '../externalCustodyContractR26';
import {canonicalDeletionPayload} from '../deletionBarrierV1';

const owner='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const other='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const work='4c0782ca-9074-43ee-9f3c-5f8500026780';
const keyId='9f8746d1-76c3-4217-8d2c-115056189df7';
const now=1792164000000;
const scope={memberId:owner,workId:work,generation:1,purpose:'append' as const};
const rows=[{field:'manuscript_working_drafts.content',recordId:work,
 value:Buffer.from('fictional chapter for source contract')}];
const fakeManifest={id:work,memberId:owner,manuscriptId:work,generation:1,keyId,
 cipherRef:'ws-beta-r23-held-history/'+work+'.enc',
 cipherSHA256:'a'.repeat(64),previousSHA256:null,state:'held_only' as const};
const hashed=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
const auth=getMemberIdFromRequest as jest.Mock;
const access=writersStudioBetaAccess as jest.Mock;
const persist=persistHeldHistoryR23 as jest.Mock;
const flagNames=[
 'WRITERS_STUDIO_RESTRICTED_BETA','WRITERS_STUDIO_R17_HELD_SERVICE_REVIEW',
 'R23_VAULT_HISTORY_FIXTURE','R23_VAULT_SERVICE_FIXTURE',
 'R26_EXTERNAL_CUSTODY_FIXTURE',
];
const initial=Object.fromEntries(flagNames.map(x=>[x,process.env[x]]));
beforeEach(()=>{
 jest.resetAllMocks();
 for(const flag of flagNames)process.env[flag]=flag.includes('FIXTURE')?'fictional-only':'true';
 auth.mockResolvedValue(owner);
 access.mockResolvedValue({eligible:true,basis:'active_beta_tester'});
 persist.mockResolvedValue(fakeManifest);
});
afterAll(()=>{
 for(const flag of flagNames){
  if(initial[flag]===undefined)delete process.env[flag];
  else process.env[flag]=initial[flag];
 }
});
function request(options?:{host?:string;origin?:string;identityHeader?:string}){
 const host=options?.host??'soullab.life';
 return new NextRequest('https://'+host+R23_REVIEW_PATH,{
   method:'POST',headers:{
     host,origin:options?.origin??'https://soullab.life',
     ...(options?.identityHeader?{'x-member-id':options.identityHeader}:{})},
 });
}
function fakeOperator(mutate?:{badLease?:boolean}){
 const keys=generateKeyPairSync('ed25519');
 const checkpointSigner=generateKeyPairSync('ed25519');
 const freshSigner=generateKeyPairSync('ed25519');
 const key={keyId,keyBytes:randomBytes(32)};
 const outside={authority:'fabricated_r26_external_operator_test_only' as const,
  resolve:jest.fn(async (asked:R23Scope,challenge:string)=>{
   const checkpoint={protocol:'soullab.ws.deletion-highwater.v1' as const,
     stream:'writers-studio-beta' as const,generation:10,revokedWorks:[],revokedKeyIds:[]};
   const cp=canonicalDeletionPayload(checkpoint);
   const checkpointSha256=hashed(cp);
   const lease:R26Lease={protocol:'soullab.ws.external-work-key-lease.r26',
     ...asked,keyId,challenge,issuedAtMs:now-1000,expiresAtMs:now+30000,
     keySha256:hashed(key.keyBytes),checkpointSha256};
   const freshness:R26Freshness={protocol:'soullab.ws.independent-highwater-witness.r26',
     memberId:asked.memberId,workId:asked.workId,keyId,challenge,
     minimumGeneration:10,checkpointSha256,issuedAtMs:now-1000,expiresAtMs:now+30000};
   return {key,
    lease:{statement:lease,signature:sign(null,canonicalKeyLeaseR26(lease),
      mutate?.badLease?freshSigner.privateKey:keys.privateKey).toString('base64')},
    freshness:{statement:freshness,signature:sign(null,canonicalFreshnessR26(freshness),
      freshSigner.privateKey).toString('base64')},
    deletion:{checkpoint,signature:sign(null,cp,checkpointSigner.privateKey).toString('base64')},
   };
  })};
 const custodian=createHeldFixtureCustodianR26({
   outside,trustedClock:()=>now,
   trustedPublicRoots:{
     keyCustodian:keys.publicKey,deletionAuthority:checkpointSigner.publicKey,
     independentFreshness:freshSigner.publicKey,
   },
 });
 return {outside,custodian};
}
const save=(requestValue:NextRequest,custodian:ReturnType<typeof fakeOperator>['custodian'])=>
 saveHeldWriterRevisionR23({request:requestValue,workId:work,generation:1,
  records:rows,custodian});
describe('R26 key-grant composition starts after R17 member-session and consent',()=>{
 it('requires verified session, active writer consent and signed key before held storage',async()=>{
   const x=fakeOperator();
   expect(await save(request(),x.custodian)).toEqual({
     kind:'held_fixture_only',value:fakeManifest});
   expect(auth).toHaveBeenCalledTimes(1);
   expect(access).toHaveBeenCalledWith(owner);
   expect(x.outside.resolve).toHaveBeenCalledTimes(1);
   expect(x.outside.resolve.mock.calls[0][0]).toEqual(scope);
   expect(x.outside.resolve.mock.calls[0][1]).toMatch(/^[0-9a-f]{64}$/);
   expect(persist).toHaveBeenCalledWith(expect.objectContaining({
     subject:{memberId:owner,assertedBy:'server_verified_member_session'},
     manuscriptId:work,generation:1,
   }));
 });
 it('refuses missing authenticated session before any key broker or storage call',async()=>{
   auth.mockResolvedValue(null); const x=fakeOperator();
   expect(await save(request({identityHeader:owner}),x.custodian)).toEqual({
     kind:'refused',status:401});
   expect(x.outside.resolve).not.toHaveBeenCalled();
   expect(persist).not.toHaveBeenCalled();
 });
 it('refuses a valid but uninvited or consent-withdrawn member before key request',async()=>{
   access.mockResolvedValue({eligible:false,basis:'not_in_pilot'});
   const x=fakeOperator();
   expect(await save(request(),x.custodian)).toEqual({kind:'refused',status:403});
   expect(x.outside.resolve).not.toHaveBeenCalled();
   expect(persist).not.toHaveBeenCalled();
 });
 it('refuses wrong origin, even when session and broker would otherwise succeed',async()=>{
   const x=fakeOperator();
   expect(await save(request({origin:'https://foreign.invalid'}),x.custodian))
     .toEqual({kind:'refused',status:403});
   expect(x.outside.resolve).not.toHaveBeenCalled();
   expect(persist).not.toHaveBeenCalled();
 });
 it('refuses a forged external Work-key lease before calling held SQL/vault backend',async()=>{
   const x=fakeOperator({badLease:true});
   expect(await save(request(),x.custodian)).toEqual({kind:'refused',status:503});
   expect(x.outside.resolve).toHaveBeenCalledTimes(1);
   expect(persist).not.toHaveBeenCalled();
 });
 it('uses server-verified identity rather than an arbitrary claimed member header',async()=>{
   const x=fakeOperator();
   expect(await save(request({identityHeader:other}),x.custodian))
     .toEqual({kind:'held_fixture_only',value:fakeManifest});
   expect(x.outside.resolve.mock.calls[0][0].memberId).toBe(owner);
 });
});
