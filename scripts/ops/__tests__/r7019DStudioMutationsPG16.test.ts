/**
 * R70.19D — actual Studio metadata, share and soft-delete REST routes.
 * Fictional auth-only mocks + real disposable PostgreSQL16 and vault.
 * No production member, shared invitation or externally reachable link.
 */
jest.mock('next/headers',()=>({
  cookies:jest.fn(async()=>({get:()=>undefined})),
}));
jest.mock('@/lib/auth/getMemberFromRequest',()=>({
  getMemberIdFromRequest:jest.fn(async()=>process.env.R7019B_FICT_MEMBER||null),
}));
jest.mock('@/lib/studio/getPractitionerIdForMember',()=>({
  getPractitionerIdForMember:jest.fn(async()=>process.env.R7019B_FICT_PRACTITIONER||null),
}));
jest.mock('@/lib/team/colabTeams',()=>({
  COLAB_TEAM_COOKIE:'fictional_team',
  resolveCurrentTeamId:jest.fn(async()=>null),
  canActInTeam:jest.fn(async()=>false),
}));

import {NextRequest} from 'next/server';
import {query,closePool} from '@/lib/db/postgres';
import {withHeldR7019BCapture} from
 '@/lib/writersStudio/recovery/heldR7019BWriterFence';
import {PATCH,POST as SHARE} from '@/app/api/studio/files/[fileId]/route';
import {DELETE as REMOVE} from '@/app/api/studio/files/route';
import {readFile} from 'node:fs/promises';
import path from 'node:path';

const M='4c0782ca-9074-43ee-9f3c-5f8500026780';
const P='4b96fbc6-b36d-4fc1-9eb4-ebf286881b09';
const FOREIGN='11111111-1111-4111-8111-111111111111';
const enabled=process.env.R7019B_WRITER_FIXTURE==='fictional-only' &&
  process.env.R7019B_FICT_MEMBER===M &&
  process.env.R7019B_FICT_PRACTITIONER===P &&
  /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_atomic$/.test(
    process.env.DATABASE_URL||'');
const suite=enabled?describe:describe.skip;
const wait=(n:number)=>new Promise(resolve=>setTimeout(resolve,n));
let fileId='',originalName='',storedPath='';
const ctx=(id:string=fileId)=>({params:Promise.resolve({fileId:id})});
const request=(method:string,body:any)=>new NextRequest(
  'http://127.0.0.1/api/studio/files/'+fileId,
  {method,headers:{'content-type':'application/json'},body:JSON.stringify(body)});
async function current(){
 const r=await query<{name:string;status:string;storage_path:string;file_scope:string}>(
   'SELECT name,status,storage_path,file_scope FROM practitioner_files WHERE id=$1 AND practitioner_id=$2',
   [fileId,P]);
 return r.rows[0]??null;
}
async function shares(){
 const r=await query<{count:number}>(
  'SELECT count(*)::int AS count FROM practitioner_file_shares WHERE file_id=$1',
  [fileId]);
 return r.rows[0].count;
}
suite('R70.19D genuine Studio REST mutation leases',()=>{
 beforeAll(async()=>{
  const r=await query<{id:string;name:string;storage_path:string;status:string}>(
   'SELECT id,name,storage_path,status FROM practitioner_files WHERE practitioner_id=$1',[P]);
  expect(r.rows).toHaveLength(1);
  fileId=r.rows[0].id;
  originalName=r.rows[0].name;
  storedPath=r.rows[0].storage_path;
  expect(r.rows[0].status).toBe('active');
  expect(await shares()).toBe(0);
 });
 afterAll(async()=>{await closePool();});

 it('metadata PATCH cannot run across an already locked DB/vault snapshot',async()=>{
  let pending:Promise<Response>|undefined;
  let complete=false;
  const capture=await withHeldR7019BCapture(M,async(client)=>{
   pending=PATCH(request('PATCH',{
     name:'fictional-renamed.txt',description:'fictional-checkpoint-only',
     fileScope:'personal',
   }),ctx()) as Promise<Response>;
   pending.then(()=>{complete=true;},()=>{complete=true;});
   await wait(220);
   expect(complete).toBe(false);
   const before=await client.query<{name:string;status:string}>(
    'SELECT name,status FROM practitioner_files WHERE id=$1',[fileId]);
   expect(before.rows[0].name).toBe(originalName);
   expect(before.rows[0].status).toBe('active');
   return {name:before.rows[0].name};
  });
  expect(capture.releaseApproved).toBe(false);
  expect(capture.snapshot.name).toBe(originalName);
  const response=await pending!;
  expect(response.status).toBe(200);
  expect((await response.json()).file.name).toBe('fictional-renamed.txt');
  expect((await current())?.name).toBe('fictional-renamed.txt');
 });
 it('unauthorized cross-Co-Lab metadata scope is refused',async()=>{
  const response=await PATCH(request('PATCH',{
   fileScope:'colab',teamId:FOREIGN,
  }),ctx());
  expect(response.status).toBe(403);
  expect((await current())?.file_scope).toBe('personal');
 });
 it('share POST and access receipt cannot cross the held snapshot',async()=>{
  let pending:Promise<Response>|undefined;
  let complete=false;
  const before=await shares();
  const capture=await withHeldR7019BCapture(M,async(client)=>{
   pending=SHARE(request('POST',{
    clientId:FOREIGN,shareType:'download',expiresInDays:2,
   }),ctx()) as Promise<Response>;
   pending.then(()=>{complete=true;},()=>{complete=true;});
   await wait(220);
   expect(complete).toBe(false);
   const r=await client.query<{n:number}>(
    'SELECT count(*)::int AS n FROM practitioner_file_shares WHERE file_id=$1',[fileId]);
   expect(r.rows[0].n).toBe(before);
   return {};
  });
  expect(capture.releaseApproved).toBe(false);
  const response=await pending!;
  expect(response.status).toBe(200);
  const payload=await response.json();
  expect(payload.success).toBe(true);
  expect(await shares()).toBe(before+1);
  // Do not log the generated token or claim its link is an authorized member flow.
 });
 it('owner file DELETE is soft-only and blocked until capture finishes',async()=>{
  let pending:Promise<Response>|undefined;
  let complete=false;
  const capture=await withHeldR7019BCapture(M,async(client)=>{
   pending=REMOVE(new NextRequest(
     'http://127.0.0.1/api/studio/files?id='+fileId,
     {method:'DELETE'})) as Promise<Response>;
   pending.then(()=>{complete=true;},()=>{complete=true;});
   await wait(220);
   expect(complete).toBe(false);
   const r=await client.query<{status:string}>(
    'SELECT status FROM practitioner_files WHERE id=$1',[fileId]);
   expect(r.rows[0].status).toBe('active');
   return {};
  });
  expect(capture.releaseApproved).toBe(false);
  const response=await pending!;
  expect(response.status).toBe(200);
  const body=await response.json();
  expect(body.deletionMode).toBe('soft');
  expect(body.originalBytesDestroyed).toBe(false);
  expect((await current())?.status).toBe('deleted');
  expect((await readFile(path.join(process.env.FILE_STORAGE_PATH!,storedPath))).length)
   .toBeGreaterThan(0);
 });
 it('permanent erasure remains 503 even for the exact owner',async()=>{
  const response=await REMOVE(new NextRequest(
    'http://127.0.0.1/api/studio/files?id='+fileId+'&permanent=true',
    {method:'DELETE'}));
  expect(response.status).toBe(503);
  expect((await current())?.status).toBe('deleted');
 });
 it('metadata PATCH cannot resurrect a soft-deleted original',async()=>{
  const response=await PATCH(request('PATCH',{
   status:'active',name:'fictional-resurrected.txt',
  }),ctx());
  expect(response.status).toBe(404);
  expect((await current())?.status).toBe('deleted');
 });
 it('forged fixture member cannot update a file',async()=>{
  process.env.R7019B_FICT_MEMBER=FOREIGN;
  try{
   const response=await PATCH(request('PATCH',{name:'fictional-foreign.txt'}),ctx());
   expect(response.status).not.toBe(200);
   expect((await current())?.status).toBe('deleted');
  }finally{process.env.R7019B_FICT_MEMBER=M;}
 });
});
