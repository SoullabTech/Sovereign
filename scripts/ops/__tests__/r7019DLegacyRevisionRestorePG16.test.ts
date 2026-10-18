/**
 * R70.19D — existing (unconverted) legacy Draft revision POST.
 * Test-only owner mock, actual route and disposable PostgreSQL16.
 * No real sign-in or production recovery approved by this suite.
 */
jest.mock('server-only',()=>({}));
jest.mock('@/lib/auth/getMemberFromRequest',()=>({
 getMemberIdFromRequest:jest.fn(async()=>process.env.R7019B_FICT_MEMBER||null),
}));
jest.mock('@/lib/writersStudio/release/heldLegacyWriterFenceR52',()=>({
 holdLegacyWriterForVerifiedMemberR52:jest.fn(async()=>null),
}));
import {randomUUID} from 'node:crypto';
import {NextRequest} from 'next/server';
import {POST} from '@/app/api/sovereign/manuscripts/[id]/draft/revisions/route';
import {query,closePool} from '@/lib/db/postgres';
import {withHeldR7019BCapture} from
 '@/lib/writersStudio/recovery/heldR7019BWriterFence';

const MEMBER='4c0782ca-9074-43ee-9f3c-5f8500026780';
const FOREIGN='11111111-1111-4111-8111-111111111111';
const enabled=process.env.R7019B_WRITER_FIXTURE==='fictional-only' &&
 process.env.R7019B_FICT_MEMBER===MEMBER &&
 /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_atomic$/.test(
  process.env.DATABASE_URL||'');
const suite=enabled?describe:describe.skip;
const older='Fictional saved revision one, with exact original wording.';
const latest='Fictional next draft before requested restoration.';
const sleep=(n:number)=>new Promise(done=>setTimeout(done,n));
const workId=randomUUID(),draftId=randomUUID();
const ctx={params:Promise.resolve({id:workId})};
function request(base=2,key='r7019d-fict-restore-1'){
 return new NextRequest('http://127.0.0.1/api/sovereign/manuscripts/'+workId+'/draft/revisions',{
  method:'POST',headers:{'content-type':'application/json'},
  body:JSON.stringify({revisionNumber:1,baseRevisionId:base,idempotencyKey:key}),
 });
}
async function state(){
 const r=await query<{content:string;version:string;revision_count:number}>(
   'SELECT content,version,revision_count FROM manuscript_working_drafts WHERE id=$1',
   [draftId]);
 return r.rows[0]??null;
}
async function revisionCount(){
 const r=await query<{n:number}>(
  'SELECT count(*)::int AS n FROM working_draft_revisions WHERE draft_id=$1',[draftId]);
 return r.rows[0].n;
}
suite('R70.19D real legacy Draft restore checkpoint lease',()=>{
 beforeAll(async()=>{
  await query(
   'INSERT INTO member_manuscripts(id,member_id,title) VALUES ($1,$2,$3)',
   [workId,MEMBER,'FICTIONAL earlier draft']);
  await query(
   "INSERT INTO manuscript_working_drafts(id,manuscript_id,member_id,content,base_source_hash,revision_count,version) VALUES ($1,$2,$3,$4,'fictional-revision-base',1,2)",
   [draftId,workId,MEMBER,latest]);
  await query(
   'INSERT INTO working_draft_revisions(draft_id,revision_number,content,saved_by) VALUES ($1,1,$2,$3)',
   [draftId,older,MEMBER]);
  expect((await state())?.content).toBe(latest);
  expect(await revisionCount()).toBe(1);
 });
 afterAll(async()=>{await closePool();});
 it('actual unconverted RESTORE cannot alter Draft while SQL+vault snapshot lease is held',async()=>{
  let pending:Promise<Response>|undefined,settled=false;
  const cap=await withHeldR7019BCapture(MEMBER,async(client)=>{
   pending=POST(request(),ctx) as Promise<Response>;
   pending.then(()=>{settled=true;},()=>{settled=true;});
   await sleep(220);
   expect(settled).toBe(false);
   const before=await client.query<{content:string;version:string}>(
    'SELECT content,version FROM manuscript_working_drafts WHERE id=$1',[draftId]);
   expect(before.rows[0].content).toBe(latest);
   expect(before.rows[0].version).toBe('2');
   return {version:before.rows[0].version};
  });
  expect(cap.releaseApproved).toBe(false);
  expect(cap.snapshot.version).toBe('2');
  const response=await pending!;
  expect(response.status).toBe(200);
  const receipt=await response.json();
  expect(receipt.restoredFrom).toBe(1);
  expect((await state())?.content).toBe(older);
  expect((await state())?.version).toBe('3');
  expect(await revisionCount()).toBe(2);
 });
 it('unauthorized fixture member cannot restore another Work',async()=>{
  process.env.R7019B_FICT_MEMBER=FOREIGN;
  try{
   const response=await POST(request(3,'fictional-forged'),ctx);
   expect(response.status).not.toBe(200);
   expect((await state())?.content).toBe(older);
   expect(await revisionCount()).toBe(2);
  }finally{process.env.R7019B_FICT_MEMBER=MEMBER;}
 });
 it('invalid or absent revision guard refuses without any mutation',async()=>{
  const invalid=new NextRequest(
   'http://127.0.0.1/api/sovereign/manuscripts/'+workId+'/draft/revisions',{
     method:'POST',headers:{'content-type':'application/json'},
     body:JSON.stringify({revisionNumber:1}),
   });
  const response=await POST(invalid,ctx);
  expect(response.status).toBe(400);
  expect((await state())?.version).toBe('3');
  expect(await revisionCount()).toBe(2);
 });

 it('failed immutable receipt INSERT rolls back Draft UPDATE atomically',async()=>{
  // Deliberately reproduce the integrity gap in a disposable database.
  const before=await state();
  expect(before?.version).toBe('3');
  expect(before?.revision_count).toBe(2);
  expect(await revisionCount()).toBe(2);
  await query(
   'ALTER TABLE working_draft_revisions ADD CONSTRAINT r7019d_fixture_revision_cap CHECK (revision_number <= 2)');
  try{
   const reply=await POST(request(3,'r7019d-fict-revision-insert-failure'),ctx);
   expect(reply.status).toBe(500);
   // The new ONE-transaction repair rolls back the content, version,
   // revision_count AND single-use idempotency receipt on failed append.
   const after=await state();
   expect(after?.version).toBe('3');
   expect(after?.revision_count).toBe(2);
   expect(after?.content).toBe(older);
   expect(await revisionCount()).toBe(2);
   const {inspectHeldR7019CSourceAndDraft}=await import(
     '@/lib/writersStudio/recovery/heldR7019CSourceDraftScope');
   const snapshot=await withHeldR7019BCapture(MEMBER,async(client,vault)=>
     inspectHeldR7019CSourceAndDraft(client,MEMBER,vault));
   expect(snapshot.snapshot.draftCount).toBeGreaterThan(0);
   expect(snapshot.releaseApproved).toBe(false);
  }finally{
   await query('ALTER TABLE working_draft_revisions DROP CONSTRAINT IF EXISTS r7019d_fixture_revision_cap');
  }
  expect((await state())?.revision_count).toBe(2);
  expect(await revisionCount()).toBe(2);
 });
});
