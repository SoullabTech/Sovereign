/** R47 default-off/no-public-route regression. No member data or SQL. */
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
jest.mock('@/lib/db/postgres',()=>({
 query:jest.fn(()=>{throw Error('R47_UNIT_SQL_MUST_NOT_RUN');}),
}));
jest.mock('../heldDraftRequestR38',()=>({
 reviewHeldDraftAdmissionR38:jest.fn(),
}));
import {query} from '@/lib/db/postgres';
import {reviewHeldDraftAdmissionR38} from '../heldDraftRequestR38';
import {prepareHeldUndoR47,submitHeldUndoR47,
 R47_REAL_DURABLE_UNDO_ENABLED} from '../heldDurableUndoR47';
const old=process.env.R47_DURABLE_UNDO_FIXTURE;
afterAll(()=>{
 if(old===undefined)delete process.env.R47_DURABLE_UNDO_FIXTURE;
 else process.env.R47_DURABLE_UNDO_FIXTURE=old;
});
function routes(directory:string):string[]{
 return readdirSync(directory,{withFileTypes:true}).flatMap(e=>{
  const f=path.join(directory,e.name);
  return e.isDirectory()?routes(f):e.isFile()&&
   /^route\.(ts|tsx)$/.test(e.name)?[f]:[];
 });
}
describe('R47 Undo never becomes a live writer route by side effect',()=>{
 it('real author Undo remains compiled false',()=>{
  expect(R47_REAL_DURABLE_UNDO_ENABLED).toBe(false);
 });
 it('without explicit synthetic flag, refuses before auth and SQL',async()=>{
  delete process.env.R47_DURABLE_UNDO_FIXTURE;
  expect(await prepareHeldUndoR47(null as never)).toMatchObject({
   kind:'refused',status:404,releaseApproved:false,
  });
  expect(await submitHeldUndoR47(null as never)).toMatchObject({
   kind:'refused',status:404,releaseApproved:false,
  });
  expect(query).not.toHaveBeenCalled();
  expect(reviewHeldDraftAdmissionR38).not.toHaveBeenCalled();
 });
 it('no actual Next.js route imports the Undo adapter',()=>{
  const linked=routes(path.join(process.cwd(),'app/api')).filter(f=>
   /heldDurableUndoR47|prepareHeldUndoR47|submitHeldUndoR47/
    .test(readFileSync(f,'utf8')));
  expect(linked).toEqual([]);
 });
 it('SQL is outside production migrations and immutable/HMAC-only',()=>{
  const d=readFileSync(path.join(process.cwd(),
   'docs/ops/WS_R47_DURABLE_UNDO_REVIEW_ONLY.sql'),'utf8');
  expect(d).toContain('r47_undo_never_delete');
  expect(d).toContain('undo_binding_hmac char(64)');
  expect(d).toContain('FOREIGN KEY(work_id,applied_generation)');
  for(const banned of [
   'original_prose text','prior_text text','proposed_text text',
   'raw_approval_token text','source_text text',
  ])expect(d).not.toContain(banned);
 });
});
