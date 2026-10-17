/**
 * R47 default-off and route-isolation contract. No SQL, file or real writer.
 */
import path from 'node:path';
import {readFileSync,readdirSync} from 'node:fs';
jest.mock('@/lib/db/postgres',()=>({
 query:jest.fn(()=>{throw Error('r47_default_off_sql_must_not_run');}),
}));
import {query} from '@/lib/db/postgres';
import {
 R47_REAL_PRIVATE_EDITORIAL_ENABLED,
 recordHeldPrivateReviewR47,
 reopenHeldPrivateReviewR47,
 reconcileHeldPrivateReviewR47,
} from '../heldPrivateEditorialReviewR47';
const prior=process.env.R47_PRIVATE_EDITORIAL_FIXTURE;
afterAll(()=>{
 if(prior===undefined)delete process.env.R47_PRIVATE_EDITORIAL_FIXTURE;
 else process.env.R47_PRIVATE_EDITORIAL_FIXTURE=prior;
});
function routes(root:string):string[]{
 return readdirSync(root,{withFileTypes:true}).flatMap(f=>{
  const p=path.join(root,f.name);
  if(f.isDirectory())return routes(p);
  return f.isFile()&&/^route\.(ts|tsx)$/.test(f.name)?[p]:[];
 });
}
describe('R47 private editorial custody held-only',()=>{
 it('compiled real service is default OFF regardless of fixture flags',()=>{
  expect(R47_REAL_PRIVATE_EDITORIAL_ENABLED).toBe(false);
 });
 it('without exact opt-in refuses before any SQL or vault read',async()=>{
  delete process.env.R47_PRIVATE_EDITORIAL_FIXTURE;
  await expect(recordHeldPrivateReviewR47(null as never))
   .rejects.toHaveProperty('code','r47_real_private_review_disabled');
  await expect(reopenHeldPrivateReviewR47(null as never))
   .rejects.toHaveProperty('code','r47_real_private_review_disabled');
  await expect(reconcileHeldPrivateReviewR47(null as never))
   .rejects.toHaveProperty('code','r47_real_private_review_disabled');
  expect(query).not.toHaveBeenCalled();
 });
 it('no real Next HTTP route can import or invoke private editorial fixture',()=>{
  const app=path.join(process.cwd(),'app/api');
  const linked=routes(app).filter(f=>/heldPrivateEditorialReviewR47|recordHeldPrivateReviewR47|reopenHeldPrivateReviewR47|reconcileHeldPrivateReviewR47/
    .test(readFileSync(f,'utf8')));
  expect(linked).toEqual([]);
 });
 it('review schema has no private draft/alternative/proposal text columns',()=>{
  const sql=readFileSync(path.join(process.cwd(),
   'docs/ops/WS_R47_PRIVATE_REVIEW_CUSTODY_REVIEW_ONLY.sql'),'utf8');
  expect(sql).toContain('r47_review_delete_forbidden');
  expect(sql).toContain("state IN ('reserved','verified')");
  expect(sql).toContain('review_hmac char(64)');
  for(const forbidden of ['proposed_text text','original_text text',
    'section_text text','source_text text','raw_token text']){
    expect(sql).not.toContain(forbidden);
  }
 });
 it('new R47 service never imports R46 Apply/Undo or writes to live routes',()=>{
  const source=readFileSync(path.join(process.cwd(),
   'lib/writersStudio/recovery/heldPrivateEditorialReviewR47.ts'),'utf8');
  expect(source).toContain('releaseApproved:false;canApply:false');
  expect(source).toContain('R47_REAL_PRIVATE_EDITORIAL_ENABLED=false');
  expect(source).not.toContain("from './heldDurableSignedApplyR46'");
  expect(source).not.toContain("from './heldDurableUndoR47'");
  expect(source).not.toMatch(/\bfetch\s*\(|apiFetch|sendEmail|externalKMS/);
 });
});
