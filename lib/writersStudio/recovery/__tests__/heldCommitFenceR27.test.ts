import {NextRequest} from 'next/server';
jest.mock('../heldWriterSessionReviewR17',()=>({reviewHeldWriterRequestR17:jest.fn()}));
jest.mock('../heldExternalCustodyAdapterR26',()=>({createHeldFixtureCustodianR26:jest.fn()}));
jest.mock('../heldVaultHistoryR23',()=>({persistHeldHistoryR23:jest.fn()}));
import {reviewHeldWriterRequestR17} from '../heldWriterSessionReviewR17';
import {createHeldFixtureCustodianR26} from '../heldExternalCustodyAdapterR26';
import {persistHeldHistoryR23} from '../heldVaultHistoryR23';
import {attemptHeldRevisionWithFenceR27,R27_REAL_COMMIT_FENCE_ENABLED,type R27HeldWriterProviders} from '../heldCommitFenceR27';
const review=reviewHeldWriterRequestR17 as jest.Mock;
const provider=createHeldFixtureCustodianR26 as jest.Mock;
const write=persistHeldHistoryR23 as jest.Mock;
const MEMBER='11111111-1111-4111-8111-111111111111';
const WORK='33333333-3333-4333-8333-333333333333';
const granted=(id=MEMBER)=>({kind:'held_only',subject:{memberId:id,assertedBy:'server_verified_member_session'},origin:'https://soullab.life'});
const received={memberId:MEMBER,workId:WORK,generation:2,purpose:'append'};
const events:string[]=[];
let config:R27HeldWriterProviders;
const original=Object.fromEntries(['R27_COMMIT_FENCE_FIXTURE','R26_EXTERNAL_CUSTODY_FIXTURE','R23_VAULT_HISTORY_FIXTURE'].map(x=>[x,process.env[x]]));
const request=()=>new NextRequest('https://soullab.life/api/sovereign/writers-studio/held-pair',{method:'POST',headers:{host:'soullab.life',origin:'https://soullab.life'}});
const run=()=>attemptHeldRevisionWithFenceR27({request:request(),workId:WORK,generation:2,records:[{field:'manuscript_working_drafts.content',recordId:WORK,value:Buffer.from('fiction-only')}],providers:config});
beforeEach(()=>{
 jest.resetAllMocks();events.length=0;
 process.env.R27_COMMIT_FENCE_FIXTURE='fictional-only';
 process.env.R26_EXTERNAL_CUSTODY_FIXTURE='fictional-only';
 process.env.R23_VAULT_HISTORY_FIXTURE='fictional-only';
 review.mockImplementation(async()=>{events.push('review');return granted()});
 provider.mockReturnValue({resolve:async()=>{events.push('key');return {scope:received,key:{keyId:WORK,keyBytes:Buffer.alloc(32)},trust:{signed:{},signer:{},independent:{minimumGeneration:13}}}}});
 write.mockImplementation(async()=>{events.push('write');return {generation:2}});
 config={outside:{authority:'fabricated_r26_external_operator_test_only',resolve:async()=>null} as never,
 pinnedRoots:{keyCustodian:{} as never,deletionAuthority:{} as never,independentFreshness:{} as never},
 trustedClock:()=>1000,
 coordinator:{authority:'fictional_same_work_revocation_commit_lock',withWorkFence:async(_scope,cb)=>{events.push('fence');return cb({currentDeletionEpoch:13,workActive:true})}},
 };
});
afterAll(()=>{for(const [k,v] of Object.entries(original)){if(v===undefined)delete process.env[k];else process.env[k]=v;}});
describe('R27 held Work save fence',()=>{
 it('cannot turn on real writer operations',()=>expect(R27_REAL_COMMIT_FENCE_ENABLED).toBe(false));
 it('refuses absent fixture gate',async()=>{delete process.env.R27_COMMIT_FENCE_FIXTURE;expect(await run()).toEqual({kind:'refused',status:404});expect(provider).not.toHaveBeenCalled()});
 it('fences between key and encrypted writing, rechecking session',async()=>{
  expect((await run()).kind).toBe('held_fixture_only');
  expect(events).toEqual(['review','key','fence','review','write']);
  expect(review).toHaveBeenCalledTimes(2);
 });
 it('rejects withdrawal between key and commit',async()=>{
  review.mockResolvedValueOnce(granted()).mockResolvedValueOnce({kind:'refused',status:403});
  expect(await run()).toEqual({kind:'refused',status:403});expect(write).not.toHaveBeenCalled();
 });
 it('rejects owner identity change before commit',async()=>{
  review.mockResolvedValueOnce(granted()).mockResolvedValueOnce(granted('22222222-2222-4222-8222-222222222222'));
  expect(await run()).toEqual({kind:'refused',status:403});expect(write).not.toHaveBeenCalled();
 });
 it('rejects advancing deletion epoch',async()=>{
  config.coordinator.withWorkFence=async(_scope,cb)=>cb({currentDeletionEpoch:14,workActive:true});
  expect(await run()).toEqual({kind:'refused',status:403});expect(write).not.toHaveBeenCalled();
 });
 it('rejects revoked Work at same epoch',async()=>{
  config.coordinator.withWorkFence=async(_scope,cb)=>cb({currentDeletionEpoch:13,workActive:false as true});
  expect(await run()).toEqual({kind:'refused',status:403});expect(write).not.toHaveBeenCalled();
 });
 it('refuses a missing coordinator instead of skipping the lock',async()=>{
  config={...config,coordinator:null as never};
  expect(await run()).toEqual({kind:'refused',status:503});
  expect(write).not.toHaveBeenCalled();
 });
 it('refuses unavailable external custody without persisting bytes',async()=>{
  provider.mockReturnValueOnce({resolve:async()=>{throw Error('fixture unavailable')}});
  expect(await run()).toEqual({kind:'refused',status:503});
  expect(write).not.toHaveBeenCalled();
 });
 it('refuses coordinator failure without writing',async()=>{
  config.coordinator.withWorkFence=async()=>{throw Error('coordinator unavailable')};
  expect(await run()).toEqual({kind:'refused',status:503});expect(write).not.toHaveBeenCalled();
 });
});
