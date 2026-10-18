/**
 * R70.19C: real Keep / Unkeep HTTP route on disposable PostgreSQL 16.
 * Identity and R52 beta admission are fictional Jest stubs; do not construe
 * these tests as real-member authentication or a production Keep grant.
 */
jest.mock('@/lib/auth/getMemberFromRequest',()=>({
 getMemberIdFromRequest:jest.fn(async ()=>
  process.env.R7019B_FICT_MEMBER||null),
}));
jest.mock('@/lib/writersStudio/release/heldLegacyWriterFenceR52',()=>({
 holdLegacyWriterForVerifiedMemberR52:jest.fn(async()=>null),
}));
import {NextRequest} from 'next/server';
import {POST,DELETE} from '@/app/api/sovereign/manuscripts/[id]/keeps/route';
import {query,closePool} from '@/lib/db/postgres';
import {withHeldR7019BCapture} from
 '@/lib/writersStudio/recovery/heldR7019BWriterFence';

const M='4c0782ca-9074-43ee-9f3c-5f8500026780';
const FOREIGN='11111111-1111-4111-8111-111111111111';
const enabled=process.env.R7019B_WRITER_FIXTURE==='fictional-only' &&
 process.env.R7019B_FICT_MEMBER===M &&
 /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_atomic$/.test(
  process.env.DATABASE_URL||'');
const tests=enabled?describe:describe.skip;
let work='',section='',keep='';
const sleep=(ms:number)=>new Promise(done=>setTimeout(done,ms));
const ctx=(id:string)=>({params:Promise.resolve({id})});
const post=(mId:string=work,sanctuary=false)=>POST(
 new NextRequest('http://127.0.0.1/api/sovereign/manuscripts/'+mId+'/keeps',{
  method:'POST',headers:{'content-type':'application/json'},
  body:JSON.stringify({sectionId:section,
   text:'Fictional untouched original paragraph.',sanctuary}),
 }),ctx(mId));
const remove=(id:string=keep)=>DELETE(
 new NextRequest('http://127.0.0.1/api/sovereign/manuscripts/'+work+
  '/keeps?keepId='+id,{method:'DELETE'}),ctx(work));
async function count(){
 const r=await query<{n:number}>(
  'SELECT count(*)::int AS n FROM manuscript_keeps WHERE member_id=$1',[M]);
 return r.rows[0]?.n;
}
tests('R70.19C actual Keep gestures share the held Source/Draft lease',()=>{
 beforeAll(async()=>{
  const r=await query<{work:string;section:string}>(`
   SELECT m.id AS work,s.id AS section FROM member_manuscripts m
   JOIN manuscript_sections s ON s.manuscript_id=m.id
   WHERE m.member_id=$1 ORDER BY s.position LIMIT 1`,[M]);
  expect(r.rows).toHaveLength(1);
  work=r.rows[0].work;section=r.rows[0].section;
 });
 afterAll(async()=>{await closePool();});
 it('Keep cannot cross a held SQL/vault checkpoint',async()=>{
  expect(await count()).toBe(0);
  let response:Promise<Response>|null=null,settled=false;
  await withHeldR7019BCapture(M,async(client)=>{
   response=post() as Promise<Response>;
   response.then(()=>{settled=true;},()=>{settled=true;});
   await sleep(190);
   expect(settled).toBe(false);
   const n=await client.query<{n:number}>(
    'SELECT count(*)::int AS n FROM manuscript_keeps');
   expect(n.rows[0].n).toBe(0);
   return {before:n.rows[0].n};
  });
  const reply=await response!;
  expect(reply.status).toBe(201);
  const b=await reply.json();
  keep=b.keep.id;
  expect(keep).toMatch(/^[a-f0-9-]{36}$/);
  expect(await count()).toBe(1);
 });
 it('Sanctuary refuses persistence and foreign-member fixture refuses',async()=>{
  const sanctuary=await post(work,true);
  expect(sanctuary.status).toBe(200);
  expect((await sanctuary.json()).persisted).toBe(false);
  expect(await count()).toBe(1);
  process.env.R7019B_FICT_MEMBER=FOREIGN;
  try{
   const foreign=await post();
   expect(foreign.status).not.toBe(201);
   expect(await count()).toBe(1);
  }finally{process.env.R7019B_FICT_MEMBER=M;}
 });
 it('Unkeep deletion waits for checkpoint then deletes exactly one Keep',async()=>{
  let response:Promise<Response>|null=null,settled=false;
  await withHeldR7019BCapture(M,async(client)=>{
   response=remove() as Promise<Response>;
   response.then(()=>{settled=true;},()=>{settled=true;});
   await sleep(190);expect(settled).toBe(false);
   const n=await client.query<{n:number}>(
    'SELECT count(*)::int AS n FROM manuscript_keeps');
   expect(n.rows[0].n).toBe(1);
   return {};
  });
  expect((await response!).status).toBe(200);
  expect(await count()).toBe(0);
 });
 it('separate new member recognition is preserved in current Work',async()=>{
  const reply=await post();
  expect(reply.status).toBe(201);
  keep=(await reply.json()).keep.id;
  expect(await count()).toBe(1);
 });
});
