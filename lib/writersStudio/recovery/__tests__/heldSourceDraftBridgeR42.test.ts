/**
 * R42 source isolation: no public route, no real member KMS or writer activation.
 * This test does not connect to SQL/vault/KMS and uses no real manuscript.
 */
import path from 'node:path';
import {readFileSync,readdirSync} from 'node:fs';
jest.mock('@/lib/db/postgres',()=>({
 query:jest.fn(()=>{throw Error('R42_unit_SQL_must_not_run');}),
 transaction:jest.fn(()=>{throw Error('R42_unit_transaction_must_not_run');}),
}));
jest.mock('../heldSourceComposerR36',()=>({
 composeHeldOriginalR36:jest.fn(()=>{throw Error('R42_unit_Source_must_not_run');}),
}));
import {query,transaction} from '@/lib/db/postgres';
import {composeHeldOriginalR36} from '../heldSourceComposerR36';
import {
 beginHeldDraftFromOriginalR42,R42_REAL_SOURCE_DRAFT_ENABLED,
} from '../heldSourceDraftBridgeR42';
import {R36_REAL_SOURCE_COMPOSER_ENABLED} from '../heldSourceComposerR36';
import {R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED}
 from '../heldProtectedDraftR35';

function routes(dir:string):string[]{
 return readdirSync(dir,{withFileTypes:true}).flatMap(f=>{
  const p=path.join(dir,f.name);
  return f.isDirectory()?routes(p):
    f.isFile()&&/^route\.(ts|tsx)$/.test(f.name)?[p]:[];
 });
}
const original=process.env.R42_SOURCE_DRAFT_FIXTURE;
afterAll(()=>{
 if(original===undefined)delete process.env.R42_SOURCE_DRAFT_FIXTURE;
 else process.env.R42_SOURCE_DRAFT_FIXTURE=original;
});
describe('R42 original Source→first Draft local-only default-deny boundary',()=>{
 it('all selected real-member flags remain statically OFF',()=>{
  expect(R42_REAL_SOURCE_DRAFT_ENABLED).toBe(false);
  expect(R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED).toBe(false);
 });
 it('without exact fictional opt-in refuses before ANY source/query/transaction',async()=>{
  delete process.env.R42_SOURCE_DRAFT_FIXTURE;
  await expect(beginHeldDraftFromOriginalR42(null as never))
   .rejects.toHaveProperty('code','r42_real_source_to_draft_disabled');
  expect(query).not.toHaveBeenCalled();
  expect(transaction).not.toHaveBeenCalled();
  expect(composeHeldOriginalR36).not.toHaveBeenCalled();
 });
 it('no real Writer route imports or invokes this fixture Source→draft composer',()=>{
  const repo=process.cwd();
  const linked=routes(path.join(repo,'app','api')).filter(f=>
    /(?:heldSourceDraftBridgeR42|beginHeldDraftFromOriginalR42)/
     .test(readFileSync(f,'utf8')));
  expect(linked).toEqual([]);
 });
});
