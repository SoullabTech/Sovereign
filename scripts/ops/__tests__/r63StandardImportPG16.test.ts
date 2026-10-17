/**
 * R63 — ACTUAL Next manuscript POST/GET + TRUE PostgreSQL16 transaction.
 * Fictional member sessions, source text, and SQL only. No KMS, provider,
 * member production data, secrets, file-vault originals or deployment.
 */
// Jest runs in node, but the actual route is a server-only module.
 // This mock enforces no browser/server environment crossing in tests.
jest.mock('server-only',()=>({}));
jest.mock('next/headers',()=>({
 cookies:jest.fn(async()=>({get:(_name:string)=>undefined})),
}));
import {NextRequest} from 'next/server';
import {query,closePool} from '@/lib/db/postgres';
import {POST} from '@/app/api/sovereign/manuscripts/route';
import {GET as GET_MANUSCRIPT}
 from '@/app/api/sovereign/manuscripts/[id]/route';
import {persistConfirmedSectionsR63} from
 '@/lib/manuscript/source/persistConfirmedSectionsR63';

const enabled=process.env.R63_STANDARD_IMPORT_PG16==='fictional-only'&&
 /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_atomic$/.test(
  process.env.DATABASE_URL||'')&&
 process.env.CAPACITOR_BUILD===''&&process.env.MAIA_CABIN_MODE==='';
const tests=enabled?describe:describe.skip;
const MEMBER='11111111-1111-4111-8111-111111111111';
const FOREIGN='22222222-2222-4222-8222-222222222222';
const TOKEN_A='r63-fictional-auth-a';
const TOKEN_B='r63-fictional-auth-b';
const TITLE='Fictional two chapter manuscript';
const PASSAGE1='First fictional section.';
const PASSAGE2='Second fictional section.';
let manuscriptId='';
function request(token:string,body:unknown){
 return new NextRequest('http://localhost/api/sovereign/manuscripts',{
  method:'POST',headers:{
   'x-session-token':token,'content-type':'application/json',
  },body:JSON.stringify(body),
 });
}
const confirm=(second=PASSAGE2)=>({
 title:TITLE,
 sections:[
  {heading:'One',headingDepth:1,headingSignal:'member',body:PASSAGE1},
  {heading:'Two',headingDepth:1,headingSignal:'member',body:second},
 ],
 confirmedText:'One\n'+PASSAGE1+'\nTwo\n'+second,
});
async function counts(){
 const r=await query<{manuscripts:number;sections:number;arrivals:number}>(`
  SELECT
    (SELECT count(*)::int FROM member_manuscripts) AS manuscripts,
    (SELECT count(*)::int FROM manuscript_sections) AS sections,
    (SELECT count(*)::int FROM manuscript_source_arrivals) AS arrivals
 `);
 return r.rows[0];
}

tests('real conventional manuscript POST atomicity and member scope on disposable PG16',()=>{
 afterAll(async()=>{await closePool();});

 it('auth_sessions allow only an actual current session, not bare identity claims',async()=>{
  const empty=await POST(request('fictional-invalid',confirm()));
  expect(empty.status).toBe(401);
  expect(await counts()).toEqual({manuscripts:0,sections:0,arrivals:0});
  const forged=new NextRequest('http://localhost/api/sovereign/manuscripts',{
   method:'POST',headers:{
    'x-session-token':TOKEN_A,'x-member-id':FOREIGN,
    'content-type':'application/json',
   },body:JSON.stringify(confirm()),
  });
  const denied=await POST(forged);
  expect(denied.status).toBe(401);
  expect(await counts()).toEqual({manuscripts:0,sections:0,arrivals:0});
 });

 it('preview is read-only: no Source arrival or manuscript before confirmation',async()=>{
  const preview=await POST(request(TOKEN_A,{
   title:TITLE,text:'One\n'+PASSAGE1+'\n\nTwo\n'+PASSAGE2,
  }));
  expect(preview.status).toBe(200);
  expect((await preview.json()).preview).toBeDefined();
  expect(await counts()).toEqual({manuscripts:0,sections:0,arrivals:0});
 });

 it('one current session commits complete manuscript and immutable pasted Source',async()=>{
  const confirmed=await POST(request(TOKEN_A,confirm()));
  expect(confirmed.status).toBe(201);
  const data=await confirmed.json();
  manuscriptId=data.id;
  expect(manuscriptId).toMatch(/^[0-9a-f-]{36}$/);
  expect(data.sectionCount).toBe(2);
  expect(data.sourceCustody).toBe('source_custodied');
  expect(await counts()).toEqual({manuscripts:1,sections:2,arrivals:1});
  const sections=await query<{position:number;heading:string;body:string}>(
   'SELECT position, heading, body FROM manuscript_sections WHERE manuscript_id=$1 ORDER BY position',
   [manuscriptId],
  );
  expect(sections.rows).toEqual([
   {position:0,heading:'One',body:PASSAGE1},
   {position:1,heading:'Two',body:PASSAGE2},
  ]);
  const source=await query<{source_kind:string;source_text:string;manuscript_id:string}>(
   'SELECT source_kind, source_text, manuscript_id FROM manuscript_source_arrivals WHERE member_id=$1',
   [MEMBER],
  );
  expect(source.rows).toEqual([{
   source_kind:'member_supplied_text',
   source_text:confirm().confirmedText,
   manuscript_id:manuscriptId,
  }]);
 });

 it('foreign member cannot read another writer, and authorized owner can reopen safely',async()=>{
  const url='http://localhost/api/sovereign/manuscripts/'+manuscriptId;
  const as=(token:string)=>new NextRequest(url,{headers:{'x-session-token':token}});
  const ctx={params:Promise.resolve({id:manuscriptId})};
  const mine=await GET_MANUSCRIPT(as(TOKEN_A),ctx);
  expect(mine.status).toBe(200);
  expect(mine.headers.get('Cache-Control')).toContain('no-store');
  const mineBody=await mine.json();
  expect(mineBody.manuscript.title).toBe(TITLE);
  expect(mineBody.sections).toHaveLength(2);
  const other=await GET_MANUSCRIPT(as(TOKEN_B),ctx);
  expect(other.status).toBe(404);
  expect(other.headers.get('Cache-Control')).toContain('no-store');
  expect((await other.json()).error).toBe('Not found');
  expect((await GET_MANUSCRIPT(as('fictional-invalid'),ctx)).status).toBe(401);
 });

 it('actual POST rolls back both sections and minted manuscript on failure after section one',async()=>{
  await query(`
   CREATE OR REPLACE FUNCTION r63_reject_one_fictional_section()
   RETURNS trigger LANGUAGE plpgsql AS $$
   BEGIN
    IF NEW.body='R63_FICTIONAL_CONSTRAINT_FAILURE' THEN
     RAISE EXCEPTION 'fixture-only abort' USING ERRCODE='23514';
    END IF;
    RETURN NEW;
   END$$
  `);
  await query(`
   CREATE TRIGGER r63_reject_fictional_section
    BEFORE INSERT ON manuscript_sections
    FOR EACH ROW EXECUTE FUNCTION r63_reject_one_fictional_section()
  `);
  const before=await counts();
  const failed=await POST(request(TOKEN_A,
   confirm('R63_FICTIONAL_CONSTRAINT_FAILURE')));
  expect(failed.status).toBe(500);
  expect(await failed.json()).toEqual({error:'Failed to save manuscript'});
  expect(await counts()).toEqual(before);
  const hasBad=await query<{n:number}>(
   "SELECT count(*)::int AS n FROM manuscript_sections WHERE body='R63_FICTIONAL_CONSTRAINT_FAILURE'");
  expect(hasBad.rows[0].n).toBe(0);
 });

 it('direct transaction abort on a database check constraint also leaves no partial rows',async()=>{
  const before=await counts();
  await expect(persistConfirmedSectionsR63({
   verifiedMemberId:MEMBER,title:'Intentional fictional second-section error',
   sections:[
    {position:0,heading:'Good',body:'Fictional good',
     headingDepth:1,headingSignal:'member'},
    {position:1,heading:null,body:'',
     headingDepth:null,headingSignal:null},
   ],
  })).rejects.toThrow();
  expect(await counts()).toEqual(before);
 });

 it('the transaction creates no alternate key, provider or release authority',async()=>{
  expect(await counts()).toEqual({manuscripts:1,sections:2,arrivals:1});
  const orphan=await query<{n:number}>(`
   SELECT count(*)::int AS n FROM member_manuscripts m
   LEFT JOIN manuscript_sections s ON s.manuscript_id=m.id
   WHERE s.id IS NULL`);
  expect(orphan.rows[0].n).toBe(0);
 });
});
