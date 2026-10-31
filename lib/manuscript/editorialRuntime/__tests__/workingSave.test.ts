jest.mock('@/lib/db/postgres', () => ({ transaction: jest.fn() }));
jest.mock('../thread', () => ({ openEditorialRelationshipWithClient: jest.fn() }));
jest.mock('@/lib/writers-studio/threadOrigin', () => ({ lockCurrentEditorialOriginWithClient: jest.fn() }));
jest.mock('../../proposalChain/store', () => ({ appendAuthoredVersionWithExecutor: jest.fn() }));

import { transaction } from '@/lib/db/postgres';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { openEditorialRelationshipWithClient } from '../thread';
import { lockCurrentEditorialOriginWithClient } from '@/lib/writers-studio/threadOrigin';
import { appendAuthoredVersionWithExecutor } from '../../proposalChain/store';
import { saveWorkingEditorialVersion } from '../workingSave';

const MEMBER='11111111-1111-4111-8111-111111111111';
const REL='22222222-2222-4222-8222-222222222222';
const SECTION='33333333-3333-4333-8333-333333333333';
const THREAD='44444444-4444-4444-8444-444444444444';
const CHAIN='55555555-5555-4555-8555-555555555555';
const VERSION='66666666-6666-4666-8666-666666666666';
const KEY='77777777-7777-4777-8777-777777777777';
const DRAFT='88888888-8888-4888-8888-888888888888';
const identity={status:'verified' as const,memberId:MEMBER};
const posture=TurnPosture.resolve({sanctuary:false});
const request={idempotencyKey:KEY,relationshipId:REL,sectionId:SECTION,
 range:{start:0,end:12},revisionNumber:7,threadId:null,supersedes:null,
 replacementText:'My exact words',sanctuary:false,kept:[]};
const tx={query:jest.fn()};
const mockedTransaction=transaction as jest.MockedFunction<typeof transaction>;
const mockedOpen=openEditorialRelationshipWithClient as jest.MockedFunction<typeof openEditorialRelationshipWithClient>;
const mockedLock=lockCurrentEditorialOriginWithClient as jest.MockedFunction<typeof lockCurrentEditorialOriginWithClient>;
const mockedAppend=appendAuthoredVersionWithExecutor as jest.MockedFunction<typeof appendAuthoredVersionWithExecutor>;

beforeEach(()=>{
 jest.resetAllMocks();
 mockedTransaction.mockImplementation(async fn=>fn(tx as never));
 tx.query.mockImplementation(async(sql:string)=>{
  if(sql.includes('FROM writer_editorial_save_receipts')) return {rows:[]};
  return {rows:[]};
 });
 mockedOpen.mockResolvedValue({ok:true,threadId:THREAD,chainId:CHAIN});
 mockedAppend.mockResolvedValue({outcome:'appended',version:{id:VERSION,chainId:CHAIN,
  supersedes:null,replacementText:'My exact words',author:'member',authoredAt:'2026-10-20T22:00:00.000Z'}});
});

it('creates first member root in one caller transaction and records a content-free receipt',async()=>{
 const result=await saveWorkingEditorialVersion({identity,posture,request});
 expect(result).toEqual({ok:true,replayed:false,threadId:THREAD,chainId:CHAIN,
  versionId:VERSION,supersedes:null,sectionId:SECTION});
 expect(mockedOpen).toHaveBeenCalledWith(tx,expect.objectContaining({identity,relationshipId:REL,sectionId:SECTION,posture}),
  {range:request.range,revisionNumber:7});
 expect(mockedAppend).toHaveBeenCalledWith(tx,MEMBER,CHAIN,{
  author:'member',supersedes:null,replacementText:'My exact words'});
 const receipt=tx.query.mock.calls.find(c=>String(c[0]).includes('INSERT INTO writer_editorial_save_receipts'));
 expect(receipt?.[1]).toEqual([MEMBER,KEY,REL,THREAD,CHAIN,VERSION,SECTION,null]);
 expect(tx.query.mock.calls.some(c=>String(c[0]).includes('ask_turns'))).toBe(false);
});

it('replays the same idempotency key only after current origin authority and exact canonical wording',async()=>{
 tx.query.mockImplementation(async(sql:string)=>{
  if(sql.includes('FROM writer_editorial_save_receipts')) return {rows:[{
   relationship_id:REL,thread_id:THREAD,proposal_chain_id:CHAIN,proposal_version_id:VERSION,
   target_section_id:SECTION,supersedes:null,formulation:'My exact words',stored_supersedes:null,
  }]};
  return {rows:[]};
 });
 mockedLock.mockResolvedValue({ok:true,origin:{id:'99999999-9999-4999-8999-999999999999',threadId:THREAD,
  proposalChainId:CHAIN,memberId:MEMBER,livingWorkId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  manuscriptId:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',relationshipId:REL,
  creationExpressionId:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',draftId:DRAFT,targetSectionId:SECTION,
  draftVersion:7,draftRevisionCount:3,locusScopeKind:'passage',createdAt:'2026-10-20T22:00:00.000Z'}});
 const result=await saveWorkingEditorialVersion({identity,posture,request});
 expect(result).toMatchObject({ok:true,replayed:true,threadId:THREAD,versionId:VERSION});
 expect(mockedOpen).not.toHaveBeenCalled();
 expect(mockedAppend).not.toHaveBeenCalled();
});

it('refuses same idempotency key with different wording',async()=>{
 tx.query.mockImplementation(async(sql:string)=>sql.includes('FROM writer_editorial_save_receipts')?{rows:[{
  relationship_id:REL,thread_id:THREAD,proposal_chain_id:CHAIN,proposal_version_id:VERSION,
  target_section_id:SECTION,supersedes:null,formulation:'Earlier wording',stored_supersedes:null,
 }]}:{rows:[]});
 expect(await saveWorkingEditorialVersion({identity,posture,request})).toEqual({ok:false,reason:'idempotency_conflict'});
 expect(mockedOpen).not.toHaveBeenCalled();expect(mockedAppend).not.toHaveBeenCalled();
});

it('does not claim to persist settled Craft choices the current schema cannot store',async()=>{
 const result=await saveWorkingEditorialVersion({identity,posture,request:{...request,kept:[{start:0,end:2,text:'My'}]}});
 expect(result).toEqual({ok:false,reason:'settled_choices_not_persisted'});
 expect(mockedTransaction).not.toHaveBeenCalled();
});

it('existing-thread Save revalidates exact current locus before appending',async()=>{
 const existing={...request,threadId:THREAD};
 mockedLock.mockResolvedValue({ok:true,origin:{id:'99999999-9999-4999-8999-999999999999',threadId:THREAD,
  proposalChainId:CHAIN,memberId:MEMBER,livingWorkId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  manuscriptId:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',relationshipId:REL,
  creationExpressionId:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',draftId:DRAFT,targetSectionId:SECTION,
  draftVersion:7,draftRevisionCount:3,locusScopeKind:'passage',createdAt:'2026-10-20T22:00:00.000Z'}});
 tx.query.mockImplementation(async(sql:string)=>{
  if(sql.includes('FROM writer_editorial_save_receipts')) return {rows:[]};
  if(sql.includes('FROM manuscript_working_drafts')) return {rows:[{version:'7',revision_count:3,text:'My exact text',heading:null,expected_text:'My exact text'}]};
  return {rows:[]};
 });
 const result=await saveWorkingEditorialVersion({identity,posture,request:{...existing,range:{start:0,end:13}}});
 expect(result).toMatchObject({ok:true,threadId:THREAD,chainId:CHAIN});
 expect(mockedOpen).not.toHaveBeenCalled();
 expect(mockedLock).toHaveBeenCalledWith(tx,{memberId:MEMBER,relationshipId:REL,threadId:THREAD});
});
