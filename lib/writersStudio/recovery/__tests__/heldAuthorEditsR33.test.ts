import {randomUUID,createHash} from 'node:crypto';
jest.mock('../heldVaultHistoryR23',()=>({
 persistHeldHistoryR23:jest.fn(),
 readHeldHistoryR23:jest.fn(),
}));
import {persistHeldHistoryR23,readHeldHistoryR23} from '../heldVaultHistoryR23';
import {
 beginDraftR33,reopenDraftR33,saveDraftR33,
 applyAuthorApprovedR33,undoLastApplyR33,
 R33_REAL_EDITORIAL_WRITES_ENABLED,R33_SNAPSHOT_PROTOCOL,
} from '../heldAuthorEditsR33';
import type {WorkRecord} from '../workEnvelopeV1';
const append=persistHeldHistoryR23 as jest.Mock;
const read=readHeldHistoryR23 as jest.Mock;
const MEMBER='11111111-1111-4111-8111-111111111111';
const WORK='33333333-3333-4333-8333-333333333333';
const scope={
 subject:{memberId:MEMBER,assertedBy:'server_verified_member_session' as const},
 workId:WORK,custody:{key:{keyId:randomUUID(),keyBytes:Buffer.alloc(32,1)},
 signedDeletion:null,trustedSigner:null,independent:null},
};
const hash=(v:string)=>createHash('sha256').update(v).digest('hex');
const oldEnv=process.env.R33_EDITORIAL_HISTORY_FIXTURE;
const history=new Map<number,{manifest:any;records:WorkRecord[]}>();
beforeEach(()=>{
 jest.clearAllMocks();history.clear();
 process.env.R33_EDITORIAL_HISTORY_FIXTURE='fictional-only';
 append.mockImplementation(async(input:any)=>{
  const generation=input.generation as number;
  if(history.has(generation))throw Error('mock_immutable_version');
  if(generation!==history.size+1)throw Error('mock_stale_version');
  const manifest={id:randomUUID(),memberId:MEMBER,manuscriptId:WORK,
    generation,keyId:scope.custody.key.keyId,cipherRef:'fictional.enc',
    cipherSHA256:hash('encrypted fixture '+generation),
    previousSHA256:history.get(generation-1)?.manifest.cipherSHA256??null,
    state:'held_only'};
  history.set(generation,{manifest,records:input.records});
  return manifest;
 });
 read.mockImplementation(async(input:any)=>{
  const current=history.get(input.generation);
  if(!current)throw Error('no_fixture_history');
  return current;
 });
});
afterAll(()=>{
 if(oldEnv===undefined)delete process.env.R33_EDITORIAL_HISTORY_FIXTURE;
 else process.env.R33_EDITORIAL_HISTORY_FIXTURE=oldEnv;
});
describe('R33 author-owned encrypted editorial state machine (mocked custody; physical PG16 separate)',()=>{
 it('keeps real member writing statically OFF and non-fixture fails before I/O',async()=>{
  expect(R33_REAL_EDITORIAL_WRITES_ENABLED).toBe(false);
  delete process.env.R33_EDITORIAL_HISTORY_FIXTURE;
  await expect(beginDraftR33({...scope,text:'fiction'}))
    .rejects.toMatchObject({code:'r33_live_editorial_disabled'});
  expect(append).not.toHaveBeenCalled();
 });
 it('begins, saves, applies only with explicit fictional confirmation, then undoes',async()=>{
  const first=await beginDraftR33({...scope,text:'original'});
  const saved=await saveDraftR33({...scope,expectedGeneration:1,
    expectedSHA256:first.textSHA256,text:'revised'});
  await expect(applyAuthorApprovedR33({...scope,expectedGeneration:2,
    expectedSHA256:saved.textSHA256,proposedText:'MAIA edit',authorConfirmed:false}))
    .rejects.toMatchObject({code:'r33_explicit_author_confirmation_required'});
  expect(history.size).toBe(2);
  const applied=await applyAuthorApprovedR33({...scope,
    expectedGeneration:2,expectedSHA256:saved.textSHA256,
    proposedText:'MAIA edit',authorConfirmed:true});
  expect(applied.text).toBe('MAIA edit');
  expect(applied.previousText).toBe('revised');
  const undo=await undoLastApplyR33({...scope,
    expectedGeneration:3,expectedSHA256:applied.textSHA256});
  expect(undo.text).toBe('revised');
  expect(undo.previousText).toBe('MAIA edit');
  expect(undo.action).toBe('undo');
  expect((await reopenDraftR33({...scope,generation:1})).text).toBe('original');
  expect((await reopenDraftR33({...scope,generation:3})).text).toBe('MAIA edit');
  expect(history.size).toBe(4);
 });
 it('refuses stale author text digest before any append',async()=>{
  const first=await beginDraftR33({...scope,text:'original'});
  await expect(saveDraftR33({...scope,
    expectedGeneration:1,expectedSHA256:'a'.repeat(64),text:'new'}))
    .rejects.toMatchObject({code:'r33_optimistic_digest_conflict'});
  expect(first.textSHA256).not.toBe('a'.repeat(64));
  expect(history.size).toBe(1);
 });
 it('refuses undo unless most recent action is Apply, including twice',async()=>{
  const first=await beginDraftR33({...scope,text:'start'});
  await expect(undoLastApplyR33({...scope,
    expectedGeneration:1,expectedSHA256:first.textSHA256}))
    .rejects.toMatchObject({code:'r33_only_latest_apply_can_undo'});
  const applied=await applyAuthorApprovedR33({...scope,
    expectedGeneration:1,expectedSHA256:first.textSHA256,
    proposedText:'changed',authorConfirmed:true});
  const undo=await undoLastApplyR33({...scope,expectedGeneration:2,
    expectedSHA256:applied.textSHA256});
  await expect(undoLastApplyR33({...scope,
    expectedGeneration:3,expectedSHA256:undo.textSHA256}))
    .rejects.toMatchObject({code:'r33_only_latest_apply_can_undo'});
 });
 it('refuses empty/oversized current draft and identical no-op edits',async()=>{
  await expect(beginDraftR33({...scope,text:''}))
    .rejects.toMatchObject({code:'r33_invalid_draft'});
  await expect(beginDraftR33({...scope,text:'x'.repeat(2*1024*1024+1)}))
    .rejects.toMatchObject({code:'r33_draft_too_large'});
  const first=await beginDraftR33({...scope,text:'stable'});
  await expect(saveDraftR33({...scope,expectedGeneration:1,
    expectedSHA256:first.textSHA256,text:'stable'}))
    .rejects.toMatchObject({code:'r33_no_change_to_commit'});
 });
 it('rejects forged subject or Work before writing',async()=>{
  await expect(beginDraftR33({...scope,text:'author',
    subject:{...scope.subject,assertedBy:'client_claimed' as never}}))
    .rejects.toMatchObject({code:'r33_unverified_author_or_work'});
  await expect(beginDraftR33({...scope,text:'author',workId:'not_uuid'}))
    .rejects.toMatchObject({code:'r33_unverified_author_or_work'});
  expect(history.size).toBe(0);
 });
 it('does not allow an unexpected historical plaintext-bearing field',async()=>{
  await beginDraftR33({...scope,text:'original'});
  const row=history.get(1)!;
  row.records.push({field:'unreviewed_memo.content',recordId:WORK,
    value:Buffer.from('hidden unapproved prose')});
  await expect(reopenDraftR33({...scope,generation:1}))
    .rejects.toMatchObject({code:'r33_snapshot_record_count'});
 });
 it('uses existing classified encrypted fields and stores action note inside them',async()=>{
  await beginDraftR33({...scope,text:'fiction'});
  expect(history.get(1)!.records.map(x=>x.field)).toEqual([
    'manuscript_working_drafts.content',
    'working_draft_revisions.content',
    'working_draft_revisions.note',
  ]);
  const note=JSON.parse(history.get(1)!.records[2].value.toString());
  expect(note.protocol).toBe(R33_SNAPSHOT_PROTOCOL);
  expect(note.action).toBe('start');
  expect(note.fromGeneration).toBe(0);
  expect(note.proposedSHA256).toBeNull();
 });
});
