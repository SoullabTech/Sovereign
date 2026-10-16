/** R44 default-off / no-active-route security regression. */
import {readdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
jest.mock('@/lib/db/postgres',()=>({
 query:jest.fn(()=>{throw Error('R44_UNIT_SQL_MUST_NOT_RUN');}),
}));
import {query} from '@/lib/db/postgres';
import {
 R44_REAL_AUTHOR_APPROVAL_ENABLED,prepareHeldAuthorApprovalR44,
 claimHeldAuthorApprovalR44,
} from '../heldDurableAuthorApprovalR44';
const old=process.env.R44_DURABLE_APPROVAL_FIXTURE;
afterAll(()=>{if(old===undefined)delete process.env.R44_DURABLE_APPROVAL_FIXTURE;
 else process.env.R44_DURABLE_APPROVAL_FIXTURE=old;});
function routes(dir:string):string[]{
 return readdirSync(dir,{withFileTypes:true}).flatMap(x=>{
  const p=path.join(dir,x.name);
  return x.isDirectory()?routes(p):x.isFile()&&/^route\.(tsx|ts)$/.test(x.name)?[p]:[];
 });
}
describe('R44 durable one-use author choice stays offline',()=>{
 it('real author approval is compiled OFF',()=>{
  expect(R44_REAL_AUTHOR_APPROVAL_ENABLED).toBe(false);
 });
 it('without explicitly marked isolated PG16 fixture, refuses before SQL',async()=>{
  delete process.env.R44_DURABLE_APPROVAL_FIXTURE;
  await expect(prepareHeldAuthorApprovalR44(null as never))
   .rejects.toHaveProperty('code','r44_real_author_approval_disabled');
  await expect(claimHeldAuthorApprovalR44(null as never))
   .rejects.toHaveProperty('code','r44_real_author_approval_disabled');
  expect(query).not.toHaveBeenCalled();
 });
 it('the additional Draft database fixture requires BOTH R46 and R45 marks',async()=>{
  const vars=[
   'R44_DURABLE_APPROVAL_FIXTURE','R37_SECTION_PASSAGE_FIXTURE',
   'R36_PASSAGE_REVIEW_FIXTURE','R45_DURABLE_SIGNED_AUTHOR_FIXTURE',
   'R46_DURABLE_SIGNED_APPLY_FIXTURE','DATABASE_URL',
   'FILE_STORAGE_PATH',
  ] as const;
  const saved=vars.map(k=>process.env[k]);
  try{
   vars.slice(0,5).forEach(k=>process.env[k]='fictional-only');
   process.env.DATABASE_URL='postgresql://fict@127.0.0.1:59544/r35_draft';
   process.env.FILE_STORAGE_PATH='/private/tmp/ws-r35-physical-r46-guard/vault';
   for(const k of [
    'R45_DURABLE_SIGNED_AUTHOR_FIXTURE',
    'R46_DURABLE_SIGNED_APPLY_FIXTURE',
   ]){
    delete process.env[k];
    await expect(prepareHeldAuthorApprovalR44(null as never))
      .rejects.toHaveProperty('code','r44_real_author_approval_disabled');
    process.env[k]='fictional-only';
   }
   process.env.FILE_STORAGE_PATH='/production/vault';
   await expect(prepareHeldAuthorApprovalR44(null as never))
    .rejects.toHaveProperty('code','r44_real_author_approval_disabled');
   expect(query).not.toHaveBeenCalled();
  }finally{
   vars.forEach((k,i)=>saved[i]===undefined?
    delete process.env[k]:process.env[k]=saved[i]);
  }
 });
 it('no active writer HTTP route can invoke the prototype',()=>{
  const linked=routes(path.join(process.cwd(),'app/api')).filter(f=>
   /(?:heldDurableAuthorApprovalR44|prepareHeldAuthorApprovalR44|claimHeldAuthorApprovalR44)/
    .test(readFileSync(f,'utf8')));
  expect(linked).toEqual([]);
 });
 it('only immutable HMAC metadata is mentioned in the review SQL',()=>{
  const s=readFileSync(path.join(process.cwd(),
    'docs/ops/WS_R44_DURABLE_AUTHOR_APPROVAL_REVIEW_ONLY.sql'),'utf8');
  expect(s).toContain('token_hmac char(64)');
  expect(s).toContain('review_binding_hmac char(64)');
  expect(s).toContain('r44_approval_never_delete');
  for(const bad of ['original_text text','proposed_text text','raw_token text','source_text text'])
   expect(s).not.toContain(bad);
 });
});
