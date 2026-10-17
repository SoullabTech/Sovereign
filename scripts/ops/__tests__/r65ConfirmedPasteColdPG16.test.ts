/** Independent Jest process: confirmation receipt survives process restart. */
jest.mock('server-only',()=>({}));
jest.mock('next/headers',()=>({
 cookies:jest.fn(async()=>({get:(_name:string)=>undefined})),
}));
import {NextRequest} from 'next/server';
import {query,closePool} from '@/lib/db/postgres';
import {POST} from '@/app/api/sovereign/manuscripts/route';

const enabled=process.env.R65_CONFIRMED_PASTE_PG16==='fictional-only'&&
 /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_atomic$/.test(
  process.env.DATABASE_URL||'');
const tests=enabled?describe:describe.skip;
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const key='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const text='  Exact fictional Source 🌱\nKeep all punctuation.\n';
const body={
 confirmationId:key,title:'Fictional R65 Writer',
 sections:[
  {heading:'Part 1',headingDepth:1,headingSignal:'member',
   body:'Exact fictional authored passage.'},
  {heading:'Part 2',headingDepth:1,headingSignal:'member',
   body:'Fictional second section.'},
 ],
 confirmedText:text,
};
async function post(token:string){
 return POST(new NextRequest('http://localhost/api/sovereign/manuscripts',{
  method:'POST',headers:{
   'x-session-token':token,'content-type':'application/json'},
  body:JSON.stringify(body),
 }));
}
tests('cold process import receipt and member/erasure stability',()=>{
 afterAll(async()=>{await closePool();});
 it('deleted first Work leaves receipt tombstone across processes; retry never revives',async()=>{
  const receipt=await query<{manuscript_id:string|null}>(
   'SELECT manuscript_id FROM manuscript_import_confirmations WHERE member_id=$1 AND confirmation_id=$2',
   [A,key]);
  expect(receipt.rows).toEqual([{manuscript_id:null}]);
  const active=await query<{n:number}>(`
    SELECT count(*)::int AS n FROM manuscript_import_active_payloads
     WHERE member_id=$1 AND confirmation_id=$2
  `,[A,key]);
  expect(active.rows[0].n).toBe(0);
  const before=await query<{n:number}>(
   'SELECT count(*)::int AS n FROM member_manuscripts WHERE member_id=$1',[A]);
  const res=await post('r63-fictional-auth-a');
  expect(res.status).toBe(409);
  const after=await query<{n:number}>(
   'SELECT count(*)::int AS n FROM member_manuscripts WHERE member_id=$1',[A]);
  expect(after.rows).toEqual(before.rows);
 });
 it('a different member with same UUID still gets only their saved Work',async()=>{
  const receipt=await query<{manuscript_id:string|null}>(
   'SELECT manuscript_id FROM manuscript_import_confirmations WHERE member_id=$1 AND confirmation_id=$2',
   [B,key]);
  expect(receipt.rows).toHaveLength(1);
  const id=receipt.rows[0].manuscript_id;
  expect(id).toMatch(/^[a-f0-9-]{36}$/);
  const active=await query<{request_sha256:string}>(`
    SELECT request_sha256 FROM manuscript_import_active_payloads
     WHERE member_id=$1 AND confirmation_id=$2 AND manuscript_id=$3
  `,[B,key,id]);
  expect(active.rows).toHaveLength(1);
  expect(active.rows[0].request_sha256).toMatch(/^[0-9a-f]{64}$/);
  const res=await post('r63-fictional-auth-b');
  expect(res.status).toBe(200);
  expect((await res.json()).id).toBe(id);
  const sources=await query<{n:number}>(
   'SELECT count(*)::int AS n FROM manuscript_source_arrivals WHERE manuscript_id=$1 AND member_id=$2',
   [id,B]);
  expect(sources.rows[0].n).toBe(1);
 });
});
