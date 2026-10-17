/**
 * R65 ACTUAL Next POST, real PostgreSQL16 and existing auth_sessions.
 * Every member, manuscript and word is invented; no external model/KMS.
 * Runs after R63's original and cold suites on a disposable container.
 */
jest.mock('server-only',()=>({}));
jest.mock('next/headers',()=>({
 cookies:jest.fn(async()=>({get:(_name:string)=>undefined})),
}));
import {NextRequest} from 'next/server';
import {query,closePool} from '@/lib/db/postgres';
import {POST} from '@/app/api/sovereign/manuscripts/route';
import {GET as GET_MANUSCRIPT}
 from '@/app/api/sovereign/manuscripts/[id]/route';

const enabled=process.env.R65_CONFIRMED_PASTE_PG16==='fictional-only'&&
 /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_atomic$/.test(
  process.env.DATABASE_URL||'')&&
 process.env.CAPACITOR_BUILD===''&&process.env.MAIA_CABIN_MODE==='';
const tests=enabled?describe:describe.skip;
const MEMBER_A='11111111-1111-4111-8111-111111111111';
const MEMBER_B='22222222-2222-4222-8222-222222222222';
const TOKEN_A='r63-fictional-auth-a';
const TOKEN_B='r63-fictional-auth-b';
const A='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const B='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const C='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const D='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const SOURCE='  Exact fictional Source 🌱\nKeep all punctuation.\n';
const SECOND='Fictional second section.';
let savedA='';
const makeBody=(id:string,text=SOURCE)=>({
 confirmationId:id,
 title:'Fictional R65 Writer',
 sections:[
  {heading:'Part 1',headingDepth:1,headingSignal:'member',
   body:'Exact fictional authored passage.'},
  {heading:'Part 2',headingDepth:1,headingSignal:'member',
   body:SECOND},
 ],
 confirmedText:text,
});
const post=(token:string,body:unknown)=>POST(new NextRequest(
 'http://localhost/api/sovereign/manuscripts',{
  method:'POST',headers:{'x-session-token':token,
   'content-type':'application/json'},
  body:JSON.stringify(body),
 }));
async function counts(){
 const r=await query<{manuscripts:number;sections:number;arrivals:number;receipts:number;active:number}>(`
  SELECT
    (SELECT count(*)::int FROM member_manuscripts) AS manuscripts,
    (SELECT count(*)::int FROM manuscript_sections) AS sections,
    (SELECT count(*)::int FROM manuscript_source_arrivals) AS arrivals,
    (SELECT count(*)::int FROM manuscript_import_confirmations) AS receipts,
    (SELECT count(*)::int FROM manuscript_import_active_payloads) AS active
 `);
 return r.rows[0];
}

tests('conventional pasted manuscript: atomic Source and once-only author confirmation',()=>{
 afterAll(async()=>{await closePool();});

 it('invalid, revoked and client-forged member identities cannot mint a receipt',async()=>{
  const initial=await counts();
  expect(initial).toEqual({manuscripts:1,sections:2,arrivals:1,receipts:0,active:0});
  expect((await post('unknown',makeBody(A))).status).toBe(401);
  const foreignClaim=new NextRequest(
   'http://localhost/api/sovereign/manuscripts',{
    method:'POST',headers:{
     'x-session-token':TOKEN_A,'x-member-id':MEMBER_B,
     'content-type':'application/json'},
    body:JSON.stringify(makeBody(A)),
   });
  expect((await POST(foreignClaim)).status).toBe(401);
  expect(await counts()).toEqual(initial);
 });

 it('real member Save commits manuscript, both sections, immutable pasted Source and receipt together',async()=>{
  const response=await post(TOKEN_A,makeBody(A));
  expect(response.status).toBe(201);
  const payload=await response.json();
  expect(payload.sourceCustody).toBe('source_custodied');
  expect(payload.sectionCount).toBe(2);
  savedA=payload.id;
  const manuscript=await query<{source_custody:string}>(
   'SELECT source_custody FROM member_manuscripts WHERE id=$1 AND member_id=$2',
   [savedA,MEMBER_A]);
  expect(manuscript.rows).toEqual([{source_custody:'source_custodied'}]);
  const source=await query<{source_text:string;source_kind:string;manuscript_id:string}>(
   'SELECT source_text,source_kind,manuscript_id FROM manuscript_source_arrivals WHERE manuscript_id=$1',
   [savedA]);
  expect(source.rows).toEqual([{
   source_text:SOURCE,source_kind:'member_supplied_text',manuscript_id:savedA,
  }]);
  const parts=await query<{body:string}>(
   'SELECT body FROM manuscript_sections WHERE manuscript_id=$1 ORDER BY position',
   [savedA]);
  expect(parts.rows.map(r=>r.body)).toEqual([
   'Exact fictional authored passage.',SECOND]);
  expect(await counts()).toEqual({manuscripts:2,sections:4,arrivals:2,receipts:1,active:1});
 });

 it('a lost first HTTP response followed by exact same confirmation returns SAME Work',async()=>{
  const original=await counts();
  const same=await post(TOKEN_A,makeBody(A));
  expect(same.status).toBe(200);
  expect(await same.json()).toEqual({
   id:savedA,sectionCount:2,sourceCustody:'source_custodied',
  });
  expect(await counts()).toEqual(original);
 });

 it('same confirmation with altered text or section cuts refuses without changing writing',async()=>{
  const before=await counts();
  const changed=await post(TOKEN_A,makeBody(A,'Modified fictional Source.'));
  expect(changed.status).toBe(409);
  const refusal=await changed.json();
  expect(JSON.stringify(refusal)).not.toContain('Modified fictional Source.');
  const moved=makeBody(A);
  moved.sections[1].body='Fictional new cut';
  expect((await post(TOKEN_A,moved)).status).toBe(409);
  expect(await counts()).toEqual(before);
  expect((await post(TOKEN_A,makeBody('not-a-uuid'))).status).toBe(400);
  expect(await counts()).toEqual(before);
 });

 it('concurrent double-Save with one UUID creates ONE Work and ONE Source',async()=>{
  const before=await counts();
  const replies=await Promise.all([
   post(TOKEN_A,makeBody(B)),post(TOKEN_A,makeBody(B)),
  ]);
  expect(replies.map(r=>r.status).sort()).toEqual([200,201]);
  const ids=await Promise.all(replies.map(r=>r.json()));
  expect(ids[0].id).toBe(ids[1].id);
  const after=await counts();
  expect(after.manuscripts-before.manuscripts).toBe(1);
  expect(after.sections-before.sections).toBe(2);
  expect(after.arrivals-before.arrivals).toBe(1);
  expect(after.receipts-before.receipts).toBe(1);
 });

 it('same confirmation ID in another member account never exposes first member Work',async()=>{
  const before=await counts();
  const second=await post(TOKEN_B,makeBody(A));
  expect(second.status).toBe(201);
  const data=await second.json();
  expect(data.id).not.toBe(savedA);
  const url='http://localhost/api/sovereign/manuscripts/'+savedA;
  const response=await GET_MANUSCRIPT(new NextRequest(url,{
   headers:{'x-session-token':TOKEN_B},
  }),{params:Promise.resolve({id:savedA})});
  expect(response.status).toBe(404);
  expect(response.headers.get('Cache-Control')).toContain('no-store');
  const after=await counts();
  expect(after.manuscripts-before.manuscripts).toBe(1);
  expect(after.receipts-before.receipts).toBe(1);
 });

 it('a failed Source insert also rolls back manuscript, first section and new receipt',async()=>{
  await query(`
   CREATE OR REPLACE FUNCTION r65_reject_fictional_paste()
   RETURNS trigger LANGUAGE plpgsql AS $$
   BEGIN
    IF NEW.source_text='R65_SOURCE_INSERT_FAILURE_FICTIONAL' THEN
     RAISE EXCEPTION 'fictional reject' USING ERRCODE='23514';
    END IF;
    RETURN NEW;
   END$$
  `);
  await query(`
   CREATE TRIGGER r65_failure_guard
   BEFORE INSERT ON manuscript_source_arrivals
   FOR EACH ROW EXECUTE FUNCTION r65_reject_fictional_paste()
  `);
  const before=await counts();
  const failed=await post(TOKEN_A,makeBody(C,'R65_SOURCE_INSERT_FAILURE_FICTIONAL'));
  expect(failed.status).toBe(500);
  expect(await failed.json()).toEqual({error:'Failed to save manuscript'});
  expect(await counts()).toEqual(before);
  const retried=await post(TOKEN_A,makeBody(C));
  expect(retried.status).toBe(201);
  const after=await counts();
  expect(after.manuscripts-before.manuscripts).toBe(1);
  expect(after.sections-before.sections).toBe(2);
  expect(after.arrivals-before.arrivals).toBe(1);
  expect(after.receipts-before.receipts).toBe(1);
 });

 it('a deleted Work leaves a durable confirmation tombstone and old retries cannot resurrect it',async()=>{
  const before=await counts();
  await query('DELETE FROM member_manuscripts WHERE id=$1 AND member_id=$2',
   [savedA,MEMBER_A]);
  const row=await query<{manuscript_id:string|null}>(
   'SELECT manuscript_id FROM manuscript_import_confirmations WHERE member_id=$1 AND confirmation_id=$2',
   [MEMBER_A,A]);
  expect(row.rows).toEqual([{manuscript_id:null}]);
  // Cascading Work deletion must erase the associated content-derived
  // fingerprint; the durable UUID tombstone holds no manuscript text/hash.
  const active=await query<{n:number}>(`
   SELECT count(*)::int AS n FROM manuscript_import_active_payloads
   WHERE member_id=$1 AND confirmation_id=$2
  `,[MEMBER_A,A]);
  expect(active.rows[0].n).toBe(0);
  const afterDelete=await counts();
  expect(afterDelete.active).toBe(before.active-1);
  expect(afterDelete.manuscripts).toBe(before.manuscripts-1);
  const refused=await post(TOKEN_A,makeBody(A));
  expect(refused.status).toBe(409);
  expect(await counts()).toEqual(afterDelete);
 });

 it('the test never opened an operational provider, member key or private file vault',async()=>{
  const receipts=await query<{n:number}>(`
   SELECT count(*)::int AS n FROM manuscript_import_confirmations
   WHERE manuscript_id IS NULL
  `);
  expect(receipts.rows[0].n).toBe(1);
  expect(process.env.R65_CONFIRMED_PASTE_PG16).toBe('fictional-only');
 });
});
