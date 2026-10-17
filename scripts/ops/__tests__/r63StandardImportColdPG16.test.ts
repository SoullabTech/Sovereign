/** R63 fresh Jest process: reopens only the completed fictional import. */
// Jest runs in node, but the actual route is a server-only module.
 // This mock enforces no browser/server environment crossing in tests.
jest.mock('server-only',()=>({}));
jest.mock('next/headers',()=>({
 cookies:jest.fn(async()=>({get:(_name:string)=>undefined})),
}));
import {NextRequest} from 'next/server';
import {query,closePool} from '@/lib/db/postgres';
import {GET} from '@/app/api/sovereign/manuscripts/[id]/route';
const enabled=process.env.R63_STANDARD_IMPORT_PG16==='fictional-only'&&
 /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_atomic$/.test(
  process.env.DATABASE_URL||'');
const tests=enabled?describe:describe.skip;
const MEMBER='11111111-1111-4111-8111-111111111111';
tests('cold fresh-process readback of committed fictional Source and sections',()=>{
 afterAll(async()=>{await closePool();});
 it('one and only one manuscript, both sections and one owned Source remain',async()=>{
  const got=await query<{
   id:string;title:string;source_custody:string
  }>('SELECT id,title,source_custody FROM member_manuscripts WHERE member_id=$1',[MEMBER]);
  expect(got.rows).toHaveLength(1);
  expect(got.rows[0].title).toBe('Fictional two chapter manuscript');
  expect(got.rows[0].source_custody).toBe('source_custodied');
  const parts=await query<{body:string;position:number}>(
   'SELECT position,body FROM manuscript_sections WHERE manuscript_id=$1 ORDER BY position',
   [got.rows[0].id]);
  expect(parts.rows).toEqual([
   {position:0,body:'First fictional section.'},
   {position:1,body:'Second fictional section.'},
  ]);
  const src=await query<{source_kind:string;source_text:string}>(
   'SELECT source_kind,source_text FROM manuscript_source_arrivals WHERE manuscript_id=$1',
   [got.rows[0].id]);
  expect(src.rows).toEqual([{
   source_kind:'member_supplied_text',
   source_text:'One\nFirst fictional section.\nTwo\nSecond fictional section.',
  }]);
 });
 it('real owner GET returns private no-store and foreign session remains 404',async()=>{
  const rows=await query<{id:string}>(
   'SELECT id FROM member_manuscripts WHERE member_id=$1',[MEMBER]);
  const id=rows.rows[0].id;
  const ctx={params:Promise.resolve({id})};
  const req=(token:string)=>new NextRequest(
   'http://localhost/api/sovereign/manuscripts/'+id,{
    headers:{'x-session-token':token},
   });
  const mine=await GET(req('r63-fictional-auth-a'),ctx);
  expect(mine.status).toBe(200);
  expect(mine.headers.get('Cache-Control')).toContain('no-store');
  const foreign=await GET(req('r63-fictional-auth-b'),ctx);
  expect(foreign.status).toBe(404);
  expect(foreign.headers.get('Cache-Control')).toContain('no-store');
 });
});
