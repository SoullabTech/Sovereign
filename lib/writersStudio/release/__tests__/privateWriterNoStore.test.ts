import {NextResponse} from 'next/server';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {privateWriterNoStore,PRIVATE_WRITER_CACHE_CONTROL} from '../privateWriterNoStore';

describe('ordinary Writer private member response cache containment',()=>{
 it('requires no-store, no-cache and immediate expiry while preserving status and session cookies',()=>{
  const resp=NextResponse.json({message:'member-owned fictional prose'},
   {status:207,headers:{'Set-Cookie':'maia_session=fake; HttpOnly; SameSite=Lax'}});
  const same=privateWriterNoStore(resp);
  expect(same).toBe(resp);
  expect(same.status).toBe(207);
  expect(same.headers.get('Cache-Control')).toBe('private, no-store, max-age=0');
  expect(same.headers.get('Pragma')).toBe('no-cache');
  expect(same.headers.get('Expires')).toBe('0');
  expect(same.cookies.get('maia_session')?.value).toBe('fake');
 });
 it('overrides a cached response instead of inheriting a public cache policy',()=>{
  const resp=NextResponse.json({fictional:'draft'},{headers:{
   'Cache-Control':'public,max-age=3600',
  }});
  privateWriterNoStore(resp);
  expect(resp.headers.get('Cache-Control')).toBe(PRIVATE_WRITER_CACHE_CONTROL);
  expect(resp.headers.get('Cache-Control')).not.toContain('public');
 });
 it('does not invent member authorization or permit writing',()=>{
  const denied=new NextResponse(null,{status:404});
  const result=privateWriterNoStore(denied);
  expect(result.status).toBe(404);
  expect(result.headers.get('Cache-Control')).toContain('no-store');
 });
 it('the six central manuscript, Work and editorial GET owner scopes wrap every response',()=>{
  const routes=[
   'app/api/sovereign/manuscripts/route.ts',
   'app/api/sovereign/manuscripts/[id]/route.ts',
   'app/api/sovereign/manuscripts/[id]/draft/route.ts',
   'app/api/sovereign/living-works/route.ts',
   'app/api/writers-studio/editorial/thread/route.ts',
   'app/api/writers-studio/editorial/relationships/route.ts',
  ];
  for(const file of routes){
   const code=readFileSync(resolve(process.cwd(),file),'utf8');
   expect(code).toContain("from '@/lib/writersStudio/release/privateWriterNoStore'");
   expect(code).toMatch(/export async function GET\([\s\S]{0,130}\{\s*return privateWriterNoStore\(await [A-Za-z][A-Za-z0-9]*\(/);
   expect(code).toContain("privateWriterNoStore(await");
   expect(code).toContain("export async function GET");
  }
 });
});
