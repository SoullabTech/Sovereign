import {createHash,randomUUID} from 'node:crypto';
jest.mock('../heldProtectedDraftR35',()=>({
 reopenHeldDraftR35:jest.fn(),changeHeldDraftR35:jest.fn(),
}));
import {reopenHeldDraftR35,changeHeldDraftR35} from '../heldProtectedDraftR35';
import {
 reviewSectionPassageR37,applySelectedSectionR37,undoSelectedSectionR37,
 R37_REAL_SECTION_EDIT_ENABLED,type R37SectionSelection,
 type R37FixtureGesture,type R37UndoGesture,
} from '../heldSectionApplyR37';
import type {R35View} from '../heldProtectedDraftR35';
const read=reopenHeldDraftR35 as jest.Mock;
const change=changeHeldDraftR35 as jest.Mock;
const A='11111111-1111-4111-8111-111111111111';
const W='33333333-3333-4333-8333-333333333333';
const S1='55555555-5555-4555-8555-555555555551';
const S2='55555555-5555-4555-8555-555555555552';
const C1='A lantern glows beside the river.\n\n';
const C2='The forest waits with its own story.';
const CHOICE='66666666-6666-4666-8666-666666666666';
const ALT='77777777-7777-4777-8777-777777777777';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const scope={subject:{memberId:A,
  assertedBy:'server_verified_member_session' as const},
  workId:W,custody:{key:{keyId:randomUUID(),keyBytes:Buffer.alloc(32,4)},
    signedDeletion:null,trustedSigner:null,independent:null},
};
const base:R35View={workId:W,generation:1,checkpointCount:0,
 kind:'sections',sections:[{id:S1,text:C1},{id:S2,text:C2}],
 content:C1+C2,note:null,action:'start',restoredFrom:null};
function selection(snapshot=base):R37SectionSelection{
 const section=snapshot.sections[0];
 const original='lantern glows';
 const start=Array.from(section.text.split(original)[0]).length;
 return {expectedWorkSHA256:sha(snapshot.content),section:{
  sectionId:section.id,currentText:section.text,
  expectedGeneration:snapshot.generation,
  expectedDraftSHA256:sha(section.text),
  anchor:{sectionId:section.id,start,end:start+Array.from(original).length,
    selectedText:original,sectionSHA256:sha(section.text)},
  alternatives:[
    {id:CHOICE,origin:'maia',wording:'lantern shimmers'},
    {id:ALT,origin:'member',wording:'lantern shines'},
  ],chosenAlternativeId:CHOICE,
 }};
}
function gesture(sel=selection(),key='fictional-idem-001'):R37FixtureGesture{
 return {kind:'synthetic_author_clicked_apply_section',
  workId:W,sectionId:S1,alternativeId:CHOICE,
  expectedGeneration:sel.section.expectedGeneration,
  sectionSHA256:sel.section.expectedDraftSHA256,
  selectedPassageSHA256:sha('lantern glows'),
  idempotencyKey:key};
}
const undoGesture=(gen:number,key:string):R37UndoGesture=>({
 kind:'synthetic_author_clicked_undo_section',workId:W,
 expectedGeneration:gen,appliedVersion:gen,idempotencyKey:key,
});
let versions=new Map<number,R35View>();
let receipts=new Map<string,{payload:string;gen:number;count:number;action:any}>();
let max=1;
const prev=process.env.R37_SECTION_PASSAGE_FIXTURE;
beforeEach(()=>{
 jest.clearAllMocks();process.env.R37_SECTION_PASSAGE_FIXTURE='fictional-only';
 process.env.R36_PASSAGE_REVIEW_FIXTURE='fictional-only';
 versions=new Map([[1,base]]);receipts=new Map();max=1;
 read.mockImplementation(async({generation}:{generation:number})=>{
  if(!versions.has(generation))throw Error('missing');
  return versions.get(generation);
 });
 change.mockImplementation(async({operation}:any)=>{
  const payload=JSON.stringify(operation);
  const key=operation.body?.idempotencyKey;
  if(receipts.has(key)){
    const prior=receipts.get(key)!;
    if(prior.payload!==payload)throw Error('idempotency key reused');
    return {status:'replayed',action:prior.action,
      generation:prior.gen,checkpointCount:prior.count,cipherSHA256:sha('gen'+prior.gen)};
  }
  const current=versions.get(max)!;
  if(operation.body.baseRevisionId!==max)throw Error('stale revision');
  const gen=++max;
  const checkpoint=operation.kind==='restore'?current.checkpointCount+1:
    current.checkpointCount;
  const sections=operation.kind==='save'?operation.body.sections:
    versions.get(operation.body.revisionNumber)!.sections;
  const next:R35View={...current,generation:gen,checkpointCount:checkpoint,
    action:operation.kind,sections,content:sections.map((s:any)=>s.text).join(''),
    note:operation.kind==='save'?operation.body.note:null,
    restoredFrom:operation.kind==='restore'?operation.body.revisionNumber:null};
  versions.set(gen,next);
  receipts.set(key,{payload,gen,count:checkpoint,action:operation.kind});
  return {status:'saved',action:operation.kind,generation:gen,
    checkpointCount:checkpoint,cipherSHA256:sha('gen'+gen)};
 });
});
afterAll(()=>{
 if(prev===undefined)delete process.env.R37_SECTION_PASSAGE_FIXTURE;
 else process.env.R37_SECTION_PASSAGE_FIXTURE=prev;
 delete process.env.R36_PASSAGE_REVIEW_FIXTURE;
});
describe('R37 synthetic multi-section passage Apply with R35 idempotent ledger',()=>{
 it('keeps real section editing statically disabled',()=>{
  expect(R37_REAL_SECTION_EDIT_ENABLED).toBe(false);
  delete process.env.R37_SECTION_PASSAGE_FIXTURE;
  expect(()=>reviewSectionPassageR37(base,selection())).toThrow(
    expect.objectContaining({code:'r37_live_section_edit_disabled'}));
  expect(change).not.toHaveBeenCalled();
 });
 it('pure preview identifies changed words, preserves order and other section',()=>{
  const review=reviewSectionPassageR37(base,selection());
  expect(review.releaseApproved).toBe(false);
  expect(review.sectionOrder).toEqual([S1,S2]);
  expect(review.untouchedSectionIds).toEqual([S2]);
  expect(review.review.proposedSectionText).toBe(
    'A lantern shimmers beside the river.\n\n');
  expect(change).not.toHaveBeenCalled();
 });
 it('Apply preserves other section, order, encrypted private note and can be undone',async()=>{
  const sel=selection();
  const applied=await applySelectedSectionR37({...scope,selection:sel,
    gesture:gesture(sel)});
  expect(applied.receipt.generation).toBe(2);
  expect(applied.releaseApproved).toBe(false);
  expect(versions.get(2)!.sections[1]).toEqual(base.sections[1]);
  expect(versions.get(2)!.sections.map(s=>s.id)).toEqual([S1,S2]);
  const note=JSON.parse(versions.get(2)!.note!);
  expect(note.protocol).toBe('soullab.ws.r37.section-passage.v1');
  expect(note.fromGeneration).toBe(1);
  expect(note.resultingSectionSHA256).toBe(sha(versions.get(2)!.sections[0].text));
  const undone=await undoSelectedSectionR37({...scope,
    gesture:undoGesture(2,'fictional-undo-key1')});
  expect(undone.receipt.generation).toBe(3);
  expect(versions.get(3)!.content).toBe(base.content);
  expect(versions.get(3)!.sections).toEqual(base.sections);
  expect(versions.get(3)!.checkpointCount).toBe(1);
 });
 it('identical Apply retry does not append an extra encrypted generation',async()=>{
  const sel=selection(),g=gesture(sel);
  const a=await applySelectedSectionR37({...scope,selection:sel,gesture:g});
  const again=await applySelectedSectionR37({...scope,selection:sel,gesture:g});
  expect(a.receipt.status).toBe('saved');
  expect(again.receipt.status).toBe('replayed');
  expect(again.receipt.generation).toBe(2);
  expect(max).toBe(2);
 });
 it('reused idempotency key cannot change the selected replacement',async()=>{
  const sel=selection(),g=gesture(sel);
  await applySelectedSectionR37({...scope,selection:sel,gesture:g});
  const changed={...sel,section:{...sel.section,
    chosenAlternativeId:ALT}};
  const alteredGesture={...g,alternativeId:ALT};
  await expect(applySelectedSectionR37({...scope,selection:changed,
    gesture:alteredGesture})).rejects.toThrow();
  expect(max).toBe(2);
 });
 it('conflicting fresh editor gesture after an earlier Save must refuse',async()=>{
  const sel=selection();
  await applySelectedSectionR37({...scope,selection:sel,gesture:gesture(sel)});
  await expect(applySelectedSectionR37({...scope,selection:sel,
    gesture:gesture(sel,'brand-new-idem-key')})).rejects.toThrow('stale revision');
  expect(max).toBe(2);
 });
 it('wrong section anchors, reordered or altered sections fail before writing',()=>{
  const alt={...base,sections:[base.sections[1],base.sections[0]]};
  expect(()=>reviewSectionPassageR37(alt,selection())).toThrow(
   expect.objectContaining({code:'r37_stale_work_snapshot'}));
  const bad={...base,kind:'plain' as const};
  expect(()=>reviewSectionPassageR37(bad,selection())).toThrow(
   expect.objectContaining({code:'r37_requires_section_addressable_multi_section_work'}));
  const other=selection();
  expect(()=>reviewSectionPassageR37(base,{...other,
    section:{...other.section,sectionId:randomUUID()}})).toThrow();
 });
 it('forged or mismatched synthetic approval does not call encrypted writer',async()=>{
  const sel=selection(),g=gesture(sel);
  await expect(applySelectedSectionR37({...scope,selection:sel,
    gesture:{...g,selectedPassageSHA256:sha('wrong')}}))
    .rejects.toMatchObject({code:'r37_author_gesture_unverified'});
  expect(change).not.toHaveBeenCalled();
 });
 it('cannot Undo a normal Save, a malformed note or twice',async()=>{
  versions.set(2,{...base,generation:2,action:'save',note:'ordinary author note'});
  max=2;
  await expect(undoSelectedSectionR37({...scope,
    gesture:undoGesture(2,'fictional-undo-key2')}))
    .rejects.toMatchObject({code:'r37_invalid_encrypted_apply_note'});
  versions=new Map([[1,base]]);max=1;receipts.clear();
  const s=selection();
  await applySelectedSectionR37({...scope,selection:s,gesture:gesture(s)});
  await undoSelectedSectionR37({...scope,gesture:undoGesture(2,'fictional-undo-key3')});
  await expect(undoSelectedSectionR37({...scope,
    gesture:undoGesture(3,'fresh-undo-misuse')})).rejects.toMatchObject({
     code:'r37_last_edit_not_applied_section'});
 });
 it('Undo idempotency replay is structural and does not restore twice',async()=>{
  const s=selection();
  await applySelectedSectionR37({...scope,selection:s,gesture:gesture(s)});
  const g=undoGesture(2,'same-undo-idemkey');
  const first=await undoSelectedSectionR37({...scope,gesture:g});
  const replay=await undoSelectedSectionR37({...scope,gesture:g});
  expect(first.receipt.status).toBe('saved');
  expect(replay.receipt.status).toBe('replayed');
  expect(max).toBe(3);
 });
});
